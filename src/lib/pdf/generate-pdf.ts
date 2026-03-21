/**
 * Generates a professional A4 PDF legal document with full Cyrillic support.
 * Uses jsPDF with embedded Roboto font from pdfmake.
 */
import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";

// Cache font data in memory
let robotoRegular: string | null = null;
let robotoBold: string | null = null;

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
}

const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297;
const MARGIN_LEFT = 25;
const MARGIN_RIGHT = 20;
const MARGIN_TOP = 20;
const MARGIN_BOTTOM = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const FONT_SIZE = 11;
const TITLE_FONT_SIZE = 13;
const LINE_HEIGHT = 1.5;

export async function generateDocumentPdf(
  title: string,
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

  let y = MARGIN_TOP;
  let pageNum = 1;

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      pageNum++;
      y = MARGIN_TOP;
    }
  }

  function addText(
    content: string,
    options: {
      bold?: boolean;
      fontSize?: number;
      align?: "left" | "center" | "right" | "justify";
      indent?: number;
      spaceBefore?: number;
      spaceAfter?: number;
      maxWidth?: number;
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
    } = options;

    y += spaceBefore;

    doc.setFont("Roboto", bold ? "bold" : "normal");
    doc.setFontSize(fontSize);

    const lineHeightMm = (fontSize * LINE_HEIGHT * 25.4) / 72; // pt to mm

    // Split text into lines that fit within maxWidth
    const lines = doc.splitTextToSize(content, maxWidth);

    for (const line of lines) {
      checkPageBreak(lineHeightMm);

      const x = MARGIN_LEFT + indent;

      if (align === "center") {
        doc.text(line, PAGE_WIDTH / 2, y, { align: "center" });
      } else if (align === "right") {
        doc.text(line, PAGE_WIDTH - MARGIN_RIGHT, y, { align: "right" });
      } else if (align === "justify" && lines.length > 1) {
        doc.text(line, x, y, {
          align: "justify",
          maxWidth,
        });
      } else {
        doc.text(line, x, y);
      }

      y += lineHeightMm;
    }

    y += spaceAfter;
  }

  // Parse and render the document
  const docLines = text.split("\n");

  for (let i = 0; i < docLines.length; i++) {
    const line = docLines[i];
    const trimmed = line.trim();

    // Empty line
    if (trimmed === "") {
      y += 2;
      continue;
    }

    // Main title: "ПОЗОВНА ЗАЯВА"
    if (
      trimmed.match(
        /^(ПОЗОВНА ЗАЯВА|ЗАЯВА|КЛОПОТАННЯ|СКАРГА|АПЕЛЯЦІЙНА)/i
      ) &&
      trimmed.length < 60
    ) {
      addText(trimmed, {
        bold: true,
        fontSize: TITLE_FONT_SIZE,
        align: "center",
        spaceBefore: 6,
        spaceAfter: 1,
      });
      continue;
    }

    // Subtitle after title: "про розірвання шлюбу"
    if (
      trimmed.match(/^про\s/i) &&
      trimmed.length < 80 &&
      i > 0 &&
      docLines[i - 1]
        ?.trim()
        .match(
          /^(ПОЗОВНА ЗАЯВА|ЗАЯВА|КЛОПОТАННЯ|СКАРГА|АПЕЛЯЦІЙНА)/i
        )
    ) {
      addText(trimmed, {
        bold: true,
        fontSize: 12,
        align: "center",
        spaceAfter: 6,
      });
      continue;
    }

    // Court header: "До ..." at the top
    if (trimmed.startsWith("До ") && i < 5) {
      addText(trimmed, {
        bold: true,
        align: "right",
        spaceBefore: 0,
        spaceAfter: 1,
        maxWidth: 90,
      });
      continue;
    }

    // Header block: Позивач, Відповідач data (right-aligned)
    if (
      i < 20 &&
      trimmed.match(
        /^(Позивач|Відповідач|Третя особа)\s*:/i
      )
    ) {
      addText(trimmed, {
        bold: true,
        align: "right",
        spaceAfter: 0.5,
        maxWidth: 90,
      });
      continue;
    }

    // Address/phone lines in header (right-aligned, smaller)
    if (
      i < 25 &&
      (trimmed.match(
        /^(адреса|тел\.|телефон|ІПН|РНОКПП|email|e-mail)\s*:/i
      ) ||
        trimmed.match(/^(що проживає|який проживає|зареєстрован|яка проживає)/i))
    ) {
      addText(trimmed, {
        fontSize: 10,
        align: "right",
        maxWidth: 90,
        spaceAfter: 0.5,
      });
      continue;
    }

    // Section headers: "ПРОШУ:", "Додатки:"
    if (
      trimmed.match(
        /^(ПРОШУ|ПРОСИМО|Додатки|ДОДАТКИ)\s*:?$/i
      ) ||
      trimmed === "ПРОШУ:" ||
      trimmed === "Додатки:"
    ) {
      addText(trimmed, {
        bold: true,
        fontSize: 12,
        spaceBefore: 6,
        spaceAfter: 2,
      });
      continue;
    }

    // Numbered list items
    if (trimmed.match(/^\d+[\.\)]\s/)) {
      addText(trimmed, {
        indent: 5,
        spaceBefore: 1,
        spaceAfter: 1,
      });
      continue;
    }

    // Bullet/dash list items
    if (trimmed.match(/^[-–—•]\s/)) {
      addText(trimmed, {
        indent: 5,
        spaceBefore: 0.5,
        spaceAfter: 0.5,
      });
      continue;
    }

    // Date line
    if (
      (trimmed.match(/^"?___"?\s/) ||
        (trimmed.match(/^\d{2}\.\d{2}\.\d{4}/) && trimmed.length < 40))
    ) {
      addText(trimmed, {
        spaceBefore: 8,
        spaceAfter: 1,
      });
      continue;
    }

    // Signature line
    if (trimmed.includes("__________") || trimmed.match(/^Підпис/i)) {
      addText(trimmed, {
        spaceBefore: 4,
        spaceAfter: 1,
      });
      continue;
    }

    // Regular paragraph
    addText(trimmed, {
      align: "justify",
      spaceBefore: 0.5,
      spaceAfter: 0.5,
    });
  }

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${p} / ${totalPages}`,
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - 10,
      { align: "center" }
    );
    doc.setTextColor(0, 0, 0);
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
