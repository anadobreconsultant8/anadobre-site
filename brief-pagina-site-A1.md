# Brief construcție pagină site — Termen ABC A1

> Handoff pentru Claude Code. Scop: pagină canonică pe site pentru primul termen din seria ABC, optimizată SEO + GEO (să fie citată de ChatGPT/Perplexity/Google AI).
> Textul final la nivel de fraze se scrie în vocea Anei (skill `/voce-ana`) — acest brief e specificația de structură + conținut.

---

## 1. Identificare

- **Termen:** Ce înseamnă, de fapt, automatizările de marketing și vânzări?
- **Slug / URL:** `anadobre.com/abc/automatizari-marketing-vanzari`
- **Secțiune site:** ABC / Glosar (creează hub-ul `/abc` dacă nu există, cu listă de termeni)
- **Cluster SEO:** Cluster 1 — Automatizări de marketing & vânzări
- **Cuvânt-cheie principal:** automatizări de marketing și vânzări
- **Cuvinte secundare:** ce sunt automatizările de marketing, marketing automation România, fluxuri de automatizare

---

## 2. SEO / meta

- **Title tag (~60 caractere):** Ce sunt automatizările de marketing și vânzări? | Ana Dobre
- **Meta description (~155 caractere):** Ce înseamnă automatizările de marketing și vânzări, cum funcționează și la ce te ajută concret în business. Explicat pe înțelesul unui antreprenor.
- **Canonical:** self
- **OG image:** cardul 1 din caruselul ABC (reutilizează designul)

---

## 3. Structură pagină (șablon GEO — respectă ordinea)

**H1:** Ce înseamnă, de fapt, automatizările de marketing și vânzări?

**Paragraf de răspuns direct (primele 2-3 fraze — critic pentru AI):**
> Răspuns concis și complet la întrebare, imediat sub H1. Definește termenul într-o frază + „la ce folosește”. (AI-ul extrage acest paragraf.)

**H2 — Ce sunt, mai exact (definiția extinsă)**
> Definiție simplă, fără jargon. Analogia „dacă se întâmplă X, sistemul face Y”.

**H2 — Cum funcționează un flux de automatizare**
> Cele 3 piese: declanșator → condiție → acțiune. Un exemplu concret (lead din ads → CRM → email → alocare agent).

**H2 — La ce te ajută în marketing și vânzări** *(obligatoriu — perspectiva de business)*
> Beneficii concrete: timp, resurse, lead-uri care nu se pierd, răspuns rapid, comunicare constantă.

**H2 — Ce poți automatiza (exemple pe scurt)**
> Listă scurtă: lead management, follow-up, remindere, nurturing, raportare. (Link intern către termenii ABC respectivi când există.)

**H2 — De unde începi**
> Pași minimi + invitație la audit/discuție.

**H2 — Întrebări frecvente (FAQ)**
> 3-4 întrebări din cluster (vezi mai jos) — alimentează schema FAQ.

---

## 4. Întrebări FAQ (pentru schema + GEO)

- Ce sunt automatizările de marketing și vânzări?
- Cum îți automatizezi vânzările?
- Ce poți automatiza în marketing?
- De unde începi cu automatizările?

---

## 5. Date structurate (schema.org)

- `Article` (headline, author: Ana Dobre, datePublished, image)
- `FAQPage` cu întrebările de la punctul 4 (răspunsuri scurte, 1-2 fraze)
- `BreadcrumbList`: Acasă › ABC › [termen]

---

## 6. Linkuri interne & CTA

- **Linkuri interne:** către hub-ul `/abc`, către alți termeni relevanți (când există), către pagina Servicii.
- **CTA final:** „Vrei să afli mai multe despre automatizările de marketing și vânzări - exemple concrete, inclusiv pe industrii, ce presupune un plan de automatizări și cum poți începe acest demers în business-ul tău? Programează o discuție.” → buton către `/servicii#formular` sau `/mini-audit`.

---

## 7. Design / brand (match anadobre.com)

- Culori: bleumarin `#0F1C38`, coral `#D26A4C`, cornflower `#5E8EEA`, bleu-gri `#8AA0B8`, fundal deschis `#F3F5FA`.
- Fonturi: titluri Playfair Display; text Poppins.
- Elemente: motiv „constelație” subtil (ca pe hero), etichete cu liniuță coral, accente coral cu parcimonie.
- Lizibilitate: măsură de text îngustă, spațiu alb generos, H2 clare pe întrebări.

---

## 8. Pași

1. Construiește pagina în Claude Code pe structura de mai sus.
2. Scrie textul final la nivel de fraze **în vocea Anei** (`/voce-ana`).
3. Publică → ia URL-ul real.
4. Actualizează `href`-ul din caruselul PDF (`carusel-abc-demo.html`) cu URL-ul real.
5. Publică caruselul pe LinkedIn (marți).
