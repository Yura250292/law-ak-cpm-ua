"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { compressImage } from "@/lib/image-compress";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface GeneratedDocument {
  type: string;
  text: string;
  createdAt: string;
}

interface HistoryItem {
  id: string;
  title: string;
  models: string[];
  messageCount: number;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Per-file hard cap: avoid sending huge files even to R2. Multi-hundred-MB PDFs
// would just stall the AI step. R2 itself can take much more if ever needed.
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const IMAGE_RE = /\.(jpg|jpeg|png|webp|heic|heif)$/i;
const ACCEPTED_FILES =
  ".pdf,.docx,.doc,.rtf,.txt,.jpg,.jpeg,.png,.webp,.heic,.heif";

async function prepareFiles(newFiles: FileList | File[]): Promise<File[]> {
  return Promise.all(
    Array.from(newFiles).map(async (f) => {
      if (IMAGE_RE.test(f.name)) {
        try {
          return await compressImage(f);
        } catch {
          return f;
        }
      }
      return f;
    })
  );
}

class UnauthorizedError extends Error {}

/**
 * Parses a JSON response. When the server is restarting or the process died
 * mid-request, the proxy returns an empty/HTML 502 — res.json() would throw a
 * cryptic "string did not match the expected pattern" (Safari).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function readJson(res: Response): Promise<any> {
  const raw = await res.text();
  try {
    return JSON.parse(raw);
  } catch {
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(
        `Сервер не відповів (${res.status}) — він перезапускався або не впорався з запитом. Спробуйте ще раз за хвилину.`
      );
    }
    throw new Error(`Сервер повернув неочікувану відповідь (${res.status}). Спробуйте ще раз.`);
  }
}

/**
 * Uploads files directly to R2 via presigned URL (bypasses the server body
 * size limit) and returns their keys.
 */
async function uploadToR2(files: File[]): Promise<{ key: string; name: string }[]> {
  const uploaded: { key: string; name: string }[] = [];
  for (const f of files) {
    const presignRes = await fetch("/api/admin/case-analysis/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: f.name,
        contentType: f.type || "application/octet-stream",
      }),
    });
    if (presignRes.status === 401) throw new UnauthorizedError();
    const presignData = await readJson(presignRes);
    if (!presignRes.ok) {
      throw new Error(presignData.error ?? "Не вдалося отримати URL");
    }

    const putRes = await fetch(presignData.url, {
      method: "PUT",
      headers: { "Content-Type": presignData.contentType },
      body: f,
    });
    if (!putRes.ok) {
      throw new Error(
        `Не вдалося завантажити "${f.name}" у сховище (${putRes.status})`
      );
    }
    uploaded.push({ key: presignData.key, name: f.name });
  }
  return uploaded;
}

function findTooBig(files: File[]): string | null {
  const tooBig = files.find((f) => f.size > MAX_FILE_BYTES);
  return tooBig
    ? `Файл "${tooBig.name}" завеликий (${(tooBig.size / 1024 / 1024).toFixed(1)} МБ). Максимум — 50 МБ на файл.`
    : null;
}

export default function CaseAnalysisPage() {
  const router = useRouter();

  // Upload state
  const [lawyerTask, setLawyerTask] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [pastedText, setPastedText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [aiMode, setAiMode] = useState<"synergy" | "gemini" | "claude">(
    "synergy"
  );

  // Document generation state
  const [generatingDoc, setGeneratingDoc] = useState(false);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [activeDocIndex, setActiveDocIndex] = useState(-1);
  const activeDoc = documents[activeDocIndex] ?? null;
  const generatedDoc = activeDoc?.text ?? "";

  // History state
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const visibleHistory = historyQuery.trim()
    ? history.filter((h) =>
        h.title.toLowerCase().includes(historyQuery.trim().toLowerCase())
      )
    : history;

  // Analysis state
  const [analysis, setAnalysis] = useState("");
  const [caseContext, setCaseContext] = useState("");
  const [fileName, setFileName] = useState("");
  const [analysisModels, setAnalysisModels] = useState<string[]>([]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatFiles, setChatFiles] = useState<File[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/admin/case-analysis/history");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await readJson(res);
      if (res.ok) setHistory(data.items ?? []);
    } catch {
      // History is optional — the page works without it.
    } finally {
      setHistoryLoading(false);
    }
  }, [router]);

  const hasAnalysisNow = !!analysis;
  useEffect(() => {
    if (!hasAnalysisNow) loadHistory();
  }, [hasAnalysisNow, loadHistory]);

  async function openHistory(id: string) {
    setError("");
    try {
      const res = await fetch(`/api/admin/case-analysis/history/${id}`);
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error ?? "Не вдалося відкрити аналіз");
      const item = data.item;
      const docs: GeneratedDocument[] = Array.isArray(item.documents) ? item.documents : [];
      setAnalysisId(item.id);
      setLawyerTask(item.lawyerTask ?? "");
      setAnalysis(item.analysis);
      setCaseContext(item.caseContext);
      setFileName(item.fileNames?.length ? item.fileNames.join(", ") : item.title);
      setAnalysisModels(item.models ?? []);
      if (item.mode === "gemini" || item.mode === "claude") setAiMode(item.mode);
      setChatMessages(Array.isArray(item.messages) ? item.messages : []);
      setDocuments(docs);
      setActiveDocIndex(docs.length - 1);
      setFiles([]);
      setChatFiles([]);
      setPastedText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося відкрити аналіз");
    }
  }

  async function renameHistory(item: HistoryItem) {
    const title = window.prompt("Назва справи", item.title)?.trim();
    if (!title || title === item.title) return;
    const res = await fetch(`/api/admin/case-analysis/history/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      setHistory((prev) => prev.map((h) => (h.id === item.id ? { ...h, title } : h)));
    } else {
      setError("Не вдалося перейменувати справу");
    }
  }

  async function deleteHistory(item: HistoryItem) {
    if (!window.confirm(`Видалити аналіз «${item.title}» разом із чатом і документами?`)) return;
    const res = await fetch(`/api/admin/case-analysis/history/${item.id}`, {
      method: "DELETE",
    });
    if (res.ok) setHistory((prev) => prev.filter((h) => h.id !== item.id));
    else setError("Не вдалося видалити аналіз");
  }

  // ── Add files ──
  async function addFiles(newFiles: FileList | File[]) {
    const processed = await prepareFiles(newFiles);
    setFiles((prev) => [...prev, ...processed]);
  }

  async function addChatFiles(newFiles: FileList | File[]) {
    const processed = await prepareFiles(newFiles);
    setChatFiles((prev) => [...prev, ...processed]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Upload & Analyze ──
  async function handleAnalyze() {
    if (files.length === 0 && !pastedText.trim()) {
      setError("Завантажте файли, фото або вставте текст справи");
      return;
    }

    const tooBigError = findTooBig(files);
    if (tooBigError) {
      setError(tooBigError);
      return;
    }

    setUploading(true);
    setError("");
    setAnalysis("");
    setChatMessages([]);

    try {
      // Step 1: upload each file directly to R2 via presigned URL.
      const uploaded = await uploadToR2(files);

      // Step 2: trigger analysis with R2 keys (small JSON payload).
      const res = await fetch("/api/admin/case-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lawyerTask: lawyerTask.trim() || undefined,
          text: pastedText.trim() || undefined,
          files: uploaded,
          mode: aiMode,
        }),
      });

      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await readJson(res);

      if (!res.ok) {
        throw new Error(data.error ?? "Помилка аналізу");
      }

      setAnalysisId(data.analysisId ?? null);
      setDocuments([]);
      setActiveDocIndex(-1);
      setAnalysis(data.analysis);
      setCaseContext(data.documentText);
      setFileName(data.fileName);
      setAnalysisModels(Array.isArray(data.models) ? data.models : []);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        router.push("/admin/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Помилка аналізу");
    } finally {
      setUploading(false);
    }
  }

  // ── Chat ──
  const handleSendChat = useCallback(async () => {
    const q = chatInput.trim();
    const attached = chatFiles;
    if ((!q && attached.length === 0) || chatLoading) return;

    const tooBigError = findTooBig(attached);
    if (tooBigError) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Помилка: ${tooBigError}` },
      ]);
      return;
    }

    const fileLine = attached.length
      ? `📎 ${attached.map((f) => f.name).join(", ")}`
      : "";
    const userMsg: ChatMessage = {
      role: "user",
      text: [fileLine, q].filter(Boolean).join("\n"),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatFiles([]);
    if (chatFileInputRef.current) chatFileInputRef.current.value = "";
    setChatLoading(true);

    try {
      const uploaded = attached.length ? await uploadToR2(attached) : [];

      const res = await fetch("/api/admin/case-analysis/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseContext: lawyerTask
            ? `ЗАВДАННЯ АДВОКАТА: ${lawyerTask}\n\n${caseContext}`
            : caseContext,
          analysisResult: analysis,
          chatHistory: [...chatMessages, userMsg],
          question: q,
          files: uploaded,
          analysisId,
        }),
      });

      if (res.status === 401) throw new UnauthorizedError();
      const data = await readJson(res);

      if (!res.ok) {
        throw new Error(data.error ?? "Помилка");
      }

      // Added documents stay in the case context for the next questions
      // and for document generation.
      if (data.addedText) {
        setCaseContext((prev) => prev + data.addedText);
      }
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer },
      ]);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        router.push("/admin/login");
        return;
      }
      // Give the question and attached files back, so a retry is one click.
      setChatInput((cur) => cur || q);
      setChatFiles((cur) => (cur.length ? cur : attached));
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Помилка: ${err instanceof Error ? err.message : "невідома"}`,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [
    chatInput,
    chatFiles,
    chatLoading,
    lawyerTask,
    caseContext,
    analysis,
    chatMessages,
    analysisId,
    router,
  ]);

  // ── Generate document ──
  async function handleGenerateDocument(docType: string) {
    setGeneratingDoc(true);

    try {
      const res = await fetch("/api/admin/case-analysis/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseContext,
          analysisResult: analysis,
          chatHistory: [],
          analysisId,
          documentType: docType,
          question: `Сформуй повний текст процесуального документа: "${docType}".

Вимоги:
1. Документ має бути ПОВНИМ і ГОТОВИМ до подання — зі всіма реквізитами
2. Використай ВСІ дані сторін та обставини з матеріалів справи
3. Структура: шапка (суд, сторони) → заголовок → описова частина → мотивувальна частина → прохальна частина → додатки → дата, підпис
4. Посилайся тільки на реальні статті законів [ТОЧНО]
5. Формат: готовий юридичний документ українською мовою
6. НЕ додавай коментарів — тільки текст документа`,
        }),
      });

      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error ?? "Помилка");
      // Buttons are disabled while generating, so `documents` is current here.
      setDocuments([
        ...documents,
        { type: docType, text: data.answer, createdAt: new Date().toISOString() },
      ]);
      setActiveDocIndex(documents.length);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Помилка формування документа"
      );
    } finally {
      setGeneratingDoc(false);
    }
  }

  // ── Export ──
  async function handleExport(
    content: string,
    format: "pdf" | "doc" | "txt",
    title: string
  ) {
    try {
      const res = await fetch("/api/admin/case-analysis/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, format, title }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Помилка експорту");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format === "doc" ? "doc" : format;
      a.download = `${title.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_")}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка експорту");
    }
  }

  // ── Reset ──
  function handleReset() {
    setLawyerTask("");
    setFiles([]);
    setPastedText("");
    setAnalysis("");
    setCaseContext("");
    setChatMessages([]);
    setChatFiles([]);
    setFileName("");
    setAnalysisModels([]);
    setError("");
    setDocuments([]);
    setActiveDocIndex(-1);
    setAnalysisId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── File drag & drop ──
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  const hasAnalysis = !!analysis;
  const imageCount = files.filter((f) =>
    /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(f.name)
  ).length;
  const docCount = files.length - imageCount;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-primary text-white sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-white/70 hover:text-white transition text-sm"
            >
              &larr; До заявок
            </Link>
            <div className="hidden sm:block h-4 w-px bg-white/20" />
            <span className="text-sm font-medium">Аналіз справи</span>
            {fileName && (
              <>
                <div className="hidden sm:block h-4 w-px bg-white/20" />
                <span className="text-xs text-white/60 truncate max-w-[200px]">
                  {fileName}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
          <Link
            href="/admin/sources"
            className="text-sm text-white/70 hover:text-white transition"
          >
            Джерела
          </Link>
          {hasAnalysis && (
            <button
              onClick={handleReset}
              className="text-sm text-white/70 hover:text-white transition"
            >
              Нова справа
            </button>
          )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error */}
        {error && (
          <div className="mb-5 px-5 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {/* ══════ UPLOAD PHASE ══════ */}
        {!hasAnalysis && !uploading && (
          <div className="max-w-2xl mx-auto space-y-6 mt-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-primary mb-2">
                Аналіз справи
              </h1>
              <p className="text-muted text-sm">
                Опишіть задачу, завантажте документи — AI-помічник проаналізує
                та запропонує стратегію вирішення
              </p>
            </div>

            {/* Lawyer task / instruction */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="text-sm font-bold text-primary mb-2">
                Що потрібно зробити? (завдання для помічника)
              </h3>
              <p className="text-xs text-muted mb-3">
                Опишіть що саме потрібно: аналіз рішення, пошук шляхів
                вирішення, підготовка документа, хронологія кроків тощо
              </p>
              <textarea
                value={lawyerTask}
                onChange={(e) => setLawyerTask(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                placeholder="Наприклад:
• Аналіз справи + стратегія захисту + підготовка позовної заяви
• Перевір проєкт договору дарування частки в СК ТОВ — чи закриті всі питання, що додати
• Аналіз статуту ТОВ для нового одноосібного учасника — які зміни внести, щоб у майбутньому без перешкод продати частку третім особам
• Хронологія кроків + законодавство + судова практика по справі..."
              />
            </div>

            {/* File upload */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="bg-white rounded-2xl border-2 border-dashed border-border hover:border-accent transition p-8 text-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILES}
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    addFiles(e.target.files);
                  }
                }}
              />
              {files.length > 0 ? (
                <div className="text-left">
                  <p className="font-medium text-primary text-center mb-3">
                    {files.length} файл(ів) обрано
                    {imageCount > 0 && ` (${imageCount} фото)`}
                  </p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-surface rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm shrink-0">
                            {/\.(jpg|jpeg|png|webp|heic|heif)$/i.test(f.name)
                              ? "\uD83D\uDDBC\uFE0F"
                              : "\uD83D\uDCC4"}
                          </span>
                          <span className="text-sm text-primary truncate">
                            {f.name}
                          </span>
                          <span className="text-xs text-muted shrink-0">
                            {(f.size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(i);
                          }}
                          className="text-red-400 hover:text-red-600 text-sm shrink-0 ml-2"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted text-center mt-3">
                    Натисніть щоб додати ще файли
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-primary">
                    Перетягніть файли сюди або натисніть для вибору
                  </p>
                  <p className="text-xs text-muted mt-2">
                    Документи: PDF, DOCX, DOC, RTF, TXT
                  </p>
                  <p className="text-xs text-muted">
                    Фото документів: JPG, PNG, WEBP, HEIC
                  </p>
                  <p className="text-xs text-accent font-medium mt-2">
                    Можна завантажити кілька файлів одночасно
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted">або вставте текст</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Paste text */}
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
              placeholder="Вставте текст справи, позовної заяви, рішення суду..."
            />

            {/* AI mode selector */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="text-sm font-bold text-primary mb-1">
                Режим AI
              </h3>
              <p className="text-xs text-muted mb-3">
                Синергія — Gemini готує чернетку, Claude перевіряє та
                фіналізує. Найвища якість, але повільніше.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: "synergy" as const,
                    title: "Синергія",
                    sub: "Gemini + Claude",
                    rec: true,
                  },
                  {
                    id: "gemini" as const,
                    title: "Тільки Gemini",
                    sub: "2.5 Pro · швидко",
                    rec: false,
                  },
                  {
                    id: "claude" as const,
                    title: "Тільки Claude",
                    sub: "Opus 4.7",
                    rec: false,
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setAiMode(m.id)}
                    className={`relative px-3 py-3 rounded-xl border text-left transition ${
                      aiMode === m.id
                        ? "border-accent bg-accent/10 ring-2 ring-accent/40"
                        : "border-border bg-surface hover:border-accent/60"
                    }`}
                  >
                    {m.rec && (
                      <span className="absolute -top-2 right-2 text-[10px] font-bold bg-accent text-primary px-1.5 py-0.5 rounded">
                        РЕКОМЕНД.
                      </span>
                    )}
                    <div className="text-sm font-semibold text-primary">
                      {m.title}
                    </div>
                    <div className="text-[11px] text-muted mt-0.5">
                      {m.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={files.length === 0 && !pastedText.trim()}
              className="w-full h-14 bg-accent text-primary font-bold text-base rounded-xl hover:bg-accent-hover hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Аналізувати справу
            </button>

            {/* History */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-primary">
                  Історія аналізів
                </h3>
                {historyLoading && (
                  <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full" />
                )}
              </div>
              {history.length > 5 && (
                <input
                  type="search"
                  value={historyQuery}
                  onChange={(e) => setHistoryQuery(e.target.value)}
                  placeholder="Пошук за назвою справи…"
                  className="w-full h-9 px-3 mb-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent transition"
                />
              )}
              {history.length === 0 && !historyLoading ? (
                <p className="text-xs text-muted">
                  Тут з’являться збережені аналізи — з чатом і сформованими
                  документами.
                </p>
              ) : (
                <ul className="divide-y divide-border max-h-[60vh] overflow-y-auto">
                  {visibleHistory.length === 0 && (
                    <li className="py-2.5 text-xs text-muted">Нічого не знайдено</li>
                  )}
                  {visibleHistory.map((h) => (
                    <li key={h.id} className="flex items-center gap-3 py-2.5">
                      <button
                        onClick={() => openHistory(h.id)}
                        className="flex-1 min-w-0 text-left group"
                      >
                        <div className="text-sm font-medium text-primary truncate group-hover:underline">
                          {h.title}
                        </div>
                        <div className="text-[11px] text-muted mt-0.5">
                          {formatDate(h.updatedAt)}
                          {h.messageCount > 0 &&
                            ` · чат: ${Math.ceil(h.messageCount / 2)}`}
                          {h.documentCount > 0 &&
                            ` · документів: ${h.documentCount}`}
                        </div>
                      </button>
                      <button
                        onClick={() => renameHistory(h)}
                        className="shrink-0 px-2 py-1 text-xs text-muted hover:text-primary transition"
                        aria-label={`Перейменувати ${h.title}`}
                      >
                        Перейменувати
                      </button>
                      <button
                        onClick={() => deleteHistory(h)}
                        className="shrink-0 px-2 py-1 text-xs text-muted hover:text-red-700 transition"
                        aria-label={`Видалити ${h.title}`}
                      >
                        Видалити
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ══════ LOADING ══════ */}
        {uploading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-accent border-t-transparent rounded-full mb-4" />
            <p className="text-primary font-medium">
              AI аналізує справу...
            </p>
            <p className="text-muted text-sm mt-1">
              Це може зайняти 30-60 секунд
            </p>
          </div>
        )}

        {/* ══════ ANALYSIS RESULTS + CHAT ══════ */}
        {hasAnalysis && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* LEFT: Analysis results + Document generation */}
            <div className="space-y-5 max-h-[calc(100vh-140px)] overflow-y-auto">
              <div className="bg-white rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide">
                    Результати аналізу
                  </h2>
                  <ExportButtons
                    onExport={(fmt) =>
                      handleExport(
                        analysis,
                        fmt,
                        `Аналіз справи${fileName ? " - " + fileName.replace(/\.[^.]+$/, "") : ""}`
                      )
                    }
                  />
                </div>
                {analysisModels.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-4 text-xs">
                    <span className="text-muted">Брали участь:</span>
                    {analysisModels.map((m, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-accent/15 text-primary font-medium border border-accent/30"
                      >
                        {m}
                      </span>
                    ))}
                    {analysisModels.length > 1 && (
                      <span
                        className="text-muted"
                        title="Перша модель готує чернетку, друга перевіряє і доповнює"
                      >
                        · синергія
                      </span>
                    )}
                  </div>
                )}
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer text={analysis} />
                </div>
              </div>

              {/* Document generation */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">
                  Сформувати документ
                </h2>
                <p className="text-xs text-muted mb-3">
                  На основі аналізу сформуйте процесуальний документ: позовну
                  заяву, скаргу, клопотання, заяву про видачу судового наказу
                  тощо
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    "Позовна заява",
                    "Заява про видачу судового наказу",
                    "Апеляційна скарга",
                    "Касаційна скарга",
                    "Заява про збільшення позовних вимог",
                    "Заява про зміну предмету позову",
                    "Заява про примусове виконання",
                    "Клопотання",
                    "Відзив на позов",
                    "Заперечення",
                  ].map((docType) => (
                    <button
                      key={docType}
                      onClick={() =>
                        handleGenerateDocument(docType)
                      }
                      disabled={generatingDoc}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border text-primary hover:bg-accent hover:text-primary hover:border-accent transition disabled:opacity-40"
                    >
                      {docType}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Або введіть свій тип документа..."
                    className="flex-1 h-10 px-4 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent transition"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          handleGenerateDocument(val);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                    disabled={generatingDoc}
                  />
                </div>
                {generatingDoc && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted">
                    <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full" />
                    Формування документа...
                  </div>
                )}
              </div>

              {/* Generated document */}
              {generatedDoc && (
                <div className="bg-white rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                    <h2 className="text-sm font-bold text-primary uppercase tracking-wide">
                      Сформований документ
                      {activeDoc && (
                        <span className="ml-2 normal-case font-medium text-muted">
                          — {activeDoc.type}
                        </span>
                      )}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <ExportButtons
                        onExport={(fmt) =>
                          handleExport(generatedDoc, fmt, activeDoc?.type ?? "Документ")
                        }
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            generatedDoc.replace(/\*\*/g, "")
                          );
                        }}
                        className="px-3 py-1 text-xs font-medium rounded-lg bg-surface border border-border hover:bg-accent hover:border-accent transition"
                      >
                        Копіювати
                      </button>
                    </div>
                  </div>
                  {documents.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {documents.map((d, i) => (
                        <button
                          key={`${d.createdAt}-${i}`}
                          onClick={() => setActiveDocIndex(i)}
                          className={`px-3 py-1 text-xs rounded-lg border transition ${
                            i === activeDocIndex
                              ? "bg-accent border-accent text-primary font-semibold"
                              : "bg-surface border-border text-muted hover:text-primary"
                          }`}
                        >
                          {d.type} · {formatDate(d.createdAt)}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none">
                    <MarkdownRenderer text={generatedDoc} />
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Chat */}
            <div className="flex flex-col h-[calc(100vh-140px)]">
              <div className="bg-white rounded-2xl border border-border flex-1 flex flex-col overflow-hidden">
                {/* Chat header */}
                <div className="px-5 py-3 border-b border-border bg-surface rounded-t-2xl">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide">
                    Чат з помічником
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Запитуйте про справу, судову практику, статті кодексів
                  </p>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted text-sm mb-4">
                        Запитайте AI-помічника про цю справу
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          "Знайди судову практику по цій справі",
                          "Які ризики у цій справі?",
                          "Яку стратегію захисту обрати?",
                          "Знайди потрібну статтю кодексу",
                        ].map((hint) => (
                          <button
                            key={hint}
                            onClick={() => {
                              setChatInput(hint);
                            }}
                            className="px-3 py-1.5 text-xs text-muted bg-surface rounded-lg border border-border hover:bg-surface-dark transition"
                          >
                            {hint}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-primary text-white rounded-br-md"
                            : "bg-surface text-primary rounded-bl-md border border-border"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <MarkdownRenderer text={msg.text} />
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-surface rounded-2xl rounded-bl-md px-4 py-3 border border-border">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted rounded-full animate-bounce" />
                          <span
                            className="w-2 h-2 bg-muted rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <span
                            className="w-2 h-2 bg-muted rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Chat input */}
                <div className="px-4 py-3 border-t border-border">
                  {chatFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {chatFiles.map((f, i) => (
                        <span
                          key={`${f.name}-${i}`}
                          className="inline-flex items-center gap-1.5 max-w-full px-2.5 py-1 text-xs text-primary bg-surface rounded-lg border border-border"
                        >
                          <span className="truncate">📎 {f.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setChatFiles((prev) =>
                                prev.filter((_, j) => j !== i)
                              )
                            }
                            className="text-muted hover:text-primary shrink-0"
                            aria-label={`Прибрати ${f.name}`}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      ref={chatFileInputRef}
                      type="file"
                      accept={ACCEPTED_FILES}
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          addChatFiles(e.target.files);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => chatFileInputRef.current?.click()}
                      disabled={chatLoading}
                      title="Додати документи до справи (PDF, фото, DOCX)"
                      aria-label="Додати документи"
                      className="h-11 w-11 shrink-0 rounded-xl border border-border bg-surface text-lg hover:bg-surface-dark transition disabled:opacity-40"
                    >
                      📎
                    </button>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChat();
                        }
                      }}
                      placeholder={
                        chatFiles.length
                          ? "Що перевірити в нових документах? (можна порожнім)"
                          : "Запитайте про справу, судову практику, статті..."
                      }
                      className="flex-1 h-11 px-4 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                      disabled={chatLoading}
                    />
                    <button
                      onClick={handleSendChat}
                      disabled={
                        (!chatInput.trim() && chatFiles.length === 0) ||
                        chatLoading
                      }
                      className="h-11 px-5 bg-accent text-primary font-semibold rounded-xl hover:bg-accent-hover transition disabled:opacity-40 shrink-0"
                    >
                      &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/** Download buttons: PDF, Word, TXT */
function ExportButtons({
  onExport,
}: {
  onExport: (fmt: "pdf" | "doc" | "txt") => void | Promise<void>;
}) {
  const [busy, setBusy] = useState<"pdf" | "doc" | "txt" | null>(null);

  async function handle(fmt: "pdf" | "doc" | "txt") {
    setBusy(fmt);
    try {
      await onExport(fmt);
    } finally {
      setBusy(null);
    }
  }

  const btn =
    "px-2.5 py-1 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-accent hover:border-accent transition disabled:opacity-50";

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => handle("pdf")}
        disabled={busy !== null}
        className={btn}
        title="Завантажити як PDF"
      >
        {busy === "pdf" ? "..." : "PDF"}
      </button>
      <button
        onClick={() => handle("doc")}
        disabled={busy !== null}
        className={btn}
        title="Завантажити як Word"
      >
        {busy === "doc" ? "..." : "Word"}
      </button>
      <button
        onClick={() => handle("txt")}
        disabled={busy !== null}
        className={btn}
        title="Завантажити як TXT"
      >
        {busy === "txt" ? "..." : "TXT"}
      </button>
    </div>
  );
}

/** Simple markdown-to-HTML renderer for AI responses */
function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // H2: ## Header
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h3
          key={i}
          className="text-sm font-bold text-primary mt-4 mb-2 uppercase tracking-wide border-b border-border pb-1"
        >
          {trimmed.slice(3)}
        </h3>
      );
      continue;
    }

    // H3: ### Header
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="text-sm font-semibold text-primary mt-3 mb-1">
          {trimmed.slice(4)}
        </h4>
      );
      continue;
    }

    // Bold line or list
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <div key={i} className="flex gap-2 ml-2 my-0.5">
          <span className="text-accent shrink-0 mt-0.5">&bull;</span>
          <span>
            <InlineFormatted text={trimmed.slice(2)} />
          </span>
        </div>
      );
      continue;
    }

    // Numbered list
    if (trimmed.match(/^\d+[\.\)]\s/)) {
      elements.push(
        <div key={i} className="ml-2 my-0.5">
          <InlineFormatted text={trimmed} />
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="my-1">
        <InlineFormatted text={trimmed} />
      </p>
    );
  }

  return <>{elements}</>;
}

/** Render inline markdown: **bold**, [links](url), `code` */
function InlineFormatted({ text }: { text: string }) {
  // Split by patterns: **bold**, [text](url), `code`, [ТОЧНО], [ПЕРЕВІРИТИ]
  const parts = text.split(
    /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\`[^`]+\`|\[ТОЧНО\]|\[ПЕРЕВІРИТИ\])/g
  );

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }

        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        // Only plain http(s) URLs become links — never javascript:, data: or URLs with spaces.
        if (linkMatch && !/^https?:\/\/\S+$/i.test(linkMatch[2].trim())) {
          return <span key={i}>{linkMatch[1]}</span>;
        }
        if (linkMatch) {
          return (
            <a
              key={i}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              {linkMatch[1]}
            </a>
          );
        }

        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="bg-surface px-1.5 py-0.5 rounded text-xs font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        if (part === "[ТОЧНО]") {
          return (
            <span
              key={i}
              className="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded ml-1"
            >
              ТОЧНО
            </span>
          );
        }

        if (part === "[ПЕРЕВІРИТИ]") {
          return (
            <span
              key={i}
              className="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-700 rounded ml-1"
            >
              ПЕРЕВІРИТИ
            </span>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
