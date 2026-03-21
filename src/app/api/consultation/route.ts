import { NextResponse } from "next/server";
import { Resend } from "resend";

const CONSULTATION_LABELS: Record<string, string> = {
  blitz: "Бліц-консультація (15 хв) — 300 грн",
  standard: "Стандартна консультація (30 хв) — 500 грн",
  extended: "Розширена консультація (60 хв) — 900 грн",
};

const TOPIC_LABELS: Record<string, string> = {
  family: "Сімейне право",
  civil: "Цивільне право",
  commercial: "Господарське право",
  administrative: "Адміністративне право",
  other: "Інше",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, consultationType, preferredDate, preferredTime, topic, description } = body;

    // Validation
    if (!name || !phone || !email || !consultationType || !preferredDate || !preferredTime || !topic) {
      return NextResponse.json(
        { error: "Будь ласка, заповніть усі обов'язкові поля." },
        { status: 400 },
      );
    }

    if (!CONSULTATION_LABELS[consultationType]) {
      return NextResponse.json({ error: "Невірний тип консультації." }, { status: 400 });
    }

    if (!TOPIC_LABELS[topic]) {
      return NextResponse.json({ error: "Невірна тема консультації." }, { status: 400 });
    }

    // Send notification email
    const notificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (notificationEmail && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `Юридичні послуги <${process.env.EMAIL_FROM ?? "docs@yourdomain.com"}>`,
        to: notificationEmail,
        subject: "Нова заявка на консультацію",
        html: `
          <!DOCTYPE html>
          <html lang="uk">
          <head><meta charset="UTF-8"></head>
          <body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="background: #0B0B0B; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 22px;">Нова заявка на консультацію</h1>
            </div>
            <div style="background: #f7fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 160px;">Ім'я:</td>
                  <td style="padding: 8px 0; font-weight: 600;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Телефон:</td>
                  <td style="padding: 8px 0;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Email:</td>
                  <td style="padding: 8px 0;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Тип консультації:</td>
                  <td style="padding: 8px 0; font-weight: 600;">${CONSULTATION_LABELS[consultationType]}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Тема:</td>
                  <td style="padding: 8px 0;">${TOPIC_LABELS[topic]}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Бажана дата:</td>
                  <td style="padding: 8px 0;">${preferredDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Бажаний час:</td>
                  <td style="padding: 8px 0;">${preferredTime}</td>
                </tr>
                ${description ? `<tr>
                  <td style="padding: 8px 0; color: #666; vertical-align: top;">Опис питання:</td>
                  <td style="padding: 8px 0;">${description}</td>
                </tr>` : ""}
              </table>
              <p style="font-size: 13px; color: #999; margin-top: 24px; text-align: center;">
                Зв'яжіться з клієнтом для підтвердження дати та часу консультації.
              </p>
            </div>
          </body>
          </html>
        `,
      });
    } else {
      console.warn("RESEND_API_KEY or ADMIN_NOTIFICATION_EMAIL not set, skipping email notification");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Consultation booking error:", error);
    return NextResponse.json(
      { error: "Внутрішня помилка сервера. Спробуйте пізніше." },
      { status: 500 },
    );
  }
}
