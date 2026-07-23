"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BLOCK_LABELS,
  BLOCK_TYPES,
  estimateReadTime,
  newBlock,
  type Block,
  type BlockType,
} from "@/lib/content-blocks";
import { slugify } from "@/lib/translit";
import { BlockEditor } from "./BlockEditors";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import { ImageUploadField } from "./ImageUploadField";

interface ArticleMeta {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  coverImage: string | null;
  readTime: string;
  status: "DRAFT" | "PUBLISHED";
}

interface ArticleEditorProps {
  id?: string;
  initial?: ArticleMeta & { blocks: Block[] };
}

const EMPTY: ArticleMeta & { blocks: Block[] } = {
  title: "",
  slug: "",
  excerpt: "",
  category: "Загальне",
  author: "Кабаль Анастасія",
  coverImage: null,
  readTime: "5 хв",
  status: "DRAFT",
  blocks: [],
};

const fieldCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export function ArticleEditor({ id, initial }: ArticleEditorProps) {
  const router = useRouter();
  const [meta, setMeta] = useState<ArticleMeta>(initial ?? EMPTY);
  const [blocks, setBlocks] = useState<Block[]>(initial?.blocks ?? []);
  const [slugLocked, setSlugLocked] = useState<boolean>(Boolean(initial?.slug));
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentId, setCurrentId] = useState<string | undefined>(id);

  // Авто-slug з заголовка, поки не редагували вручну.
  useEffect(() => {
    if (!slugLocked) {
      setMeta((m) => ({ ...m, slug: slugify(m.title) }));
    }
  }, [meta.title, slugLocked]);

  const computedReadTime = useMemo(() => estimateReadTime(blocks), [blocks]);

  function updateMeta<K extends keyof ArticleMeta>(key: K, val: ArticleMeta[K]) {
    setMeta((m) => ({ ...m, [key]: val }));
  }

  // ── Операції з блоками ──
  function addBlock(type: BlockType) {
    setBlocks((b) => [...b, newBlock(type)]);
  }
  function updateBlock(i: number, block: Block) {
    setBlocks((b) => b.map((x, idx) => (idx === i ? block : x)));
  }
  function removeBlock(i: number) {
    setBlocks((b) => b.filter((_, idx) => idx !== i));
  }
  function moveBlock(i: number, dir: -1 | 1) {
    setBlocks((b) => {
      const j = i + dir;
      if (j < 0 || j >= b.length) return b;
      const copy = [...b];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  async function save(status: "DRAFT" | "PUBLISHED") {
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...meta,
        status,
        readTime: computedReadTime,
        blocks,
      };
      const url = currentId
        ? `/api/admin/content/articles/${currentId}`
        : "/api/admin/content/articles";
      const method = currentId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Помилка збереження");

      setMeta((m) => ({ ...m, status }));
      if (!currentId && data.article?.id) {
        setCurrentId(data.article.id);
        router.replace(`/admin/articles/${data.article.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка збереження");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/articles")}
            className="text-sm text-muted hover:text-primary"
          >
            ← До списку
          </button>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              meta.status === "PUBLISHED"
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {meta.status === "PUBLISHED" ? "Опубліковано" : "Чернетка"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-2 flex rounded-lg border border-border bg-white p-0.5 text-sm">
            <button
              onClick={() => setTab("edit")}
              className={`rounded-md px-3 py-1 ${tab === "edit" ? "bg-primary text-white" : "text-muted"}`}
            >
              Редактор
            </button>
            <button
              onClick={() => setTab("preview")}
              className={`rounded-md px-3 py-1 ${tab === "preview" ? "bg-primary text-white" : "text-muted"}`}
            >
              Перегляд
            </button>
          </div>
          {currentId ? (
            <a
              href={`/admin/preview/article/${currentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary transition hover:border-accent/40"
            >
              Відкрити перегляд
            </a>
          ) : null}
          <button
            onClick={() => save("DRAFT")}
            disabled={saving}
            className="rounded-lg border-2 border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
          >
            {saving ? "…" : "Зберегти чернетку"}
          </button>
          <button
            onClick={() => save(meta.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")}
            disabled={saving}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-primary transition hover:bg-accent-hover disabled:opacity-50"
          >
            {meta.status === "PUBLISHED" ? "Зняти з публікації" : "Опублікувати"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {tab === "preview" ? (
        <div className="rounded-2xl border border-border bg-white p-6 sm:p-10">
          {blocks.length === 0 ? (
            <p className="text-center text-muted">Ще немає блоків для перегляду</p>
          ) : (
            <BlockRenderer blocks={blocks} />
          )}
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Blocks column */}
          <div className="order-2 space-y-4 lg:order-1">
            {blocks.map((block, i) => (
              <div key={block.id} className="rounded-2xl border border-border bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent">
                    {BLOCK_LABELS[block.type]}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveBlock(i, -1)}
                      disabled={i === 0}
                      className="rounded px-2 py-1 text-muted hover:bg-surface disabled:opacity-30"
                      title="Вгору"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveBlock(i, 1)}
                      disabled={i === blocks.length - 1}
                      className="rounded px-2 py-1 text-muted hover:bg-surface disabled:opacity-30"
                      title="Вниз"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeBlock(i)}
                      className="rounded px-2 py-1 text-red-500 hover:bg-red-50"
                      title="Видалити"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <BlockEditor block={block} onChange={(b) => updateBlock(i, b)} />
              </div>
            ))}

            {/* Add block palette */}
            <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-4">
              <p className="mb-2 text-sm font-medium text-muted">Додати блок:</p>
              <div className="flex flex-wrap gap-2">
                {BLOCK_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-primary transition hover:border-accent/40 hover:text-accent"
                  >
                    + {BLOCK_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Metadata sidebar */}
          <aside className="order-1 space-y-4 lg:order-2">
            <div className="space-y-3 rounded-2xl border border-border bg-white p-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-primary">Заголовок</span>
                <input
                  value={meta.title}
                  onChange={(e) => updateMeta("title", e.target.value)}
                  className={fieldCls}
                  placeholder="Назва статті"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-primary">
                  Slug (URL)
                </span>
                <input
                  value={meta.slug}
                  onChange={(e) => {
                    setSlugLocked(true);
                    updateMeta("slug", e.target.value);
                  }}
                  className={fieldCls}
                  placeholder="url-adresa"
                />
                <span className="mt-1 block text-xs text-muted">/blog/{meta.slug || "…"}</span>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-primary">
                  Короткий опис
                </span>
                <textarea
                  value={meta.excerpt}
                  onChange={(e) => updateMeta("excerpt", e.target.value)}
                  className={fieldCls + " min-h-[70px] resize-y"}
                  placeholder="Анонс для списку та SEO"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-primary">Категорія</span>
                <input
                  value={meta.category}
                  onChange={(e) => updateMeta("category", e.target.value)}
                  className={fieldCls}
                  placeholder="Сімейне право"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-primary">Автор</span>
                <input
                  value={meta.author}
                  onChange={(e) => updateMeta("author", e.target.value)}
                  className={fieldCls}
                />
              </label>
              <div className="text-xs text-muted">
                Час читання: <b>{computedReadTime}</b> (авто)
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-4">
              <span className="mb-2 block text-sm font-medium text-primary">
                Обкладинка
              </span>
              <ImageUploadField
                value={meta.coverImage ?? ""}
                onChange={(url) => updateMeta("coverImage", url || null)}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default ArticleEditor;
