import Foundation

/// Помічає дзвінок: якась «дзвінкова» програма тримає мікрофон.
/// Раз на секунду читає список аудіопроцесів Core Audio — жодних приватних API.
final class CallDetector {
    /// Дзвінки з iPhone на Mac (Continuity) і FaceTime.
    static let phonePatterns = ["com.apple.facetime", "callservicesd", "avconferenced", "com.apple.telephonyutilities"]
    static let messengerPatterns = ["whatsapp", "viber", "telegram", "signal"]

    var includeMessengers = false
    /// true — дзвінок почався, false — закінчився. Друге — назва процесу.
    var onChange: ((Bool, String) -> Void)?

    private var timer: Timer?
    private var active = false
    private var activeSince: Date?
    private var inactiveSince: Date?
    private var current = ""
    private var lastInputs: Set<String> = []

    /// Скільки секунд сигнал має триматися, щоб не смикатись від коротких сплесків.
    private let startDelay: TimeInterval = 2
    private let stopDelay: TimeInterval = 4

    func start() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in self?.tick() }
    }

    private func matches(_ p: AudioProcess) -> Bool {
        let hay = "\(p.bundleID) \(p.name)".lowercased()
        let patterns = Self.phonePatterns + (includeMessengers ? Self.messengerPatterns : [])
        return patterns.contains { hay.contains($0) }
    }

    private func tick() {
        let me = getpid()
        let inputs = AudioProcess.all().filter { $0.input && $0.pid != me }

        // Для діагностики: хто взагалі бере мікрофон.
        let labels = Set(inputs.map(\.label))
        if labels != lastInputs {
            Log.write("мікрофон використовують: \(labels.isEmpty ? "—" : labels.sorted().joined(separator: ", "))")
            lastInputs = labels
        }

        let call = inputs.first(where: matches)
        let now = Date()
        if let call {
            inactiveSince = nil
            if !active {
                if activeSince == nil { activeSince = now }
                if now.timeIntervalSince(activeSince!) >= startDelay {
                    active = true
                    current = call.label
                    onChange?(true, current)
                }
            }
        } else {
            activeSince = nil
            if active {
                if inactiveSince == nil { inactiveSince = now }
                if now.timeIntervalSince(inactiveSince!) >= stopDelay {
                    active = false
                    onChange?(false, current)
                }
            }
        }
    }
}
