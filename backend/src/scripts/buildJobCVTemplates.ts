// Generates 3 job-application CV templates with distinct layouts.
// Run: npx ts-node src/scripts/buildJobCVTemplates.ts
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PizZip = require('pizzip');
import fs from 'fs';
import path from 'path';

const BASE_DOCX = path.resolve(__dirname, '../../templates/cv_template.docx');
const OUT_DIR   = path.resolve(__dirname, '../../templates');
const FONT      = 'Calibri';

// Usable page width: A4 (11906) minus 2×1134 twip margins = 9638 twips
const PW = 9638;

// ─── Low-level OOXML helpers ──────────────────────────────────────────────────

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function rPr(o: { b?: boolean; i?: boolean; col?: string; sz?: number; font?: string; lang?: string }) {
  let s = '';
  if (o.font) s += `<w:rFonts w:ascii="${o.font}" w:hAnsi="${o.font}" w:cs="${o.font}"/>`;
  if (o.b)    s += '<w:b/><w:bCs/>';
  if (o.i)    s += '<w:i/><w:iCs/>';
  if (o.col)  s += `<w:color w:val="${o.col}"/>`;
  if (o.sz)   s += `<w:sz w:val="${o.sz}"/><w:szCs w:val="${o.sz}"/>`;
  if (o.lang) s += `<w:lang w:val="${o.lang}"/>`;
  return s ? `<w:rPr>${s}</w:rPr>` : '';
}

type RunOpts = { b?: boolean; i?: boolean; col?: string; sz?: number; font?: string; lang?: string };

function run(text: string, o: RunOpts = {}): string {
  return `<w:r>${rPr(o)}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
}

type ParaOpts = { align?: string; before?: number; after?: number };

function para(content: string, o: ParaOpts = {}): string {
  let pPr = '';
  if (o.align) pPr += `<w:jc w:val="${o.align}"/>`;
  const sp: string[] = [];
  if (o.before != null) sp.push(`w:before="${o.before}"`);
  if (o.after  != null) sp.push(`w:after="${o.after}"`);
  if (sp.length) pPr += `<w:spacing ${sp.join(' ')}/>`;
  return `<w:p>${pPr ? `<w:pPr>${pPr}</w:pPr>` : ''}${content}</w:p>`;
}

const EP = '<w:p/>';   // empty paragraph placeholder (compact)
function ep(o: ParaOpts = {}) { return para('', o); }

// No-border shorthand
const NB = '<w:tcBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/></w:tcBorders>';
function allBorder(color: string) {
  const b = `<w:top w:val="single" w:sz="4" w:color="${color}"/><w:left w:val="single" w:sz="4" w:color="${color}"/><w:bottom w:val="single" w:sz="4" w:color="${color}"/><w:right w:val="single" w:sz="4" w:color="${color}"/>`;
  return `<w:tcBorders>${b}</w:tcBorders>`;
}
function bottomBorder(color: string) {
  return `<w:tcBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="single" w:sz="4" w:color="${color}"/><w:right w:val="nil"/></w:tcBorders>`;
}
function topBorder(color: string) {
  return `<w:tcBorders><w:top w:val="single" w:sz="12" w:color="${color}"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/></w:tcBorders>`;
}

type CellOpts = {
  w?: number; fill?: string; span?: number; vAlign?: string;
  borders?: string; pad?: [number, number, number, number]; // T R B L
};

function cell(content: string, o: CellOpts = ''  as unknown as CellOpts): string {
  let tcPr = '';
  if (o.w    != null) tcPr += `<w:tcW w:w="${o.w}" w:type="dxa"/>`;
  if (o.span && o.span > 1) tcPr += `<w:gridSpan w:val="${o.span}"/>`;
  if (o.fill)  tcPr += `<w:shd w:val="clear" w:color="auto" w:fill="${o.fill}"/>`;
  if (o.borders) tcPr += o.borders;
  if (o.vAlign) tcPr += `<w:vAlign w:val="${o.vAlign}"/>`;
  const [pT=60, pR=108, pB=60, pL=108] = o.pad ?? [60, 108, 60, 108];
  tcPr += `<w:tcMar><w:top w:w="${pT}" w:type="dxa"/><w:left w:w="${pL}" w:type="dxa"/><w:bottom w:w="${pB}" w:type="dxa"/><w:right w:w="${pR}" w:type="dxa"/></w:tcMar>`;
  return `<w:tc>${tcPr ? `<w:tcPr>${tcPr}</w:tcPr>` : ''}${content}</w:tc>`;
}

type RowOpts = { h?: number; exact?: boolean };

function trow(cells: string, o: RowOpts = {}): string {
  const trPr = o.h ? `<w:trPr><w:trHeight w:val="${o.h}"${o.exact ? ' w:hRule="exact"' : ' w:hRule="atLeast"'}/></w:trPr>` : '';
  return `<w:tr>${trPr}${cells}</w:tr>`;
}

type TblOpts = { borders?: 'none' | 'all' | 'innerH'; borderColor?: string };

function tbl(cols: number[], rows: string, o: TblOpts = {}): string {
  const tw = cols.reduce((a, b) => a + b, 0);
  const bc = o.borderColor ?? 'C8D0DC';
  let borders = '';
  if (o.borders === 'none') {
    borders = `<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>`;
  } else if (o.borders === 'all') {
    borders = `<w:tblBorders><w:top w:val="single" w:sz="4" w:color="${bc}"/><w:left w:val="single" w:sz="4" w:color="${bc}"/><w:bottom w:val="single" w:sz="4" w:color="${bc}"/><w:right w:val="single" w:sz="4" w:color="${bc}"/><w:insideH w:val="single" w:sz="4" w:color="${bc}"/><w:insideV w:val="single" w:sz="4" w:color="${bc}"/></w:tblBorders>`;
  } else if (o.borders === 'innerH') {
    borders = `<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="single" w:sz="4" w:color="${bc}"/><w:insideV w:val="nil"/></w:tblBorders>`;
  }
  const grid = cols.map(w => `<w:gridCol w:w="${w}"/>`).join('');
  return `<w:tbl><w:tblPr><w:tblW w:w="${tw}" w:type="dxa"/>${borders}<w:tblLook w:val="04A0"/></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${rows}</w:tbl>`;
}

// Conditional tag paragraph (paragraphLoop paragraph-level conditional)
function cond(tag: string): string {
  return para(run(tag, { sz: 2, col: 'FFFFFF', font: FONT }), { before: 0, after: 0 });
}

// Document wrapper with full A4 sectPr
function doc(body: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:aink="http://schemas.microsoft.com/office/drawing/2016/ink" xmlns:am3d="http://schemas.microsoft.com/office/drawing/2017/model3d" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:oel="http://schemas.microsoft.com/office/2019/extlst" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:w16cex="http://schemas.microsoft.com/office/word/2018/wordml/cex" xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid" xmlns:w16="http://schemas.microsoft.com/office/word/2018/wordml" xmlns:w16sdtdh="http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash" xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh wp14">
<w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`;
}

// ─── Reusable section building ────────────────────────────────────────────────

// A section header row spanning all columns (colored bg, white bold text)
function sectionHeaderRow(text: string, cols: number[], fill: string): string {
  const totalW = cols.reduce((a, b) => a + b, 0);
  return trow(
    cell(
      para(run(text, { b: true, col: 'FFFFFF', sz: 20, font: FONT, lang: 'el-GR' }), { before: 80, after: 80 }),
      { w: totalW, span: cols.length, fill, borders: NB, vAlign: 'center', pad: [60, 160, 60, 160] },
    ),
    { h: 440 },
  );
}

// A column-header row with a light tint
function colHeaderRow(headers: string[], cols: number[], fill: string): string {
  return trow(
    headers.map((h, i) =>
      cell(
        para(run(h, { b: true, sz: 16, font: FONT, lang: 'el-GR' }), { before: 50, after: 50 }),
        { w: cols[i], fill, borders: NB },
      ),
    ).join(''),
  );
}

// A data-row template with {#loop}...{/loop} tags
function dataRow(loopName: string, phs: string[], cols: number[], sz = 16): string {
  const cells = phs.map((ph, i) => {
    let text = ph;
    if (i === 0)              text = `{#${loopName}}${ph}`;
    if (i === phs.length - 1) text = `${ph}{/${loopName}}`;
    return cell(
      para(run(text, { sz, font: FONT, lang: 'el-GR' }), { before: 50, after: 50 }),
      { w: cols[i], borders: NB },
    );
  }).join('');
  return trow(cells);
}

// ─── LAYOUT 1 · Classic Professional (Navy) ───────────────────────────────────
//  • Centered full-width colored banner
//  • Grid-based personal info (4 columns)
//  • Bordered tables with column sub-headers
// ─────────────────────────────────────────────────────────────────────────────
function buildClassic(hc: string, ct: string): string {
  // Column layouts
  const EDU  = [3300, 2350, 2350, 1638];    // education 4-col
  const EXP  = [3100, 2200, 2700, 1638];    // experience 4-col
  const LANG = [3200, 3200, 3238];           // languages 3-col
  const PERS = [1460, 3359, 1460, 3359];    // personal info 4-col

  // Header banner
  const banner = tbl([PW],
    trow(
      cell(
        para(run('{firstName} {lastName}', { b: true, col: 'FFFFFF', sz: 48, font: FONT }), { align: 'center', before: 200, after: 60 }) +
        para(run('ΒΙΟΓΡΑΦΙΚΟ ΣΗΜΕΙΩΜΑ', { col: 'B8C8E8', sz: 18, font: FONT }), { align: 'center', before: 0, after: 200 }),
        { w: PW, fill: hc, borders: NB, vAlign: 'center' },
      ),
      { h: 1600 },
    ),
    { borders: 'none' },
  );

  // Personal info
  const L = PERS[0], V = PERS[1];
  const lbl = (t: string) => para(run(t + ':', { b: true, sz: 18, font: FONT }), { before: 60, after: 60 });
  const val = (ph: string) => para(run(ph, { sz: 18, font: FONT }), { before: 60, after: 60 });

  const personalTable = tbl(PERS,
    trow(cell(lbl('Επώνυμο'), { w: L, borders: NB }) + cell(val('{lastName}'),   { w: V, borders: NB }) + cell(lbl('Όνομα'),     { w: L, borders: NB }) + cell(val('{firstName}'),  { w: V, borders: NB })) +
    trow(cell(lbl('Πατρώνυμο'),   { w: L, borders: NB }) + cell(val('{fatherName}'),  { w: V, borders: NB }) + cell(lbl('Μητρώνυμο'),  { w: L, borders: NB }) + cell(val('{motherName}'),  { w: V, borders: NB })) +
    trow(cell(lbl('Ημ. Γέννησης'), { w: L, borders: NB }) + cell(val('{dateOfBirth}'), { w: V, borders: NB }) + cell(lbl('Τόπος Γέν.'),  { w: L, borders: NB }) + cell(val('{placeOfBirth}'), { w: V, borders: NB })) +
    trow(cell(lbl('Τηλέφωνο'),    { w: L, borders: NB }) + cell(val('{phone}'),       { w: V, borders: NB }) + cell(lbl('Email'),       { w: L, borders: NB }) + cell(val('{email}'),       { w: V, borders: NB })) +
    trow(cell(lbl('Διεύθυνση'),   { w: L, borders: NB }) + cell(val('{homeAddress}'),  { w: PW - L, span: 3, borders: NB })),
    { borders: 'none' },
  );

  // Education
  const eduTbl = tbl(EDU,
    sectionHeaderRow('ΕΚΠΑΙΔΕΥΣΗ', EDU, hc) +
    colHeaderRow(['Ίδρυμα / Σχολή', 'Τίτλος Πτυχίου', 'Ειδικότητα', 'Ημερομηνία'], EDU, ct) +
    dataRow('educationOnlyRows', ['{institutionFull}', '{degreeTitle}', '{specialization}', '{dateAwarded}'], EDU),
    { borders: 'all' },
  );

  // Experience
  const expTbl = tbl(EXP,
    sectionHeaderRow('ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ', EXP, hc) +
    colHeaderRow(['Έργο / Θέση', 'Εργοδότης', 'Ρόλος', 'Περίοδος'], EXP, ct) +
    dataRow('experienceRows', ['{projectText}', '{employerName}', '{roleName}', '{period}'], EXP),
    { borders: 'all' },
  );

  // Languages
  const langTbl = tbl(LANG,
    sectionHeaderRow('ΓΛΩΣΣΕΣ', LANG, hc) +
    colHeaderRow(['Γλώσσα', 'Τίτλος / Πιστοποιητικό', 'Επίπεδο'], LANG, ct) +
    dataRow('languageRows', ['{language}', '{degreeTitle}', '{level}'], LANG),
    { borders: 'all' },
  );

  // Publications
  const pubTbl = tbl([PW],
    sectionHeaderRow('ΔΗΜΟΣΙΕΥΣΕΙΣ', [PW], hc) +
    trow(cell(para(run('{#publicationRows}{publicationText}{/publicationRows}', { sz: 18, font: FONT }), { before: 60, after: 60 }), { w: PW, borders: NB })),
    { borders: 'all' },
  );

  const body =
    banner +
    ep({ before: 100, after: 0 }) +
    personalTable +
    ep({ before: 100, after: 0 }) +
    eduTbl +
    ep({ before: 100, after: 0 }) +
    expTbl +
    ep({ before: 100, after: 0 }) +
    cond('{#hasLanguages}') +
    langTbl +
    ep({ before: 100, after: 0 }) +
    cond('{/hasLanguages}') +
    cond('{#hasPublications}') +
    pubTbl +
    ep({ before: 100, after: 0 }) +
    cond('{/hasPublications}');

  return doc(body);
}

// ─── LAYOUT 2 · Two-Column Sidebar (Indigo) ───────────────────────────────────
//  • Fixed colored left sidebar: name, contact, personal details, languages
//  • Right content area: education, experience, publications
//  • Sidebar spans full document height
// ─────────────────────────────────────────────────────────────────────────────
function buildSidebar(hc: string, ct: string): string {
  const SB = 2760;          // sidebar width
  const MC = PW - SB;       // main content width = 6878

  // Inner table column layouts (relative to MC)
  const EDU  = [Math.round(MC * 0.4), Math.round(MC * 0.35), Math.round(MC - Math.round(MC * 0.4) - Math.round(MC * 0.35))]; // 3-col
  const EXP  = [Math.round(MC * 0.35), Math.round(MC * 0.28), Math.round(MC * 0.2), MC - Math.round(MC * 0.35) - Math.round(MC * 0.28) - Math.round(MC * 0.2)]; // 4-col
  const LANG_SB = [Math.round(SB * 0.55), SB - Math.round(SB * 0.55)]; // 2-col inside sidebar

  // Sidebar label helper
  const sl = (t: string) => para(run(t, { b: true, col: 'C8D4F0', sz: 16, font: FONT }), { before: 40, after: 20 });
  const sv = (ph: string) => para(run(ph, { col: 'FFFFFF', sz: 18, font: FONT }), { before: 0, after: 40 });
  const sh = (t: string)  => para(run(t, { b: true, col: 'FFFFFF', sz: 18, font: FONT }), { before: 120, after: 40 });

  // Left sidebar content (inner table of labels/values)
  const sbInfo = tbl([SB],
    // Name block
    trow(cell(
      para(run('{firstName} {lastName}', { b: true, col: 'FFFFFF', sz: 36, font: FONT }), { before: 160, after: 60 }) +
      para(run('ΒΙΟΓΡΑΦΙΚΟ ΣΗΜΕΙΩΜΑ', { col: 'B0BFDF', sz: 16, font: FONT }), { before: 0, after: 160 }),
      { w: SB, fill: hc, borders: NB, pad: [0, 160, 0, 160] },
    )) +
    // Contact section header
    trow(cell(sh('ΕΠΙΚΟΙΝΩΝΙΑ') + sl('Τηλέφωνο') + sv('{phone}') + sl('Email') + sv('{email}') + sl('Διεύθυνση') + sv('{homeAddress}'),
      { w: SB, fill: hc, borders: NB, pad: [0, 160, 0, 160] })) +
    // Personal details header
    trow(cell(sh('ΠΡΟΣΩΠΙΚΑ ΣΤΟΙΧΕΙΑ') + sl('Πατρώνυμο') + sv('{fatherName}') + sl('Μητρώνυμο') + sv('{motherName}') + sl('Ημ. Γέννησης') + sv('{dateOfBirth}') + sl('Τόπος Γέν.') + sv('{placeOfBirth}'),
      { w: SB, fill: hc, borders: NB, pad: [0, 160, 0, 160] })),
    { borders: 'none' },
  );

  // Languages inside sidebar (nested 2-col table with loop)
  const sbLangTbl = tbl(LANG_SB,
    // Header row (full span)
    trow(cell(para(run('ΓΛΩΣΣΕΣ', { b: true, col: 'FFFFFF', sz: 18, font: FONT }), { before: 80, after: 80 }),
      { w: SB, span: 2, fill: hc, borders: NB, pad: [40, 160, 40, 160] })) +
    // Column headers
    trow(
      cell(para(run('Γλώσσα', { b: true, col: 'B0BFDF', sz: 16, font: FONT }), { before: 30, after: 30 }), { w: LANG_SB[0], fill: hc, borders: NB, pad: [0, 80, 0, 160] }) +
      cell(para(run('Επίπεδο', { b: true, col: 'B0BFDF', sz: 16, font: FONT }), { before: 30, after: 30 }), { w: LANG_SB[1], fill: hc, borders: NB, pad: [0, 80, 0, 80] }),
    ) +
    // Data rows
    trow(
      cell(para(run('{#languageRows}{language}', { col: 'FFFFFF', sz: 16, font: FONT }), { before: 40, after: 40 }), { w: LANG_SB[0], fill: hc, borders: NB, pad: [0, 80, 0, 160] }) +
      cell(para(run('{level}{/languageRows}', { col: 'FFFFFF', sz: 16, font: FONT }), { before: 40, after: 40 }), { w: LANG_SB[1], fill: hc, borders: NB, pad: [0, 80, 0, 80] }),
    ),
    { borders: 'none' },
  );

  // Sidebar column (full height filler at bottom)
  const sidebarContent = sbInfo + cond('{#hasLanguages}') + ep({ before: 0, after: 0 }) + sbLangTbl + cond('{/hasLanguages}');

  // Right content: education table
  const eduTbl = tbl(EDU,
    sectionHeaderRow('ΕΚΠΑΙΔΕΥΣΗ', EDU, hc) +
    colHeaderRow(['Ίδρυμα / Σχολή', 'Τίτλος Πτυχίου', 'Ειδικότητα'], EDU, ct) +
    dataRow('educationOnlyRows', ['{institutionFull}', '{degreeTitle}', '{specialization} {dateAwarded}'], EDU),
    { borders: 'all' },
  );

  // Right content: experience table
  const expTbl = tbl(EXP,
    sectionHeaderRow('ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ', EXP, hc) +
    colHeaderRow(['Έργο / Θέση', 'Εργοδότης', 'Ρόλος', 'Περίοδος'], EXP, ct) +
    dataRow('experienceRows', ['{projectText}', '{employerName}', '{roleName}', '{period}'], EXP),
    { borders: 'all' },
  );

  // Right content: publications
  const pubTbl = tbl([MC],
    sectionHeaderRow('ΔΗΜΟΣΙΕΥΣΕΙΣ', [MC], hc) +
    trow(cell(para(run('{#publicationRows}{publicationText}{/publicationRows}', { sz: 18, font: FONT }), { before: 60, after: 60 }), { w: MC, borders: NB })),
    { borders: 'all' },
  );

  const mainContent =
    eduTbl +
    ep({ before: 80, after: 0 }) +
    expTbl +
    ep({ before: 80, after: 0 }) +
    cond('{#hasPublications}') +
    pubTbl +
    ep({ before: 80, after: 0 }) +
    cond('{/hasPublications}');

  // Outer 2-column table
  const outer = tbl([SB, MC],
    trow(
      cell(sidebarContent, { w: SB, fill: hc, borders: NB, vAlign: 'top', pad: [0, 0, 0, 0] }) +
      cell(mainContent,    { w: MC, borders: NB, vAlign: 'top', pad: [0, 108, 0, 160] }),
    ),
    { borders: 'none' },
  );

  return doc(outer);
}

// ─── LAYOUT 3 · Clean Minimal (Teal) ──────────────────────────────────────────
//  • Split header row: large name (left) | contact info (right)
//  • No table borders — sections separated by colored top-accent rule
//  • Compact personal info strip
//  • Borderless data tables with subtle inner-H lines
// ─────────────────────────────────────────────────────────────────────────────
function buildClean(hc: string, _ct: string): string {
  // Column layouts (no borders — inner-H only)
  const EDU  = [3300, 2350, 2350, 1638];
  const EXP  = [3100, 2200, 2700, 1638];
  const LANG = [3200, 3200, 3238];

  const HW = Math.round(PW * 0.55);  // header name cell width
  const CW = PW - HW;                // header contact cell width

  // Header: 2-column table — name left | contact right
  const headerTbl = tbl([HW, CW],
    trow(
      cell(
        para(run('{firstName} {lastName}', { b: true, col: hc, sz: 52, font: FONT }), { before: 80, after: 20 }) +
        para(run('ΒΙΟΓΡΑΦΙΚΟ ΣΗΜΕΙΩΜΑ', { col: '888888', sz: 16, i: true, font: FONT }), { before: 0, after: 80 }),
        { w: HW, borders: NB, vAlign: 'bottom' },
      ) +
      cell(
        para(run('{email}', { col: '444444', sz: 16, font: FONT }), { align: 'right', before: 80, after: 30 }) +
        para(run('{phone}', { col: '444444', sz: 16, font: FONT }), { align: 'right', before: 0, after: 30 }) +
        para(run('{homeAddress}', { col: '888888', sz: 14, font: FONT }), { align: 'right', before: 0, after: 80 }),
        { w: CW, borders: NB, vAlign: 'bottom' },
      ),
    ),
    { borders: 'none' },
  );

  // Colored top-rule divider
  const divider = tbl([PW],
    trow(cell(EP, { w: PW, fill: hc, borders: NB, pad: [3, 0, 3, 0] }), { h: 60, exact: true }),
    { borders: 'none' },
  );

  // Personal info strip: 3 cells separated by color
  const PERS3 = [Math.round(PW / 3), Math.round(PW / 3), PW - 2 * Math.round(PW / 3)];
  const pv = (lbl: string, ph: string) =>
    para(run(lbl + ': ', { b: true, col: hc, sz: 16, font: FONT }) + run(ph, { sz: 16, font: FONT, col: '333333' }), { before: 50, after: 50 });

  const personalTbl = tbl(PERS3,
    trow(
      cell(pv('Πατρώνυμο', '{fatherName}') + pv('Μητρώνυμο', '{motherName}'), { w: PERS3[0], borders: NB }) +
      cell(pv('Ημ. Γέννησης', '{dateOfBirth}') + pv('Τόπος Γέν.', '{placeOfBirth}'), { w: PERS3[1], borders: NB }) +
      cell(pv('Επώνυμο', '{lastName}') + pv('Όνομα', '{firstName}'), { w: PERS3[2], borders: NB }),
    ),
    { borders: 'none' },
  );

  // Section heading (not a table row — a standalone paragraph with color)
  function secHeading(text: string): string {
    return para(
      run(text, { b: true, col: hc, sz: 22, font: FONT, lang: 'el-GR' }),
      { before: 120, after: 60 },
    );
  }

  // Column label row (no fill, just bold text, bottom border)
  function colLabelRow(headers: string[], cols: number[]): string {
    return trow(
      headers.map((h, i) =>
        cell(
          para(run(h, { b: true, sz: 16, col: '555555', font: FONT, lang: 'el-GR' }), { before: 40, after: 40 }),
          { w: cols[i], borders: bottomBorder(hc) },
        ),
      ).join(''),
    );
  }

  const eduTbl = tbl(EDU,
    colLabelRow(['Ίδρυμα / Σχολή', 'Τίτλος Πτυχίου', 'Ειδικότητα', 'Ημερομηνία'], EDU) +
    dataRow('educationOnlyRows', ['{institutionFull}', '{degreeTitle}', '{specialization}', '{dateAwarded}'], EDU, 18),
    { borders: 'innerH', borderColor: 'E8EBEF' },
  );

  const expTbl = tbl(EXP,
    colLabelRow(['Έργο / Θέση', 'Εργοδότης', 'Ρόλος', 'Περίοδος'], EXP) +
    dataRow('experienceRows', ['{projectText}', '{employerName}', '{roleName}', '{period}'], EXP, 18),
    { borders: 'innerH', borderColor: 'E8EBEF' },
  );

  const langTbl = tbl(LANG,
    colLabelRow(['Γλώσσα', 'Τίτλος / Πιστοποιητικό', 'Επίπεδο'], LANG) +
    dataRow('languageRows', ['{language}', '{degreeTitle}', '{level}'], LANG, 18),
    { borders: 'innerH', borderColor: 'E8EBEF' },
  );

  const pubTbl = tbl([PW],
    trow(cell(
      para(run('{#publicationRows}{publicationText}{/publicationRows}', { sz: 18, font: FONT }), { before: 50, after: 50 }),
      { w: PW, borders: NB },
    )),
    { borders: 'none' },
  );

  const body =
    headerTbl +
    divider +
    personalTbl +
    divider +
    secHeading('ΕΚΠΑΙΔΕΥΣΗ') +
    eduTbl +
    secHeading('ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ') +
    expTbl +
    cond('{#hasLanguages}') +
    secHeading('ΓΛΩΣΣΕΣ') +
    langTbl +
    cond('{/hasLanguages}') +
    cond('{#hasPublications}') +
    secHeading('ΔΗΜΟΣΙΕΥΣΕΙΣ') +
    pubTbl +
    cond('{/hasPublications}');

  return doc(body);
}

// ─── Generate all 3 templates ─────────────────────────────────────────────────

const baseContent  = fs.readFileSync(BASE_DOCX, 'binary');

const LAYOUTS = [
  { name: 'navy',   hc: '1B2A4A', ct: 'D0D8EE', builder: buildClassic },
  { name: 'indigo', hc: '2D2170', ct: 'D5D2F0', builder: buildSidebar },
  { name: 'teal',   hc: '0A5260', ct: 'C8E3E7', builder: buildClean   },
] as const;

for (const { name, hc, ct, builder } of LAYOUTS) {
  const docXml = builder(hc, ct);

  const zip = new PizZip(baseContent);
  zip.file('word/document.xml', docXml);
  const buf: Buffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });

  const outPath = path.join(OUT_DIR, `cv_job_${name}_placeholders.docx`);
  fs.writeFileSync(outPath, buf);

  // Sanity check
  const verify = new PizZip(buf.toString('binary')).files['word/document.xml'].asText();
  const checks: Record<string, boolean> = {
    hasFirstName:       verify.includes('{firstName}'),
    hasLastName:        verify.includes('{lastName}'),
    hasEduLoop:         verify.includes('{#educationOnlyRows}'),
    hasExpLoop:         verify.includes('{#experienceRows}'),
    hasLangLoop:        verify.includes('{#languageRows}'),
    hasPubCond:         verify.includes('{#hasPublications}'),
    hasLangCond:        verify.includes('{#hasLanguages}'),
  };
  const ok = Object.values(checks).every(Boolean);
  console.log(`cv_job_${name}_placeholders.docx  [${ok ? 'OK' : 'FAIL'}]`);
  if (!ok) Object.entries(checks).filter(([, v]) => !v).forEach(([k]) => console.log(`  MISSING: ${k}`));
}
