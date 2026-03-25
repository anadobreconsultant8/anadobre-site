# INSTRUCȚIUNI: Mini-Audit Backend Complet

## CE TREBUIE IMPLEMENTAT

Site-ul Astro are deja pagina `/mini-audit` cu quiz-ul funcțional client-side (8 întrebări, scor, rezultat). Trebuie să adăugăm:

1. Un API endpoint serverless care primește datele din formular
2. Generare PDF personalizat cu raportul
3. Creare contact în ActiveCampaign cu tag-uri și câmpuri custom
4. Trimitere email cu PDF-ul atașat via Resend

## ARHITECTURA

```
[Frontend: formular completat] 
    → POST /api/mini-audit-submit
        → Generează PDF personalizat
        → Creează/actualizează contact în ActiveCampaign
        → Aplică tag-uri în ActiveCampaign
        → Trimite email cu PDF atașat via Resend
        → Returnează { success: true }
```

## PAS 1: Transformă proiectul în SSR (Hybrid)

Site-ul trebuie să suporte și pagini statice și endpoint-uri API serverless.

În `astro.config.mjs`, schimbă output-ul:

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'hybrid',       // static by default, SSR on demand
  adapter: cloudflare(),   // deploy pe Cloudflare Pages
  integrations: [tailwind()],
});
```

Instalează adapter-ul:
```bash
npm install @astrojs/cloudflare
```

## PAS 2: Endpoint-ul API

Creează fișierul `src/pages/api/mini-audit-submit.ts` (sau .js):

```typescript
export const prerender = false; // Acest endpoint rulează server-side

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { prenume, email, companie, scor, nivel, raspunsuri } = body;

    // Validare
    if (!prenume || !email || !companie || scor === undefined || !nivel || !raspunsuri) {
      return new Response(JSON.stringify({ error: 'Câmpuri lipsă' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Generează PDF-ul
    const pdfBase64 = await generatePDF({ prenume, email, companie, scor, nivel, raspunsuri });

    // 2. Creează contact în ActiveCampaign
    await createACContact({ prenume, email, companie, scor, nivel });

    // 3. Trimite email cu PDF via Resend
    await sendEmailWithPDF({ prenume, email, companie, scor, nivel, pdfBase64 });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Mini-audit submit error:', error);
    return new Response(JSON.stringify({ error: 'Eroare internă' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

## PAS 3: Generare PDF

Folosește `jspdf` — funcționează în Cloudflare Workers/Pages Functions.

Instalează:
```bash
npm install jspdf
```

Creează fișierul `src/lib/generate-pdf.ts`:

```typescript
import { jsPDF } from 'jspdf';

interface PDFData {
  prenume: string;
  email: string;
  companie: string;
  scor: number;
  nivel: string;
  raspunsuri: number[];
}

export async function generatePDF(data: PDFData): Promise<string> {
  const { prenume, companie, scor, nivel, raspunsuri } = data;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = 20;

  // ── Culori ──
  const navy = [3, 48, 110];        // #03306E
  const blue = [2, 73, 165];        // #0249A5
  const amber = [201, 136, 12];     // #C9880C
  const textDark = [26, 26, 46];    // #1A1A2E
  const textMuted = [74, 85, 104];  // #4A5568
  const bgLight = [238, 244, 250];  // #EEF4FA
  const red = [220, 53, 53];
  const amberBg = [250, 238, 218];
  const green = [29, 158, 117];

  // ── Helper functions ──
  function addText(text: string, x: number, yPos: number, size: number, color: number[], style: string = 'normal') {
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    if (style === 'bold') {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(text, x, yPos);
    return yPos;
  }

  function addWrappedText(text: string, x: number, yPos: number, size: number, color: number[], maxWidth: number, style: string = 'normal'): number {
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    if (style === 'bold') {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, yPos);
    return yPos + (lines.length * size * 0.45);
  }

  function checkPageBreak(currentY: number, needed: number): number {
    if (currentY + needed > 270) {
      doc.addPage();
      return 20;
    }
    return currentY;
  }

  // ══════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════
  addText('Ana Dobre', margin, y, 18, navy, 'bold');
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(blue[0], blue[1], blue[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('STRATEGY  \u2192  AUTOMATION  \u2192  RESULTS', margin, y);
  
  // Linie separator
  y += 6;
  doc.setDrawColor(214, 230, 245); // #D6E6F5
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Titlu raport
  y = addWrappedText('Raport Mini-Audit: Maturitate Automatiz\u0103ri Marketing & V\u00E2nz\u0103ri', margin, y, 16, navy, contentWidth, 'bold');
  y += 4;
  addText(`Preg\u0103tit pentru ${prenume} \u2014 ${companie}`, margin, y, 10, textMuted);
  y += 5;
  
  const today = new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
  addText(`Data: ${today}`, margin, y, 9, textMuted);
  y += 12;

  // ══════════════════════════════════════
  // SECȚIUNEA 1: SCORUL
  // ══════════════════════════════════════
  
  // Fundal colorat pentru scor
  const scorColor = scor <= 5 ? red : scor <= 10 ? amber : green;
  const scorBgColor = scor <= 5 ? [252, 235, 235] : scor <= 10 ? amberBg : [225, 245, 238];
  
  doc.setFillColor(scorBgColor[0], scorBgColor[1], scorBgColor[2]);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');
  
  addText(`Scorul t\u0103u: ${scor} din 16`, margin + 10, y + 12, 18, scorColor, 'bold');
  addText(`Nivel: ${nivel}`, margin + 10, y + 22, 12, scorColor);
  
  // Bara de progres
  const barY = y + 26;
  const barWidth = contentWidth - 20;
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(margin + 10, barY - 6, barWidth, 4, 2, 2, 'F');
  
  const fillWidth = (scor / 16) * barWidth;
  doc.setFillColor(scorColor[0], scorColor[1], scorColor[2]);
  doc.roundedRect(margin + 10, barY - 6, fillWidth, 4, 2, 2, 'F');
  
  y += 38;

  // Descriere nivel
  const nivelDescriptions: Record<string, string> = {
    '\u00CEncep\u0103tor': 'Procesele tale de marketing \u0219i v\u00E2nz\u0103ri func\u021Bioneaz\u0103 predominant manual. Pierzi lead-uri \u0219i oportunit\u0103\u021Bi din cauza lipsei de structur\u0103 \u0219i automatizare. Vestea bun\u0103: poten\u021Bialul de \u00EEmbun\u0103t\u0103\u021Bire e enorm \u2014 chiar \u0219i c\u00E2teva automatiz\u0103ri de baz\u0103 pot schimba radical rata de conversie.',
    'Intermediar': 'Ai un CRM \u0219i c\u00E2teva procese \u00EEn loc, dar automatiz\u0103rile nu lucreaz\u0103 ca un sistem integrat. Sunt puncte de pierdere \u00EEntre etapele parcursului clientului \u2014 lead-uri care se r\u0103cesc, follow-up-uri care nu se fac, date fragmentate. Cu optimiz\u0103ri targetate, po\u021Bi cre\u0219te semnificativ rata de conversie.',
    'Avansat': 'Ai un sistem de automatizare func\u021Bional \u0219i integrat. Provocarea ta acum nu mai e implementarea de baz\u0103, ci optimizarea continu\u0103: A/B testing pe secven\u021Be, \u00EEmbun\u0103t\u0103\u021Birea segment\u0103rii, raportare avansat\u0103, \u0219i scalarea a ceea ce func\u021Bioneaz\u0103 deja.'
  };
  
  y = addWrappedText(nivelDescriptions[nivel] || '', margin, y, 10, textDark, contentWidth);
  y += 10;

  // ══════════════════════════════════════
  // SECȚIUNEA 2: ANALIZA PE CATEGORII
  // ══════════════════════════════════════
  y = checkPageBreak(y, 40);
  y = addWrappedText('Analiz\u0103 pe categorii', margin, y, 14, navy, contentWidth, 'bold');
  y += 6;

  const categories = [
    {
      name: 'Funda\u021Bie CRM & Timp de r\u0103spuns',
      indices: [0, 1],
      low: 'Ave\u021Bi oportunit\u0103\u021Bi semnificative de \u00EEmbun\u0103t\u0103\u021Bire \u00EEn configurarea CRM-ului \u0219i viteza de r\u0103spuns. Un CRM bine configurat \u0219i un timp de r\u0103spuns sub 2 ore pot cre\u0219te rata de conversie cu 15-25%.',
      high: 'Funda\u021Bia CRM \u0219i procesul de r\u0103spuns sunt la un nivel bun. Urm\u0103torul pas: automatizarea complet\u0103 a primului r\u0103spuns pentru sub 5 minute.'
    },
    {
      name: 'Nurturing & Follow-up',
      indices: [2, 3],
      low: 'Lead-urile care nu cump\u0103r\u0103 imediat sunt cel mai mare poten\u021Bial neexploatat. F\u0103r\u0103 secven\u021Be automate de nurturing, pierde\u021Bi \u00EEntre 30-50% din lead-urile care ar fi cump\u0103rat cu un follow-up structurat.',
      high: 'Ave\u021Bi secven\u021Be de nurturing active \u2014 excelent. Urm\u0103torul pas: segmentarea secven\u021Belor pe baza comportamentului lead-ului (ce deschide, ce clickuie\u0219te).'
    },
    {
      name: 'M\u0103surare & Raportare',
      indices: [4, 5],
      low: 'F\u0103r\u0103 vizibilitate pe rata de conversie \u0219i pe integrarea platformelor, optimizarea se face pe intui\u021Bie. Implementarea unui dashboard de monitorizare poate debloca decizii de marketing cu impact imediat.',
      high: 'M\u0103sura\u021Bi \u0219i ave\u021Bi platforme integrate \u2014 sunte\u021Bi \u00EEntr-o pozi\u021Bie excelent\u0103 pentru optimizare bazat\u0103 pe date.'
    },
    {
      name: 'Segmentare & Optimizare',
      indices: [6, 7],
      low: 'Segmentarea lead-urilor pe surse \u0219i optimizarea periodic\u0103 a automatiz\u0103rilor sunt ce diferen\u021Biaz\u0103 un sistem func\u021Bional de un sistem performant. Aici e cel mai mare poten\u021Bial de cre\u0219tere.',
      high: 'Segmentarea \u0219i optimizarea sunt la un nivel matur. Urm\u0103torul pas: A/B testing sistematic pe secven\u021Be \u0219i raportare avansat\u0103 pe ROI per canal.'
    }
  ];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const catScore = cat.indices.reduce((sum, idx) => sum + (raspunsuri[idx] || 0), 0);
    const maxCatScore = 4;
    
    y = checkPageBreak(y, 35);
    
    // Număr categorie + titlu
    doc.setFontSize(11);
    doc.setTextColor(amber[0], amber[1], amber[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`0${i + 1}`, margin, y);
    
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text(`${cat.name}`, margin + 10, y);
    
    // Scor categorie
    doc.setTextColor(blue[0], blue[1], blue[2]);
    doc.setFontSize(10);
    doc.text(`${catScore} / ${maxCatScore}`, pageWidth - margin - 15, y);
    
    y += 5;
    
    // Descriere
    const description = catScore < 3 ? cat.low : cat.high;
    y = addWrappedText(description, margin, y, 9, textMuted, contentWidth);
    y += 6;
  }

  // ══════════════════════════════════════
  // SECȚIUNEA 3: RECOMANDĂRI
  // ══════════════════════════════════════
  y = checkPageBreak(y, 50);
  y += 4;
  y = addWrappedText('Recomand\u0103ri concrete \u2014 urm\u0103torii pa\u0219i', margin, y, 14, navy, contentWidth, 'bold');
  y += 6;

  const recommendations: Record<string, string[]> = {
    '\u00CEncep\u0103tor': [
      'Configureaz\u0103 corect CRM-ul: pipeline de v\u00E2nz\u0103ri, c\u00E2mpuri custom pentru tipul de lead, sursa \u0219i stadiul.',
      'Implementeaz\u0103 un email automat de r\u0103spuns la fiecare lead nou \u2014 sub 5 minute de la completarea formularului.',
      'Creeaz\u0103 o secven\u021B\u0103 de 3-5 emailuri de nurturing pentru lead-urile care nu cump\u0103r\u0103 imediat.'
    ],
    'Intermediar': [
      'Conecteaz\u0103 toate platformele (CRM, email, formulare, ads) \u00EEntr-un sistem integrat \u2014 n8n sau Zapier.',
      'Implementeaz\u0103 follow-up automat pe ofertele trimise: la 48h, la 7 zile, la 14 zile.',
      'Creeaz\u0103 un dashboard lunar cu KPI-uri: rata de conversie per etap\u0103, cost per lead, timp mediu de conversie.'
    ],
    'Avansat': [
      'Implementeaz\u0103 A/B testing pe subiectele emailurilor \u0219i pe secven\u021Bele de nurturing.',
      'Creeaz\u0103 raportare avansat\u0103 pe ROI per canal de achizi\u021Bie.',
      'Automatizeaz\u0103 segmentarea dinamic\u0103 pe baza comportamentului (lead scoring).'
    ]
  };

  const recs = recommendations[nivel] || recommendations['Intermediar'];
  for (let i = 0; i < recs.length; i++) {
    y = checkPageBreak(y, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(amber[0], amber[1], amber[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`${i + 1}.`, margin, y);
    
    y = addWrappedText(recs[i], margin + 8, y, 10, textDark, contentWidth - 8);
    y += 4;
  }

  // ══════════════════════════════════════
  // SECȚIUNEA 4: CTA
  // ══════════════════════════════════════
  y = checkPageBreak(y, 40);
  y += 6;
  
  // Box CTA
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
  
  y += 10;
  addText('Vrei s\u0103 discut\u0103m cum ar ar\u0103ta un plan personalizat?', margin + 10, y, 12, navy, 'bold');
  y += 8;
  addText('Programeaz\u0103 o consulta\u021Bie gratuit\u0103 de 30 de minute:', margin + 10, y, 10, textMuted);
  y += 6;
  doc.setTextColor(blue[0], blue[1], blue[2]);
  doc.textWithLink('https://anadobre.com/servicii#formular', margin + 10, y, { url: 'https://anadobre.com/servicii#formular' });
  y += 6;
  addText('Email: hello@anadobre.com', margin + 10, y, 10, textMuted);

  // ══════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════
  const footerY = 285;
  doc.setDrawColor(214, 230, 245);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  addText('\u00A9 2026 Ana Dobre  |  anadobre.com  |  Automatiz\u0103ri Marketing & V\u00E2nz\u0103ri', margin, footerY, 8, textMuted);

  // Generează base64
  const pdfOutput = doc.output('datauristring');
  // Extrage doar partea de base64 (fără prefixul data:application/pdf;base64,)
  const base64 = pdfOutput.split(',')[1];
  
  return base64;
}
```

## PAS 4: Integrare ActiveCampaign

Creează fișierul `src/lib/activecampaign.ts`:

```typescript
interface ACContactData {
  prenume: string;
  email: string;
  companie: string;
  scor: number;
  nivel: string;
}

// CREDENȚIALE — se iau din environment variables
// AC_API_URL = https://anabucuroiu.api-us1.com
// AC_API_KEY = [cheia ta API]

export async function createACContact(data: ACContactData) {
  const AC_API_URL = import.meta.env.AC_API_URL || process.env.AC_API_URL;
  const AC_API_KEY = import.meta.env.AC_API_KEY || process.env.AC_API_KEY;

  if (!AC_API_URL || !AC_API_KEY) {
    console.error('AC credentials missing');
    throw new Error('ActiveCampaign credentials not configured');
  }

  const headers = {
    'Api-Token': AC_API_KEY,
    'Content-Type': 'application/json',
  };

  // ── 1. Creează sau actualizează contactul ──
  const contactPayload = {
    contact: {
      email: data.email,
      firstName: data.prenume,
    }
  };

  const contactRes = await fetch(`${AC_API_URL}/api/3/contact/sync`, {
    method: 'POST',
    headers,
    body: JSON.stringify(contactPayload),
  });

  const contactJson = await contactRes.json();
  const contactId = contactJson.contact?.id;

  if (!contactId) {
    throw new Error('Failed to create/sync AC contact');
  }

  // ── 2. Setează câmpurile custom ──
  // IDs din contul tău ActiveCampaign:
  // Scor Mini-Audit = field 22
  // Nivel Mini-Audit = field 23 (dropdown: Începător/Intermediar/Avansat)
  // Companie = field 15
  // Sursa Lead = field 24

  const fieldValues = [
    { field: '22', value: String(data.scor) },          // Scor Mini-Audit
    { field: '23', value: data.nivel },                   // Nivel Mini-Audit
    { field: '15', value: data.companie },                // Companie
    { field: '24', value: 'mini-audit' },                 // Sursa Lead
  ];

  for (const fv of fieldValues) {
    await fetch(`${AC_API_URL}/api/3/fieldValues`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fieldValue: {
          contact: contactId,
          field: fv.field,
          value: fv.value,
        }
      }),
    });
  }

  // ── 3. Adaugă la lista "Website Leads" (ID: 4) ──
  await fetch(`${AC_API_URL}/api/3/contactLists`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      contactList: {
        list: '4',           // Website Leads
        contact: contactId,
        status: '1',         // 1 = subscribed
      }
    }),
  });

  // ── 4. Aplică tag-uri ──
  // Mai întâi, creează tag-urile dacă nu există, sau caută ID-urile lor
  const tagNames = ['mini-audit'];
  
  // Adaugă tag-ul de nivel
  if (data.nivel === '\u00CEncep\u0103tor') {
    tagNames.push('audit-beginner');
  } else if (data.nivel === 'Intermediar') {
    tagNames.push('audit-intermediate');
  } else if (data.nivel === 'Avansat') {
    tagNames.push('audit-advanced');
  }

  for (const tagName of tagNames) {
    // Caută tag-ul existent
    const searchRes = await fetch(
      `${AC_API_URL}/api/3/tags?search=${encodeURIComponent(tagName)}`,
      { headers }
    );
    const searchJson = await searchRes.json();
    
    let tagId: string;
    
    if (searchJson.tags && searchJson.tags.length > 0) {
      tagId = searchJson.tags[0].id;
    } else {
      // Creează tag-ul dacă nu există
      const createTagRes = await fetch(`${AC_API_URL}/api/3/tags`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tag: {
            tag: tagName,
            tagType: 'contact',
          }
        }),
      });
      const createTagJson = await createTagRes.json();
      tagId = createTagJson.tag?.id;
    }

    if (tagId) {
      // Aplică tag-ul pe contact
      await fetch(`${AC_API_URL}/api/3/contactTags`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contactTag: {
            contact: contactId,
            tag: tagId,
          }
        }),
      });
    }
  }

  return contactId;
}
```

## PAS 5: Trimitere email cu PDF via Resend

Instalează:
```bash
npm install resend
```

Creează fișierul `src/lib/send-email.ts`:

```typescript
interface EmailData {
  prenume: string;
  email: string;
  companie: string;
  scor: number;
  nivel: string;
  pdfBase64: string;
}

export async function sendEmailWithPDF(data: EmailData) {
  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

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
        <p style="font-size: 11px; color: #8E99A4; line-height: 1.6;">Primești acest email pentru c\u0103 ai completat mini-auditul pe anadobre.com. Dac\u0103 ai \u00EEntreb\u0103ri, r\u0103spunde direct la acest email sau scrie-mi la hello@anadobre.com.</p>
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
```

## PAS 6: Asamblarea endpoint-ului complet

Actualizează `src/pages/api/mini-audit-submit.ts` să importe funcțiile:

```typescript
export const prerender = false;

import type { APIRoute } from 'astro';
import { generatePDF } from '../../lib/generate-pdf';
import { createACContact } from '../../lib/activecampaign';
import { sendEmailWithPDF } from '../../lib/send-email';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { prenume, email, companie, scor, nivel, raspunsuri } = body;

    // Validare
    if (!prenume || !email || !companie || scor === undefined || !nivel || !raspunsuri) {
      return new Response(JSON.stringify({ error: 'C\u00e2mpuri lips\u0103' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validare email simpla
    if (!email.includes('@') || !email.includes('.')) {
      return new Response(JSON.stringify({ error: 'Email invalid' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Generează PDF
    const pdfBase64 = await generatePDF({ prenume, email, companie, scor, nivel, raspunsuri });

    // 2. Creează contact în ActiveCampaign (non-blocking — nu oprim flow-ul dacă AC dă eroare)
    try {
      await createACContact({ prenume, email, companie, scor, nivel });
    } catch (acError) {
      console.error('AC integration error (non-fatal):', acError);
      // Continuăm — mai important e ca lead-ul să primească PDF-ul
    }

    // 3. Trimite email cu PDF
    await sendEmailWithPDF({ prenume, email, companie, scor, nivel, pdfBase64 });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Mini-audit submit error:', error);
    return new Response(
      JSON.stringify({ error: 'A ap\u0103rut o eroare. Te rog \u00eencearc\u0103 din nou.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

## PAS 7: Conectare frontend

Pe pagina `/mini-audit`, formularul de la final (care apare după afișarea scorului) trebuie să facă la submit:

```javascript
// La click pe butonul "Trimite-mi raportul":
const submitBtn = document.getElementById('audit-submit-btn');
const formMessage = document.getElementById('audit-form-message');

submitBtn.addEventListener('click', async () => {
  const prenume = document.getElementById('audit-prenume').value.trim();
  const email = document.getElementById('audit-email').value.trim();
  const companie = document.getElementById('audit-companie').value.trim();

  // Validare client-side
  if (!prenume || !email || !companie) {
    formMessage.textContent = 'Te rog completează toate câmpurile.';
    formMessage.style.color = '#DC3535';
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Se trimite raportul...';
  formMessage.textContent = '';

  try {
    const response = await fetch('/api/mini-audit-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prenume,
        email,
        companie,
        scor: window.auditScor,        // scorul calculat de quiz
        nivel: window.auditNivel,       // "Începător" / "Intermediar" / "Avansat"
        raspunsuri: window.auditRaspunsuri  // array [1, 0, 2, 1, ...]
      }),
    });

    const data = await response.json();

    if (data.success) {
      formMessage.innerHTML = '\u2713 Raportul a fost trimis pe <strong>' + email + '</strong>. Verific\u0103 inbox-ul (\u0219i folderul spam).';
      formMessage.style.color = '#1D9E75';
      submitBtn.textContent = 'Raport trimis \u2713';
      // Nu re-activăm butonul — prevenim trimiteri multiple
    } else {
      throw new Error(data.error || 'Eroare');
    }
  } catch (err) {
    formMessage.textContent = 'Ceva nu a mers. \u00CEncearc\u0103 din nou sau scrie-mi la hello@anadobre.com';
    formMessage.style.color = '#DC3535';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Trimite-mi raportul \u2192';
  }
});
```

IMPORTANT: Quiz-ul trebuie să salveze scorul, nivelul și răspunsurile în variabile globale accesibile formularului:
```javascript
// La finalul calculului de scor din quiz, adaugă:
window.auditScor = totalScore;        // număr: 0-16
window.auditNivel = nivelText;        // string: "Începător" / "Intermediar" / "Avansat"
window.auditRaspunsuri = answers;     // array: [1, 0, 2, 1, 2, 0, 1, 1]
```

## PAS 8: Environment Variables

### Local development (.env în rădăcina proiectului):
```
AC_API_URL=https://anabucuroiu.api-us1.com
AC_API_KEY=[API_KEY_DE_LA_ANA]
RESEND_API_KEY=[API_KEY_DE_LA_RESEND]
```

Adaugă `.env` în `.gitignore`!

### Cloudflare Pages (la deploy):
Settings → Environment Variables → adaugă cele 3 variabile pentru Production AND Preview.

## PAS 9: Setup Resend (manual, face Ana)

1. Creează cont gratuit pe https://resend.com
2. Verifică domeniul anadobre.com (adaugă records DNS conform instrucțiunilor Resend)
3. Generează API Key
4. Adaugă RESEND_API_KEY în .env local și în Cloudflare Pages env vars

NOTĂ: Până nu e verificat domeniul, Resend poate trimite doar de la onboarding@resend.dev. 
Pentru testare locală, schimbă temporar "from" în send-email.ts la "onboarding@resend.dev".

## TESTARE

1. Rulează `npm run dev`
2. Parcurge quiz-ul pe /mini-audit
3. La final, completează formularul cu emailul tău
4. Verifică:
   - Ai primit emailul cu PDF atașat?
   - PDF-ul arată corect (scor, nivel, categorii, recomandări)?
   - În ActiveCampaign: s-a creat contactul cu câmpurile custom completate?
   - Tag-urile mini-audit + audit-[nivel] sunt aplicate?
   - Contactul e în lista "Website Leads"?

## ERORI POSIBILE

- "AC credentials missing" → verifică .env
- "Resend API error: 403" → domeniul nu e verificat, sau API key e greșit
- "Failed to create/sync AC contact" → verifică AC_API_URL (trebuie fără / la final)
- PDF-ul nu se generează → jspdf poate avea probleme cu unele fonturi; în caz de eroare, simplifică textul din PDF (elimină diacritice dacă e necesar)
- Quiz-ul nu trimite scorul → verifică că window.auditScor etc. sunt setate ÎNAINTE de submit
