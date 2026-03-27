import { jsPDF } from 'jspdf';

interface Analysis {
  puncteFortă: string[];
  zoneCritice: string[];
  recomandări: { titlu: string; descriere: string; prioritate: string }[];
  concluzie: string;
}

interface PDFData {
  prenume: string;
  companie: string;
  scor: number;
  nivel: string;
  raspunsuri: number[];
  analysis: Analysis;
}

async function loadFont(doc: jsPDF, url: string, name: string, style: string) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  doc.addFileToVFS(`${name}-${style}.ttf`, b64);
  doc.addFont(`${name}-${style}.ttf`, name, style);
}

export async function generatePDF(data: PDFData): Promise<string> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Roboto suportă diacritice românești: ș ț ă î â
  await loadFont(doc, '/fonts/Roboto-Regular.ttf', 'Roboto', 'normal');
  await loadFont(doc, '/fonts/Roboto-Bold.ttf', 'Roboto', 'bold');
  doc.setFont('Roboto', 'normal');

  const W = 210;
  const mL = 18;
  const mR = 18;
  const cW = W - mL - mR; // 174mm
  let y = 0;

  const navy:  [number,number,number] = [3, 48, 110];
  const blue:  [number,number,number] = [2, 73, 165];
  const amber: [number,number,number] = [201, 136, 12];
  const gray:  [number,number,number] = [74, 85, 104];
  const light: [number,number,number] = [238, 244, 250];
  const green: [number,number,number] = [29, 158, 117];
  const red:   [number,number,number] = [180, 40, 40];
  const white: [number,number,number] = [255, 255, 255];
  const scorColor: [number,number,number] = data.scor <= 5 ? red : data.scor <= 10 ? amber : green;

  function setColor(c: [number,number,number]) { doc.setTextColor(c[0], c[1], c[2]); }
  function setFill(c: [number,number,number])  { doc.setFillColor(c[0], c[1], c[2]); }

  function wtext(text: string, x: number, yy: number, size: number, color: [number,number,number], bold = false, maxW?: number): number {
    doc.setFontSize(size);
    doc.setFont('Roboto', bold ? 'bold' : 'normal');
    setColor(color);
    if (maxW) {
      const lines = doc.splitTextToSize(text, maxW) as string[];
      doc.text(lines, x, yy);
      return yy + lines.length * size * 0.42;
    }
    doc.text(text, x, yy);
    return yy + size * 0.42;
  }

  function hline(yy: number, color: [number,number,number] = [214, 230, 245]) {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.3);
    doc.line(mL, yy, W - mR, yy);
  }

  function rect(x: number, yy: number, w: number, h: number, color: [number,number,number], r = 2) {
    setFill(color);
    doc.roundedRect(x, yy, w, h, r, r, 'F');
  }

  function pageBreak(yy: number, need: number): number {
    if (yy + need > 278) { doc.addPage(); return 18; }
    return yy;
  }

  // ── HEADER ───────────────────────────────────────
  rect(0, 0, W, 30, navy, 0);
  y = 11;
  wtext('Ana Dobre', mL, y, 17, white, true);
  y += 7;
  doc.setFontSize(7.5);
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(150, 190, 230);
  doc.text('STRATEGY  \u2192  AUTOMATION  \u2192  RESULTS', mL, y);

  const bX = W - mR - 26;
  rect(bX, 5, 26, 20, [10, 65, 130], 2);
  doc.setFontSize(15);
  doc.setFont('Roboto', 'bold');
  setColor(scorColor);
  doc.text(`${data.scor}/16`, bX + 13, 16, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(180, 210, 240);
  doc.text('SCOR', bX + 13, 21, { align: 'center' });

  y = 38;

  // ── TITLU ────────────────────────────────────────
  y = wtext('Raport de Maturitate în Automatizări Marketing & Vânzări', mL, y, 13, navy, true, cW);
  y += 3;
  const today = new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
  y = wtext(`Pregătit pentru ${data.prenume} — ${data.companie}  ·  ${today}`, mL, y, 9, gray, false, cW);
  y += 4;
  hline(y); y += 5;

  // ── NIVEL + BAR ───────────────────────────────────
  rect(mL, y, cW, 20, light, 3);
  wtext(`Nivel: ${data.nivel}`, mL + 5, y + 8, 11, scorColor, true);
  doc.setFontSize(9);
  doc.setFont('Roboto', 'normal');
  setColor(gray);
  doc.text(`Scor: ${data.scor} din 16 puncte`, W - mR - 5, y + 8, { align: 'right' });
  const bBarX = mL + 5;
  const bBarW = cW - 10;
  rect(bBarX, y + 13, bBarW, 3, [210, 220, 235], 1);
  rect(bBarX, y + 13, Math.max(2, bBarW * (data.scor / 16)), 3, scorColor, 1);
  y += 26;

  // ── CONCLUZIE ────────────────────────────────────
  y = pageBreak(y, 35);
  y = wtext('Concluzie', mL, y, 12, navy, true);
  y += 4;
  y = wtext(data.analysis.concluzie, mL, y, 9.5, gray, false, cW);
  y += 6;
  hline(y); y += 8;

  // ── PUNCTE FORTE + ZONE CRITICE ──────────────────
  y = pageBreak(y, 55);
  const colW = (cW - 6) / 2;
  const col2X = mL + colW + 6;
  const colTop = y;

  y = wtext('Puncte forte', mL, y, 11, green, true);
  y += 3;
  let yL = y;
  for (const pf of data.analysis.puncteFortă) {
    rect(mL, yL - 1.5, 2.5, 2.5, green, 0);
    yL = wtext(pf, mL + 5, yL, 9, gray, false, colW - 5);
    yL += 4;
  }

  let yR = colTop;
  yR = wtext('Zone critice', col2X, yR, 11, amber, true);
  yR += 3;
  for (const zc of data.analysis.zoneCritice) {
    rect(col2X, yR - 1.5, 2.5, 2.5, amber, 0);
    yR = wtext(zc, col2X + 5, yR, 9, gray, false, colW - 5);
    yR += 4;
  }

  y = Math.max(yL, yR) + 6;
  hline(y); y += 8;

  // ── RECOMANDĂRI ───────────────────────────────────
  y = pageBreak(y, 25);
  y = wtext('Recomandări prioritare', mL, y, 12, navy, true);
  y += 7;

  const pColors: Record<string, [number,number,number]> = {
    'Înaltă': red, 'Medie': amber, 'Scăzută': green,
  };

  for (let i = 0; i < data.analysis.recomandări.length; i++) {
    const rec = data.analysis.recomandări[i];
    y = pageBreak(y, 45);

    rect(mL, y - 4.5, 8, 8, navy, 1);
    doc.setFontSize(10);
    doc.setFont('Roboto', 'bold');
    setColor(white);
    doc.text(`${i + 1}`, mL + 4, y + 0.5, { align: 'center' });

    const pCol = pColors[rec.prioritate] ?? gray;
    doc.setFontSize(8);
    doc.setFont('Roboto', 'normal');
    setColor(pCol);
    doc.text(`Prioritate: ${rec.prioritate}`, W - mR, y - 1, { align: 'right' });

    y = wtext(rec.titlu, mL + 11, y, 10.5, navy, true, cW - 11 - 38);
    y += 2;
    y = wtext(rec.descriere, mL + 11, y, 9, gray, false, cW - 11);
    y += 9;
  }

  hline(y); y += 7;

  // ── CTA BOX ──────────────────────────────────────
  y = pageBreak(y, 32);
  rect(mL, y, cW, 28, light, 3);
  y += 7;
  y = wtext('Vrei un plan personalizat de implementare?', mL + 6, y, 10.5, navy, true, cW - 12);
  y += 5;
  y = wtext('Programează o consultație gratuită de 30 de minute:', mL + 6, y, 9, gray, false, cW - 12);
  y += 5;
  doc.setFontSize(9);
  doc.setFont('Roboto', 'normal');
  setColor(blue);
  doc.textWithLink('anadobre.com/servicii#formular', mL + 6, y, { url: 'https://anadobre.com/servicii#formular' });

  // ── FOOTER ───────────────────────────────────────
  const fY = 290;
  hline(fY - 4);
  doc.setFontSize(7.5);
  doc.setFont('Roboto', 'normal');
  setColor(gray);
  doc.text('\u00A9 2026 Ana Dobre  \u00B7  anadobre.com  \u00B7  hello@anadobre.com', W / 2, fY, { align: 'center' });

  return doc.output('datauristring').split(',')[1];
}
