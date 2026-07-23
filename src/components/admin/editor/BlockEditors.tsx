"use client";

import { useRef } from "react";
import type { Block } from "@/lib/content-blocks";
import { ImageUploadField } from "./ImageUploadField";

const inputCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
const textareaCls = inputCls + " min-h-[80px] resize-y leading-relaxed";

interface EditorProps<T extends Block> {
  block: T;
  onChange: (block: T) => void;
}

export function HeadingBlockEditor({ block, onChange }: EditorProps<Extract<Block, { type: "heading" }>>) {
  return (
    <div className="flex gap-2">
      <select
        value={block.level}
        onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 2 | 3 })}
        className={inputCls + " w-24"}
      >
        <option value={2}>H2</option>
        <option value={3}>H3</option>
      </select>
      <input
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Текст заголовка"
        className={inputCls}
      />
    </div>
  );
}

export function ParagraphBlockEditor({ block, onChange }: EditorProps<Extract<Block, { type: "paragraph" }>>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function insertLink() {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = block.text.slice(start, end) || "текст";
    const token = `[${selected}](https://)`;
    const next = block.text.slice(0, start) + token + block.text.slice(end);
    onChange({ ...block, text: next });
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={ref}
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Текст абзацу. Посилання: [текст](https://…)"
        className={textareaCls}
      />
      <button
        type="button"
        onClick={insertLink}
        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-primary"
      >
        Вставити посилання
      </button>
    </div>
  );
}

export function ImageBlockEditor({ block, onChange }: EditorProps<Extract<Block, { type: "image" }>>) {
  return (
    <div className="space-y-2">
      <ImageUploadField
        value={block.url}
        onChange={(url) => onChange({ ...block, url })}
      />
      <input
        value={block.alt}
        onChange={(e) => onChange({ ...block, alt: e.target.value })}
        placeholder="Опис зображення (alt)"
        className={inputCls}
      />
      <input
        value={block.caption ?? ""}
        onChange={(e) => onChange({ ...block, caption: e.target.value })}
        placeholder="Підпис (необовʼязково)"
        className={inputCls}
      />
    </div>
  );
}

export function ListBlockEditor({ block, onChange }: EditorProps<Extract<Block, { type: "list" }>>) {
  function setItem(i: number, val: string) {
    const items = [...block.items];
    items[i] = val;
    onChange({ ...block, items });
  }
  function addItem() {
    onChange({ ...block, items: [...block.items, ""] });
  }
  function removeItem(i: number) {
    onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-2">
      <select
        value={block.style}
        onChange={(e) => onChange({ ...block, style: e.target.value as "bullet" | "numbered" })}
        className={inputCls + " w-40"}
      >
        <option value="bullet">Маркований</option>
        <option value="numbered">Нумерований</option>
      </select>
      {block.items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={it}
            onChange={(e) => setItem(i, e.target.value)}
            placeholder={`Пункт ${i + 1}`}
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="shrink-0 rounded-lg border border-border px-3 text-sm text-red-500 transition hover:bg-red-50"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-primary"
      >
        + Пункт
      </button>
    </div>
  );
}

export function QuoteBlockEditor({ block, onChange }: EditorProps<Extract<Block, { type: "quote" }>>) {
  return (
    <div className="space-y-2">
      <textarea
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Текст цитати"
        className={textareaCls}
      />
      <input
        value={block.cite ?? ""}
        onChange={(e) => onChange({ ...block, cite: e.target.value })}
        placeholder="Джерело / автор (необовʼязково)"
        className={inputCls}
      />
    </div>
  );
}

export function ButtonBlockEditor({ block, onChange }: EditorProps<Extract<Block, { type: "button" }>>) {
  return (
    <div className="space-y-2">
      <input
        value={block.label}
        onChange={(e) => onChange({ ...block, label: e.target.value })}
        placeholder="Текст кнопки"
        className={inputCls}
      />
      <input
        value={block.url}
        onChange={(e) => onChange({ ...block, url: e.target.value })}
        placeholder="Посилання (напр. /consultation або https://…)"
        className={inputCls}
      />
      <select
        value={block.variant}
        onChange={(e) => onChange({ ...block, variant: e.target.value as "primary" | "outline" })}
        className={inputCls + " w-48"}
      >
        <option value="primary">Основна (золота)</option>
        <option value="outline">Контурна</option>
      </select>
    </div>
  );
}

export function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  switch (block.type) {
    case "heading":
      return <HeadingBlockEditor block={block} onChange={onChange} />;
    case "paragraph":
      return <ParagraphBlockEditor block={block} onChange={onChange} />;
    case "image":
      return <ImageBlockEditor block={block} onChange={onChange} />;
    case "list":
      return <ListBlockEditor block={block} onChange={onChange} />;
    case "quote":
      return <QuoteBlockEditor block={block} onChange={onChange} />;
    case "button":
      return <ButtonBlockEditor block={block} onChange={onChange} />;
  }
}
