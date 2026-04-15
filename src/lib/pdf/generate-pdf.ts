/**
 * Generates a professional A4 PDF legal document (Ukrainian court format).
 * Uses Noto Serif (serif, Cyrillic) — looks like Times New Roman.
 * Handles markdown **bold** from AI output.
 */
import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";

// ─── Font cache ────────────────────────────────────────
let fontRegular: string | null = null;
let fontBold: string | null = null;
let fontItalic: string | null = null;

function loadFonts() {
  if (fontRegular) return;

  // Try project-bundled Noto Serif first, fallback to Roboto
  const serifDir = path.join(process.cwd(), "src/lib/pdf/fonts");
  const robotoDir = path.join(process.cwd(), "node_modules/pdfmake/fonts/Roboto");

  if (fs.existsSync(path.join(serifDir, "NotoSerif-Regular.ttf"))) {
    fontRegular = fs.readFileSync(path.join(serifDir, "NotoSerif-Regular.ttf")).toString("base64");
    fontBold = fs.readFileSync(path.join(serifDir, "NotoSerif-Bold.ttf")).toString("base64");
    fontItalic = fs.readFileSync(path.join(serifDir, "NotoSerif-Italic.ttf")).toString("base64");
  } else {
    fontRegular = fs.readFileSync(path.join(robotoDir, "Roboto-Regular.ttf")).toString("base64");
    fontBold = fs.readFileSync(path.join(robotoDir, "Roboto-Medium.ttf")).toString("base64");
    fontItalic = fs.readFileSync(path.join(robotoDir, "Roboto-Italic.ttf")).toString("base64");
  }
}

// ─── Constants ─────────────────────────────────────────
const PW = 210; // A4 width mm
const PH = 297; // A4 height mm
const ML = 30;  // margin left (court standard: 30mm)
const MR = 15;  // margin right (court standard: 15mm)
const MT = 20;  // margin top
const MB = 25;  // margin bottom
const CW = PW - ML - MR; // content width = 165mm
const FONT = "DocFont";

// Font sizes (pt) — court standard is 14pt
const SZ_BODY = 13;
const SZ_HEADER = 12;
const SZ_TITLE = 16;
const SZ_SUBTITLE = 14;
const SZ_SECTION = 14;
const SZ_SMALL = 10;
const SZ_PAGE = 9;

const LH = 1.6; // line height factor

// ─── Main export ───────────────────────────────────────
export async function generateDocumentPdf(
  _title: string,
  text: string
): Promise<Buffer> {
  loadFonts();

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.addFileToVFS("Font-Regular.ttf", fontRegular!);
  doc.addFont("Font-Regular.ttf", FONT, "normal");
  doc.addFileToVFS("Font-Bold.ttf", fontBold!);
  doc.addFont("Font-Bold.ttf", FONT, "bold");
  doc.addFileToVFS("Font-Italic.ttf", fontItalic!);
  doc.addFont("Font-Italic.ttf", FONT, "italic");

  const ctx = new RenderContext(doc);
  ctx.renderDocument(text);

  // Page numbers + discreet attribution footer
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont(FONT, "normal");
    doc.setFontSize(SZ_PAGE);
    doc.setTextColor(150);
    doc.text(
      "Адвокат Кабаль Анастасія Ігорівна  ·  +38 (095) 672-80-05",
      ML,
      PH - 12
    );
    doc.text(`${p} / ${total}`, PW - MR, PH - 12, { align: "right" });
    doc.setTextColor(0);
  }

  return Buffer.from(doc.output("arraybuffer"));
}

// ─── Render context ────────────────────────────────────
class RenderContext {
  private doc: jsPDF;
  private y = MT;

  constructor(doc: jsPDF) {
    this.doc = doc;
  }

  private lh(size: number): number {
    return (size * LH * 25.4) / 72;
  }

  private pageBreak(need: number) {
    if (this.y + need > PH - MB) {
      this.doc.addPage();
      this.y = MT;
    }
  }

  private space(mm: number) {
    this.y += mm;
  }

  // ── Print helpers ──

  /** Print simple text block (no markdown) */
  private print(
    text: string,
    opts: {
      size?: number;
      bold?: boolean;
      italic?: boolean;
      align?: "left" | "center" | "right";
      indent?: number;
      maxW?: number;
    } = {}
  ) {
    const {
      size = SZ_BODY,
      bold = false,
      italic = false,
      align = "left",
      indent = 0,
      maxW = CW - indent,
    } = opts;

    const style = bold ? "bold" : italic ? "italic" : "normal";
    this.doc.setFont(FONT, style);
    this.doc.setFontSize(size);

    const lines = this.doc.splitTextToSize(text, maxW) as string[];
    const h = this.lh(size);

    for (const line of lines) {
      this.pageBreak(h);
      const x = ML + indent;

      if (align === "center") {
        this.doc.text(line, PW / 2, this.y, { align: "center" });
      } else if (align === "right") {
        this.doc.text(line, PW - MR, this.y, { align: "right" });
      } else {
        this.doc.text(line, x, this.y);
      }
      this.y += h;
    }
  }

  /** Print text with inline **bold** markdown */
  private printMixed(
    text: string,
    opts: {
      size?: number;
      align?: "left" | "center" | "right";
      indent?: number;
      maxW?: number;
    } = {}
  ) {
    const { size = SZ_BODY, align = "left", indent = 0, maxW = CW - indent } = opts;

    const clean = text.replace(/\*\*/g, "");
    this.doc.setFont(FONT, "normal");
    this.doc.setFontSize(size);

    const lines = this.doc.splitTextToSize(clean, maxW) as string[];
    const h = this.lh(size);

    // For single-line mixed bold, render with font switching
    if (lines.length === 1 && text.includes("**")) {
      this.pageBreak(h);
      const parts = text.split(/(\*\*)/);
      let bold = false;
      let cx = align === "right" ? PW - MR - this.doc.getTextWidth(clean) :
               align === "center" ? PW / 2 - this.doc.getTextWidth(clean) / 2 :
               ML + indent;

      for (const part of parts) {
        if (part === "**") { bold = !bold; continue; }
        if (!part) continue;
        this.doc.setFont(FONT, bold ? "bold" : "normal");
        this.doc.text(part, cx, this.y);
        cx += this.doc.getTextWidth(part);
      }
      this.y += h;
      return;
    }

    // Multi-line or no bold — render as plain
    for (const line of lines) {
      this.pageBreak(h);
      const x = ML + indent;
      if (align === "center") {
        this.doc.text(line, PW / 2, this.y, { align: "center" });
      } else if (align === "right") {
        this.doc.text(line, PW - MR, this.y, { align: "right" });
      } else {
        this.doc.text(line, x, this.y);
      }
      this.y += h;
    }
  }

  /** Draw thin horizontal line */
  private rule() {
    this.pageBreak(4);
    this.space(2);
    this.doc.setDrawColor(180);
    this.doc.setLineWidth(0.3);
    this.doc.line(ML + 40, this.y, PW - MR - 40, this.y);
    this.space(4);
  }

  // ── Main renderer ──

  renderDocument(rawText: string) {
    // Clean page-number artifacts and markdown heading markers
    const text = rawText
      .replace(/^\d+\s*\/\s*\d+$/gm, "")
      .replace(/^#{1,6}\s+/gm, "");       // strip markdown ### headers
    const lines = text.split("\n");

    let phase: "header" | "body" = "header";
    let prevWasTitle = false;
    let headerLineCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const trimmed = raw.trim();
      const clean = strip(trimmed);

      // ── Skip lines that should not appear in lawyer documents ──
      if (clean.match(/^Ціна позову\s*:/i)) continue;
      if (clean.match(/^Судовий збір\s*$/i)) continue;
      if (clean.match(/^Ціна позову.*Судовий збір/i)) continue;

      // ── Empty line → spacing ──
      if (!trimmed) {
        this.space(phase === "header" ? 1.5 : 3);
        prevWasTitle = false;
        continue;
      }

      // ── Detect main title ──
      if (
        clean.match(/^ПОЗОВНА ЗАЯВА|^ЗАЯВА\b|^КЛОПОТАННЯ|^СКАРГА|^АПЕЛЯЦІЙНА|^ВІДЗИВ|^ВІДПОВІДЬ|^ПОЯСНЕННЯ|^КЛОПОТАН/i) &&
        clean.length < 80
      ) {
        phase = "body";
        prevWasTitle = true;
        this.rule();
        this.space(4);
        this.print(clean.toUpperCase(), { size: SZ_TITLE, bold: true, align: "center" });
        this.space(1);
        continue;
      }

      // ── Subtitle after title ──
      if (prevWasTitle && clean.match(/^про\s/i) && clean.length < 120) {
        prevWasTitle = false;
        this.print(clean, { size: SZ_SUBTITLE, bold: true, align: "center" });
        this.space(6);
        continue;
      }
      // Also detect multi-line subtitle (parenthetical clarification)
      if (prevWasTitle && clean.match(/^\(/)) {
        this.print(clean, { size: SZ_SMALL, italic: true, align: "center" });
        this.space(1);
        continue;
      }
      prevWasTitle = false;

      // ════════════════ HEADER PHASE ════════════════
      if (phase === "header") {
        headerLineCount++;
        const headerW = 85;

        // Safety: if line is very long (body paragraph), switch to body
        if (clean.length > 120) {
          phase = "body";
          // Fall through to body rendering below
        }
        // Safety: after too many header lines, force switch to body
        else if (headerLineCount > 25) {
          phase = "body";
          // Fall through to body rendering below
        } else {
          // Court / authority name (bold, right)
          if (clean.match(/^(ДО|До)\s/) || clean.match(/^(Начальнику|Голові|Директору|Керівнику|Прокурору)\s/i)) {
            this.print(clean, { size: SZ_HEADER, bold: true, align: "right", maxW: headerW });
            this.space(0.5);
            continue;
          }

          // Subordinate line (у ... районі, у м. ...)
          if (clean.match(/^у\s+(Самбірському|Львівському|місті|м\.)/i) || clean.match(/^(Західного|Східного|Південного|Північного)\s/i)) {
            this.print(clean, { size: SZ_SMALL, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // Recipient name (Ірині ХАНАС, Володимиру НАГОРНЯКУ)
          if (clean.match(/^[А-ЯІЇЄҐ][а-яіїєґ']+і?\s+[А-ЯІЇЄҐ]{2,}$/) && clean.length < 40) {
            this.print(clean, { size: SZ_HEADER, bold: true, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // Court / authority address (zip code at start or end)
          if (clean.match(/^\d{5}/) || clean.match(/\d{5}$/)) {
            this.print(clean, { size: SZ_SMALL, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // City at start
          if (clean.match(/^м\.\s/i) && i < 5) {
            this.print(clean, { size: SZ_SMALL, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // e-mail line
          if (clean.match(/^e-?mail\s*:/i) || clean.match(/@.*\.(gov|ua|com|net)/i)) {
            this.print(clean, { size: SZ_SMALL, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // Street address (вул., пр., бульв.)
          if (clean.match(/^вул\.|^пр\.\s|^бульв\./i)) {
            this.print(clean, { size: SZ_SMALL, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // Party labels: Позивач:, Відповідач:, Третя особа:
          if (clean.match(/^(Позивач|Відповідач|Третя особа|Заявник|Боржник|Стягувач)\s*:/i)) {
            this.space(3);
            this.print(clean, { size: SZ_HEADER, bold: true, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // Applicant name in genitive (Баєва Дмитра Сергійовича)
          if (clean.match(/^[А-ЯІЇЄҐ][а-яіїєґ']+а?\s+[А-ЯІЇЄҐ][а-яіїєґ']+а?\s+[А-ЯІЇЄҐ][а-яіїєґ']+а?$/) && clean.length < 60) {
            this.space(2);
            this.print(clean, { size: SZ_HEADER, bold: true, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // РНОКПП / ІПН
          if (clean.match(/^РНОКПП|^ІПН|^ідентифікаційний/i)) {
            this.print(clean, { size: SZ_SMALL, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // Date of birth, address registration, other header details
          if (clean.match(/^(Дата народження|Адреса реєстрації|Адреса проживання|Місце проживання|кв\.)\s*[,:]/i) ||
              clean.match(/^кв\.\s*\d/i)) {
            this.print(clean, { size: SZ_SMALL, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // Phone
          if (clean.match(/^тел\.|^\+38|^телефон/i)) {
            this.print(clean, { size: SZ_SMALL, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // Case reference (Справа №, Виконавче провадження №)
          if (clean.match(/^(Справа|Виконавче провадження)\s*[№#]/i)) {
            this.space(2);
            this.print(clean, { size: SZ_SMALL, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // Judge (Суддя -)
          if (clean.match(/^Суддя\s/i)) {
            this.print(clean, { size: SZ_SMALL, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // Ціна позову / Судовий збір
          if (clean.match(/^(Ціна позову|Судовий збір)\s*:/i)) {
            this.space(2);
            if (hasBold(trimmed)) {
              this.printMixed(trimmed, { size: SZ_SMALL, align: "right", maxW: headerW });
            } else {
              this.print(clean, { size: SZ_SMALL, align: "right", maxW: headerW });
            }
            this.space(0.3);
            continue;
          }

          // Parenthetical (розрахунок:...)
          if (clean.match(/^\(/) && clean.match(/\)$/)) {
            this.print(clean, { size: SZ_SMALL, italic: true, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // Short header info lines (< 70 chars) — still part of header
          if (clean.length < 70) {
            this.print(clean, { size: SZ_SMALL, align: "right", maxW: headerW });
            this.space(0.3);
            continue;
          }

          // Long line in header = probably body text → switch phase
          phase = "body";
          // Fall through to body rendering below
        }
      }

      // ════════════════ BODY PHASE ════════════════

      // Section headers: ПРОШУ:, Додатки:, Правові підстави
      if (clean.match(/^(ПРОШУ|ПРОСИМО|Додатки|ДОДАТКИ)\s*:?\s*$/i)) {
        this.space(6);
        this.print(clean, { size: SZ_SECTION, bold: true });
        this.space(3);
        continue;
      }

      // Sub-section headers: Правові підстави позову, Обставини справи
      if (clean.match(/^(Правові підстави|Обставини справи|Фактичні обставини|Обґрунтування позову)/i) && clean.length < 60) {
        this.space(4);
        this.print(clean, { size: SZ_BODY, bold: true });
        this.space(2);
        continue;
      }

      // "На підставі вищевикладеного..." / "На підставі вищенаведеного..." — bold pre-request paragraph
      if (clean.match(/^На підставі вище/i) || clean.match(/^Керуючись ст/i)) {
        this.space(4);
        if (hasBold(trimmed)) {
          this.printMixed(trimmed, { size: SZ_BODY });
        } else {
          this.print(clean, { size: SZ_BODY, bold: true });
        }
        this.space(3);
        continue;
      }

      // Numbered list: 1. / 1) / 2.
      if (clean.match(/^\d+[\.\)]\s/)) {
        this.space(1.5);
        if (hasBold(trimmed)) {
          this.printMixed(trimmed, { indent: 8 });
        } else {
          this.print(clean, { indent: 8 });
        }
        this.space(1.5);
        continue;
      }

      // Bullet/dash list
      if (clean.match(/^[-–—•]\s/)) {
        this.space(0.5);
        this.print(clean, { indent: 8 });
        this.space(0.5);
        continue;
      }

      // Date + signature line (e.g., "07.11.2025 року            __________________            Дмитро БАЄВ")
      if (clean.match(/\d{2}\.\d{2}\.\d{4}.*_{3,}/) || clean.match(/\d{2}\.\d{2}\.\d{4}.*[А-ЯІЇЄҐ]{2,}$/)) {
        this.space(10);
        this.print(clean, { size: SZ_BODY });
        this.space(2);
        continue;
      }

      // Date line
      if (
        clean.match(/^Дата подання/i) ||
        clean.match(/^Дата\s*:/i) ||
        clean.match(/^«___»\s/) ||
        clean.match(/^"___"\s/) ||
        clean.match(/^\[поточна дата\]/i) ||
        (clean.match(/^\d{2}\.\d{2}\.\d{4}/) && clean.length < 40)
      ) {
        this.space(10);
        this.print(clean, { size: SZ_BODY });
        this.space(2);
        continue;
      }

      // Signature line with underscores
      if (clean.includes("__________") || clean.match(/^Підпис\s*/i)) {
        this.space(5);
        this.print(clean, { size: SZ_BODY });
        this.space(2);
        continue;
      }

      // Standalone name at end (e.g., "Дмитро БАЄВ")
      if (clean.match(/^[А-ЯІЇЄҐ][а-яіїєґ']+\s+[А-ЯІЇЄҐ]{2,}$/) && clean.length < 40) {
        this.space(5);
        this.print(clean, { size: SZ_BODY, align: "right" });
        this.space(2);
        continue;
      }

      // "Додаток:" / "Додатки:" as inline (not section header but continuation)
      if (clean.match(/^Додатки?\s*:/i) && clean.length > 15) {
        this.space(2);
        this.print(clean, { size: SZ_BODY });
        this.space(1);
        continue;
      }

      // Regular paragraph — LEFT aligned
      this.space(1);
      if (hasBold(trimmed)) {
        this.printMixed(trimmed, { size: SZ_BODY });
      } else {
        this.print(clean, { size: SZ_BODY });
      }
      this.space(1);
    }
  }
}

// ─── Utilities ─────────────────────────────────────────
function strip(s: string): string {
  return s.replace(/\*\*/g, "");
}

function hasBold(s: string): boolean {
  return s.includes("**");
}
