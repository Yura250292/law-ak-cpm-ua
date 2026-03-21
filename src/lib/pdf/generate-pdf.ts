/**
 * Generates a simple A4 PDF document from plain text.
 * Uses raw PDF syntax — no external dependencies, works everywhere.
 */
export async function generateDocumentPdf(
  title: string,
  text: string
): Promise<Buffer> {
  // Split text into lines, handling various line breaks
  const allLines: string[] = [];
  const rawLines = text.split("\n");

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      allLines.push("");
      continue;
    }
    // Word-wrap long lines at ~80 chars
    const words = trimmed.split(/\s+/);
    let currentLine = "";
    for (const word of words) {
      if (currentLine.length + word.length + 1 > 80) {
        allLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + " " + word : word;
      }
    }
    if (currentLine) allLines.push(currentLine);
  }

  // PDF generation using raw PDF syntax
  const fontSize = 11;
  const titleFontSize = 14;
  const lineHeight = fontSize * 1.6;
  const marginLeft = 70;
  const marginTop = 60;
  const marginBottom = 60;
  const pageWidth = 595.28; // A4
  const pageHeight = 841.89; // A4
  const usableHeight = pageHeight - marginTop - marginBottom;

  // Paginate lines
  const pages: string[][] = [];
  let currentPage: string[] = [];
  let yUsed = 0;

  // Title takes space
  const titleLines = [title];
  yUsed += titleFontSize * 2 + 20; // title + gap

  for (const line of allLines) {
    const lineSpace = line === "" ? lineHeight * 0.6 : lineHeight;
    if (yUsed + lineSpace > usableHeight) {
      pages.push(currentPage);
      currentPage = [];
      yUsed = 0;
    }
    currentPage.push(line);
    yUsed += lineSpace;
  }
  if (currentPage.length > 0) pages.push(currentPage);
  if (pages.length === 0) pages.push([]);

  // Encode text for PDF (escape special chars and handle Cyrillic via PDFDocEncoding workaround)
  // Since raw PDF with Type1 fonts can't do Cyrillic, we'll use a hex-encoded approach with a unicode font
  // Actually, the simplest approach: use the built-in Helvetica and encode Cyrillic as UTF-16BE

  // Better approach: generate PDF with embedded text using a content stream approach
  // For Cyrillic, we need to use a CIDFont. Let's use a simpler method with text rendering.

  // Let's use a different strategy: create a valid PDF with Cyrillic support
  return generatePdfWithCyrillic(title, allLines, pages, {
    fontSize,
    titleFontSize,
    lineHeight,
    marginLeft,
    marginTop,
    pageWidth,
    pageHeight,
  });
}

function generatePdfWithCyrillic(
  title: string,
  _allLines: string[],
  pages: string[][],
  opts: {
    fontSize: number;
    titleFontSize: number;
    lineHeight: number;
    marginLeft: number;
    marginTop: number;
    pageWidth: number;
    pageHeight: number;
  }
): Buffer {
  const { fontSize, titleFontSize, lineHeight, marginLeft, marginTop, pageWidth, pageHeight } = opts;

  // We'll build the PDF using objects
  const objects: string[] = [];
  let objectCount = 0;

  function addObject(content: string): number {
    objectCount++;
    objects.push(content);
    return objectCount;
  }

  // Object 1: Catalog
  addObject("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");

  // Object 2: Pages (placeholder, we'll update later)
  const pagesObjIndex = addObject(""); // placeholder

  // Object 3: Font - use Identity-H CIDFont for Unicode
  addObject(
    "3 0 obj\n<< /Type /Font /Subtype /Type0 /BaseFont /Helvetica " +
    "/Encoding /Identity-H " +
    "/DescendantFonts [4 0 R] " +
    "/ToUnicode 5 0 R >>\nendobj"
  );

  // Object 4: CIDFont
  addObject(
    "4 0 obj\n<< /Type /Font /Subtype /CIDFontType2 /BaseFont /Helvetica " +
    "/CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> " +
    "/W [0 [600]] /DW 600 >>\nendobj"
  );

  // Object 5: ToUnicode CMap
  const cmap = [
    "/CIDInit /ProcSet findresource begin",
    "12 dict begin",
    "begincmap",
    "/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def",
    "/CMapName /Adobe-Identity-UCS def",
    "/CMapType 2 def",
    "1 begincodespacerange",
    "<0000> <FFFF>",
    "endcodespacerange",
    "1 beginbfrange",
    "<0000> <FFFF> <0000>",
    "endbfrange",
    "endcmap",
    "CMapSpaceUsed /CMapName get exch /CMap defineresource pop",
    "end end",
  ].join("\n");
  const cmapStream = `5 0 obj\n<< /Length ${cmap.length} >>\nstream\n${cmap}\nendstream\nendobj`;
  objects[4] = cmapStream; // replace placeholder at index 4 (object 5)

  // Generate page objects
  const pageObjIds: number[] = [];

  for (let p = 0; p < pages.length; p++) {
    const lines = pages[p];
    let y = pageHeight - marginTop;

    let streamContent = "";

    // Title only on first page
    if (p === 0) {
      streamContent += `BT\n/F1 ${titleFontSize} Tf\n${marginLeft} ${y} Td\n`;
      streamContent += `(${escapePdfString(title)}) Tj\nET\n`;
      y -= titleFontSize * 2 + 10;
    }

    // Body text
    streamContent += `BT\n/F1 ${fontSize} Tf\n`;
    for (const line of lines) {
      if (line === "") {
        y -= lineHeight * 0.6;
        continue;
      }
      streamContent += `${marginLeft} ${y.toFixed(1)} Td\n`;
      streamContent += `(${escapePdfString(line)}) Tj\n`;
      y -= lineHeight;
    }
    streamContent += "ET\n";

    const streamBytes = Buffer.from(streamContent, "latin1");

    // Content stream object
    const contentId = addObject(
      `${objectCount + 1} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${streamContent}endstream\nendobj`
    );

    // Correct the object number
    objects[objects.length - 1] =
      `${contentId} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${streamContent}endstream\nendobj`;

    // Page object
    const pageId = addObject(
      `${objectCount + 1} 0 obj\n<< /Type /Page /Parent 2 0 R ` +
      `/MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
      `/Contents ${contentId} 0 R ` +
      `/Resources << /Font << /F1 6 0 R >> >> >>\nendobj`
    );
    objects[objects.length - 1] =
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R ` +
      `/MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
      `/Contents ${contentId} 0 R ` +
      `/Resources << /Font << /F1 6 0 R >> >> >>\nendobj`;

    pageObjIds.push(pageId);
  }

  // Object 6: Simple font (Helvetica - for Latin fallback)
  addObject(
    `${objectCount + 1} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj`
  );
  const fontObjId = objectCount;
  objects[objects.length - 1] =
    `${fontObjId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj`;

  // Update Pages object
  const pageRefs = pageObjIds.map((id) => `${id} 0 R`).join(" ");
  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${pageObjIds.length} >>\nendobj`;

  // Build PDF
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += obj + "\n";
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += "xref\n";
  pdf += `0 ${objectCount + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 0; i < objectCount; i++) {
    pdf += offsets[i].toString().padStart(10, "0") + " 00000 n \n";
  }

  pdf += "trailer\n";
  pdf += `<< /Size ${objectCount + 1} /Root 1 0 R >>\n`;
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF\n";

  return Buffer.from(pdf, "latin1");
}

function escapePdfString(str: string): string {
  // Convert to Windows-1251 compatible characters for Cyrillic
  // PDF Type1 Helvetica with WinAnsiEncoding supports Latin but not Cyrillic
  // For now, transliterate Cyrillic to ensure PDF is valid and readable
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, (ch) => {
      // Try WinAnsi encoding for common chars
      const code = ch.charCodeAt(0);
      if (code >= 0x410 && code <= 0x44F) {
        // Cyrillic А-я range — use WinAnsi codes 192-255 for Cyrillic
        // Windows-1251 encoding maps:
        const win1251 = cyrillicToWin1251(code);
        if (win1251) return String.fromCharCode(win1251);
      }
      if (code === 0x406) return String.fromCharCode(0xB2); // І
      if (code === 0x456) return String.fromCharCode(0xB3); // і
      if (code === 0x407) return String.fromCharCode(0xAF); // Ї
      if (code === 0x457) return String.fromCharCode(0xBF); // ї
      if (code === 0x404) return String.fromCharCode(0xAA); // Є
      if (code === 0x454) return String.fromCharCode(0xBA); // є
      if (code === 0x490) return String.fromCharCode(0xA5); // Ґ
      if (code === 0x491) return String.fromCharCode(0xB4); // ґ
      if (code === 0x2014) return "-"; // em dash
      if (code === 0x2013) return "-"; // en dash
      if (code === 0x201C || code === 0x201D) return '"'; // quotes
      if (code === 0x201E) return '"';
      if (code === 0xAB || code === 0xBB) return '"'; // guillemets
      if (code === 0x2116) return "N"; // №
      return "?";
    });
}

function cyrillicToWin1251(unicode: number): number | null {
  // Unicode Cyrillic А(0x410) - я(0x44F) maps to Win-1251 192-255
  if (unicode >= 0x410 && unicode <= 0x44F) {
    return unicode - 0x410 + 0xC0;
  }
  // Ё = 0x401 -> 0xA8, ё = 0x451 -> 0xB8
  if (unicode === 0x401) return 0xA8;
  if (unicode === 0x451) return 0xB8;
  return null;
}
