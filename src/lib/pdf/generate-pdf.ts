import type { TDocumentDefinitions } from "pdfmake/interfaces";

export async function generateDocumentPdf(
  title: string,
  text: string
): Promise<Buffer> {
  const pdfmake = await import("pdfmake");

  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [70, 80, 40, 60],
    content: [
      {
        text: title,
        fontSize: 14,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 24],
      },
      ...paragraphs.map((paragraph) => ({
        text: paragraph,
        fontSize: 12,
        lineHeight: 1.5,
        alignment: "justify" as const,
        margin: [0, 0, 0, 10] as [number, number, number, number],
      })),
    ],
  };

  const pdfDoc = pdfmake.createPdf(docDefinition);
  const buffer = await pdfDoc.getBuffer();
  return buffer;
}
