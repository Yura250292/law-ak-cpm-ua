import AppKit
import AVFoundation

// Службові режими для перевірки з терміналу:
//   CallRecorder --diagnose              — хто зараз працює з мікрофоном і звуком
//   CallRecorder --test-record 10 a.m4a  — записати N секунд і зберегти файл (без надсилання)
//   CallRecorder --flush                 — надіслати чергу й вийти
let args = CommandLine.arguments

if args.contains("--flush") {
    Task {
        let sent = await Uploader().flush()
        print("надіслано: \(sent), у черзі: \(Uploader.pendingCount())")
        exit(0)
    }
    RunLoop.main.run()
}

if args.contains("--diagnose") {
    for p in AudioProcess.all() where p.input || p.output {
        print("\(p.input ? "🎙" : "  ") \(p.output ? "🔊" : "  ") \(p.label)")
    }
    exit(0)
}

if let i = args.firstIndex(of: "--test-record"), args.count > i + 2, let seconds = Double(args[i + 1]) {
    let output = URL(fileURLWithPath: args[i + 2])
    let recording = CallRecording(reason: "тест")
    do { try recording.start() } catch {
        print("не вдалося почати: \(error.localizedDescription)")
        exit(1)
    }
    print("записую \(Int(seconds)) с…")
    Task {
        try? await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
        if let (file, meta) = await recording.finish(into: FileManager.default.temporaryDirectory) {
            try? FileManager.default.removeItem(at: output)
            try? FileManager.default.moveItem(at: file, to: output)
            print("готово: \(output.path), \(meta.durationMs) мс")
            exit(0)
        }
        print("нічого не записалось")
        exit(1)
    }
    RunLoop.main.run()
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
