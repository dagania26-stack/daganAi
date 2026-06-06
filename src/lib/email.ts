import { Resend } from "resend"

// Initialisation lazy pour éviter l'erreur au build si RESEND_API_KEY est absent
function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendRapportEmail(opts: {
  to:           string
  businessNom:  string
  periode:      string
  analyseText:  string
  kpis: { ca: number; depenses: number; benefice: number; chargesMois: number; encours: number }
}) {
  const { to, businessNom, periode, analyseText, kpis } = opts
  const year = new Date().getFullYear()
  const fmt  = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA"

  // Extract first 800 chars of analysis for email preview
  const analysePreview = analyseText.replace(/\*\*/g, "").slice(0, 800) + (analyseText.length > 800 ? "…" : "")

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Rapport — ${businessNom}</title></head>
<body style="margin:0;padding:0;background-color:#F5F0EB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0EB;padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:20px;overflow:hidden;">
        <tr><td style="background-color:#C1440E;padding:32px 40px;text-align:center;">
          <p style="margin:0;font-size:26px;font-weight:700;color:#fff;letter-spacing:-0.5px;">Dagan IA</p>
          <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.65);letter-spacing:2.5px;text-transform:uppercase;">Rapport Financier</p>
        </td></tr>

        <tr><td style="padding:36px 40px 24px;">
          <h1 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#1A1512;">${businessNom}</h1>
          <p style="margin:0 0 28px;font-size:14px;color:#6B6860;">Période : ${periode}</p>

          <!-- KPI cards -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td width="50%" style="padding-right:6px;padding-bottom:10px;">
                <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:14px 16px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#6B6860;">Chiffre d'affaires</p>
                  <p style="margin:0;font-size:16px;font-weight:700;color:#2D6A4F;">${fmt(kpis.ca)}</p>
                </div>
              </td>
              <td width="50%" style="padding-left:6px;padding-bottom:10px;">
                <div style="background:${kpis.benefice >= 0 ? "#F0FDF4" : "#FEF2F2"};border:1px solid ${kpis.benefice >= 0 ? "#BBF7D0" : "#FECACA"};border-radius:10px;padding:14px 16px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#6B6860;">Bénéfice net</p>
                  <p style="margin:0;font-size:16px;font-weight:700;color:${kpis.benefice >= 0 ? "#2D6A4F" : "#DC2626"};">${fmt(kpis.benefice)}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td width="50%" style="padding-right:6px;">
                <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:14px 16px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#6B6860;">Charges /mois</p>
                  <p style="margin:0;font-size:16px;font-weight:700;color:#92400E;">${fmt(kpis.chargesMois)}</p>
                </div>
              </td>
              <td width="50%" style="padding-left:6px;">
                <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:14px 16px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#6B6860;">Dettes en cours</p>
                  <p style="margin:0;font-size:16px;font-weight:700;color:#DC2626;">${fmt(kpis.encours)}</p>
                </div>
              </td>
            </tr>
          </table>

          <!-- Analyse preview -->
          ${analysePreview ? `
          <div style="background:#FFF8F0;border:1px solid #E8E0D8;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#C1440E;text-transform:uppercase;letter-spacing:1.5px;">Analyse DaganAI</p>
            <p style="margin:0;font-size:13px;color:#3D3530;line-height:1.7;white-space:pre-wrap;">${analysePreview}</p>
          </div>` : ""}

          <p style="margin:0;font-size:13px;color:#6B6860;line-height:1.7;">
            Connectez-vous à votre espace Dagan IA pour consulter le rapport complet et télécharger le PDF détaillé.
          </p>
        </td></tr>

        <tr><td style="padding:0 40px;"><div style="height:1px;background-color:#E8E0D8;"></div></td></tr>
        <tr><td style="padding:20px 40px 32px;">
          <p style="margin:0;font-size:12px;color:#A09890;line-height:1.75;">
            Rapport généré automatiquement par Dagan IA.<br>
            &copy; ${year} Dagan IA &mdash; Lomé, Togo
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const { error } = await getResend().emails.send({
    from:    "Dagan IA <rapports@daganai.com>",
    to,
    subject: `Rapport financier — ${businessNom} (${periode})`,
    html,
  })
  if (error) throw new Error(error.message)
}

export async function sendMagicLinkEmail(to: string, url: string) {
  const { error } = await getResend().emails.send({
    from: "Dagan IA <connexion@daganai.com>",
    to,
    subject: "Votre lien de connexion — Dagan IA",
    html: magicLinkHtml(url),
  })
  if (error) throw new Error(error.message)
}

function magicLinkHtml(url: string): string {
  const year = new Date().getFullYear()
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Connexion — Dagan IA</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0EB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0EB;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#ffffff;border-radius:20px;overflow:hidden;">

          <!-- En-tête -->
          <tr>
            <td style="background-color:#C1440E;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Dagan IA</p>
              <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.65);letter-spacing:2.5px;text-transform:uppercase;">DAGAN GESTION</p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding:44px 40px 36px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1A1A1A;line-height:1.3;">Votre lien de connexion</h1>
              <p style="margin:0 0 36px;font-size:15px;color:#6B6860;line-height:1.7;">
                Cliquez sur le bouton ci-dessous pour accéder à votre espace de gestion financière.
                Ce lien est valable <strong style="color:#1A1A1A;">24 heures</strong> et ne peut être utilisé qu'une seule fois.
              </p>

              <!-- Bouton CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:36px;">
                    <a href="${url}"
                       style="display:inline-block;background-color:#C1440E;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:16px 40px;border-radius:12px;letter-spacing:0.2px;">
                      Accéder à Dagan Gestion
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Lien alternatif -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#FFF8F0;border-radius:10px;border:1px solid #E8E0D8;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#6B6860;text-transform:uppercase;letter-spacing:1.2px;">Lien de secours</p>
                    <a href="${url}" style="color:#C1440E;font-size:12px;word-break:break-all;text-decoration:none;">${url}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Séparateur -->
          <tr>
            <td style="padding:0 40px;"><div style="height:1px;background-color:#E8E0D8;"></div></td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="padding:24px 40px 36px;">
              <p style="margin:0;font-size:12px;color:#A09890;line-height:1.75;">
                Si vous n'avez pas demandé ce lien, ignorez cet email. Votre compte reste sécurisé.<br>
                &copy; ${year} Dagan IA &mdash; Lomé, Togo
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
