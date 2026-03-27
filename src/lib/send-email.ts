interface Analysis {
  puncteFortă: string[];
  zoneCritice: string[];
  recomandări: { titlu: string; descriere: string; prioritate: string }[];
  concluzie: string;
}

interface EmailData {
  prenume: string;
  email: string;
  companie: string;
  scor: number;
  nivel: string;
  analysis: Analysis;
  apiKey: string;
}

export async function sendReport(data: EmailData) {
  const RESEND_API_KEY = data.apiKey;
  if (!RESEND_API_KEY) throw new Error('Resend API key not configured');

  const scorColor = data.scor <= 5 ? '#B42828' : data.scor <= 10 ? '#C9880C' : '#1D9E75';
  const scorBg    = data.scor <= 5 ? '#FEF2F2' : data.scor <= 10 ? '#FFFBEB' : '#F0FDF4';

  const priorityColor = (p: string) =>
    p === 'Înaltă' ? '#B42828' : p === 'Medie' ? '#C9880C' : '#1D9E75';

  const puncteFortăHTML = data.analysis.puncteFortă.map(pf => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #E8F4EA; vertical-align: top;">
        <span style="color: #1D9E75; font-weight: bold; margin-right: 8px;">✓</span>
        <span style="color: #374151; font-size: 14px; line-height: 1.6;">${pf}</span>
      </td>
    </tr>`).join('');

  const zoneCriticeHTML = data.analysis.zoneCritice.map(zc => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #FEF3C7; vertical-align: top;">
        <span style="color: #C9880C; font-weight: bold; margin-right: 8px;">⚠</span>
        <span style="color: #374151; font-size: 14px; line-height: 1.6;">${zc}</span>
      </td>
    </tr>`).join('');

  const recomandariHTML = data.analysis.recomandări.map((rec, i) => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #E5E7EB;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="32" style="vertical-align: top; padding-top: 2px;">
              <div style="width: 28px; height: 28px; background: #03306E; border-radius: 6px; text-align: center; line-height: 28px; color: #ffffff; font-weight: bold; font-size: 14px;">${i + 1}</div>
            </td>
            <td style="padding-left: 12px; vertical-align: top;">
              <div style="margin-bottom: 6px;">
                <span style="font-size: 15px; font-weight: bold; color: #03306E;">${rec.titlu}</span>
                <span style="margin-left: 10px; font-size: 11px; font-weight: 600; color: ${priorityColor(rec.prioritate)}; text-transform: uppercase; letter-spacing: 0.5px;">● ${rec.prioritate}</span>
              </div>
              <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #4B5563;">${rec.descriere}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #F3F4F6; font-family: Arial, Helvetica, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F3F4F6; padding: 32px 0;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

    <!-- HEADER -->
    <tr>
      <td style="background: #021B3D; padding: 28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <div style="font-size: 20px; font-weight: bold; color: #ffffff; margin-bottom: 4px;">Ana Dobre</div>
              <div style="font-size: 9px; letter-spacing: 2px; color: #5A93CC; text-transform: uppercase;">STRATEGY → AUTOMATION → RESULTS</div>
            </td>
            <td align="right">
              <div style="background: #0249A5; border-radius: 8px; padding: 8px 16px; display: inline-block; text-align: center;">
                <div style="font-size: 22px; font-weight: bold; color: ${scorColor};">${data.scor}/16</div>
                <div style="font-size: 10px; color: #93C5FD; letter-spacing: 1px;">SCOR</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- INTRO -->
    <tr>
      <td style="padding: 28px 32px 0;">
        <p style="margin: 0 0 8px; font-size: 17px; color: #111827;">Bună, <strong>${data.prenume}</strong>!</p>
        <p style="margin: 0; font-size: 14px; color: #6B7280; line-height: 1.6;">Mai jos găsești raportul tău de maturitate în automatizări, generat pe baza răspunsurilor din mini-audit.</p>
      </td>
    </tr>

    <!-- SCOR BOX -->
    <tr>
      <td style="padding: 20px 32px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: ${scorBg}; border-radius: 8px; padding: 20px; border: 1px solid ${scorColor}33;">
          <tr>
            <td align="center">
              <div style="font-size: 13px; color: #6B7280; margin-bottom: 6px;">Scorul tău de maturitate</div>
              <div style="font-size: 36px; font-weight: bold; color: ${scorColor}; line-height: 1;">${data.scor} <span style="font-size: 20px;">din 16</span></div>
              <div style="font-size: 16px; color: ${scorColor}; margin-top: 6px; font-weight: 600;">Nivel: ${data.nivel}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CONCLUZIE -->
    <tr>
      <td style="padding: 24px 32px 0;">
        <div style="font-size: 16px; font-weight: bold; color: #03306E; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #D6E6F5;">Concluzie</div>
        <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #374151;">${data.analysis.concluzie}</p>
      </td>
    </tr>

    <!-- PUNCTE FORTE + ZONE CRITICE -->
    <tr>
      <td style="padding: 24px 32px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <!-- Puncte forte -->
            <td width="48%" style="vertical-align: top; padding-right: 12px;">
              <div style="font-size: 14px; font-weight: bold; color: #1D9E75; margin-bottom: 8px;">Puncte forte</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${puncteFortăHTML}
              </table>
            </td>
            <!-- Zone critice -->
            <td width="4%"></td>
            <td width="48%" style="vertical-align: top; padding-left: 12px;">
              <div style="font-size: 14px; font-weight: bold; color: #C9880C; margin-bottom: 8px;">Zone critice</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${zoneCriticeHTML}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- RECOMANDARI -->
    <tr>
      <td style="padding: 24px 32px 0;">
        <div style="font-size: 16px; font-weight: bold; color: #03306E; margin-bottom: 4px; padding-bottom: 8px; border-bottom: 2px solid #D6E6F5;">Recomandări prioritare</div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${recomandariHTML}
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding: 24px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #EEF4FA; border-radius: 8px; padding: 24px;">
          <tr>
            <td align="center">
              <p style="margin: 0 0 6px; font-size: 15px; font-weight: bold; color: #03306E;">Vrei un plan personalizat de implementare?</p>
              <p style="margin: 0 0 18px; font-size: 13px; color: #6B7280;">Programează o consultație gratuită de 30 de minute.</p>
              <a href="https://anadobre.com/servicii#formular" style="background: #0249A5; color: #ffffff; padding: 13px 30px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">Programează o discuție →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="padding: 0 32px 28px;">
        <p style="margin: 0 0 4px; font-size: 14px; color: #111827;">Cu drag,<br><strong>Ana Dobre</strong></p>
        <p style="margin: 0; font-size: 12px; color: #9CA3AF;">Automatizări Marketing & Vânzări · anadobre.com</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;">
        <p style="margin: 0; font-size: 11px; color: #9CA3AF; line-height: 1.5;">Primești acest email pentru că ai completat mini-auditul pe anadobre.com. Dacă ai întrebări, scrie-mi la hello@anadobre.com.</p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Ana Dobre <hello@anadobre.com>',
      to: data.email,
      subject: `Raportul tău de mini-audit — Scor: ${data.scor}/16 (${data.nivel})`,
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Resend error:', err);
    throw new Error(`Resend API error: ${response.status}`);
  }

  return await response.json();
}
