export const prerender = false;
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const cfEnv = (locals as any).runtime?.env ?? {};
    const ANTHROPIC_API_KEY = cfEnv.ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'Anthropic API key not configured' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    const { raspunsuri, scor, nivel } = await request.json();
    // raspunsuri is array of 8 numbers (0/1/2)

    const questionContext = [
      { q: 'CRM', r: raspunsuri[0], opts: ['Nu folosesc CRM', 'Am CRM dar neconfigurate complet', 'CRM configurat și actualizat constant'] },
      { q: 'Timp răspuns lead', r: raspunsuri[1], opts: ['Peste 24h / nu știu', 'Între 2-24h', 'Sub 2 ore, proces clar'] },
      { q: 'Secvențe email automate', r: raspunsuri[2], opts: ['Emailuri manuale', 'Doar email bun venit', 'Secvențe nurturing active și segmentate'] },
      { q: 'Lead-uri care nu cumpără imediat', r: raspunsuri[3], opts: ['Niciun proces', 'Contact ocazional, fără structură', 'Automatizări follow-up și nurturing'] },
      { q: 'Măsurare conversie lead→client', r: raspunsuri[4], opts: ['Nu măsurăm', 'Estimăm aproximativ', 'Monitorizat în CRM, raportat lunar'] },
      { q: 'Integrare platforme (CRM, email, formulare, ads)', r: raspunsuri[5], opts: ['Fiecare separat', 'Unele conectate', 'Sistem integrat, date circulă automat'] },
      { q: 'Gestionare lead-uri pe surse diferite', r: raspunsuri[6], opts: ['Toate la un loc, fără diferențiere', 'Separate dar fără fluxuri diferite', 'Automatizări diferențiate pe surse, taguri, segmentare'] },
      { q: 'Revizuire și optimizare automatizări', r: raspunsuri[7], opts: ['Niciodată', 'Ocazional, când apare o problemă', 'Lunar, pe baza datelor'] },
    ];

    const answersText = questionContext.map((item, i) =>
      `${i + 1}. ${item.q}: "${item.opts[item.r]}" (scor: ${item.r}/2)`
    ).join('\n');

    const prompt = `Ești un consultant senior în automatizări de marketing și vânzări. Analizează rezultatele acestui mini-audit completat de un antreprenor român și generează o analiză structurată.

RĂSPUNSURI AUDIT (scor total: ${scor}/16, nivel: ${nivel}):
${answersText}

INSTRUCȚIUNI STRICTE:
- Bazează-te EXCLUSIV pe răspunsurile de mai sus și pe best practices reale din industrie
- Nu inventa statistici sau numere specifice dacă nu sunt consacrate (ex: "studii arată că X%")
- Fii concret și specific la răspunsurile date, nu generic
- Limbă: română, ton profesional dar direct
- Recomandările trebuie să fie acționabile, nu vagi

Răspunde EXCLUSIV în format JSON valid, fără text în afara JSON-ului:
{
  "puncteFortă": ["string", "string"],
  "zoneCritice": ["string", "string"],
  "recomandări": [
    {
      "titlu": "string (max 60 chars)",
      "descriere": "string (2-3 propoziții concrete, bazate pe răspunsul specific al utilizatorului)",
      "prioritate": "Înaltă|Medie|Scăzută"
    }
  ],
  "concluzie": "string (3-4 propoziții, personalizat pe scorul și răspunsurile specifice)"
}

Generează exact 2 puncte forte, 2 zone critice, și 3 recomandări prioritizate descrescător.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Claude API error: ${response.status} ${err}`);
    }

    const claudeResponse = await response.json() as { content: { type: string; text: string }[] };
    const text = claudeResponse.content[0]?.text ?? '';

    // Parse JSON from Claude's response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid Claude response format');
    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ success: true, analysis }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('get-analysis error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
