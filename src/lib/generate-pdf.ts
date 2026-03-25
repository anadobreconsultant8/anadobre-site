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
  const navy: [number, number, number]    = [3, 48, 110];
  const blue: [number, number, number]    = [2, 73, 165];
  const amber: [number, number, number]   = [201, 136, 12];
  const textDark: [number, number, number]  = [26, 26, 46];
  const textMuted: [number, number, number] = [74, 85, 104];
  const bgLight: [number, number, number]   = [238, 244, 250];
  const red: [number, number, number]     = [220, 53, 53];
  const amberBg: [number, number, number] = [250, 238, 218];
  const green: [number, number, number]   = [29, 158, 117];

  function addText(text: string, x: number, yPos: number, size: number, color: [number, number, number], style = 'normal') {
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', style === 'bold' ? 'bold' : 'normal');
    doc.text(text, x, yPos);
    return yPos;
  }

  function addWrappedText(text: string, x: number, yPos: number, size: number, color: [number, number, number], maxWidth: number, style = 'normal'): number {
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', style === 'bold' ? 'bold' : 'normal');
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

  y += 6;
  doc.setDrawColor(214, 230, 245);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  y = addWrappedText('Raport Mini-Audit: Maturitate Automatiz\u0103ri Marketing & V\u00E2nz\u0103ri', margin, y, 16, navy, contentWidth, 'bold');
  y += 4;
  addText(`Preg\u0103tit pentru ${prenume} \u2014 ${companie}`, margin, y, 10, textMuted);
  y += 5;

  const today = new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
  addText(`Data: ${today}`, margin, y, 9, textMuted);
  y += 12;

  // ══════════════════════════════════════
  // SCORUL
  // ══════════════════════════════════════
  const scorColor: [number, number, number] = scor <= 5 ? red : scor <= 10 ? amber : green;
  const scorBgColor: [number, number, number] = scor <= 5 ? [252, 235, 235] : scor <= 10 ? amberBg : [225, 245, 238];

  doc.setFillColor(scorBgColor[0], scorBgColor[1], scorBgColor[2]);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');

  addText(`Scorul t\u0103u: ${scor} din 16`, margin + 10, y + 12, 18, scorColor, 'bold');
  addText(`Nivel: ${nivel}`, margin + 10, y + 22, 12, scorColor);

  const barY = y + 26;
  const barWidth = contentWidth - 20;
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(margin + 10, barY - 6, barWidth, 4, 2, 2, 'F');
  const fillWidth = (scor / 16) * barWidth;
  doc.setFillColor(scorColor[0], scorColor[1], scorColor[2]);
  doc.roundedRect(margin + 10, barY - 6, fillWidth, 4, 2, 2, 'F');

  y += 38;

  const nivelDescriptions: Record<string, string> = {
    '\u00CEncep\u0103tor': 'Procesele tale de marketing \u0219i v\u00E2nz\u0103ri func\u021Bioneaz\u0103 predominant manual. Pierzi lead-uri \u0219i oportunit\u0103\u021Bi din cauza lipsei de structur\u0103 \u0219i automatizare. Vestea bun\u0103: poten\u021Bialul de \u00EEmbun\u0103t\u0103\u021Bire e enorm \u2014 chiar \u0219i c\u00E2teva automatiz\u0103ri de baz\u0103 pot schimba radical rata de conversie.',
    'Intermediar': 'Ai un CRM \u0219i c\u00E2teva procese \u00EEn loc, dar automatiz\u0103rile nu lucreaz\u0103 ca un sistem integrat. Sunt puncte de pierdere \u00EEntre etapele parcursului clientului \u2014 lead-uri care se r\u0103cesc, follow-up-uri care nu se fac, date fragmentate. Cu optimiz\u0103ri targetate, po\u021Bi cre\u0219te semnificativ rata de conversie.',
    'Avansat': 'Ai un sistem de automatizare func\u021Bional \u0219i integrat. Provocarea ta acum nu mai e implementarea de baz\u0103, ci optimizarea continu\u0103: A/B testing pe secven\u021Be, \u00EEmbun\u0103t\u0103\u021Birea segment\u0103rii, raportare avansat\u0103, \u0219i scalarea a ceea ce func\u021Bioneaz\u0103 deja.'
  };

  y = addWrappedText(nivelDescriptions[nivel] || '', margin, y, 10, textDark, contentWidth);
  y += 10;

  // ══════════════════════════════════════
  // ANALIZA PE CATEGORII
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
      high: 'Ave\u021Bi secven\u021Be de nurturing active \u2014 excelent. Urm\u0103torul pas: segmentarea secven\u021Belor pe baza comportamentului lead-ului.'
    },
    {
      name: 'M\u0103surare & Raportare',
      indices: [4, 5],
      low: 'F\u0103r\u0103 vizibilitate pe rata de conversie \u0219i pe integrarea platformelor, optimizarea se face pe intui\u021Bie. Implementarea unui dashboard de monitorizare poate debloca decizii cu impact imediat.',
      high: 'M\u0103sura\u021Bi \u0219i ave\u021Bi platforme integrate \u2014 sunte\u021Bi \u00EEntr-o pozi\u021Bie excelent\u0103 pentru optimizare bazat\u0103 pe date.'
    },
    {
      name: 'Segmentare & Optimizare',
      indices: [6, 7],
      low: 'Segmentarea lead-urilor pe surse \u0219i optimizarea periodic\u0103 a automatiz\u0103rilor sunt ce diferen\u021Biaz\u0103 un sistem func\u021Bional de un sistem performant.',
      high: 'Segmentarea \u0219i optimizarea sunt la un nivel matur. Urm\u0103torul pas: A/B testing sistematic pe secven\u021Be \u0219i raportare avansat\u0103 pe ROI per canal.'
    }
  ];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const catScore = cat.indices.reduce((sum, idx) => sum + (raspunsuri[idx] || 0), 0);

    y = checkPageBreak(y, 35);

    doc.setFontSize(11);
    doc.setTextColor(amber[0], amber[1], amber[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`0${i + 1}`, margin, y);

    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text(`${cat.name}`, margin + 10, y);

    doc.setTextColor(blue[0], blue[1], blue[2]);
    doc.setFontSize(10);
    doc.text(`${catScore} / 4`, pageWidth - margin - 15, y);

    y += 5;
    const description = catScore < 3 ? cat.low : cat.high;
    y = addWrappedText(description, margin, y, 9, textMuted, contentWidth);
    y += 6;
  }

  // ══════════════════════════════════════
  // RECOMANDĂRI
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
  // CTA BOX
  // ══════════════════════════════════════
  y = checkPageBreak(y, 40);
  y += 6;

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');

  y += 10;
  addText('Vrei s\u0103 discut\u0103m cum ar ar\u0103ta un plan personalizat?', margin + 10, y, 12, navy, 'bold');
  y += 8;
  addText('Programeaz\u0103 o consulta\u021Bie gratuit\u0103 de 30 de minute:', margin + 10, y, 10, textMuted);
  y += 6;
  doc.setFontSize(10);
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

  const pdfOutput = doc.output('datauristring');
  return pdfOutput.split(',')[1];
}
