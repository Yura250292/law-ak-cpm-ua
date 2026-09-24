import CoreAudio
import Darwin
import Foundation

/// Тонкі обгортки над AudioObjectGetPropertyData.
enum CA {
    static func address(_ selector: AudioObjectPropertySelector) -> AudioObjectPropertyAddress {
        AudioObjectPropertyAddress(
            mSelector: selector,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
    }

    static func objectList(_ object: AudioObjectID, _ selector: AudioObjectPropertySelector) -> [AudioObjectID] {
        var addr = address(selector)
        var size: UInt32 = 0
        guard AudioObjectGetPropertyDataSize(object, &addr, 0, nil, &size) == noErr, size > 0 else { return [] }
        var ids = [AudioObjectID](repeating: 0, count: Int(size) / MemoryLayout<AudioObjectID>.size)
        guard AudioObjectGetPropertyData(object, &addr, 0, nil, &size, &ids) == noErr else { return [] }
        return ids
    }

    static func value<T: BitwiseCopyable>(_ object: AudioObjectID, _ selector: AudioObjectPropertySelector, _ initial: T) -> T? {
        var addr = address(selector)
        var size = UInt32(MemoryLayout<T>.size)
        var result = initial
        guard AudioObjectGetPropertyData(object, &addr, 0, nil, &size, &result) == noErr else { return nil }
        return result
    }

    static func string(_ object: AudioObjectID, _ selector: AudioObjectPropertySelector) -> String? {
        var addr = address(selector)
        var size = UInt32(MemoryLayout<Unmanaged<CFString>?>.size)
        var result: Unmanaged<CFString>?
        guard AudioObjectGetPropertyData(object, &addr, 0, nil, &size, &result) == noErr else { return nil }
        return result?.takeRetainedValue() as String?
    }

    /// Аудіо-об'єкт процесу за PID (щоб виключити власний процес із запису).
    static func processObject(pid: pid_t) -> AudioObjectID? {
        var addr = address(kAudioHardwarePropertyTranslatePIDToProcessObject)
        var qualifier = pid
        var size = UInt32(MemoryLayout<AudioObjectID>.size)
        var result = AudioObjectID(kAudioObjectUnknown)
        let err = AudioObjectGetPropertyData(
            AudioObjectID(kAudioObjectSystemObject), &addr,
            UInt32(MemoryLayout<pid_t>.size), &qualifier, &size, &result
        )
        return err == noErr && result != kAudioObjectUnknown ? result : nil
    }

    static func defaultOutputDeviceUID() -> String? {
        guard let device = value(
            AudioObjectID(kAudioObjectSystemObject),
            kAudioHardwarePropertyDefaultSystemOutputDevice,
            AudioObjectID(kAudioObjectUnknown)
        ), device != kAudioObjectUnknown else { return nil }
        return string(device, kAudioDevicePropertyDeviceUID)
    }
}

/// Процес, який зараз працює з аудіо (macOS 14.2+).
struct AudioProcess: Hashable {
    let pid: pid_t
    let bundleID: String
    let name: String
    let input: Bool
    let output: Bool

    var label: String { bundleID.isEmpty ? name : "\(bundleID) (\(name))" }

    static func all() -> [AudioProcess] {
        CA.objectList(AudioObjectID(kAudioObjectSystemObject), kAudioHardwarePropertyProcessObjectList).compactMap { obj in
            guard let pid = CA.value(obj, kAudioProcessPropertyPID, pid_t(0)) else { return nil }
            let input = (CA.value(obj, kAudioProcessPropertyIsRunningInput, UInt32(0)) ?? 0) != 0
            let output = (CA.value(obj, kAudioProcessPropertyIsRunningOutput, UInt32(0)) ?? 0) != 0
            return AudioProcess(
                pid: pid,
                bundleID: CA.string(obj, kAudioProcessPropertyBundleID) ?? "",
                name: processName(pid),
                input: input,
                output: output
            )
        }
    }

    private static func processName(_ pid: pid_t) -> String {
        var buffer = [CChar](repeating: 0, count: 1024)
        return proc_name(pid, &buffer, UInt32(buffer.count)) > 0 ? String(cString: buffer) : "pid \(pid)"
    }
}
