import { jsPDF } from 'jspdf';

interface Analysis {
  'puncteFortă': string[];
  'zoneCritice': string[];
  'recomandări': { titlu: string; descriere: string; prioritate: string }[];
  'concluzie': string;
}

interface PDFData {
  prenume: string;
  companie: string;
  scor: number;
  nivel: string;
  raspunsuri: number[];
  analysis: Analysis;
}

export async function generatePDF(data: PDFData): Promise<string> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = 210;
  const mL = 18; // left margin
  const mR = 18; // right margin
  const cW = W - mL - mR; // content width = 174mm
  let y = 0;

  // Colors
  const navy: [number,number,number]  = [3, 48, 110];
  const blue: [number,number,number]  = [2, 73, 165];
  const amber: [number,number,number] = [201, 136, 12];
  const gray: [number,number,number]  = [74, 85, 104];
  const light: [number,number,number] = [238, 244, 250];
  const green: [number,number,number] = [29, 158, 117];
  const red: [number,number,number]   = [180, 40, 40];
  const white: [number,number,number] = [255, 255, 255];

  const scorColor: [number,number,number] = data.scor <= 5 ? red : data.scor <= 10 ? amber : green;

  function txt(
    text: string,
    x: number,
    yy: number,
    size: number,
    color: [number,number,number],
    bold = false,
    maxW?: number,
  ): number {
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    if (maxW) {
      const lines = doc.splitTextToSize(text, maxW) as string[];
      doc.text(lines, x, yy);
      return yy + lines.length * size * 0.4 + 1;
    }
    doc.text(text, x, yy);
    return yy + size * 0.4 + 1;
  }

  function pageBreak(yy: number, need: number): number {
    if (yy + need > 278) {
      doc.addPage();
      return 18;
    }
    return yy;
  }

  function hLine(yy: number, color: [number,number,number] = [214, 230, 245]) {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(mL, yy, W - mR, yy);
  }

  function fillRect(x: number, yy: number, w: number, h: number, color: [number,number,number], radius = 2) {
    doc.setFillColor(...color);
    doc.roundedRect(x, yy, w, h, radius, radius, 'F');
  }

  // ── HEADER ──────────────────────────────────────
  fillRect(0, 0, W, 28, navy, 0);
  y = 10;
  txt('Ana Dobre', mL, y, 16, white, true);
  y += 6;
  doc.setFontSize(7.5);
  doc.setTextColor(150, 190, 230);
  doc.setFont('helvetica', 'normal');
  doc.text('STRATEGY  \u2192  AUTOMATION  \u2192  RESULTS', mL, y);

  // Right side: score badge in header
  const badgeX = W - mR - 28;
  fillRect(badgeX, 4, 28, 20, [10, 65, 130], 2);
  doc.setFontSize(16);
  doc.setTextColor(...scorColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.scor}/16`, badgeX + 14, 16, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(180, 210, 240);
  doc.setFont('helvetica', 'normal');
  doc.text('SCOR', badgeX + 14, 21, { align: 'center' });

  y = 36;

  // ── TITLE ───────────────────────────────────────
  txt('Raport de Maturitate \u00een Automatiz\u0103ri', mL, y, 14, navy, true, cW);
  y += 7;
  const today = new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
  txt(`Preg\u0103tit pentru ${data.prenume} \u2014 ${data.companie}  \u00b7  ${today}`, mL, y, 9, gray, false, cW);
  y += 5;
  hLine(y); y += 6;

  // ── SCORE SECTION ───────────────────────────────
  fillRect(mL, y, cW, 22, light, 3);

  doc.setFontSize(11);
  doc.setTextColor(...scorColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`Nivel: ${data.nivel}`, mL + 5, y + 8);

  // Score bar
  const barX = mL + 5;
  const barW = cW - 10;
  const barY = y + 14;
  fillRect(barX, barY, barW, 4, [210, 220, 235], 2);
  fillRect(barX, barY, barW * (data.scor / 16), 4, scorColor, 2);

  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.setFont('helvetica', 'normal');
  doc.text(`Scor: ${data.scor} din 16 puncte`, W - mR - 5, y + 8, { align: 'right' });

  y += 28;

  // ── CONCLUZIE ───────────────────────────────────
  y = pageBreak(y, 30);
  txt('Concluzie', mL, y, 12, navy, true);
  y += 5;
  y = txt(data.analysis.concluzie, mL, y, 9.5, gray, false, cW);
  y += 6;
  hLine(y); y += 8;

  // ── PUNCTE FORTE & ZONE CRITICE ─────────────────
  y = pageBreak(y, 50);

  // Extract analysis fields via bracket notation to handle Romanian diacritics in keys
  const puncteForta: string[] = (data.analysis as any)['puncteFort\u0103'] ?? [];
  const recomandari: { titlu: string; descriere: string; prioritate: string }[] =
    (data.analysis as any)['recomand\u0103ri'] ?? [];

  // Two columns
  const colW = (cW - 6) / 2;
  const col2X = mL + colW + 6;
  const colStartY = y;

  // Left: Puncte forte
  txt('\u2713 Puncte forte', mL, y, 11, green, true);
  y += 5;
  let yLeft = y;
  for (const pf of puncteForta) {
    fillRect(mL, yLeft, colW, 1, green);
    yLeft += 3;
    yLeft = txt(`\u2022 ${pf}`, mL, yLeft, 9, gray, false, colW);
    yLeft += 3;
  }

  // Right: Zone critice
  let yRight = colStartY;
  txt('\u26a0 Zone critice', col2X, yRight, 11, amber, true);
  yRight += 5;
  for (const zc of data.analysis.zoneCritice) {
    fillRect(col2X, yRight, colW, 1, amber);
    yRight += 3;
    yRight = txt(`\u2022 ${zc}`, col2X, yRight, 9, gray, false, colW);
    yRight += 3;
  }

  y = Math.max(yLeft, yRight) + 6;
  hLine(y); y += 8;

  // ── RECOMANDARI ─────────────────────────────────
  y = pageBreak(y, 20);
  txt('Recomand\u0103ri prioritare', mL, y, 12, navy, true);
  y += 8;

  const priorityColor: Record<string, [number,number,number]> = {
    '\u00cEnalt\u0103': red,
    'Medie': amber,
    'Sc\u0103zut\u0103': green,
  };

  for (let i = 0; i < recomandari.length; i++) {
    const rec = recomandari[i];
    y = pageBreak(y, 35);

    // Number badge
    fillRect(mL, y - 4, 7, 7, navy, 1);
    doc.setFontSize(9);
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.text(`${i + 1}`, mL + 3.5, y + 0.5, { align: 'center' });

    // Priority badge
    const pColor = priorityColor[rec.prioritate] ?? gray;
    const pLabel = `\u25cf ${rec.prioritate}`;
    doc.setFontSize(8);
    doc.setTextColor(...pColor);
    doc.setFont('helvetica', 'normal');
    doc.text(pLabel, W - mR, y - 1, { align: 'right' });

    // Title
    const titleY = y;
    y = txt(rec.titlu, mL + 9, titleY, 10.5, navy, true, cW - 9 - 30);
    y += 2;

    // Description — always wrap
    y = txt(rec.descriere, mL + 9, y, 9, gray, false, cW - 9);
    y += 8;
  }

  hLine(y); y += 8;

  // ── CTA BOX ─────────────────────────────────────
  y = pageBreak(y, 32);
  fillRect(mL, y, cW, 30, light, 3);
  y += 8;
  txt('Vrei un plan personalizat de implementare?', mL + 6, y, 10.5, navy, true, cW - 12);
  y += 7;
  txt('Programeaz\u0103 o consulta\u021bie gratuit\u0103 de 30 de minute:', mL + 6, y, 9, gray, false, cW - 12);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(...blue);
  doc.setFont('helvetica', 'normal');
  doc.textWithLink('anadobre.com/servicii#formular', mL + 6, y, { url: 'https://anadobre.com/servicii#formular' });
  y += 12;

  // ── FOOTER ──────────────────────────────────────
  const fY = 289;
  hLine(fY - 4);
  doc.setFontSize(7.5);
  doc.setTextColor(...gray);
  doc.text('\u00a9 2026 Ana Dobre  \u00b7  anadobre.com  \u00b7  hello@anadobre.com', W / 2, fY, { align: 'center' });

  return doc.output('datauristring').split(',')[1];
}
