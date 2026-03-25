# BRIEF COMPLET: Rebuild site anadobre.com

## CONTEXT

Acest document conține toate specificațiile necesare pentru a construi site-ul anadobre.com de la zero. Site-ul este pentru Ana Dobre, consultant în automatizări de marketing și vânzări din România, cu 14+ ani de experiență. Clientul ideal: companii B2B sau B2C cu vânzare consultativă, cifra de afaceri 500K–5M EUR, care generează 50+ lead-uri lunar și folosesc deja un CRM.

Site-ul trebuie să fie profesionist, curat, și orientat pe conversie — nu flashy, nu corporate-generic, ci "expert de încredere".

---

## STACK TEHNIC

- **Framework**: Astro (Static Site Generator) — cel mai potrivit pentru un site de consultant: rapid, SEO-friendly, ușor de deploy și menținut
- **Styling**: Tailwind CSS
- **Interactivitate**: JavaScript vanilla pentru mini-audit și formulare (fără framework JS suplimentar)
- **Formulare**: Trimise via API către ActiveCampaign (endpoint-ul se configurează ulterior; pentru acum, formularul face POST către un endpoint placeholder `/api/form-submit` și afișează un mesaj de confirmare)
- **Fonturi**: Google Fonts — un font distinctiv dar profesional pentru titluri (recomandare: **DM Serif Display** sau **Playfair Display**) și un font curat pentru body (**DM Sans** sau **Source Sans 3**). NU folosi Inter, Roboto, Arial, sau system fonts.
- **Deploy**: Pregătit pentru Cloudflare Pages sau Netlify (Astro suportă ambele nativ)
- **Imagini**: Placeholder-e cu dimensiuni corecte + comentarii `<!-- REPLACE: description of needed photo -->`. Folosește placeholder-uri vizuale (colored divs cu text descriptiv), nu URL-uri externe.

---

## DESIGN SYSTEM

### Direcție estetică
**Refined Professional** — clean, spațios, cu accente de culoare subtile. Gândește-te la un site de consultanță McKinsey combinat cu călduia unui brand personal. Nu e corporate-rece, nu e freelancer-casual. E "expertul care știe ce face și te face să te simți în siguranță".

### Paletă de culori
```
--color-primary: #1B3A4B        (bleumarin închis — încredere, autoritate)
--color-primary-light: #2D6A8A  (bleumarin mediu — pentru hover, accente)
--color-accent: #E8593C         (coral/roșu cald — CTA-uri, accente de energie)
--color-accent-hover: #D04A2E   (coral închis — hover pe CTA)
--color-bg-primary: #FFFFFF     (fundal principal)
--color-bg-secondary: #F7F8FA   (fundal secțiuni alternate)
--color-bg-tertiary: #EEF2F5    (fundal carduri, highlight-uri)
--color-text-primary: #1A1A2E   (text principal — aproape negru, nu negru pur)
--color-text-secondary: #5A6474  (text secundar, descrieri)
--color-text-tertiary: #8E99A4   (text meta, date, labels)
--color-border: #E2E8F0         (borduri subtile)
--color-success: #1D9E75        (verde — pentru scoruri pozitive în mini-audit)
--color-warning: #BA7517        (amber — scoruri medii)
```

### Spațiere
- Secțiunile mari: `py-24` (96px) pe desktop, `py-16` (64px) pe mobil
- Între elemente în secțiune: `gap-8` până la `gap-12`
- Container max-width: `max-w-6xl` (1152px) centrat, cu `px-6` padding lateral
- Hero mai larg: `max-w-4xl` pentru text, centrat

### Tipografie
- H1 (hero): font display, 48–56px desktop, 32–36px mobil, font-weight 700
- H2 (titluri secțiuni): font display, 36–40px desktop, 28px mobil, font-weight 600
- H3 (subtitluri): font sans, 22–24px, font-weight 600
- Body: font sans, 17–18px, line-height 1.7, color text-primary
- Small/meta: 14–15px, color text-secondary

### Componente recurente
- **CTA principal**: background accent (#E8593C), text alb, rounded-lg (8px), padding `px-8 py-4`, font-weight 600, font-size 16px, hover: accent-hover + slight translateY(-1px) + shadow
- **CTA secundar**: border 2px primary, text primary, rounded-lg, hover: fill primary + text white
- **Carduri**: bg white, border 1px border-color, rounded-xl (12px), padding 32px, hover: subtle shadow-lg transition
- **Badge/pill**: inline, bg-tertiary, text-secondary, rounded-full, px-3 py-1, font-size 13px, uppercase tracking-wide

### Layout general
- Navbar: sticky, bg alb cu border-bottom subtil, logo stânga, meniu dreapta, CTA "Programează o discuție" vizibil în navbar pe desktop
- Footer: simplu, o singură secțiune: email de contact, link-uri social media (LinkedIn prominent), linkuri legal, copyright
- Toate paginile au secțiuni alternate alb / bg-secondary pentru ritm vizual
- Responsive: mobile-first, breakpoints standard Tailwind

---

## STRUCTURA SITE-ULUI

### Meniu de navigare (navbar)
```
Logo (stânga)    |    Servicii    Despre    Resurse    Blog    Contact    [Programează o discuție] (buton CTA)
```

NU include: coș de cumpărături, login, search. Asta e un site de consultant, nu un e-commerce.

### Pagini
1. **Acasă** (homepage) — `/`
2. **Servicii** — `/servicii`
3. **Despre** — `/despre`
4. **Resurse** — `/resurse`
5. **Mini-audit** — `/mini-audit`
6. **Blog** — `/blog` (listing) + `/blog/[slug]` (articol individual)
7. **Contact** — `/contact`

---

## PAGINA 1: HOMEPAGE (`/`)

### Secțiunea 1 — HERO (above the fold)

Fundal: alb. Layout: text centrat, max-width 800px.

```
[Badge pill] Automatizări marketing & vânzări

[H1] Sistemul tău de marketing generează lead-uri.
Dar câte devin clienți?

[Paragraf subtitlu]
Construiesc și optimizez sisteme automatizate de marketing și vânzări
pentru companii care au CRM, generează 50+ lead-uri lunar,
și vor ca procesele lor să producă mai mulți clienți din același efort.

[CTA primar - buton accent]     [CTA secundar - buton outline]
Evaluează-ți sistemul →          Programează o discuție
(link: /mini-audit)              (link: /servicii#formular)
```

Sub CTA-uri, opțional: un rând de logo-uri mici ale tool-urilor cu care lucrezi (ActiveCampaign, n8n, Zapier, Mailchimp), cu text mic deasupra: "Sisteme construite cu:"

### Secțiunea 2 — PROBLEMA (fundal bg-secondary)

Layout: 3 coloane pe desktop, stacked pe mobil. Fiecare coloană e un card cu icon minimal (doar un cerc colorat cu un simbol simplu, sau fără icon deloc — doar text).

```
[H2] Recunoști situația?

[Card 1]
Lead-urile vin, dar conversiile nu cresc proporțional.
---
Investești constant în marketing și generezi lead-uri, dar rata de conversie lead–client rămâne sub potențial. Echipa intervine manual mai mult decât ar trebui, iar unele oportunități se pierd pe drum.

[Card 2]
Automatizările există, dar nu lucrează împreună.
---
Ai fluxuri active, dar fiecare funcționează izolat. CRM-ul nu e integrat cu formularele, emailurile nu se adaptează la stadiul lead-ului, iar datele sunt fragmentate în mai multe platforme.

[Card 3]
Optimizezi pe intuiție, nu pe date.
---
Nu ai vizibilitate clară pe ce funcționează și ce nu. Deciziile de marketing se iau pe baza sentimentului, nu pe baza unui sistem care îți arată exact unde pierzi și unde câștigi.
```

### Secțiunea 3 — CE OBȚII (fundal alb)

Layout: 2 coloane pe desktop (text stânga, element vizual/ilustrație placeholder dreapta), sau 4 carduri grid.

```
[Preheading - text mic, uppercase, tracking-wide, color accent]
Ce se schimbă când lucrăm împreună

[H2] Transform procesele de marketing și vânzări
într-un sistem care produce rezultate măsurabile.

[Outcome 1]
Conversie mai mare din același volum de lead-uri
Optimizez parcursul complet al lead-ului — de la prima interacțiune până la contract — eliminând punctele unde se pierd oportunități.

[Outcome 2]
Procese care funcționează fără intervenție manuală constantă
Construiesc automatizări integrate care preiau, califică, urmăresc și convertesc lead-uri sistematic.

[Outcome 3]
Decizii bazate pe date, nu pe presupuneri
Implementez raportare și KPI-uri care arată exact unde merge bine și unde trebuie intervenit.

[Outcome 4]
Un partener strategic, nu un executor de task-uri
Lucrez ca extensie a echipei tale: audit, strategie, implementare, optimizare continuă.
```

### Secțiunea 4 — CUM FUNCȚIONEAZĂ (fundal bg-secondary)

Layout: 3 pași numerotați, orizontal pe desktop, vertical pe mobil. Fiecare pas are un număr mare (01, 02, 03) și text scurt.

```
[H2] Cum funcționează o colaborare

[Pas 01]
Audit & strategie
Analizez procesele existente, identific punctele de pierdere, și construiesc un plan de automatizare prioritizat pe baza impactului. Primești un document complet cu harta fluxurilor, recomandări concrete, și un roadmap clar.

[Pas 02]
Implementare
Construiesc și conectez automatizările etapizat: CRM, emailuri, formulare, integrări. Fiecare flux este testat înainte de a trece la următorul. Durata: 4–8 săptămâni.

[Pas 03]
Optimizare continuă
Lunar, analizăm rezultatele și ajustăm. La fiecare trimestru, evaluare strategică completă. Sistemul evoluează odată cu business-ul tău.

[CTA centrat]
[Buton accent] Vezi detalii și prețuri → (link: /servicii)
```

### Secțiunea 5 — TESTIMONIALE (fundal alb)

Layout: Carousel sau grid 2 coloane. Maxim 3 testimoniale pe homepage (cele mai puternice). Fiecare: text citat, nume, rol, companie, foto mică.

```
[H2] Ce spun companiile cu care am lucrat

[Testimonial 1 — Iulian Dinică]
"Lucrăm împreună cu Ana de peste 4 ani, timp în care am abordat cam toate modalitățile de promovare online. Profesionalismul abordării și competențele mereu actualizate ne-au adus poziționare și vizibilitate online traduse în creșterea vânzărilor."
— Iulian Dinică, Managing Partner, Document Imaging Systems

[Testimonial 2 — Mona Ursu]
"Am admirat la Ana capacitatea de a înțelege și pune în practică nu doar aspectele tehnice ale comunicării în mediul online, dar și nevoile strategice ale unui brand. O recomand oricărui business care are nevoie de suport profesionist în creșterea brandurilor."
— Mona Ursu, Founder & CEO, Brandfusion

[Testimonial 3 — Manuela Ciugudean]
"Am apreciat profesionalismul ei și abordarea pragmatică. Lucrurile s-au întâmplat repede și cu rezultate foarte bune. O recomand antreprenorilor care doresc vizibilitate în manieră eficientă, într-un spațiu de colaborare sigur și profesionist."
— Manuela Ciugudean, Coach & Personal Brand Strategist
```

NOTĂ: Fotografiile testimonialelor se preiau de pe site-ul actual (URL-urile existente din wp-content/uploads). Adaugă un comentariu HTML cu URL-ul sursei pentru fiecare imagine.

### Secțiunea 6 — LEAD MAGNET + NEWSLETTER (fundal bg-secondary)

Layout: 2 coloane pe desktop. Stânga: mini-audit CTA. Dreapta: newsletter.

```
[Coloana stânga — Mini-audit]
[H3] Vrei să știi unde pierzi lead-uri?

Răspunde la 8 întrebări despre procesele tale de marketing și vânzări. Primești un raport cu scorul tău de maturitate și recomandări concrete — gratuit, fără obligații.

[Buton accent] Începe evaluarea → (link: /mini-audit)

[Coloana dreapta — Newsletter]
[H3] Strategii de automatizare, direct în inbox.

O dată la 2 săptămâni: studii de caz, greșeli frecvente, recomandări testate în piață. Conținut pentru profesioniști care vor sisteme mai bune, nu doar mai multe tool-uri.

[Formular inline]
Prenume: [input]
Email: [input]
[Buton primary] Abonează-te

[Text mic sub formular] Zero spam. Te poți dezabona oricând.
```

### Secțiunea 7 — BLOG PREVIEW (fundal alb)

```
[H2] De pe blog

[3 carduri cu ultimele articole — fiecare card conține:]
- Imagine featured (placeholder)
- Categorie (badge pill)
- Titlu articol (link)
- Primele 2 propoziții
- Data publicării

[Link] Toate articolele → (link: /blog)
```

NOTĂ: Pentru scopul construcției, creează 3 articole placeholder cu titlurile reale de pe site-ul actual:
1. "Cum poți construi un plan lunar de conținut cu ajutorul automatizării și agenților AI, fără să pierzi controlul"
2. "Automatizări în WhatsApp Business: ce poți face concret ca antreprenor, direct din aplicație"
3. "Cum să nu mai pierzi lead-urile pe care le plătești deja"

---

## PAGINA 2: SERVICII (`/servicii`)

### Hero

```
[Badge pill] Servicii

[H1] Un sistem de marketing și vânzări
care produce clienți, nu doar lead-uri.

[Paragraf]
Planific, implementez și optimizez sisteme automatizate pentru companii care au depășit etapa de validare și vor performanță din procesele lor existente.
```

### Secțiunea "Pentru cine" (fundal bg-secondary)

```
[H2] Este pentru compania ta dacă:

[Grid 2x3 sau lista vizuală cu checkmarks]
✓ Ai cifra de afaceri de peste 500.000 EUR
✓ Generezi constant lead-uri — minim 50 pe lună
✓ Folosești deja un CRM (ActiveCampaign, HubSpot, Salesforce, Pipedrive etc.)
✓ Ai automatizări sau campanii active, dar știi că procesele pot produce mai mult
✓ Vinzi B2B sau B2C cu model de vânzare consultativă
✓ Vrei îmbunătățirea sistemului, nu doar setarea unor automatizări izolate

[Text suplimentar]
Lucrez cu companii din orice industrie care au vânzare consultativă — de la servicii profesionale și clinici, la producători, centre de formare, și agenții.
Nu lucrez (încă) cu e-commerce.
```

### Cele 3 etape (fundal alb)

Layout: 3 blocuri verticale, fiecare cu număr mare, titlu, detalii, și preț.

```
[H2] Cum transform procesele în sisteme performante

--- ETAPA 1 ---
[Număr mare] 01
[H3] Audit & plan strategic de automatizări

Începem cu un audit complet al modului în care funcționează marketingul și vânzările tale. Analizez în detaliu:

• Parcursul complet al clientului — de la prima interacțiune până post-achiziție
• Obiectivele de business și KPI-urile prin care măsurăm evoluția
• Fluxul de lead-uri: cum sunt captate, segmentate și gestionate
• Utilizarea CRM-ului și integrarea cu celelalte platforme
• Automatizările existente și impactul lor real
• Punctele unde se pierd lead-uri sau oportunități

Pe baza auditului construiesc un plan personalizat care include: obiectivele prioritare, automatizările necesare ordonate după impact, optimizările proceselor existente, arhitectura sistemului, și un roadmap clar de implementare.

La finalul acestei etape, știi exact ce implementăm, în ce ordine și de ce.

Investiție: 1.500 – 2.500 €
Durată: 2–3 săptămâni

--- ETAPA 2 ---
[Număr mare] 02
[H3] Implementare & consolidare

Construiesc și optimizez fluxurile care influențează direct performanța:

• Fluxuri de lead management — captare, calificare, distribuire
• Secvențe automate de nurturing și follow-up
• Integrare între CRM și celelalte tool-uri din stack
• Automatizări de retenție și reactivare
• Configurare raportare și dashboard-uri de monitorizare

Implementarea este etapizată și controlată — fiecare automatizare este testată și validată înainte de a trece la următoarea.

Investiție: 3.000 – 5.000 €
Durată: 4–8 săptămâni

--- ETAPA 3 ---
[Număr mare] 03
[H3] Optimizare continuă & creștere

Performanța este un proces, nu un proiect cu deadline.

Lunar: analizăm indicatorii relevanți, identificăm oportunități de îmbunătățire, implementăm optimizări, ajustăm mesajele și fluxurile pe baza datelor.

Trimestrial: evaluare strategică completă a rezultatelor, analiză de impact, plan de îmbunătățire pentru următorul trimestru.

Scopul: un sistem care crește constant în performanță, nu doar mentenanță.

Retainer lunar: 700 – 1.000 €
```

### Secțiunea "Ce obții concret" (fundal bg-secondary)

```
[H2] Ce obții concret

[Grid 2x3 de carduri, fiecare cu titlu bold + descriere scurtă]

1. Conversii mai bune din același volum de lead-uri
Optimizez modul în care lead-urile sunt preluate, urmărite și transformate în clienți. Creștere tipică: 15–30% în rata de conversie lead–client în primele 6 luni.

2. Reducerea intervențiilor manuale cu 50–60%
Automatizez procesele repetitive: răspunsuri inițiale, follow-up, calificare, distribuire lead-uri, solicitare feedback.

3. Vizibilitate completă pe performanță
Știi exact ce funcționează, ce nu, și unde trebuie intervenit. Decizii bazate pe date, nu pe intuiție.

4. Un sistem integrat, nu automatizări izolate
CRM, email, formulare, raportare — totul conectat într-un singur sistem coerent.

5. Optimizare continuă, nu doar implementare
După lansare, monitorizez, testez și îmbunătățesc constant. Sistemul evoluează odată cu business-ul tău.

6. Structură clară pentru următorii pași
La fiecare trimestru, știi exact ce optimizăm, de ce, și ce impact așteptăm.
```

### Secțiunea "Cum lucrăm" (fundal alb)

```
[H2] Următorii pași

[Pas 1 - cu număr]
Completezi formularul de mai jos
Îmi spui despre companie, provocări și obiective.

[Pas 2]
Analizez informațiile
Evaluez contextul și mă asigur că există aliniere.

[Pas 3]
Discuție de clarificare
Dacă profilul se potrivește, programăm o conversație de 30 minute.

[Text suplimentar, italic, text-secondary]
Lucrez cu un număr limitat de companii simultan pentru a păstra implicarea strategică în fiecare proiect. De aceea, selectez proiectele în funcție de nivelul de aliniere și claritatea obiectivelor.
```

### FORMULARUL "HAI SĂ DISCUTĂM" (fundal bg-secondary, id="formular")

```
[H2] Hai să discutăm despre procesele tale

[Formular cu câmpurile următoare:]

Numele tău *
[input text, required]

Adresa de email *
[input email, required]

Numele companiei *
[input text, required]

Site-ul companiei *
[input url, placeholder: "https://"]

Care e cea mai mare provocare legată de automatizarea marketingului și vânzărilor? *
[textarea, 3-4 rânduri, required, placeholder: "Ex: Generăm lead-uri dar conversiile sunt sub așteptări, echipa pierde timp pe procese manuale..."]

Câte lead-uri generați aproximativ pe lună?
[select dropdown]
- Selectează...
- Sub 50
- 50 – 100
- 100 – 300
- Peste 300

Ce CRM folosiți?
[select dropdown]
- Selectează...
- ActiveCampaign
- HubSpot
- Salesforce
- Pipedrive
- Mailchimp
- Zoho CRM
- Altul
- Nu folosim CRM

Cum ai aflat de mine?
[select dropdown]
- Selectează...
- Recomandare
- LinkedIn
- Căutare Google
- Blog / articol
- Altele

[Checkbox GDPR]
☐ Sunt de acord cu prelucrarea datelor personale conform Politicii de confidențialitate. *

[Buton accent] Trimite cererea →

[Text sub buton, mic, text-tertiary]
Analizez fiecare cerere personal. Dacă există aliniere, primești o invitație la o discuție de clarificare în maximum 48h.
```

La submit cu succes, afișează un mesaj inline (nu redirect):
```
✓ Mulțumesc! Am primit cererea ta.
Voi reveni cu un răspuns personalizat în maximum 48 de ore.
```

---

## PAGINA 3: DESPRE (`/despre`)

### Hero

```
[Badge pill] Despre mine

[H1] 14+ ani de marketing digital.
Ultimii 3, dedicați exclusiv automatizărilor.

[Paragraf]
Am ajutat companii din retail, B2B, servicii și home & deco să-și transforme procesele manuale în sisteme care funcționează consecvent.
```

La dreapta hero-ului (pe desktop) sau sub text (pe mobil): placeholder pentru fotografie profesională.
`<!-- REPLACE: Professional headshot photo of Ana Dobre, similar to current site P72B1673-3-scaled.jpg -->`

### Secțiunea 1 — Parcurs profesional (fundal alb, max 3 paragrafe)

```
[H2] Cum am ajuns aici

Am început în SEO și Google Ads — domenii care mi-au format gândirea analitică și obsesia pentru rezultate măsurabile. Am gestionat campanii complexe pe Google, Facebook, Instagram, LinkedIn și YouTube, în industrii diverse: retail, home & deco, servicii, B2B.

De-a lungul anilor am observat un lucru constant: chiar și strategiile bine gândite eșuează fără procese eficiente de execuție. Așa am ajuns la automatizări — nu ca o schimbare de direcție, ci ca un nivel următor al strategiei. Rezultatele au fost imediate: mai puține erori, mai mult timp câștigat, și campanii care funcționează constant.

Astăzi construiesc sisteme automatizate de marketing și vânzări: audit procesele existente, identific punctele de pierdere, implementez automatizări integrate, și optimizez continuu pe baza datelor. Combin experiența strategică cu implementarea tehnică — o combinație care face diferența între "avem automatizări" și "avem un sistem care produce clienți".
```

### Secțiunea 2 — Ce mă diferențiază (fundal bg-secondary, 3 coloane)

```
[H2] Ce aduc diferit

[Card 1]
Strategie + implementare, nu doar una dintre ele
Nu sunt doar strategist care dă un PDF și pleacă. Și nu sunt doar un technician care setează fără să înțeleagă de ce. Fac ambele — și asta înseamnă că sistemul pe care îl construiesc e aliniat cu obiectivele tale de business.

[Card 2]
Sisteme integrate, nu automatizări izolate
Fiecare automatizare pe care o construiesc se conectează cu restul. CRM-ul, emailul, formularele, raportarea — totul lucrează împreună ca un mecanism unic, nu ca piese separate.

[Card 3]
Optimizare continuă, nu proiecte cu deadline
Un sistem de automatizare nu e un livrabil pe care îl predai și pleci. E un proces viu care trebuie monitorizat, testat și îmbunătățit constant. De aceea ofer retainer de optimizare continuă, nu doar implementare.
```

### Secțiunea 3 — Tool-uri (fundal alb)

```
[H2] Platforme și tool-uri cu care lucrez

[Rând de logo-uri, centrate, cu spațiere generoasă]
ActiveCampaign | Mailchimp | n8n | Zapier | Google Analytics | Tally | Calendly

<!-- REPLACE: Logo images for each tool — use official logos, grayscale or muted, with hover color transition -->
```

Placeholder-uri vizuale sunt OK. Adaugă un comentariu HTML cu numele fiecărui tool.

### Secțiunea 4 — Certificări (fundal bg-secondary, compactă)

```
[H2] Certificări

[Grid de badge-uri mici — 2 sau 3 pe rând]
• Certified Digital Marketing Specialist – Strategy & Planning (Digital Marketing Institute)
• Email Marketing Automations Specialist (Mailchimp Academy)
• Certificări Google Ads & Analytics

<!-- REPLACE: Badge images from current site -->
```

### CTA final (fundal alb)

```
[H2] Vrei să discutăm despre procesele tale de marketing?

[Buton accent] Programează o discuție → (link: /servicii#formular)
[Buton secundar] Sau evaluează-ți sistemul gratuit → (link: /mini-audit)
```

---

## PAGINA 4: RESURSE (`/resurse`)

### Hero

```
[Badge pill] Resurse gratuite

[H1] Resurse gratuite pentru automatizarea marketingului și vânzărilor

[Paragraf]
Instrumente practice pe care le poți folosi imediat — fără obligații.
```

### Resursele (grid de 3 carduri)

```
[Card 1 — PRINCIPAL, vizual mai mare]
[Badge] Recomandare #1
[H3] Mini-audit: Evaluează-ți sistemul de automatizare
Răspunde la 8 întrebări despre procesele tale de marketing și vânzări. Primești un scor de maturitate și recomandări personalizate — gratuit, în 3 minute.
[Buton accent] Începe evaluarea → (link: /mini-audit)

[Card 2]
[Badge] Ebook
[H3] Ghidul companiei în creștere: Cum construiești un sistem de automatizare care produce clienți
Tot ce trebuie să știi despre audit, strategie, implementare și optimizare a automatizărilor de marketing și vânzări. Cu exemple reale din piața din România.
[Formular inline: Prenume + Email + Buton "Descarcă gratuit"]
<!-- Ebook-ul efectiv se va crea separat. Formularul trimite datele la AC cu tag "lead-magnet-ghid-automatizare" -->

[Card 3]
[Badge] Checklist
[H3] 7 semne că pierzi lead-uri din cauza lipsei de automatizare
Un checklist de o pagină pe care îl poți parcurge în 2 minute. Dacă bifezi 3+ semne, e timpul să acționezi.
[Formular inline: Prenume + Email + Buton "Descarcă checklist-ul"]
<!-- Tag AC: "lead-magnet-checklist-pierdere-leaduri" -->
```

---

## PAGINA 5: MINI-AUDIT (`/mini-audit`)

### Funcționalitate

Pagina este un wizard multi-step (fără reload — totul client-side JS). 8 întrebări cu răspunsuri predefinite, fiecare cu un scor ascuns. La final, se calculează scorul total și se afișează rezultatul + recomandări + formular de email pentru primirea raportului detaliat.

### Design

- Progress bar vizibil în partea de sus (Întrebarea 1 din 8, Întrebarea 2 din 8 etc.)
- O singură întrebare pe ecran
- Răspunsurile sunt butoane/carduri selectabile (nu dropdown-uri) — click pe răspuns avansează automat
- Tranziție smooth între întrebări (slide sau fade)
- Pagina de rezultat la final

### Întrebările și scorarea

```
ÎNTREBAREA 1: Ce CRM folosiți?
- Nu folosim CRM → 0 puncte
- Folosim unul, dar nu e configurat complet → 1 punct
- Folosim un CRM configurat și actualizat constant → 2 puncte

ÎNTREBAREA 2: Cât durează în medie de la primirea unui lead până la primul răspuns?
- Peste 24 de ore / nu știm exact → 0 puncte
- Între 2 și 24 de ore → 1 punct
- Sub 2 ore, avem proces clar → 2 puncte

ÎNTREBAREA 3: Aveți secvențe automate de email pentru lead-urile noi?
- Nu, fiecare email se trimite manual → 0 puncte
- Avem un email automat de bun venit, dar atât → 1 punct
- Da, avem secvențe de nurturing active și segmentate → 2 puncte

ÎNTREBAREA 4: Ce se întâmplă cu lead-urile care nu cumpără imediat?
- Nu avem un proces definit — rămân în baza de date → 0 puncte
- Le contactăm ocazional, dar fără o secvență structurată → 1 punct
- Avem automatizări de follow-up și nurturing pe termen lung → 2 puncte

ÎNTREBAREA 5: Măsurați rata de conversie lead → client?
- Nu o măsurăm → 0 puncte
- O estimăm aproximativ → 1 punct
- Da, o monitorizăm în CRM și raportăm lunar → 2 puncte

ÎNTREBAREA 6: Cât de integrate sunt platformele între ele? (CRM, email, formulare, ads)
- Fiecare funcționează separat → 0 puncte
- Unele sunt conectate, dar nu toate → 1 punct
- Avem un sistem integrat, datele circulă automat între platforme → 2 puncte

ÎNTREBAREA 7: Cum gestionați lead-urile din surse diferite? (ads, organic, referral)
- Toate ajung în același loc, fără diferențiere → 0 puncte
- Le separăm, dar nu avem fluxuri diferite pe surse → 1 punct
- Avem automatizări diferențiate pe surse, cu tag-uri și segmentare → 2 puncte

ÎNTREBAREA 8: Cât de des revizuiți și optimizați automatizările existente?
- Nu le-am mai atins de când au fost setate → 0 puncte
- Le ajustăm ocazional, când apare o problemă → 1 punct
- Le analizăm și optimizăm lunar pe baza datelor → 2 puncte
```

### Calculul scorului

Scor total posibil: 16 puncte.

```
0–5 puncte → NIVEL ÎNCEPĂTOR
Titlu: "Fundația lipsește."
Mesaj: "Procesele tale de marketing și vânzări funcționează predominant manual. Pierzi lead-uri și oportunități din cauza lipsei de structură și automatizare. Vestea bună: potențialul de îmbunătățire e enorm — chiar și câteva automatizări de bază pot schimba radical rata de conversie."
Recomandare: "Prioritatea #1: un audit complet al fluxurilor existente și un plan strategic de automatizare."
Culoare indicator: #E8593C (coral/roșu)

6–10 puncte → NIVEL INTERMEDIAR
Titlu: "Ai fundația, dar sistemul are gap-uri."
Mesaj: "Ai un CRM și câteva procese în loc, dar automatizările nu lucrează ca un sistem integrat. Sunt puncte de pierdere între etapele parcursului clientului — lead-uri care se răcesc, follow-up-uri care nu se fac, date fragmentate. Cu optimizări targetate, poți crește semnificativ rata de conversie."
Recomandare: "Prioritatea #1: identificarea și automatizarea punctelor de pierdere din parcursul lead-ului."
Culoare indicator: #BA7517 (amber)

11–16 puncte → NIVEL AVANSAT
Titlu: "Sistemul funcționează. E momentul să-l optimizezi."
Mesaj: "Ai un sistem de automatizare funcțional și integrat. Provocarea ta acum nu mai e implementarea de bază, ci optimizarea continuă: A/B testing pe secvențe, îmbunătățirea segmentării, raportare avansată, și scalarea a ceea ce funcționează deja."
Recomandare: "Prioritatea #1: un program de optimizare continuă cu analiză lunară și ajustări pe baza datelor."
Culoare indicator: #1D9E75 (verde)
```

### Pagina de rezultat (apare după ultima întrebare, pe aceeași pagină)

```
[Indicator vizual — bară de progres sau gauge cu culoarea corespunzătoare]
Scorul tău: [X] din 16

[H2] [Titlul nivelului]

[Paragraf — mesajul nivelului]

[Paragraf — recomandarea nivelului]

---

[H3] Vrei raportul complet cu recomandări detaliate?

Îți trimit pe email un raport personalizat cu pașii concreți pe care îi poți face, adaptat scorului tău.

[Formular]
Prenume: [input]
Email: [input]
Numele companiei: [input]
[Buton accent] Trimite-mi raportul →

<!-- La submit: trimite datele la AC cu tag "mini-audit" + tag nivel ("audit-beginner" / "audit-intermediate" / "audit-advanced") + scorul numeric ca custom field -->

[Separator vizual]

Sau, dacă vrei să discutăm direct:
[Buton secundar] Programează o discuție → (link: /servicii#formular)
```

---

## PAGINA 6: BLOG

### Listing (`/blog`)

```
[H1] Blog

[Paragraf intro]
Strategii, studii de caz și recomandări practice pentru automatizarea marketingului și vânzărilor. Conținut pentru profesioniști care vor sisteme mai bune.

[Grid de articole — 2 coloane pe desktop, 1 pe mobil]
Fiecare card: imagine featured, categorie (badge), titlu, primele 2 propoziții, data, "Citește →"
```

### Articol individual (`/blog/[slug]`)

Layout clasic de articol: max-width 720px, centrat, tipografie de lectură.

- Titlu H1
- Metadata: data, categorie, timp estimat de citire
- Conținut articol
- La final: CTA box (fundal bg-secondary, padding generos):

```
[Box CTA end-of-article]
[H3] Vrei să discutăm despre automatizarea proceselor din compania ta?

[Buton accent] Programează o discuție → (link: /servicii#formular)
[Buton secundar] Sau evaluează-ți sistemul gratuit → (link: /mini-audit)
```

- Sub CTA: secțiune "Articole similare" — 2-3 carduri.

NOTĂ: Pentru build-ul inițial, creează 3 articole cu titlurile reale, dar cu conținut placeholder (lorem ipsum structurat cu headings, paragrafe, liste). Conținutul real se va migra manual ulterior.

---

## PAGINA 7: CONTACT (`/contact`)

Pagină simplă, minimalistă.

```
[H1] Contact

[Paragraf]
Cea mai rapidă cale: completează formularul de pe pagina de servicii.
Pentru orice altceva, scrie-mi direct.

[Grid 2 coloane]

[Stânga — info contact]
Email: hello@anadobre.com
LinkedIn: linkedin.com/in/anadobre (link)

[Dreapta — formular simplu]
Numele tău: [input]
Email: [input]
Mesaj: [textarea]
[Buton] Trimite mesajul

[Sub formular]
Sau programează direct o discuție → (link: /servicii#formular)
```

---

## ELEMENTE GLOBALE

### Navbar (sticky, toate paginile)

```
[Logo — text sau imagine]                    Servicii  Despre  Resurse  Blog  Contact  [Programează o discuție]
```

- Logo: "Ana Dobre" în font display + subtitlu mic "Automatizări Marketing & Vânzări" — sau placeholder pentru imagine logo
- Pe mobil: hamburger menu
- CTA "Programează o discuție" vizibil doar pe desktop, link: /servicii#formular
- La scroll, navbar primește shadow subtil

### Footer (toate paginile)

```
[2 coloane pe desktop]

[Stânga]
Ana Dobre
Automatizări Marketing & Vânzări
hello@anadobre.com

[Dreapta]
[Linkuri] Servicii | Despre | Resurse | Blog | Contact
[Linkuri legal] Politica de confidențialitate | Politica cookies | Termeni și condiții

[Full width, sub]
© 2026 Ana Dobre. Toate drepturile rezervate.
```

NU include: coș de cumpărături, login, ANPC/Netopia (nu e e-commerce), captcha de math, "Convingerea mea", toolbar de accesibilitate custom (browsere-le au deja), buton Log In.

---

## SEO & META

Fiecare pagină trebuie să aibă:
- `<title>` unic și descriptiv
- `<meta name="description">` unic
- Open Graph tags (og:title, og:description, og:image)
- Canonical URL

```
Homepage:
title: "Ana Dobre — Automatizări Marketing & Vânzări pentru Companii în Creștere"
description: "Construiesc și optimizez sisteme automatizate de marketing și vânzări. Audit, implementare și optimizare continuă pentru companii cu CRM și 50+ lead-uri lunar."

Servicii:
title: "Servicii Automatizare Marketing & Vânzări — Ana Dobre"
description: "Audit, implementare și optimizare de sisteme automatizate. Pentru companii B2B și B2C cu vânzare consultativă, cifra de afaceri 500K+ EUR."

Despre:
title: "Despre Ana Dobre — 14+ Ani Marketing Digital, Expert Automatizări"
description: "Consultant în automatizări de marketing și vânzări. Combin strategia cu implementarea tehnică pentru a construi sisteme care produc clienți, nu doar lead-uri."

Resurse:
title: "Resurse Gratuite Automatizări Marketing — Ana Dobre"
description: "Mini-audit gratuit, ebook-uri și checklist-uri despre automatizarea marketingului și vânzărilor. Conținut practic pentru companii în creștere."

Mini-audit:
title: "Mini-audit Gratuit: Evaluează-ți Sistemul de Automatizare — Ana Dobre"
description: "8 întrebări, 3 minute, recomandări personalizate. Descoperă unde pierzi lead-uri și ce poți automatiza pentru a crește rata de conversie."

Blog:
title: "Blog — Strategii Automatizare Marketing & Vânzări — Ana Dobre"
description: "Articole despre automatizări de marketing, lead management, CRM, AI în marketing, și strategii de conversie pentru companii din România."

Contact:
title: "Contact — Ana Dobre"
description: "Ia legătura cu Ana Dobre pentru automatizarea proceselor de marketing și vânzări."
```

---

## NOTĂ IMPORTANTĂ DESPRE FORMULARE

Toate formularele trimit datele prin POST la un endpoint `/api/form-submit`. Implementează un handler simplu care:
1. Validează câmpurile required
2. Afișează un mesaj de succes inline
3. Logează datele în consolă (pentru testare)
4. Include un comentariu `// TODO: Connect to ActiveCampaign API` la locul unde se va adăuga integrarea reală

Formularul de newsletter are endpoint separat: `/api/newsletter-subscribe`.

---

## IMAGINI ȘI ASSETS

Site-ul trebuie să funcționeze complet fără imagini reale. Folosește:
- Divs cu background-color (#EEF2F5) și text descriptiv centrat pentru fiecare placeholder de imagine
- Dimensiuni corecte (aspect ratio) pentru fiecare placeholder
- Comentarii HTML `<!-- REPLACE: description -->` pe fiecare placeholder

Imagini de pregătit ulterior (nu sunt în scope-ul build-ului):
- Headshot profesional Ana Dobre (hero homepage, pagina Despre)
- Logo-uri tool-uri (ActiveCampaign, n8n, Zapier, Mailchimp, Google Analytics, Tally, Calendly)
- Logo-uri companii clienți (pentru testimoniale)
- Featured images pentru articole de blog
- OG image default pentru social sharing

---

## PERFORMANCE & DEPLOYMENT

- Build static cu Astro (output: static)
- Fonturile încărcate cu `font-display: swap`
- Imagini optimizate (când vor fi adăugate) — format WebP
- Score minim țintit: 95+ Performance, 100 Accessibility, 100 Best Practices, 100 SEO (Lighthouse)
- Deploy pe Cloudflare Pages (configurare: `astro build` → directorul `dist/`)

---

## CE NU FACE PARTE DIN ACEST BUILD

- Integrare reală ActiveCampaign (se adaugă ulterior — formularele sunt pregătite)
- Migrare conținut real din blog (se face manual)
- Imagini reale (se înlocuiesc placeholder-urile)
- Ebook-uri și PDF-uri descărcabile (se creează separat)
- Configurare DNS și domeniu (se face la deploy)
- Analytics (Google Analytics / Plausible — se adaugă ulterior)
