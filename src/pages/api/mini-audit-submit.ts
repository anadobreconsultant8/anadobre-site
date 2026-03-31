export const prerender = false;
import type { APIRoute } from 'astro';
import { createACContact } from '../../lib/activecampaign';
import { sendReport } from '../../lib/send-email';

const SYSTEM_PROMPT = `Ești un consultant senior cu peste 12 ani de experiență în automatizări de marketing și vânzări consultative pentru business-uri B2B din România. Profilul tău de expertiză:

SEGMENTUL DE PIAȚĂ PE CARE ÎL DESERVEȘTI:
- Companii cu cifră de afaceri între 500.000 EUR și 5 milioane EUR
- Ciclu de vânzare consultativ: 2-12 săptămâni, deal-uri între 2.000-50.000 EUR
- Minim 50 lead-uri calificate pe lună
- Echipe de vânzări de 2-10 persoane, procese mixte (online + consultare directă)
- Industrii tipice: servicii profesionale (consultanță, IT, HR, juridic), producție B2B, distribuție, real estate comercial

STACKS TEHNOLOGICE PE CARE LE CUNOȘTI DIN PIAȚA ROMÂNEASCĂ:
- CRM: HubSpot (Free/Starter/Pro), Pipedrive, Zoho CRM, Salesforce Essentials, Bitrix24
- Email automation: ActiveCampaign, Mailchimp, Brevo (Sendinblue)
- Automatizări: n8n (self-hosted), Make (Integromat), Zapier
- Formulare/landing: Tally, Typeform, HubSpot Forms
- Facturare/ERP: SmartBill, Facturis, SAP B1
- Ads: Google Ads, Meta Ads, LinkedIn Ads

PRINCIPII DE ANALIZĂ:
1. Bazează-te STRICT pe răspunsurile date — nu presupune ce nu știi
2. Referă-te la situația concretă descrisă, nu la scenarii generice
3. Prioritizează recomandările după impact/efort pentru acest segment de piață
4. Poți cita benchmark-uri consacrate (ex: InsideSales research despre timp de răspuns, HubSpot State of Marketing) dar nu inventa statistici
5. Recomandările trebuie să fie implementabile cu resurse limitate
6. Răspunde exclusiv în limba română, ton profesional și direct

Răspunde EXCLUSIV cu un obiect JSON valid, fără text în afara JSON-ului, fără markdown, fără \`\`\`json. Doar JSON pur.`;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const cfEnv = (locals as any).runtime?.env ?? {};
    const RESEND_API_KEY    = cfEnv.RESEND_API_KEY    || import.meta.env.RESEND_API_KEY;
    const AC_API_URL        = cfEnv.AC_API_URL        || import.meta.env.AC_API_URL;
    const AC_API_KEY        = cfEnv.AC_API_KEY        || import.meta.env.AC_API_KEY;
    const ANTHROPIC_API_KEY = cfEnv.ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY;

    console.log('[mini-audit] env check — RESEND:', !!RESEND_API_KEY, '| ANTHROPIC:', !!ANTHROPIC_API_KEY, '| runtime keys:', Object.keys(cfEnv));

    if (!RESEND_API_KEY)    throw new Error('Resend API key not configured');
    if (!ANTHROPIC_API_KEY) throw new Error('Anthropic API key not configured');

    const { prenume, email, companie, scor, nivel, raspunsuri, marketing } = await request.json();

    if (!prenume || !email || scor === undefined || !nivel || !raspunsuri) {
      return new Response(JSON.stringify({ error: 'Câmpuri lipsă' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // ── 1. Generează analiza cu Claude ──────────────
    const questionContext = [
      { q: 'CRM și gestionarea lead-urilor', r: raspunsuri[0], opts: ['Nu folosesc niciun CRM — lead-urile sunt gestionate în Excel, email sau memorie', 'Am un CRM instalat, dar nu este configurat complet — pipeline incomplet, câmpuri nefolosite, date neactualizate', 'CRM configurat corect cu pipeline de vânzări, câmpuri custom și date actualizate constant'] },
      { q: 'Timp de răspuns la lead-uri noi', r: raspunsuri[1], opts: ['Peste 24 de ore sau nu știm exact — nu există un proces definit', 'Între 2 și 24 de ore — există intenția de a răspunde rapid, dar fără automatizare', 'Sub 2 ore, cu un proces clar — de preferință automatizat sau cu SLA intern respectat'] },
      { q: 'Secvențe automate de email pentru lead-uri noi', r: raspunsuri[2], opts: ['Nu avem — fiecare email se trimite manual, de la caz la caz', 'Avem un singur email automat de bun venit, dar nu există o secvență de nurturing', 'Avem secvențe complete de nurturing, active și segmentate pe tipuri de lead sau industrie'] },
      { q: 'Ce se întâmplă cu lead-urile care nu cumpără imediat', r: raspunsuri[3], opts: ['Nu avem niciun proces — rămân în baza de date și poate îi contactăm cândva', 'Îi contactăm ocazional, fără o secvență structurată sau cadență definită', 'Avem automatizări de follow-up pe termen mediu și lung — secvențe de nurturing cu durată de 30-90 zile'] },
      { q: 'Măsurarea ratei de conversie lead → client', r: raspunsuri[4], opts: ['Nu o măsurăm — nu știm câți lead-uri devin clienți', 'O estimăm aproximativ, fără date exacte din sistem', 'O monitorizăm precis în CRM și raportăm lunar — știm rata per etapă și per canal'] },
      { q: 'Gradul de integrare între platforme (CRM, email, formulare, ads)', r: raspunsuri[5], opts: ['Fiecare platformă funcționează separat — transferul datelor este manual', 'Unele platforme sunt conectate, dar nu toate — există discontinuități în flux', 'Avem un sistem complet integrat — lead-urile din ads și formulare ajung automat în CRM și declanșează secvențe de email'] },
      { q: 'Gestionarea lead-urilor din surse diferite (ads, organic, referral)', r: raspunsuri[6], opts: ['Toate lead-urile ajung în același loc, fără diferențiere pe sursă', 'Le separăm în sistem, dar nu avem fluxuri de comunicare diferite pe surse', 'Avem automatizări diferențiate per sursă — tag-uri, segmentare, secvențe adaptate contextului de intrare'] },
      { q: 'Frecvența de revizuire și optimizare a automatizărilor', r: raspunsuri[7], opts: ['Nu le-am mai atins de când au fost setate — funcționează (sau nu) singure', 'Le ajustăm ocazional, când apare o problemă vizibilă', 'Le analizăm și optimizăm lunar pe baza datelor — rate de deschidere, conversie, drop-off'] },
    ];

    const answersText = questionContext.map((item, i) =>
      `Q${i + 1} — ${item.q}:\nRăspuns ales: "${item.opts[item.r]}" (${item.r}/2 puncte)`
    ).join('\n\n');

    const userPrompt = `Analizează acest audit de maturitate în automatizări completat de un antreprenor/manager dintr-un business B2B românesc.

SCOR TOTAL: ${scor}/16 puncte — Nivel: ${nivel}

RĂSPUNSURI DETALIATE:
${answersText}

Generează o analiză profesionistă și personalizată. Fiecare element trebuie să fie specific situației descrise, nu generic.

Structura JSON cerută (DOAR JSON, fără alt text):
{
  "puncteFortă": [
    "Descriere concretă a unui punct forte, referind direct răspunsul dat (1-2 propoziții)",
    "Al doilea punct forte, la fel de specific"
  ],
  "zoneCritice": [
    "Descriere concretă a celei mai mari probleme identificate, cu impact specific pe business (1-2 propoziții)",
    "A doua zonă critică, cu impact clar menționat"
  ],
  "recomandări": [
    {
      "titlu": "Titlu acțional, max 60 caractere",
      "descriere": "3-4 propoziții: ce anume să facă concret, de ce contează pentru situația lor specifică, ce impact să aștepte. Menționează tool-uri relevante dacă e cazul (HubSpot, ActiveCampaign, n8n, etc.). Bazează-te pe best practices documentate.",
      "prioritate": "Înaltă"
    },
    {
      "titlu": "...",
      "descriere": "...",
      "prioritate": "Medie"
    },
    {
      "titlu": "...",
      "descriere": "...",
      "prioritate": "Medie"
    }
  ],
  "concluzie": "4-5 propoziții care sintetizează situația actuală, cel mai mare risc de business dacă nu se acționează, și perspectiva realistă după implementarea recomandărilor. Ton direct și motivant."
}`;

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userPrompt },
          { role: 'assistant', content: '{' },
        ],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      throw new Error(`Claude API error: ${claudeRes.status} ${err}`);
    }

    const claudeData = await claudeRes.json() as { content: { type: string; text: string }[] };
    const rawText = '{' + (claudeData.content[0]?.text ?? '');
    let analysis;
    try {
      analysis = JSON.parse(rawText);
    } catch {
      // Fallback: extract largest JSON object
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Format răspuns Claude invalid');
      analysis = JSON.parse(jsonMatch[0]);
    }

    // ── 2. Trimite emailul cu analiza ───────────────
    await sendReport({ prenume, email, companie, scor, nivel, analysis, apiKey: RESEND_API_KEY });

    // ── 3. Sync ActiveCampaign (non-blocking) ───────
    if (AC_API_URL && AC_API_KEY) {
      createACContact({ prenume, email, companie, scor, nivel, marketing, apiUrl: AC_API_URL, apiKey: AC_API_KEY })
        .catch((e: unknown) => console.error('AC sync error (non-fatal):', e));
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('mini-audit-submit error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
