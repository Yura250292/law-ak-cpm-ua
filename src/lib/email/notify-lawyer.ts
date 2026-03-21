import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(apiKey);
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function notifyLawyerNewRequest(params: {
  requestId: string;
  documentTitle: string;
  clientEmail: string;
  clientName: string;
}) {
  const notificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!notificationEmail) {
    console.warn("ADMIN_NOTIFICATION_EMAIL not set, skipping lawyer notification");
    return;
  }

  const { requestId, documentTitle, clientEmail, clientName } = params;
  const adminLink = `${BASE_URL}/admin/requests/${requestId}`;

  const resend = getResendClient();
  await resend.emails.send({
    from: `Юридичні послуги <${process.env.EMAIL_FROM ?? "docs@yourdomain.com"}>`,
    to: notificationEmail,
    subject: `Нова заявка: ${documentTitle}`,
    html: `
      <!DOCTYPE html>
      <html lang="uk">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background: #0B0B0B; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">Нова заявка на перевірку</h1>
        </div>
        <div style="background: #f7fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; line-height: 1.6;">
            Надійшла нова заявка, яка потребує вашої перевірки.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 140px;">Документ:</td>
              <td style="padding: 8px 0; font-weight: 600;">${documentTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Клієнт:</td>
              <td style="padding: 8px 0;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Email клієнта:</td>
              <td style="padding: 8px 0;">${clientEmail}</td>
            </tr>
          </table>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${adminLink}" style="display: inline-block; padding: 12px 32px; background: #FFD600; color: #0B0B0B; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 15px;">
              Переглянути заявку
            </a>
          </div>
          <p style="font-size: 13px; color: #999; margin-top: 24px; text-align: center;">
            AI вже згенерував текст документа. Перевірте, відредагуйте та затвердіть.
          </p>
        </div>
      </body>
      </html>
    `,
  });
}
