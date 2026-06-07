import nodemailer from "nodemailer"

// ─── Transporteur Gmail ───────────────────────────────────────────────────────

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER ?? "societedilari@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

// ─── Email OTP ────────────────────────────────────────────────────────────────

export async function sendOtpEmail(to: string, code: string, type: "REGISTER" | "RESET_PASSWORD") {
  const subject =
    type === "REGISTER"
      ? "Votre code de vérification — Dagan IA"
      : "Réinitialisation de mot de passe — Dagan IA"

  const action =
    type === "REGISTER"
      ? "confirmer votre inscription"
      : "réinitialiser votre mot de passe"

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#F5F0EB;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EB;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;border:1px solid #E8E0D8;">
          <tr>
            <td style="background:#C1440E;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-family:Arial,sans-serif;font-weight:700;color:#fff;font-size:22px;">Dagan IA</p>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Grande Soeur Numerique</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
                Bonjour,<br/>
                Utilisez ce code pour ${action} sur Dagan IA.
              </p>
              <div style="background:#F5F0EB;border-radius:16px;padding:24px;text-align:center;margin:24px 0;">
                <p style="margin:0 0 8px;color:#6B4F3A;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Votre code</p>
                <p style="margin:0;font-size:42px;font-weight:700;color:#C1440E;letter-spacing:10px;font-family:'Courier New',monospace;">
                  ${code}
                </p>
              </div>
              <p style="margin:0 0 8px;color:#6B4F3A;font-size:13px;line-height:1.6;">
                Ce code est valable <strong>10 minutes</strong>.<br/>
                Si vous n'etes pas a l'origine de cette demande, ignorez cet email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #F0EDE8;text-align:center;">
              <p style="margin:0;color:#9CA3AF;font-size:12px;">
                &copy; ${new Date().getFullYear()} Dagan IA &mdash; daganai.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const transporter = getTransporter()
  const info = await transporter.sendMail({
    from:    `"Dagan IA" <${process.env.GMAIL_USER ?? "societedilari@gmail.com"}>`,
    to,
    subject,
    html,
  })
  console.log("[sendOtpEmail] envoyé:", {
    to,
    type,
    messageId: info.messageId,
    accepted:  info.accepted,
    rejected:  info.rejected,
    response:  info.response,
  })
}

// ─── Rapport financier ────────────────────────────────────────────────────────

export async function sendRapportEmail(opts: {
  to:          string
  businessNom: string
  periode:     string
  analyseText?: string
  kpis:        { ca: number; depenses: number; benefice: number; chargesMois?: number; encours?: number }
}) {
  const { to, businessNom, periode, kpis } = opts
  const f = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA"

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5F0EB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EB;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;border:1px solid #E8E0D8;">
        <tr>
          <td style="background:#C1440E;padding:28px 40px;text-align:center;">
            <p style="margin:0;font-weight:700;color:#fff;font-size:20px;">Rapport Financier</p>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">${businessNom} — ${periode}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="12" style="border-radius:12px;background:#F5F0EB;margin-bottom:24px;">
              <tr>
                <td style="color:#6B4F3A;font-size:12px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;">Chiffre d'affaires</td>
                <td style="text-align:right;font-weight:700;color:#1A1A1A;font-size:16px;">${f(kpis.ca)}</td>
              </tr>
              <tr>
                <td style="color:#6B4F3A;font-size:12px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;border-top:1px solid #E8E0D8;">Depenses</td>
                <td style="text-align:right;font-weight:700;color:#C1440E;font-size:16px;border-top:1px solid #E8E0D8;">${f(kpis.depenses)}</td>
              </tr>
              <tr>
                <td style="color:#6B4F3A;font-size:12px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;border-top:1px solid #E8E0D8;">Benefice net</td>
                <td style="text-align:right;font-weight:700;color:${kpis.benefice >= 0 ? "#16A34A" : "#DC2626"};font-size:18px;border-top:1px solid #E8E0D8;">${f(kpis.benefice)}</td>
              </tr>
            </table>
            <p style="margin:0;color:#9CA3AF;font-size:12px;text-align:center;">
              Genere automatiquement par Dagan IA
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const transporter = getTransporter()
  await transporter.sendMail({
    from:    `"Dagan IA" <${process.env.GMAIL_USER ?? "societedilari@gmail.com"}>`,
    to,
    subject: `Rapport financier — ${businessNom} (${periode})`,
    html,
  })
}
