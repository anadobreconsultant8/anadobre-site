interface EmailData {
  prenume: string;
  email: string;
  companie: string;
  scor: number;
  nivel: string;
  pdfBase64: string;
  apiKey: string;
}

export async function sendEmailWithPDF(data: EmailData) {
  const RESEND_API_KEY = data.apiKey;

  if (!RESEND_API_KEY) {
    console.error('Resend API key missing');
    throw new Error('Resend API key not configured');
  }

  const scorColor = data.scor <= 5 ? '#DC3535' : data.scor <= 10 ? '#C9880C' : '#1D9E75';

  const htmlContent = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A2E;">

      <div style="border-bottom: 2px solid #D6E6F5; padding-bottom: 16px; margin-bottom: 24px;">
        <h2 style="color: #03306E; margin: 0; font-size: 20px;">Ana Dobre</h2>
        <p style="color: #0249A5; font-size: 10px; letter-spacing: 2px; margin: 4px 0 0; text-transform: uppercase;">STRATEGY → AUTOMATION → RESULTS</p>
      </div>

      <p style="font-size: 16px; line-height: 1.6;">Bun\u0103, ${data.prenume}!</p>

      <p style="font-size: 15px; line-height: 1.7; color: #4A5568;">Mul\u021Bumesc c\u0103 ai completat mini-auditul de maturitate \u00EEn automatiz\u0103ri.</p>

      <div style="background: #EEF4FA; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="font-size: 14px; color: #4A5568; margin: 0 0 8px;">Scorul t\u0103u:</p>
        <p style="font-size: 32px; font-weight: bold; color: ${scorColor}; margin: 0;">${data.scor} din 16</p>
        <p style="font-size: 16px; color: ${scorColor}; margin: 8px 0 0;">Nivel: ${data.nivel}</p>
      </div>

      <p style="font-size: 15px; line-height: 1.7; color: #4A5568;">Am ata\u0219at raportul complet cu:</p>
      <ul style="font-size: 15px; line-height: 1.8; color: #4A5568;">
        <li>Analiza pe 4 categorii cu scor individual</li>
        <li>Recomand\u0103ri concrete adaptate nivelului t\u0103u</li>
        <li>Urm\u0103torii pa\u0219i pe care \u00EEi po\u021Bi aplica imediat</li>
      </ul>

      <p style="font-size: 15px; line-height: 1.7; color: #4A5568;">Dac\u0103 vrei s\u0103 discut\u0103m despre un plan personalizat pentru ${data.companie}, programeaz\u0103 o consulta\u021Bie gratuit\u0103:</p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="https://anadobre.com/servicii#formular" style="background: #0249A5; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 500; display: inline-block;">Programeaz\u0103 o discu\u021Bie</a>
      </div>

      <p style="font-size: 15px; line-height: 1.7; color: #1A1A2E;">Cu drag,<br><strong>Ana Dobre</strong></p>
      <p style="font-size: 13px; color: #8E99A4;">Automatiz\u0103ri Marketing & V\u00E2nz\u0103ri<br>anadobre.com</p>

      <div style="border-top: 1px solid #E2E8F0; margin-top: 32px; padding-top: 16px;">
        <p style="font-size: 11px; color: #8E99A4; line-height: 1.6;">Prime\u0219ti acest email pentru c\u0103 ai completat mini-auditul pe anadobre.com. Dac\u0103 ai \u00EEntreb\u0103ri, r\u0103spunde direct la acest email sau scrie-mi la hello@anadobre.com.</p>
      </div>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Ana Dobre <hello@anadobre.com>',
      to: data.email,
      subject: `Raportul t\u0103u de mini-audit \u2014 Scor: ${data.scor}/16 (${data.nivel})`,
      html: htmlContent,
      attachments: [
        {
          filename: 'mini-audit-raport-anadobre.pdf',
          content: data.pdfBase64,
        }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Resend error:', errorText);
    throw new Error(`Resend API error: ${response.status}`);
  }

  return await response.json();
}
