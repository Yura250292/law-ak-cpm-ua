import AppKit
import AVFoundation
import ServiceManagement

/// Застосунок у рядку меню: сам записує дзвінки, прийняті на Mac, і надсилає їх на сайт.
final class AppDelegate: NSObject, NSApplicationDelegate, NSMenuDelegate {
    private let statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
    private let detector = CallDetector()
    private let uploader = Uploader()
    private var recording: CallRecording?
    /// Запис зупинили вручну посеред дзвінка — не починати знову, поки дзвінок не скінчиться.
    private var suppressUntilCallEnds = false
    private var lastEvent = "Очікую дзвінок"
    private var clock: Timer?

    /// Коротші записи — це скинуті чи пропущені дзвінки, їх не надсилаємо.
    private let minimumDuration: TimeInterval = 20
    private let messengersKey = "includeMessengers"

    func applicationDidFinishLaunching(_ notification: Notification) {
        AVCaptureDevice.requestAccess(for: .audio) { granted in
            if !granted { Log.write("⚠️ немає дозволу на мікрофон") }
        }
        if Config.load() == nil { askForToken() }
        if SMAppService.mainApp.status == .notRegistered { try? SMAppService.mainApp.register() }

        detector.includeMessengers = UserDefaults.standard.bool(forKey: messengersKey)
        detector.onChange = { [weak self] active, who in self?.callChanged(active: active, who: who) }
        detector.start()

        let menu = NSMenu()
        menu.delegate = self
        statusItem.menu = menu
        updateIcon()

        clock = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in self?.updateIcon() }
        Timer.scheduledTimer(withTimeInterval: 300, repeats: true) { [weak self] _ in self?.flush() }
        flush()
        Log.write("запущено")
    }

    // MARK: - Запис

    private func callChanged(active: Bool, who: String) {
        if active {
            Log.write("дзвінок почався: \(who)")
            if !suppressUntilCallEnds { startRecording(reason: who) }
        } else {
            Log.write("дзвінок закінчився: \(who)")
            suppressUntilCallEnds = false
            if recording?.reason != "вручну" { stopRecording() }
        }
    }

    private func startRecording(reason: String) {
        guard recording == nil else { return }
        let r = CallRecording(reason: reason)
        do {
            try r.start()
            recording = r
            lastEvent = "Записую…"
            Log.write("● запис почато (\(reason))")
        } catch {
            lastEvent = "Помилка запису: \(error.localizedDescription)"
            Log.write("⚠️ запис не почався: \(error.localizedDescription)")
        }
        updateIcon()
    }

    private func stopRecording() {
        guard let r = recording else { return }
        recording = nil
        updateIcon()
        let duration = Date().timeIntervalSince(r.startedAt)
        Task {
            guard duration >= minimumDuration else {
                _ = await r.finish(into: FileManager.default.temporaryDirectory)
                Log.write("запис \(Int(duration)) с — закороткий, не надсилаю")
                await MainActor.run { self.lastEvent = "Короткий дзвінок — пропущено" }
                return
            }
            guard let (file, meta) = await r.finish(into: FileManager.default.temporaryDirectory) else {
                await MainActor.run { self.lastEvent = "Не вдалося зберегти запис" }
                return
            }
            do {
                try Uploader.enqueue(audio: file, meta: meta)
                Log.write("■ запис збережено: \(meta.fileName), \(meta.durationMs / 1000) с")
            } catch {
                Log.write("⚠️ не вдалося покласти в чергу: \(error.localizedDescription)")
            }
            let sent = await uploader.flush()
            await MainActor.run {
                self.lastEvent = sent > 0 ? "Надіслано: \(meta.fileName)" : "Чекає надсилання: \(meta.fileName)"
                self.updateIcon()
            }
        }
    }

    private func flush() {
        Task {
            await uploader.flush()
            await MainActor.run { self.updateIcon() }
        }
    }

    // MARK: - Меню

    private func updateIcon() {
        guard let button = statusItem.button else { return }
        if let r = recording {
            let s = Int(Date().timeIntervalSince(r.startedAt))
            button.image = NSImage(systemSymbolName: "record.circle.fill", accessibilityDescription: "Запис")
            button.image?.isTemplate = false
            button.contentTintColor = .systemRed
            button.title = String(format: " %d:%02d", s / 60, s % 60)
        } else {
            button.image = NSImage(systemSymbolName: "phone.circle", accessibilityDescription: "Запис дзвінків")
            button.image?.isTemplate = true
            button.contentTintColor = nil
            button.title = Uploader.pendingCount() > 0 ? " \(Uploader.pendingCount())" : ""
        }
    }

    func menuNeedsUpdate(_ menu: NSMenu) {
        menu.removeAllItems()
        let status = NSMenuItem(title: recording != nil ? "● Записую дзвінок" : lastEvent, action: nil, keyEquivalent: "")
        status.isEnabled = false
        menu.addItem(status)
        if Config.load() == nil {
            let warn = NSMenuItem(title: "⚠️ Не вказано токен сайту", action: nil, keyEquivalent: "")
            warn.isEnabled = false
            menu.addItem(warn)
        }
        menu.addItem(.separator())

        if recording != nil {
            menu.addItem(item("Зупинити запис", #selector(stopManually)))
        } else {
            menu.addItem(item("Почати запис вручну", #selector(startManually)))
        }

        let pending = Uploader.pendingCount()
        if pending > 0 {
            menu.addItem(item("Надіслати зараз (у черзі: \(pending))", #selector(sendNow)))
        }
        menu.addItem(.separator())

        let messengers = item("Записувати також Viber, WhatsApp, Telegram", #selector(toggleMessengers))
        messengers.state = detector.includeMessengers ? .on : .off
        menu.addItem(messengers)
        let login = item("Запускати при вході в систему", #selector(toggleLogin))
        login.state = SMAppService.mainApp.status == .enabled ? .on : .off
        menu.addItem(login)
        menu.addItem(item("Токен сайту…", #selector(editToken)))
        menu.addItem(.separator())
        menu.addItem(item("Відкрити «Розмови» на сайті", #selector(openAdmin)))
        menu.addItem(item("Журнал", #selector(openLog)))
        menu.addItem(item("Вийти", #selector(quit), key: "q"))
    }

    private func item(_ title: String, _ action: Selector, key: String = "") -> NSMenuItem {
        let i = NSMenuItem(title: title, action: action, keyEquivalent: key)
        i.target = self
        return i
    }

    @objc private func startManually() { startRecording(reason: "вручну") }

    @objc private func stopManually() {
        if recording?.reason != "вручну" { suppressUntilCallEnds = true }
        stopRecording()
    }

    @objc private func sendNow() { flush() }

    @objc private func toggleMessengers() {
        detector.includeMessengers.toggle()
        UserDefaults.standard.set(detector.includeMessengers, forKey: messengersKey)
    }

    @objc private func toggleLogin() {
        do {
            if SMAppService.mainApp.status == .enabled { try SMAppService.mainApp.unregister() }
            else { try SMAppService.mainApp.register() }
        } catch {
            Log.write("⚠️ автозапуск: \(error.localizedDescription)")
        }
    }

    @objc private func editToken() { askForToken() }

    @objc private func openAdmin() {
        let base = Config.load()?.baseURL ?? "https://law-ak.com.ua"
        NSWorkspace.shared.open(URL(string: "\(base)/admin/conversations")!)
    }

    @objc private func openLog() { NSWorkspace.shared.open(Log.url) }

    @objc private func quit() {
        if recording != nil { stopRecording() }
        DispatchQueue.main.asyncAfter(deadline: .now() + (recording == nil ? 0 : 3)) { NSApp.terminate(nil) }
    }

    private func askForToken() {
        NSApp.activate(ignoringOtherApps: true)
        let alert = NSAlert()
        alert.messageText = "Запис дзвінків"
        alert.informativeText = "Вставте токен сайту (INGEST_TOKEN). Його дає розробник."
        let field = NSSecureTextField(frame: NSRect(x: 0, y: 0, width: 320, height: 24))
        field.stringValue = Config.load()?.token ?? ""
        alert.accessoryView = field
        alert.addButton(withTitle: "Зберегти")
        alert.addButton(withTitle: "Скасувати")
        guard alert.runModal() == .alertFirstButtonReturn else { return }
        let token = field.stringValue.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !token.isEmpty else { return }
        do {
            try Config(baseURL: Config.load()?.baseURL ?? "https://law-ak.com.ua", token: token).save()
            flush()
        } catch {
            Log.write("⚠️ не вдалося зберегти токен: \(error.localizedDescription)")
        }
    }
}
