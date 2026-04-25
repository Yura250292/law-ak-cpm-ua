/**
 * Export helpers for case-analysis results / generated documents.
 * Produces PDF (jsPDF + Noto Serif) and Word (HTML with msword MIME).
 */
import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";

let fontRegular: string | null = null;
let fontBold: string | null = null;
let fontItalic: string | null = null;

function loadFonts() {
  if (fontRegular) return;
  const dir = path.join(process.cwd(), "src/lib/pdf/fonts");
  fontRegular = fs.readFileSync(path.join(dir, "NotoSerif-Regular.ttf")).toString("base64");
  fontBold = fs.readFileSync(path.join(dir, "NotoSerif-Bold.ttf")).toString("base64");
  fontItalic = fs.readFileSync(path.join(dir, "NotoSerif-Italic.ttf")).toString("base64");
}

const FONT = "AnalysisFont";
const PW = 210;
const PH = 297;
const ML = 20;
const MR = 15;
const MT = 18;
const MB = 18;
const CW = PW - ML - MR;

const SZ_TITLE = 14;
const SZ_H2 = 12;
const SZ_H3 = 11;
const SZ_BODY = 11;
const SZ_SMALL = 9;
const LH = 1.45;

function lh(size: number) {
  return (size * LH * 25.4) / 72;
}

/** Strip emoji and other non-Cyrillic/Latin pictographs that the embedded font cannot render. */
function stripUnsupported(s: string): string {
  return s
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u{FE00}-\u{FE0F}]/gu, "")
    .replace(/[\u{1F000}-\u{1F2FF}]/gu, "");
}

export async function generateAnalysisPdf(
  title: string,
  markdown: string
): Promise<Buffer> {
  loadFonts();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.addFileToVFS("AF-R.ttf", fontRegular!);
  doc.addFont("AF-R.ttf", FONT, "normal");
  doc.addFileToVFS("AF-B.ttf", fontBold!);
  doc.addFont("AF-B.ttf", FONT, "bold");
  doc.addFileToVFS("AF-I.ttf", fontItalic!);
  doc.addFont("AF-I.ttf", FONT, "italic");

  let y = MT;

  function pageBreak(need: number) {
    if (y + need > PH - MB) {
      doc.addPage();
      y = MT;
    }
  }

  function printLine(
    text: string,
    opts: { size?: number; bold?: boolean; italic?: boolean; indent?: number; color?: [number, number, number] } = {}
  ) {
    const { size = SZ_BODY, bold = false, italic = false, indent = 0, color = [30, 30, 30] } = opts;
    const style = bold ? "bold" : italic ? "italic" : "normal";
    doc.setFont(FONT, style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const cleaned = stripUnsupported(text);
    const lines = doc.splitTextToSize(cleaned, CW - indent) as string[];
    const h = lh(size);
    for (const line of lines) {
      pageBreak(h);
      doc.text(line, ML + indent, y);
      y += h;
    }
  }

  function printMixedBold(text: string, opts: { size?: number; indent?: number } = {}) {
    const { size = SZ_BODY, indent = 0 } = opts;
    doc.setFont(FONT, "normal");
    doc.setFontSize(size);
    const h = lh(size);
    const cleaned = stripUnsupported(text);
    const wrapped = doc.splitTextToSize(cleaned.replace(/\*\*/g, ""), CW - indent) as string[];

    // Single-line: render with inline bold
    if (wrapped.length === 1 && cleaned.includes("**")) {
      pageBreak(h);
      const parts = cleaned.split(/(\*\*)/);
      let bold = false;
      let cx = ML + indent;
      for (const part of parts) {
        if (part === "**") { bold = !bold; continue; }
        if (!part) continue;
        doc.setFont(FONT, bold ? "bold" : "normal");
        doc.text(part, cx, y);
        cx += doc.getTextWidth(part);
      }
      y += h;
      return;
    }
    // Multi-line: just strip bold markers
    for (const line of wrapped) {
      pageBreak(h);
      doc.text(line, ML + indent, y);
      y += h;
    }
  }

  function space(mm: number) {
    y += mm;
  }

  // ── Title block ──
  doc.setTextColor(20, 30, 60);
  doc.setFont(FONT, "bold");
  doc.setFontSize(SZ_TITLE + 2);
  doc.text(stripUnsupported(title), ML, y);
  y += lh(SZ_TITLE + 2);
  doc.setDrawColor(180, 150, 80);
  doc.setLineWidth(0.4);
  doc.line(ML, y, PW - MR, y);
  space(5);

  // ── Render markdown ──
  const lines = markdown.split("\n");
  let inTable = false;
  const tableRows: string[][] = [];

  function flushTable() {
    if (tableRows.length === 0) return;
    const colCount = Math.max(...tableRows.map((r) => r.length));
    const colW = (CW - 2) / colCount;
    const rowH = lh(SZ_SMALL) + 2;

    for (let ri = 0; ri < tableRows.length; ri++) {
      pageBreak(rowH);
      const row = tableRows[ri];
      const isHeader = ri === 0;
      doc.setFont(FONT, isHeader ? "bold" : "normal");
      doc.setFontSize(SZ_SMALL);
      doc.setDrawColor(200);
      if (isHeader) {
        doc.setFillColor(245, 240, 220);
        doc.rect(ML, y - rowH + 2, CW, rowH, "F");
      }
      // Calculate max cell height for this row
      const cellLines: string[][] = row.map((cell) =>
        doc.splitTextToSize(stripUnsupported(cell.replace(/\*\*/g, "")), colW - 4) as string[]
      );
      const maxLines = Math.max(1, ...cellLines.map((l) => l.length));
      const thisRowH = maxLines * lh(SZ_SMALL) + 4;
      pageBreak(thisRowH);

      for (let ci = 0; ci < row.length; ci++) {
        const x = ML + ci * colW;
        doc.rect(x, y - lh(SZ_SMALL) + 1, colW, thisRowH);
        const ls = cellLines[ci];
        for (let li = 0; li < ls.length; li++) {
          doc.text(ls[li], x + 2, y + li * lh(SZ_SMALL));
        }
      }
      y += thisRowH;
    }
    tableRows.length = 0;
    space(2);
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Table detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      // Skip separator row (|---|---|)
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
        inTable = true;
        continue;
      }
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      tableRows.push(cells);
      inTable = true;
      continue;
    } else if (inTable) {
      flushTable();
      inTable = false;
    }

    if (!trimmed) {
      space(2);
      continue;
    }

    // Headers
    if (trimmed.startsWith("## ")) {
      space(3);
      printLine(trimmed.slice(3), { size: SZ_H2, bold: true, color: [20, 30, 60] });
      space(1);
      continue;
    }
    if (trimmed.startsWith("### ")) {
      space(2);
      printLine(trimmed.slice(4), { size: SZ_H3, bold: true, color: [60, 60, 80] });
      space(0.5);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      space(3);
      printLine(trimmed.slice(2), { size: SZ_TITLE, bold: true });
      space(1.5);
      continue;
    }

    // Bullets
    if (/^[-*]\s/.test(trimmed)) {
      const content = trimmed.slice(2);
      doc.setFont(FONT, "normal");
      doc.setFontSize(SZ_BODY);
      doc.setTextColor(180, 150, 80);
      pageBreak(lh(SZ_BODY));
      doc.text("•", ML + 2, y);
      doc.setTextColor(30, 30, 30);
      // print content next to bullet
      const startY = y;
      printMixedBold(content, { size: SZ_BODY, indent: 7 });
      // ensure y advanced (it did via printMixedBold)
      void startY;
      continue;
    }

    // Numbered list
    if (/^\d+[\.\)]\s/.test(trimmed)) {
      printMixedBold(trimmed, { size: SZ_BODY, indent: 4 });
      continue;
    }

    // Plain paragraph
    printMixedBold(trimmed, { size: SZ_BODY });
  }

  if (inTable) flushTable();

  // ── Footer ──
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont(FONT, "normal");
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Адвокат Кабаль А. І. · law-ak.com.ua", ML, PH - 8);
    doc.text(`${p} / ${total}`, PW - MR, PH - 8, { align: "right" });
  }

  return Buffer.from(doc.output("arraybuffer"));
}

/** Generate Word-compatible .doc file via HTML. Word opens this natively. */
export function generateAnalysisDoc(title: string, markdown: string): Buffer {
  const html = markdownToHtml(markdown);
  const safeTitle = escapeHtml(title);

  const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<title>${safeTitle}</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
@page { size: A4; margin: 2cm 1.5cm 2cm 2cm; }
body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #1a1a1a; }
h1 { font-size: 16pt; color: #14213d; border-bottom: 2px solid #c89b3c; padding-bottom: 4pt; }
h2 { font-size: 14pt; color: #14213d; margin-top: 16pt; }
h3 { font-size: 12pt; color: #3a3a52; margin-top: 10pt; }
strong { color: #14213d; }
ul { margin: 6pt 0; padding-left: 20pt; }
li { margin: 3pt 0; }
table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
th, td { border: 1px solid #888; padding: 4pt 6pt; vertical-align: top; font-size: 11pt; }
th { background: #f5f0dc; font-weight: bold; }
.tag-tochno { background: #d4f5db; color: #14532d; padding: 1pt 4pt; font-size: 9pt; font-weight: bold; }
.tag-pereviryty { background: #fde9c8; color: #7c2d12; padding: 1pt 4pt; font-size: 9pt; font-weight: bold; }
.footer { margin-top: 24pt; padding-top: 8pt; border-top: 1px solid #ccc; color: #888; font-size: 9pt; text-align: center; }
</style>
</head>
<body>
<h1>${safeTitle}</h1>
${html}
<div class="footer">Адвокат Кабаль Анастасія Ігорівна · law-ak.com.ua · +38 (095) 672-80-05</div>
</body>
</html>`;

  return Buffer.from(doc, "utf-8");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineMd(s: string): string {
  let r = escapeHtml(s);
  r = r.replace(/\[ТОЧНО\]/g, '<span class="tag-tochno">ТОЧНО</span>');
  r = r.replace(/\[ПЕРЕВІРИТИ\]/g, '<span class="tag-pereviryty">ПЕРЕВІРИТИ</span>');
  r = r.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  r = r.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  r = r.replace(/`([^`]+)`/g, "<code>$1</code>");
  return r;
}

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;
  let inTable = false;
  let tableRows: string[][] = [];

  function closeList() {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  }
  function flushTable() {
    if (tableRows.length === 0) return;
    out.push("<table>");
    tableRows.forEach((row, i) => {
      const tag = i === 0 ? "th" : "td";
      out.push("<tr>" + row.map((c) => `<${tag}>${inlineMd(c)}</${tag}>`).join("") + "</tr>");
    });
    out.push("</table>");
    tableRows = [];
    inTable = false;
  }

  for (const raw of lines) {
    const t = raw.trim();

    if (t.startsWith("|") && t.endsWith("|")) {
      if (/^\|[\s\-:|]+\|$/.test(t)) {
        inTable = true;
        continue;
      }
      closeList();
      tableRows.push(t.slice(1, -1).split("|").map((c) => c.trim()));
      inTable = true;
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (!t) {
      closeList();
      continue;
    }
    if (t.startsWith("## ")) {
      closeList();
      out.push(`<h2>${inlineMd(t.slice(3))}</h2>`);
      continue;
    }
    if (t.startsWith("### ")) {
      closeList();
      out.push(`<h3>${inlineMd(t.slice(4))}</h3>`);
      continue;
    }
    if (t.startsWith("# ")) {
      closeList();
      out.push(`<h2>${inlineMd(t.slice(2))}</h2>`);
      continue;
    }
    if (/^[-*]\s/.test(t)) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inlineMd(t.slice(2))}</li>`);
      continue;
    }
    closeList();
    out.push(`<p>${inlineMd(t)}</p>`);
  }
  closeList();
  if (inTable) flushTable();
  return out.join("\n");
}
