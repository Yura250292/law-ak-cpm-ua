"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default function CaseAnalysisPage() {
  const router = useRouter();

  // Upload state
  const [files, setFiles] = useState<File[]>([]);
  const [pastedText, setPastedText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Analysis state
  const [analysis, setAnalysis] = useState("");
  const [caseContext, setCaseContext] = useState("");
  const [fileName, setFileName] = useState("");

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ── Add files ──
  function addFiles(newFiles: FileList | File[]) {
    const arr = Array.from(newFiles);
    setFiles((prev) => [...prev, ...arr]);
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

    setUploading(true);
    setError("");
    setAnalysis("");
    setChatMessages([]);

    try {
      const fd = new FormData();
      for (const f of files) {
        fd.append("files", f);
      }
      if (pastedText.trim()) {
        fd.append("text", pastedText);
      }

      const res = await fetch("/api/admin/case-analysis", {
        method: "POST",
        body: fd,
      });

      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Помилка аналізу");
      }

      setAnalysis(data.analysis);
      setCaseContext(data.documentText);
      setFileName(data.fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка аналізу");
    } finally {
      setUploading(false);
    }
  }

  // ── Chat ──
  const handleSendChat = useCallback(async () => {
    const q = chatInput.trim();
    if (!q || chatLoading) return;

    const userMsg: ChatMessage = { role: "user", text: q };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/admin/case-analysis/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseContext,
          chatHistory: [...chatMessages, userMsg],
          question: q,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Помилка");
      }

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer },
      ]);
    } catch (err) {
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
  }, [chatInput, chatLoading, caseContext, chatMessages]);

  // ── Reset ──
  function handleReset() {
    setFiles([]);
    setPastedText("");
    setAnalysis("");
    setCaseContext("");
    setChatMessages([]);
    setFileName("");
    setError("");
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
          {hasAnalysis && (
            <button
              onClick={handleReset}
              className="text-sm text-white/70 hover:text-white transition"
            >
              Нова справа
            </button>
          )}
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
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-primary mb-2">
                Аналіз справи
              </h1>
              <p className="text-muted text-sm">
                Завантажте документ або вставте текст — AI-помічник проаналізує
                справу, знайде ключові моменти та запропонує стратегію
              </p>
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
                accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp,.heic,.heif"
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
                    Документи: PDF, DOCX, DOC, TXT
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

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={files.length === 0 && !pastedText.trim()}
              className="w-full h-14 bg-accent text-primary font-bold text-base rounded-xl hover:bg-accent-hover hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Аналізувати справу
            </button>
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
            {/* LEFT: Analysis results */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-border p-6 max-h-[calc(100vh-140px)] overflow-y-auto">
                <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-4">
                  Результати аналізу
                </h2>
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer text={analysis} />
                </div>
              </div>
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
                  <div className="flex gap-2">
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
                      placeholder="Запитайте про справу, судову практику, статті..."
                      className="flex-1 h-11 px-4 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                      disabled={chatLoading}
                    />
                    <button
                      onClick={handleSendChat}
                      disabled={!chatInput.trim() || chatLoading}
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
