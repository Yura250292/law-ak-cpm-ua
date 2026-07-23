import Link from "next/link";
import type { Block } from "@/lib/content-blocks";

// Рендерить inline-токени [текст](url) як посилання. Без dangerouslySetInnerHTML.
function renderInline(text: string): React.ReactNode[] {
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const [, label, url] = match;
    const external = /^https?:\/\//i.test(url);
    if (external) {
      nodes.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent"
        >
          {label}
        </a>
      );
    } else {
      nodes.push(
        <Link
          key={key++}
          href={url}
          className="font-medium text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent"
        >
          {label}
        </Link>
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "heading": {
      const cls =
        block.level === 2
          ? "font-display text-2xl font-semibold text-primary sm:text-3xl"
          : "font-display text-xl font-semibold text-primary sm:text-2xl";
      return block.level === 2 ? (
        <h2 className={cls}>{block.text}</h2>
      ) : (
        <h3 className={cls}>{block.text}</h3>
      );
    }
    case "paragraph":
      return (
        <p className="text-base leading-relaxed text-primary/80 sm:text-lg sm:leading-relaxed">
          {renderInline(block.text)}
        </p>
      );
    case "image":
      return (
        <figure className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.url}
            alt={block.alt}
            className="w-full rounded-2xl border border-border"
          />
          {block.caption ? (
            <figcaption className="text-center text-sm text-muted">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    case "list": {
      const itemCls =
        "text-base leading-relaxed text-primary/80 sm:text-lg sm:leading-relaxed";
      return block.style === "numbered" ? (
        <ol className="ml-5 list-decimal space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className={itemCls}>
              {renderInline(it)}
            </li>
          ))}
        </ol>
      ) : (
        <ul className="ml-5 list-disc space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className={itemCls}>
              {renderInline(it)}
            </li>
          ))}
        </ul>
      );
    }
    case "quote":
      return (
        <blockquote className="rounded-r-xl border-l-4 border-accent bg-surface px-6 py-4">
          <p className="text-base italic leading-relaxed text-primary/80 sm:text-lg">
            {renderInline(block.text)}
          </p>
          {block.cite ? (
            <cite className="mt-2 block text-sm not-italic text-muted">
              — {block.cite}
            </cite>
          ) : null}
        </blockquote>
      );
    case "button": {
      const external = /^https?:\/\//i.test(block.url);
      const cls =
        block.variant === "primary"
          ? "inline-flex items-center justify-center rounded-xl bg-accent px-7 py-3 text-sm font-bold text-primary transition-all duration-200 hover:bg-accent-hover hover:shadow-lg active:scale-[0.98]"
          : "inline-flex items-center justify-center rounded-xl border-2 border-primary px-7 py-3 text-sm font-bold text-primary transition-all duration-200 hover:bg-primary hover:text-white";
      return external ? (
        <a href={block.url} target="_blank" rel="noopener noreferrer" className={cls}>
          {block.label}
        </a>
      ) : (
        <Link href={block.url} className={cls}>
          {block.label}
        </Link>
      );
    }
  }
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <BlockView key={block.id} block={block} />
      ))}
    </div>
  );
}

export default BlockRenderer;
