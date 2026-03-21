/**
 * Generates a professional A4 PDF legal document with full Cyrillic support.
 * Handles markdown-style formatting (**bold**) from AI output.
 * Uses jsPDF with embedded Roboto font.
 */
import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";

// Cache font data in memory
let robotoRegular: string | null = null;
let robotoBold: string | null = null;
let robotoItalic: string | null = null;

function loadFonts() {
  if (robotoRegular && robotoBold) return;
  const fontsDir = path.join(
    process.cwd(),
    "node_modules/pdfmake/fonts/Roboto"
  );
  robotoRegular = fs.readFileSync(
    path.join(fontsDir, "Roboto-Regular.ttf")
  ).toString("base64");
  robotoBold = fs.readFileSync(
    path.join(fontsDir, "Roboto-Medium.ttf")
  ).toString("base64");
  robotoItalic = fs.readFileSync(
    path.join(fontsDir, "Roboto-Italic.ttf")
  ).toString("base64");
}

const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297;
const MARGIN_LEFT = 25;
const MARGIN_RIGHT = 20;
const MARGIN_TOP = 25;
const MARGIN_BOTTOM = 25;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const HEADER_RIGHT_WIDTH = 85; // Width of right-aligned header block
const FONT_SIZE = 11;
const LINE_HEIGHT_FACTOR = 1.55;

export async function generateDocumentPdf(
  _title: string,
  text: string
): Promise<Buffer> {
  loadFonts();

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Register fonts
  doc.addFileToVFS("Roboto-Regular.ttf", robotoRegular!);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Medium.ttf", robotoBold!);
  doc.addFont("Roboto-Medium.ttf", "Roboto", "bold");
  doc.addFileToVFS("Roboto-Italic.ttf", robotoItalic!);
  doc.addFont("Roboto-Italic.ttf", "Roboto", "italic");

  let y = MARGIN_TOP;

  function lineH(fontSize: number): number {
    return (fontSize * LINE_HEIGHT_FACTOR * 25.4) / 72;
  }

  function checkPageBreak(needed: number) {
    if (y + needed > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      y = MARGIN_TOP;
    }
  }

  /** Remove markdown bold markers for clean text */
  function stripBold(s: string): string {
    return s.replace(/\*\*/g, "");
  }

  /** Check if line has bold markdown */
  function hasBold(s: string): boolean {
    return s.includes("**");
  }

  /**
   * Render a line with mixed bold/normal segments.
   * Handles **bold** markdown inline.
   */
  function renderMixedLine(
    lineText: string,
    x: number,
    yPos: number,
    fontSize: number,
    maxW: number
  ) {
    doc.setFontSize(fontSize);
    // Split by **
    const parts = lineText.split(/(\*\*)/);
    let bold = false;
    let cx = x;

    for (const part of parts) {
      if (part === "**") {
        bold = !bold;
        continue;
      }
      if (!part) continue;

      doc.setFont("Roboto", bold ? "bold" : "normal");
      doc.text(part, cx, yPos);
      cx += doc.getTextWidth(part);
      if (cx > x + maxW) break; // safety
    }
  }

  /**
   * Print a block of text with word wrap and optional bold/alignment.
   */
  function printBlock(
    content: string,
    opts: {
      bold?: boolean;
      fontSize?: number;
      align?: "left" | "center" | "right";
      indent?: number;
      spaceBefore?: number;
      spaceAfter?: number;
      maxWidth?: number;
      mixedBold?: boolean;
    } = {}
  ) {
    const {
      bold = false,
      fontSize = FONT_SIZE,
      align = "left",
      indent = 0,
      spaceBefore = 0,
      spaceAfter = 0,
      maxWidth = CONTENT_WIDTH - indent,
      mixedBold = false,
    } = opts;

    y += spaceBefore;
    const lh = lineH(fontSize);

    // For mixed bold, we need to handle wrapping on clean text but render with formatting
    const cleanText = stripBold(content);
    doc.setFont("Roboto", bold ? "bold" : "normal");
    doc.setFontSize(fontSize);

    const wrappedLines = doc.splitTextToSize(cleanText, maxWidth) as string[];

    // If mixed bold and single line, render with formatting
    if (mixedBold && wrappedLines.length === 1) {
      checkPageBreak(lh);
      const x =
        align === "center"
          ? PAGE_WIDTH / 2 - doc.getTextWidth(cleanText) / 2
          : align === "right"
          ? PAGE_WIDTH - MARGIN_RIGHT - doc.getTextWidth(cleanText)
          : MARGIN_LEFT + indent;
      renderMixedLine(content, x, y, fontSize, maxWidth);
      y += lh;
      y += spaceAfter;
      return;
    }

    // If mixed bold and multi-line, we need to re-split the original bold text
    if (mixedBold && wrappedLines.length > 1) {
      // Rebuild lines keeping bold markers
      const boldLines = splitMixedTextToLines(content, doc, fontSize, maxWidth);
      for (const bLine of boldLines) {
        checkPageBreak(lh);
        const cleanLine = stripBold(bLine);
        const x =
          align === "center"
            ? PAGE_WIDTH / 2 - doc.getTextWidth(cleanLine) / 2
            : align === "right"
            ? PAGE_WIDTH - MARGIN_RIGHT - doc.getTextWidth(cleanLine)
            : MARGIN_LEFT + indent;
        renderMixedLine(bLine, x, y, fontSize, maxWidth);
        y += lh;
      }
      y += spaceAfter;
      return;
    }

    // Simple text (no mixed bold)
    for (const wLine of wrappedLines) {
      checkPageBreak(lh);
      const x = MARGIN_LEFT + indent;

      if (align === "center") {
        doc.text(wLine, PAGE_WIDTH / 2, y, { align: "center" });
      } else if (align === "right") {
        doc.text(wLine, PAGE_WIDTH - MARGIN_RIGHT, y, { align: "right" });
      } else {
        doc.text(wLine, x, y);
      }
      y += lh;
    }
    y += spaceAfter;
  }

  /**
   * Draw a horizontal separator line.
   */
  function drawSeparator() {
    checkPageBreak(4);
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
    y += 3;
  }

  // ═══════════════ PARSE & RENDER ═══════════════

  // Clean text: remove page number lines like "1 / 3"
  const cleanedText = text.replace(/^\d+\s*\/\s*\d+$/gm, "");
  const lines = cleanedText.split("\n");

  // State tracking
  let inHeaderBlock = true; // before ПОЗОВНА ЗАЯВА
  let foundTitle = false;
  let prevLineWasTitle = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    const clean = stripBold(trimmed);

    // Skip empty lines — add spacing
    if (trimmed === "") {
      y += 2.5;
      prevLineWasTitle = false;
      continue;
    }

    // ──── DETECT MAIN TITLE ────
    if (
      clean.match(/^ПОЗОВНА ЗАЯВА|^ЗАЯВА$|^КЛОПОТАННЯ|^СКАРГА|^АПЕЛЯЦІЙНА/i) &&
      clean.length < 60
    ) {
      inHeaderBlock = false;
      foundTitle = true;
      prevLineWasTitle = true;

      // Separator before title
      if (y > MARGIN_TOP + 20) {
        drawSeparator();
      }

      printBlock(clean, {
        bold: true,
        fontSize: 14,
        align: "center",
        spaceBefore: 4,
        spaceAfter: 1,
      });
      continue;
    }

    // ──── SUBTITLE after title: "про стягнення аліментів..." ────
    if (
      prevLineWasTitle &&
      clean.match(/^про\s/i) &&
      clean.length < 100
    ) {
      prevLineWasTitle = false;
      printBlock(clean, {
        bold: true,
        fontSize: 12,
        align: "center",
        spaceAfter: 6,
      });
      continue;
    }

    prevLineWasTitle = false;

    // ──── HEADER BLOCK (before title) ────
    if (inHeaderBlock) {
      // Court name: "ДО ..." or "До ..."
      if (clean.match(/^ДО\s|^До\s/i)) {
        printBlock(clean, {
          bold: true,
          fontSize: FONT_SIZE,
          align: "right",
          maxWidth: HEADER_RIGHT_WIDTH,
          spaceBefore: 0,
          spaceAfter: 0.5,
        });
        continue;
      }

      // Address line after court (starts with digits or "м.")
      if (clean.match(/^\d{5}/) || clean.match(/^м\.\s/i)) {
        printBlock(clean, {
          fontSize: 10,
          align: "right",
          maxWidth: HEADER_RIGHT_WIDTH,
          spaceAfter: 1.5,
        });
        continue;
      }

      // Party labels: **Позивач:**, **Відповідач:**, **Третя особа:**
      if (
        clean.match(
          /^(Позивач|Відповідач|Третя особа|Заявник|Боржник|Стягувач)\s*:/i
        )
      ) {
        printBlock(clean, {
          bold: true,
          fontSize: FONT_SIZE,
          align: "right",
          maxWidth: HEADER_RIGHT_WIDTH,
          spaceBefore: 2,
          spaceAfter: 0.3,
        });
        continue;
      }

      // Court fee, case price: **Ціна позову:**, **Судовий збір:**
      if (clean.match(/^(Ціна позову|Судовий збір)\s*:/i)) {
        printBlock(trimmed, {
          fontSize: 10,
          align: "right",
          maxWidth: HEADER_RIGHT_WIDTH,
          mixedBold: hasBold(trimmed),
          spaceBefore: 1.5,
          spaceAfter: 0.3,
        });
        continue;
      }

      // Any other header line (address details, phone, etc.)
      printBlock(clean, {
        fontSize: 10,
        align: "right",
        maxWidth: HEADER_RIGHT_WIDTH,
        spaceAfter: 0.3,
      });
      continue;
    }

    // ──── BODY (after title) ────

    // Section headers: **ПРОШУ:**, **Додатки:**, **ДОДАТКИ:**
    if (
      clean.match(
        /^(ПРОШУ|ПРОСИМО|Додатки|ДОДАТКИ|Правові підстави|ПРАВОВІ ПІДСТАВИ)\s*:?\s*$/i
      )
    ) {
      printBlock(clean, {
        bold: true,
        fontSize: 12,
        spaceBefore: 6,
        spaceAfter: 3,
      });
      continue;
    }

    // "На підставі вищевикладеного та керуючись..." — bold pre-ПРОШУ paragraph
    if (
      clean.match(/^На підставі вищевикладеного/i) ||
      clean.match(/^Керуючись статтями/i)
    ) {
      printBlock(clean, {
        bold: true,
        fontSize: FONT_SIZE,
        spaceBefore: 4,
        spaceAfter: 2,
      });
      continue;
    }

    // Numbered list items: "1.", "2.", "1)", "2)"
    if (clean.match(/^\d+[\.\)]\s/)) {
      printBlock(trimmed, {
        indent: 7,
        spaceBefore: 1.5,
        spaceAfter: 1.5,
        mixedBold: hasBold(trimmed),
      });
      continue;
    }

    // Bullet/dash list items
    if (clean.match(/^[-–—•]\s/)) {
      printBlock(clean, {
        indent: 7,
        spaceBefore: 0.5,
        spaceAfter: 0.5,
      });
      continue;
    }

    // Date line
    if (
      clean.match(/^Дата подання/i) ||
      clean.match(/^«___»\s/) ||
      clean.match(/^"___"\s/) ||
      (clean.match(/^\d{2}\.\d{2}\.\d{4}/) && clean.length < 40) ||
      clean.match(/^\[поточна дата\]/i)
    ) {
      printBlock(clean, {
        spaceBefore: 8,
        spaceAfter: 1,
      });
      continue;
    }

    // Signature line
    if (clean.includes("__________") || clean.match(/^Підпис\s/i)) {
      printBlock(clean, {
        spaceBefore: 4,
        spaceAfter: 1,
      });
      continue;
    }

    // Parenthetical explanations (розрахунок:...) — smaller italic
    if (clean.match(/^\(розрахунок:/i) || clean.match(/^\(.*\)$/)) {
      doc.setFont("Roboto", "italic");
      printBlock(clean, {
        fontSize: 9,
        spaceBefore: 0,
        spaceAfter: 1,
      });
      doc.setFont("Roboto", "normal");
      continue;
    }

    // Regular paragraph — with possible inline **bold**
    if (hasBold(trimmed)) {
      printBlock(trimmed, {
        spaceBefore: 1,
        spaceAfter: 1,
        mixedBold: true,
      });
    } else {
      printBlock(clean, {
        spaceBefore: 1,
        spaceAfter: 1,
      });
    }
  }

  // ──── PAGE NUMBERS ────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${p} / ${totalPages}`,
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - 12,
      { align: "center" }
    );
    doc.setTextColor(0, 0, 0);
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

/**
 * Split text with **bold** markers into wrapped lines,
 * preserving bold markers positions.
 */
function splitMixedTextToLines(
  text: string,
  doc: jsPDF,
  fontSize: number,
  maxWidth: number
): string[] {
  doc.setFontSize(fontSize);

  // Split into segments: { text, bold }
  const segments: { text: string; bold: boolean }[] = [];
  const parts = text.split(/(\*\*)/);
  let bold = false;
  for (const part of parts) {
    if (part === "**") {
      bold = !bold;
      continue;
    }
    if (part) segments.push({ text: part, bold });
  }

  // Build lines word by word
  const result: string[] = [];
  let currentLine = "";
  let currentWidth = 0;

  for (const seg of segments) {
    const prefix = seg.bold ? "**" : "";
    const suffix = seg.bold ? "**" : "";
    doc.setFont("Roboto", seg.bold ? "bold" : "normal");

    const words = seg.text.split(/(\s+)/);
    for (const word of words) {
      if (!word) continue;
      const wordWidth = doc.getTextWidth(word);

      if (currentWidth + wordWidth > maxWidth && currentLine.trim()) {
        // Close any open bold on current line
        const openBolds = (currentLine.match(/\*\*/g) || []).length;
        if (openBolds % 2 !== 0) currentLine += "**";
        result.push(currentLine);
        currentLine = openBolds % 2 !== 0 ? "**" + word : word;
        currentWidth = wordWidth;
      } else {
        currentLine += word;
        currentWidth += wordWidth;
      }
    }
  }
  if (currentLine.trim()) result.push(currentLine);

  return result;
}
