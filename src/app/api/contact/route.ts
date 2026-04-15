import { NextResponse } from "next/server";
import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(apiKey);
}

const subjectLabels: Record<string, string> = {
  consultation: "Консультація",
  documents: "Складання документів",
  court: "Представництво в суді",
  other: "Інше",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, subject, message } = body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Вкажіть ваше ім'я" },
        { status: 400 }
      );
    }
    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "Вкажіть номер телефону" },
        { status: 400 }
      );
    }
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { error: "Повідомлення має містити щонайменше 10 символів" },
        { status: 400 }
      );
    }

    const notificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (!notificationEmail) {
      console.warn(
        "ADMIN_NOTIFICATION_EMAIL not set, skipping contact notification"
      );
      return NextResponse.json({ success: true });
    }

    const subjectLabel = subjectLabels[subject] ?? subject ?? "Не вказано";

    const resend = getResendClient();
    await resend.emails.send({
      from: `Юридичні послуги <${process.env.EMAIL_FROM ?? "docs@yourdomain.com"}>`,
      to: notificationEmail,
      subject: `Нове звернення: ${subjectLabel} — ${name.trim()}`,
      html: `
        <!DOCTYPE html>
        <html lang="uk">
        <head><meta charset="UTF-8"></head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: #1C1C1E; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">Нове звернення з сайту</h1>
          </div>
          <div style="background: #f7fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; line-height: 1.6;">
              Надійшло нове повідомлення через контактну форму.
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 140px; vertical-align: top;">Ім&apos;я:</td>
                <td style="padding: 8px 0; font-weight: 600;">${escapeHtml(name.trim())}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;">Телефон:</td>
                <td style="padding: 8px 0;">
                  <a href="tel:${escapeHtml(phone.trim())}" style="color: #1C1C1E; text-decoration: none;">${escapeHtml(phone.trim())}</a>
                </td>
              </tr>
              ${
                email
                  ? `<tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;">Email:</td>
                <td style="padding: 8px 0;">
                  <a href="mailto:${escapeHtml(email.trim())}" style="color: #1C1C1E; text-decoration: none;">${escapeHtml(email.trim())}</a>
                </td>
              </tr>`
                  : ""
              }
              <tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;">Тема:</td>
                <td style="padding: 8px 0;">
                  <span style="display: inline-block; background: #C9A96E; color: #1C1C1E; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 600;">${escapeHtml(subjectLabel)}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;">Повідомлення:</td>
                <td style="padding: 8px 0; line-height: 1.6;">${escapeHtml(message.trim()).replace(/\n/g, "<br>")}</td>
              </tr>
            </table>
            <p style="font-size: 13px; color: #999; margin-top: 24px; text-align: center;">
              Це повідомлення надіслано через контактну форму на сайті.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Не вдалося надіслати повідомлення. Спробуйте пізніше." },
      { status: 500 }
    );
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
