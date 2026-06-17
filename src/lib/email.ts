import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   ?? 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = process.env.SMTP_FROM ?? `ClinBase <${process.env.SMTP_USER}>`
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const link = `${APP_URL}/verify?token=${token}`

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Подтвердите ваш email — ClinBase',
    html: `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Подтверждение email</title>
</head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a6fe8,#1558d6);padding:36px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:44px;height:44px;background:rgba(255,255,255,0.2);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
                  <span style="font-size:22px;">📚</span>
                </div>
                <div style="text-align:left;">
                  <div style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">ClinBase</div>
                  <div style="color:rgba(255,255,255,0.6);font-size:12px;margin-top:1px;">СПбГПМУ × ТГМУ</div>
                </div>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;">
                Подтвердите ваш email
              </h1>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                Привет, <strong style="color:#111827;">${name}</strong>!<br>
                Вы зарегистрировались на платформе ClinBase. Для подтверждения подлинности профиля нажмите кнопку ниже.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:32px 0;">
                <a href="${link}"
                   style="display:inline-block;background:linear-gradient(135deg,#1a6fe8,#1558d6);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:14px;letter-spacing:-0.2px;box-shadow:0 4px 14px rgba(26,111,232,0.4);">
                  ✅&nbsp;&nbsp;Подтвердить email
                </a>
              </div>

              <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;text-align:center;">
                Ссылка действительна <strong style="color:#6b7280;">24 часа</strong>
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                Если кнопка не работает, скопируйте ссылку:
              </p>
              <p style="margin:8px 0 0;text-align:center;">
                <a href="${link}" style="color:#1a6fe8;font-size:12px;word-break:break-all;">${link}</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 40px;"><div style="height:1px;background:#f3f4f6;"></div></td></tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">
                Если вы не регистрировались на ClinBase — просто проигнорируйте это письмо.
              </p>
              <p style="margin:0;color:#d1d5db;font-size:11px;">
                © ${new Date().getFullYear()} ClinBase · Санкт-Петербург, Россия
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  })
}
