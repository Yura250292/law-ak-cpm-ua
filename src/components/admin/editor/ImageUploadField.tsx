"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/image-compress";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  /** "content" (зображення) або "sample-file" (дозволяє й PDF). */
  kind?: "content" | "sample-file";
  label?: string;
}

/**
 * Завантажує зображення напряму в R2 через presigned URL і повертає публічний URL.
 * Стискає зображення на клієнті перед відправкою.
 */
export function ImageUploadField({
  value,
  onChange,
  kind = "content",
  label,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const prepared = kind === "sample-file" ? file : await compressImage(file);

      const presignRes = await fetch("/api/admin/content/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: prepared.name,
          contentType: prepared.type,
          kind: kind === "sample-file" ? "sample-file" : undefined,
        }),
      });
      if (!presignRes.ok) {
        const data = await presignRes.json().catch(() => ({}));
        throw new Error(data.error || "Не вдалося отримати URL");
      }
      const { url, publicUrl, contentType } = await presignRes.json();

      const putRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: prepared,
      });
      if (!putRes.ok) throw new Error("Помилка завантаження у сховище");

      onChange(publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка завантаження");
    } finally {
      setUploading(false);
    }
  }

  const isPdf = value.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-2">
      {label ? (
        <span className="block text-sm font-medium text-primary">{label}</span>
      ) : null}

      {value ? (
        <div className="flex items-center gap-3">
          {isPdf ? (
            <span className="flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-surface text-xs font-bold text-accent">
              PDF
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-16 w-16 rounded-lg border border-border object-cover"
            />
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm text-red-500 hover:underline"
          >
            Видалити
          </button>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={kind === "sample-file" ? "image/*,application/pdf" : "image/*"}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-primary transition hover:border-accent/40 disabled:opacity-50"
      >
        {uploading ? "Завантаження…" : value ? "Замінити файл" : "Завантажити файл"}
      </button>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

export default ImageUploadField;
