/**
 * PDF engine for quotations and invoices — `pdf-lib` with the built-in Helvetica
 * faces (no font files to ship, so it runs on Vercel serverless). Documents are
 * A4: dark DWH masthead, client meta, itemised table, VAT block, footer.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { breakdown, rand } from "@/lib/breakdown";

export interface PdfLineItem {
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface PdfPayment {
  paidOn: string;
  method: string;
  reference?: string | null;
  amount: number;
}

export interface PdfDocumentInput {
  kind: "Quotation" | "Invoice";
  reference: string;
  status: string;
  issuedLabel: string;
  issued: string;
  dueLabel?: string;
  due?: string;
  eventName?: string;
  clientName: string;
  clientCompany?: string | null;
  clientEmail?: string;
  items: PdfLineItem[];
  total: number;
  notes?: string[];
  /** Settlement recorded against an invoice — printed under the totals. */
  payments?: PdfPayment[];
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const HEADER_HEIGHT = 96;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const INK = rgb(0.043, 0.106, 0.2); // #0B1B33 deep navy
const TEXT = rgb(0.1, 0.1, 0.11);
const MUTED = rgb(0.45, 0.45, 0.44);
const LINE = rgb(0.86, 0.86, 0.85);
const BAND = rgb(0.98, 0.969, 0.941); // #FAF7F0 ivory
const ACCENT = rgb(0.788, 0.635, 0.294); // #C9A24B gold
const WHITE = rgb(1, 1, 1);

const COL_DESC = MARGIN;
const COL_QTY = MARGIN + 330;
const COL_UNIT = MARGIN + 424;
const COL_AMOUNT = PAGE_WIDTH - MARGIN;
const DESC_WIDTH = COL_QTY - COL_DESC - 16;

const OK = rgb(0.247, 0.682, 0.42); // #3fae6b

function fmtDay(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

/** Helvetica/WinAnsi cannot encode everything — strip the rest before drawing. */
function safe(text: string): string {
  return text.replace(
    /[^\u0020-\u007E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2026]/g,
    ""
  );
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = safe(text).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawRight(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size: number, color = TEXT) {
  page.drawText(safe(text), { x: x - font.widthOfTextAtSize(safe(text), size), y, size, font, color });
}

function masthead(page: PDFPage, input: PdfDocumentInput, fonts: { regular: PDFFont; bold: PDFFont }) {
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - HEADER_HEIGHT, width: PAGE_WIDTH, height: HEADER_HEIGHT, color: INK });
  page.drawText("DWH", {
    x: MARGIN,
    y: PAGE_HEIGHT - 54,
    size: 17,
    font: fonts.bold,
    color: WHITE,
  });
  page.drawText("DIVERSE WORKS HOLDINGS", {
    x: MARGIN,
    y: PAGE_HEIGHT - 70,
    size: 7.5,
    font: fonts.regular,
    color: ACCENT,
  });
  drawRight(page, input.kind.toUpperCase(), PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 54, fonts.bold, 11, ACCENT);
  drawRight(page, input.reference, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 70, fonts.regular, 9.5, WHITE);
}

export async function renderPdf(input: PdfDocumentInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${input.reference} — ${input.kind} — DWH`);
  doc.setAuthor("Diverse Works Holdings");
  doc.setProducer("DWH PDF engine");

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fonts = { regular, bold };

  const total = input.total;
  const sums = breakdown(total, input.items);
  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  masthead(page, input, fonts);

  // ---- meta block -------------------------------------------------------
  let y = PAGE_HEIGHT - HEADER_HEIGHT - 34;
  page.drawText("PREPARED FOR", { x: MARGIN, y, size: 7, font: bold, color: MUTED });
  y -= 15;
  page.drawText(safe(input.clientName), { x: MARGIN, y, size: 11.5, font: bold, color: TEXT });
  y -= 13;
  if (input.clientCompany) {
    page.drawText(safe(input.clientCompany), { x: MARGIN, y, size: 9, font: regular, color: MUTED });
    y -= 12;
  }
  if (input.clientEmail) {
    page.drawText(safe(input.clientEmail), { x: MARGIN, y, size: 9, font: regular, color: MUTED });
  }

  let metaY = PAGE_HEIGHT - HEADER_HEIGHT - 34;
  const meta: [string, string][] = [
    [input.issuedLabel, input.issued],
    ...(input.dueLabel && input.due ? ([[input.dueLabel, input.due]] as [string, string][]) : []),
    ["Status", input.status],
    ...(input.eventName ? ([["Project", input.eventName]] as [string, string][]) : []),
  ];
  for (const [label, value] of meta) {
    drawRight(page, label.toUpperCase(), PAGE_WIDTH - MARGIN, metaY, bold, 7, MUTED);
    drawRight(page, value, PAGE_WIDTH - MARGIN, metaY - 12, regular, 9, TEXT);
    metaY -= 30;
  }

  // ---- table ------------------------------------------------------------
  y = Math.min(y, metaY) - 26;
  page.drawRectangle({
    x: MARGIN,
    y: y - 4,
    width: CONTENT_WIDTH,
    height: 20,
    color: BAND,
  });
  page.drawText("DESCRIPTION", { x: COL_DESC + 6, y: y + 3, size: 7, font: bold, color: MUTED });
  drawRight(page, "QTY", COL_QTY, y + 3, bold, 7, MUTED);
  drawRight(page, "UNIT PRICE", COL_UNIT, y + 3, bold, 7, MUTED);
  drawRight(page, "AMOUNT", COL_AMOUNT, y + 3, bold, 7, MUTED);
  y -= 16;

  const newPage = (): PDFPage => {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    masthead(page, input, fonts);
    y = PAGE_HEIGHT - HEADER_HEIGHT - 34;
    page.drawRectangle({ x: MARGIN, y: y - 4, width: CONTENT_WIDTH, height: 20, color: BAND });
    page.drawText("DESCRIPTION (continued)", { x: COL_DESC + 6, y: y + 3, size: 7, font: bold, color: MUTED });
    drawRight(page, "QTY", COL_QTY, y + 3, bold, 7, MUTED);
    drawRight(page, "UNIT PRICE", COL_UNIT, y + 3, bold, 7, MUTED);
    drawRight(page, "AMOUNT", COL_AMOUNT, y + 3, bold, 7, MUTED);
    y -= 16;
    return page;
  };

  if (input.items.length === 0) {
    page.drawText("Itemised breakdown available on request.", {
      x: COL_DESC + 6,
      y: y - 6,
      size: 9,
      font: regular,
      color: MUTED,
    });
    y -= 26;
  }

  for (const item of input.items) {
    const descLines = wrap(item.description, regular, 9, DESC_WIDTH);
    const rowHeight = Math.max(22, 10 + descLines.length * 11);
    if (y - rowHeight < 140) newPage();

    const top = y;
    let textY = top - 11;
    for (const line of descLines) {
      page.drawText(line, { x: COL_DESC + 6, y: textY, size: 9, font: regular, color: TEXT });
      textY -= 11;
    }
    drawRight(page, String(item.qty), COL_QTY, top - 11, regular, 9, TEXT);
    drawRight(page, rand(item.unitPrice), COL_UNIT, top - 11, regular, 9, TEXT);
    drawRight(page, rand(item.amount), COL_AMOUNT, top - 11, bold, 9, TEXT);

    y -= rowHeight;
    page.drawLine({
      start: { x: MARGIN, y: y + 4 },
      end: { x: PAGE_WIDTH - MARGIN, y: y + 4 },
      thickness: 0.5,
      color: LINE,
    });
    y -= 4;
  }

  // ---- totals -----------------------------------------------------------
  const boxWidth = 250;
  const boxX = PAGE_WIDTH - MARGIN - boxWidth;
  if (y - 110 < 120) newPage();
  let rowY = y - 24;
  page.drawText(`Subtotal (excl. VAT)`, { x: boxX, y: rowY, size: 9, font: regular, color: MUTED });
  drawRight(page, rand(sums.subtotal), PAGE_WIDTH - MARGIN, rowY, regular, 9, TEXT);
  rowY -= 16;
  page.drawText(`VAT @ 15%`, { x: boxX, y: rowY, size: 9, font: regular, color: MUTED });
  drawRight(page, rand(sums.vat), PAGE_WIDTH - MARGIN, rowY, regular, 9, TEXT);
  rowY -= 12;
  page.drawLine({
    start: { x: boxX, y: rowY },
    end: { x: PAGE_WIDTH - MARGIN, y: rowY },
    thickness: 1,
    color: ACCENT,
  });
  rowY -= 20;
  const totalLabel = input.kind === "Quotation" ? "Total (incl. VAT)" : "Amount due (incl. VAT)";
  page.drawText(totalLabel, { x: boxX, y: rowY, size: 11, font: bold, color: TEXT });
  drawRight(page, rand(sums.total), PAGE_WIDTH - MARGIN, rowY, bold, 13, ACCENT);
  y = rowY - 30;

  // ---- settlement -------------------------------------------------------
  const payments = input.payments ?? [];
  if (payments.length > 0) {
    const paid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const balance = Math.max(0, total - paid);
    if (y - (58 + payments.length * 14) < 120) newPage();

    page.drawText("SETTLEMENT", { x: boxX, y: y - 4, size: 7, font: bold, color: MUTED });
    y -= 18;
    for (const payment of payments) {
      const label = `${fmtDay(payment.paidOn)} · ${payment.method}${payment.reference ? ` · ${payment.reference}` : ""}`;
      page.drawText(safe(label), { x: boxX, y: y - 4, size: 8.5, font: regular, color: TEXT });
      drawRight(page, rand(payment.amount), PAGE_WIDTH - MARGIN, y - 4, regular, 8.5, TEXT);
      y -= 14;
    }
    y -= 4;
    page.drawLine({ start: { x: boxX, y: y + 4 }, end: { x: PAGE_WIDTH - MARGIN, y: y + 4 }, thickness: 0.5, color: LINE });
    y -= 16;
    page.drawText("Paid to date", { x: boxX, y: y - 4, size: 9, font: regular, color: MUTED });
    drawRight(page, rand(paid), PAGE_WIDTH - MARGIN, y - 4, regular, 9, TEXT);
    y -= 16;
    page.drawText("Balance due", { x: boxX, y: y - 4, size: 9, font: bold, color: TEXT });
    drawRight(page, rand(balance), PAGE_WIDTH - MARGIN, y - 4, bold, 10, balance <= 0 ? OK : ACCENT);
    y -= 24;
  }

  // ---- notes & footer ---------------------------------------------------
  for (const note of input.notes ?? []) {
    const lines = wrap(note, regular, 8, CONTENT_WIDTH);
    for (const line of lines) {
      if (y < 90) newPage();
      page.drawText(line, { x: MARGIN, y, size: 8, font: regular, color: MUTED });
      y -= 11;
    }
    y -= 4;
  }

  const pageCount = doc.getPageCount();
  for (const [index, target] of doc.getPages().entries()) {
    target.drawLine({
      start: { x: MARGIN, y: 70 },
      end: { x: PAGE_WIDTH - MARGIN, y: 70 },
      thickness: 0.5,
      color: LINE,
    });
    target.drawText("DWH · Growing value across sectors · Prices in ZAR, VAT at 15%.", {
      x: MARGIN,
      y: 56,
      size: 7.5,
      font: regular,
      color: MUTED,
    });
    drawRight(target, `Page ${index + 1} of ${pageCount}`, PAGE_WIDTH - MARGIN, 56, regular, 7.5, MUTED);
  }

  return doc.save();
}
