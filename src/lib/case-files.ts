/**
 * Turns uploaded case files into text + attachments for the AI.
 * Shared by the initial case analysis and by "add documents" in the case chat.
 */

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

function isImage(name: string): boolean {
  return IMAGE_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));
}

function getMimeType(name: string): string {
  const ext = name.toLowerCase().split(".").pop();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
  };
  return map[ext ?? ""] ?? "image/jpeg";
}

export interface UploadedItem {
  buffer: Buffer;
  name: string;
}

export interface CaseAttachment {
  mimeType: string;
  base64: string;
  fileName: string;
}

export interface ExtractedCaseFile {
  name: string;
  /** Text we could extract locally (text layer, DOCX, TXT…). */
  text: string;
  /** Set when the file must be read by the model (photo or scanned PDF). */
  attachment?: CaseAttachment;
}

/** User-facing error for a file we cannot read (respond with 400). */
export class CaseFileError extends Error {
  constructor(
    message: string,
    public details?: string
  ) {
    super(message);
  }
}

export async function extractCaseFile(item: UploadedItem): Promise<ExtractedCaseFile> {
  const { buffer, name } = item;
  const fileName = name.toLowerCase();

  if (isImage(fileName)) {
    return {
      name,
      text: "",
      attachment: { mimeType: getMimeType(fileName), base64: buffer.toString("base64"), fileName: name },
    };
  }

  if (fileName.endsWith(".pdf")) {
    // 1) Спробуємо витягти текстовий шар (pdf-parse v2).
    let extractedText = "";
    let parseError: unknown = null;
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const parsed = await parser.getText();
        extractedText = (parsed?.text ?? "").trim();
      } finally {
        await parser.destroy();
      }
    } catch (err) {
      parseError = err;
    }

    if (extractedText.length >= 100) {
      // Достатньо тексту — звичайний шлях.
      return { name, text: extractedText };
    }

    // Скан-PDF або pdf-parse зламалось — віддаємо PDF напряму моделі
    // (Gemini читає PDF нативно з OCR, Claude — як document-блок).
    if (parseError) {
      console.warn(`pdf-parse failed for ${name}, passing PDF to the model:`, parseError);
    } else {
      console.warn(
        `pdf-parse returned ${extractedText.length} chars for ${name} (likely scanned), passing PDF to the model`
      );
    }
    return {
      name,
      // Якщо щось маленьке витягли — додамо як підказку.
      text: extractedText,
      attachment: { mimeType: "application/pdf", base64: buffer.toString("base64"), fileName: name },
    };
  }

  if (fileName.endsWith(".docx")) {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return { name, text: result.value };
    } catch (err) {
      throw new CaseFileError(
        `Не вдалося прочитати DOCX "${name}". Файл пошкоджений або не є валідним .docx. Відкрийте його у Word/Pages і збережіть як .docx, PDF або .txt.`,
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  if (fileName.endsWith(".doc")) {
    // Старий бінарний формат Word (OLE2). Використовуємо word-extractor.
    try {
      // @ts-expect-error — у пакета немає типів
      const wordExtractorModule = await import("word-extractor");
      type WordExtractorCtor = new () => {
        extract(data: Buffer): Promise<{ getBody?: () => string }>;
      };
      const mod = wordExtractorModule as { default?: WordExtractorCtor };
      const WordExtractor = mod.default ?? (wordExtractorModule as unknown as WordExtractorCtor);
      const extractor = new WordExtractor();
      const doc = await extractor.extract(buffer);
      const txt = (doc.getBody?.() ?? "").trim();
      if (!txt) {
        throw new Error("Empty .doc body");
      }
      return { name, text: txt };
    } catch (err) {
      throw new CaseFileError(
        `Не вдалося прочитати DOC "${name}". Файл може бути пошкоджений або захищений паролем. Відкрийте його у Word і збережіть як .docx або PDF.`,
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  if (fileName.endsWith(".rtf")) {
    // RTF — простий текстовий формат з керуючими послідовностями.
    // Витягуємо звичайний текст регекспом — досить для аналізу AI.
    const raw = buffer.toString("utf-8");
    const stripped = raw
      .replace(/\\\*\\[a-z]+\s*[^{}]*?(?=[{}\\])/gi, "")
      .replace(/\\[a-z]+-?\d* ?/gi, "")
      .replace(/[{}]/g, "")
      .replace(/\\'[0-9a-f]{2}/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    if (stripped.length < 20) {
      throw new CaseFileError(`RTF "${name}" не вдалося розпарсити. Збережіть файл як .docx або PDF.`);
    }
    return { name, text: stripped };
  }

  if (fileName.endsWith(".txt")) {
    return { name, text: buffer.toString("utf-8") };
  }

  throw new CaseFileError(
    `Непідтримуваний формат: ${name}. Підтримуються: PDF, DOCX, DOC, RTF, TXT, JPG, PNG, WEBP`
  );
}
