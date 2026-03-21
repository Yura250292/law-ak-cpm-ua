import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(apiKey);
}

export async function sendDocumentEmail(params: {
  to: string;
  documentTitle: string;
  pdfBuffer: Buffer;
  fileName: string;
}) {
  const { to, documentTitle, pdfBuffer, fileName } = params;

  const resend = getResendClient();
  await resend.emails.send({
    from: `Юридичні послуги <${process.env.EMAIL_FROM ?? "docs@yourdomain.com"}>`,
    to,
    subject: `Ваш документ готовий: ${documentTitle}`,
    html: `
      <!DOCTYPE html>
      <html lang="uk">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background: #1a365d; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">Ваш документ готовий</h1>
        </div>
        <div style="background: #f7fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; line-height: 1.6;">Шановний клієнте,</p>
          <p style="font-size: 16px; line-height: 1.6;">
            Ваш документ <strong>"${documentTitle}"</strong> підготовлено адвокатом та додано у вкладення до цього листа.
          </p>
          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0; border-radius: 0 4px 4px 0;">
            <p style="margin: 0; font-size: 14px; color: #166534;">
              <strong>Зверніть увагу:</strong> Рекомендуємо ознайомитися зі змістом документа перед подачею до суду.
              Якщо у вас є додаткові питання — зверніться до адвоката.
            </p>
          </div>
          <p style="font-size: 14px; color: #718096; margin-top: 24px;">
            З повагою,<br>
            Адвокат Кабаль Анастасія Ігорівна
          </p>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer,
      },
    ],
  });
}
