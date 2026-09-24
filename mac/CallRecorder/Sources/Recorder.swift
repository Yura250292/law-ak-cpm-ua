import AVFoundation
import CoreAudio
import Foundation

enum RecorderError: LocalizedError {
    case coreAudio(String, OSStatus)
    case format

    var errorDescription: String? {
        switch self {
        case let .coreAudio(what, status): return "\(what): OSStatus \(status)"
        case .format: return "Невідомий формат звуку"
        }
    }
}

/// AAC без жорсткого бітрейту: енкодер сам підбирає під частоту (мікрофон AirPods — 16/24 кГц).
private func aacSettings(sampleRate: Double, channels: AVAudioChannelCount) -> [String: Any] {
    [AVFormatIDKey: kAudioFormatMPEG4AAC, AVSampleRateKey: sampleRate, AVNumberOfChannelsKey: channels]
}

/// Весь звук, що грає Mac (голос співрозмовника), крім нашого процесу.
/// Core Audio process tap (macOS 14.2+): без драйверів і без дозволу на запис екрана.
final class SystemAudioCapture {
    private var tapID = AudioObjectID(kAudioObjectUnknown)
    private var aggregateID = AudioObjectID(kAudioObjectUnknown)
    private var procID: AudioDeviceIOProcID?
    private var file: AVAudioFile?
    private let queue = DispatchQueue(label: "system-audio", qos: .userInitiated)
    private(set) var firstHostTime: UInt64 = 0

    func start(writingTo url: URL) throws {
        let own = CA.processObject(pid: getpid()).map { [$0] } ?? []
        let description = CATapDescription(stereoGlobalTapButExcludeProcesses: own)
        description.uuid = UUID()
        description.name = "CallRecorder"
        description.isPrivate = true
        description.muteBehavior = .unmuted

        var status = AudioHardwareCreateProcessTap(description, &tapID)
        guard status == noErr else { throw RecorderError.coreAudio("Створення tap", status) }

        guard var asbd = CA.value(tapID, kAudioTapPropertyFormat, AudioStreamBasicDescription()),
              let format = AVAudioFormat(streamDescription: &asbd)
        else { throw RecorderError.format }

        let outputUID = CA.defaultOutputDeviceUID() ?? ""
        let aggregate: [String: Any] = [
            kAudioAggregateDeviceNameKey: "CallRecorder",
            kAudioAggregateDeviceUIDKey: UUID().uuidString,
            kAudioAggregateDeviceMainSubDeviceKey: outputUID,
            kAudioAggregateDeviceIsPrivateKey: true,
            kAudioAggregateDeviceIsStackedKey: false,
            kAudioAggregateDeviceTapAutoStartKey: true,
            kAudioAggregateDeviceSubDeviceListKey: [[kAudioSubDeviceUIDKey: outputUID]],
            kAudioAggregateDeviceTapListKey: [[
                kAudioSubTapDriftCompensationKey: true,
                kAudioSubTapUIDKey: description.uuid.uuidString,
            ]],
        ]
        status = AudioHardwareCreateAggregateDevice(aggregate as CFDictionary, &aggregateID)
        guard status == noErr else { throw RecorderError.coreAudio("Агрегатний пристрій", status) }

        let file = try AVAudioFile(
            forWriting: url,
            settings: aacSettings(sampleRate: format.sampleRate, channels: format.channelCount),
            commonFormat: .pcmFormatFloat32,
            interleaved: format.isInterleaved
        )
        self.file = file

        status = AudioDeviceCreateIOProcIDWithBlock(&procID, aggregateID, queue) { [weak self] _, input, inputTime, _, _ in
            guard let self,
                  let buffer = AVAudioPCMBuffer(pcmFormat: format, bufferListNoCopy: input, deallocator: nil)
            else { return }
            if self.firstHostTime == 0 { self.firstHostTime = inputTime.pointee.mHostTime }
            try? file.write(from: buffer)
        }
        guard status == noErr else { throw RecorderError.coreAudio("IOProc", status) }
        status = AudioDeviceStart(aggregateID, procID)
        guard status == noErr else { throw RecorderError.coreAudio("Старт запису", status) }
    }

    func stop() {
        if aggregateID != kAudioObjectUnknown {
            AudioDeviceStop(aggregateID, procID)
            if let procID { AudioDeviceDestroyIOProcID(aggregateID, procID) }
            AudioHardwareDestroyAggregateDevice(aggregateID)
        }
        if tapID != kAudioObjectUnknown { AudioHardwareDestroyProcessTap(tapID) }
        aggregateID = AudioObjectID(kAudioObjectUnknown)
        tapID = AudioObjectID(kAudioObjectUnknown)
        procID = nil
        queue.sync { file = nil } // закриває m4a
    }
}

/// Мікрофон (голос адвоката), зведений у моно.
final class MicrophoneCapture {
    private let engine = AVAudioEngine()
    private var file: AVAudioFile?
    private let lock = NSLock()
    private(set) var firstHostTime: UInt64 = 0

    func start(writingTo url: URL) throws {
        let input = engine.inputNode
        let native = input.outputFormat(forBus: 0)
        guard native.sampleRate > 0, native.channelCount > 0,
              let mono = AVAudioFormat(standardFormatWithSampleRate: native.sampleRate, channels: 1)
        else { throw RecorderError.format }

        let file = try AVAudioFile(
            forWriting: url,
            settings: aacSettings(sampleRate: native.sampleRate, channels: 1),
            commonFormat: .pcmFormatFloat32,
            interleaved: false
        )
        self.file = file

        input.installTap(onBus: 0, bufferSize: 4096, format: native) { [weak self] buffer, time in
            guard let self, let out = AVAudioPCMBuffer(pcmFormat: mono, frameCapacity: buffer.frameLength),
                  let src = buffer.floatChannelData, let dst = out.floatChannelData
            else { return }
            let frames = Int(buffer.frameLength)
            let channels = Int(buffer.format.channelCount)
            let scale = 1 / Float(channels)
            for i in 0..<frames {
                var sum: Float = 0
                for c in 0..<channels { sum += src[c][i] }
                dst[0][i] = sum * scale
            }
            out.frameLength = buffer.frameLength
            self.lock.lock()
            if self.firstHostTime == 0 { self.firstHostTime = time.hostTime }
            try? self.file?.write(from: out)
            self.lock.unlock()
        }
        engine.prepare()
        try engine.start()
    }

    func stop() {
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
        lock.lock()
        file = nil
        lock.unlock()
    }
}

/// Готовий запис дзвінка: один m4a + дані для надсилання.
struct FinishedRecording: Codable {
    let externalId: String
    let recordedAt: Date
    let durationMs: Int
    let fileName: String
}

/// Один дзвінок: дві доріжки паралельно, по завершенні — зведення в один файл.
final class CallRecording {
    let id = UUID()
    let startedAt = Date()
    let reason: String
    private let workDir: URL
    private let system = SystemAudioCapture()
    private let mic = MicrophoneCapture()
    private var systemOK = false
    private var micOK = false

    init(reason: String) {
        self.reason = reason
        workDir = FileManager.default.temporaryDirectory.appendingPathComponent("CallRecorder-\(id.uuidString)")
    }

    private var systemURL: URL { workDir.appendingPathComponent("system.m4a") }
    private var micURL: URL { workDir.appendingPathComponent("mic.m4a") }

    func start() throws {
        try FileManager.default.createDirectory(at: workDir, withIntermediateDirectories: true)
        do { try system.start(writingTo: systemURL); systemOK = true } catch {
            Log.write("⚠️ звук системи не пишеться: \(error.localizedDescription)")
        }
        do { try mic.start(writingTo: micURL); micOK = true } catch {
            Log.write("⚠️ мікрофон не пишеться: \(error.localizedDescription)")
        }
        guard systemOK || micOK else {
            cleanup()
            throw RecorderError.format
        }
    }

    /// Зупинити й звести доріжки. Повертає шлях до m4a або nil, якщо записати нічого не вдалося.
    func finish(into directory: URL) async -> (URL, FinishedRecording)? {
        system.stop()
        mic.stop()
        defer { cleanup() }

        let tracks: [(URL, UInt64)] = [
            systemOK ? (systemURL, system.firstHostTime) : nil,
            micOK ? (micURL, mic.firstHostTime) : nil,
        ].compactMap { $0 }.filter { $0.1 != 0 }
        guard !tracks.isEmpty else { return nil }

        let first = tracks.map(\.1).min()!
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH-mm"
        let output = directory.appendingPathComponent("\(id.uuidString).m4a")
        do {
            try await Mixer.mix(
                tracks.map { ($0.0, AVAudioTime.seconds(forHostTime: $0.1) - AVAudioTime.seconds(forHostTime: first)) },
                to: output
            )
            let duration = try await AVURLAsset(url: output).load(.duration).seconds
            let meta = FinishedRecording(
                externalId: id.uuidString,
                recordedAt: startedAt,
                durationMs: Int(duration * 1000),
                fileName: "Дзвінок \(formatter.string(from: startedAt)).m4a"
            )
            return (output, meta)
        } catch {
            Log.write("⚠️ не вдалося звести доріжки: \(error.localizedDescription)")
            return nil
        }
    }

    private func cleanup() {
        try? FileManager.default.removeItem(at: workDir)
    }
}

enum Mixer {
    /// Звести кілька аудіофайлів з відступами (с) в один m4a.
    static func mix(_ inputs: [(URL, Double)], to output: URL) async throws {
        let composition = AVMutableComposition()
        for (url, offset) in inputs {
            let asset = AVURLAsset(url: url)
            guard let source = try await asset.loadTracks(withMediaType: .audio).first else { continue }
            let duration = try await asset.load(.duration)
            let track = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)
            try track?.insertTimeRange(
                CMTimeRange(start: .zero, duration: duration),
                of: source,
                at: CMTime(seconds: offset, preferredTimescale: 48_000)
            )
        }
        guard let export = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetAppleM4A) else {
            throw RecorderError.format
        }
        try? FileManager.default.removeItem(at: output)
        export.outputURL = output
        export.outputFileType = .m4a
        await export.export()
        if let error = export.error { throw error }
        guard export.status == .completed else { throw RecorderError.format }
    }
}
