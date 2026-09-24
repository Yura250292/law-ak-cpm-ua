import Foundation

struct Config: Codable {
    var baseURL: String
    var token: String

    static let directory = FileManager.default.homeDirectoryForCurrentUser
        .appendingPathComponent("Library/Application Support/CallRecorder")
    static let url = directory.appendingPathComponent("config.json")

    static func load() -> Config? {
        guard let data = try? Data(contentsOf: url) else { return nil }
        return try? JSONDecoder().decode(Config.self, from: data)
    }

    func save() throws {
        try FileManager.default.createDirectory(at: Self.directory, withIntermediateDirectories: true)
        try JSONEncoder().encode(self).write(to: Self.url, options: .atomic)
        try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: Self.url.path)
    }
}

enum UploadError: LocalizedError {
    case http(String, Int, String)
    var errorDescription: String? {
        if case let .http(step, code, body) = self { return "\(step): HTTP \(code) \(body.prefix(200))" }
        return nil
    }
}

/// Черга записів на диску: кожен — пара <id>.m4a + <id>.json. Файл видаляється
/// лише після того, як сайт підтвердив прийом, тож без інтернету нічого не губиться.
actor Uploader {
    static let queueDir = Config.directory.appendingPathComponent("queue")
    private var running = false

    static func enqueue(audio: URL, meta: FinishedRecording) throws {
        try FileManager.default.createDirectory(at: queueDir, withIntermediateDirectories: true)
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        try encoder.encode(meta).write(to: queueDir.appendingPathComponent("\(meta.externalId).json"))
        if audio.deletingLastPathComponent().standardizedFileURL != queueDir.standardizedFileURL {
            let target = queueDir.appendingPathComponent("\(meta.externalId).m4a")
            try? FileManager.default.removeItem(at: target)
            try FileManager.default.moveItem(at: audio, to: target)
        }
    }

    static func pendingCount() -> Int {
        ((try? FileManager.default.contentsOfDirectory(atPath: queueDir.path)) ?? []).filter { $0.hasSuffix(".json") }.count
    }

    /// Надіслати все, що в черзі. Повертає кількість надісланих.
    @discardableResult
    func flush() async -> Int {
        guard !running, let config = Config.load() else { return 0 }
        running = true
        defer { running = false }

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let files = (try? FileManager.default.contentsOfDirectory(at: Self.queueDir, includingPropertiesForKeys: nil)) ?? []
        var sent = 0
        for json in files where json.pathExtension == "json" {
            let audio = json.deletingPathExtension().appendingPathExtension("m4a")
            guard let data = try? Data(contentsOf: json),
                  let meta = try? decoder.decode(FinishedRecording.self, from: data),
                  FileManager.default.fileExists(atPath: audio.path)
            else {
                try? FileManager.default.removeItem(at: json)
                continue
            }
            do {
                try await upload(audio: audio, meta: meta, config: config)
                try? FileManager.default.removeItem(at: audio)
                try? FileManager.default.removeItem(at: json)
                sent += 1
                Log.write("✅ надіслано: \(meta.fileName)")
            } catch {
                Log.write("⚠️ не надіслано \(meta.fileName): \(error.localizedDescription)")
            }
        }
        return sent
    }

    private func upload(audio: URL, meta: FinishedRecording, config: Config) async throws {
        let base = config.baseURL.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        let size = (try FileManager.default.attributesOfItem(atPath: audio.path)[.size] as? NSNumber)?.intValue ?? 0

        struct Start: Decodable { let id: String; let key: String?; let url: String?; let contentType: String?; let uploaded: Bool }
        let start: Start = try await post("\(base)/api/ingest/conversations", config.token, [
            "externalId": meta.externalId,
            "fileName": meta.fileName,
            "contentType": "audio/mp4",
            "size": size,
            "recordedAt": ISO8601DateFormatter().string(from: meta.recordedAt),
            "durationMs": meta.durationMs,
        ], step: "реєстрація")
        if start.uploaded { return }
        guard let key = start.key, let putURL = start.url.flatMap(URL.init(string:)) else {
            throw UploadError.http("реєстрація", 0, "немає посилання")
        }

        var put = URLRequest(url: putURL)
        put.httpMethod = "PUT"
        put.setValue(start.contentType ?? "audio/mp4", forHTTPHeaderField: "Content-Type")
        put.timeoutInterval = 600
        let (body, response) = try await URLSession.shared.upload(for: put, fromFile: audio)
        let code = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard (200..<300).contains(code) else {
            throw UploadError.http("завантаження", code, String(decoding: body, as: UTF8.self))
        }

        struct Done: Decodable { let ok: Bool }
        let _: Done = try await post("\(base)/api/ingest/conversations/\(start.id)/complete", config.token, [
            "key": key,
            "contentType": start.contentType ?? "audio/mp4",
        ], step: "підтвердження")
    }

    private func post<T: Decodable>(_ url: String, _ token: String, _ body: [String: Any], step: String) async throws -> T {
        var request = URLRequest(url: URL(string: url)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        request.timeoutInterval = 60
        let (data, response) = try await URLSession.shared.data(for: request)
        let code = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard (200..<300).contains(code) else { throw UploadError.http(step, code, String(decoding: data, as: UTF8.self)) }
        return try JSONDecoder().decode(T.self, from: data)
    }
}
