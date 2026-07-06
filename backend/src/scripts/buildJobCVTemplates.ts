// Generates 3 modern job-application CV templates (no experience section).
// Run: npx ts-node src/scripts/buildJobCVTemplates.ts
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PizZip = require('pizzip');
import fs from 'fs';
import path from 'path';

const BASE_DOCX = path.resolve(__dirname, '../../templates/cv_template.docx');
const OUT_DIR   = path.resolve(__dirname, '../../templates');
const FONT      = 'Calibri';

// A4 with 2cm margins: usable page = 9638 twips
const PW = 9638;

// Photo drawing (rId_employee_photo is injected at runtime by cvService)
// 3.2cm × 4cm portrait:  cx=1152000 EMU, cy=1440000 EMU
const PHOTO_RID = 'rId_employee_photo';
const PHOTO_W   = 1152000;   // 3.2 cm in EMU (1 cm = 360000 EMU)
const PHOTO_H   = 1440000;   // 4.0 cm in EMU

// ─── Core OOXML helpers ──────────────────────────────────────────────────────

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

type RO = { b?: boolean; i?: boolean; col?: string; sz?: number; font?: string; lang?: string };

function rp(o: RO) {
  let s = '';
  if (o.font) s += `<w:rFonts w:ascii="${o.font}" w:hAnsi="${o.font}" w:cs="${o.font}"/>`;
  if (o.b)    s += '<w:b/><w:bCs/>';
  if (o.i)    s += '<w:i/><w:iCs/>';
  if (o.col)  s += `<w:color w:val="${o.col}"/>`;
  if (o.sz)   s += `<w:sz w:val="${o.sz}"/><w:szCs w:val="${o.sz}"/>`;
  if (o.lang) s += `<w:lang w:val="${o.lang}"/>`;
  return s ? `<w:rPr>${s}</w:rPr>` : '';
}

function run(text: string, o: RO = {}): string {
  return `<w:r>${rp(o)}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
}

type PO = { align?: string; before?: number; after?: number };

function para(content: string, o: PO = {}): string {
  let pPr = '';
  if (o.align) pPr += `<w:jc w:val="${o.align}"/>`;
  const sp: string[] = [];
  if (o.before != null) sp.push(`w:before="${o.before}"`);
  if (o.after  != null) sp.push(`w:after="${o.after}"`);
  if (sp.length) pPr += `<w:spacing ${sp.join(' ')}/>`;
  return `<w:p>${pPr ? `<w:pPr>${pPr}</w:pPr>` : ''}${content}</w:p>`;
}

const EP = '<w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>';

// Inline border helpers (return tcBorders XML)
const NB = '<w:tcBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/></w:tcBorders>';
function bbot(col: string, sz = 4) { return `<w:tcBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="single" w:sz="${sz}" w:space="0" w:color="${col}"/><w:right w:val="nil"/></w:tcBorders>`; }

type CO = { w?: number; fill?: string; span?: number; vAlign?: string; borders?: string; pad?: [number,number,number,number] };

function cell(content: string, o: CO = {}): string {
  let p = '';
  if (o.w    != null) p += `<w:tcW w:w="${o.w}" w:type="dxa"/>`;
  if (o.span && o.span > 1) p += `<w:gridSpan w:val="${o.span}"/>`;
  if (o.fill)   p += `<w:shd w:val="clear" w:color="auto" w:fill="${o.fill}"/>`;
  if (o.borders) p += o.borders;
  if (o.vAlign)  p += `<w:vAlign w:val="${o.vAlign}"/>`;
  const [pT=60, pR=108, pB=60, pL=108] = o.pad ?? [60, 108, 60, 108];
  p += `<w:tcMar><w:top w:w="${pT}" w:type="dxa"/><w:left w:w="${pL}" w:type="dxa"/><w:bottom w:w="${pB}" w:type="dxa"/><w:right w:w="${pR}" w:type="dxa"/></w:tcMar>`;
  return `<w:tc><w:tcPr>${p}</w:tcPr>${content}</w:tc>`;
}

function trow(cells: string, h?: number): string {
  const trPr = h ? `<w:trPr><w:trHeight w:val="${h}" w:hRule="atLeast"/></w:trPr>` : '';
  return `<w:tr>${trPr}${cells}</w:tr>`;
}

type TO = { borders?: 'none' | 'all'; bc?: string };

function tbl(cols: number[], rows: string, o: TO = {}): string {
  const w = cols.reduce((a, b) => a + b, 0);
  const bc = o.bc ?? 'D0D5DD';
  let bdr = '';
  if (o.borders === 'none') {
    bdr = `<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>`;
  } else if (o.borders === 'all') {
    bdr = `<w:tblBorders><w:top w:val="single" w:sz="4" w:color="${bc}"/><w:left w:val="single" w:sz="4" w:color="${bc}"/><w:bottom w:val="single" w:sz="4" w:color="${bc}"/><w:right w:val="single" w:sz="4" w:color="${bc}"/><w:insideH w:val="single" w:sz="4" w:color="${bc}"/><w:insideV w:val="single" w:sz="4" w:color="${bc}"/></w:tblBorders>`;
  }
  const grid = cols.map(c => `<w:gridCol w:w="${c}"/>`).join('');
  return `<w:tbl><w:tblPr><w:tblW w:w="${w}" w:type="dxa"/>${bdr}<w:tblLook w:val="04A0"/></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${rows}</w:tbl>`;
}

// Invisible conditional tag (consumed by docxtemplater, leaves no visible output)
function cond(tag: string): string {
  return `<w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:rPr><w:color w:val="FFFFFF"/><w:sz w:val="2"/><w:szCs w:val="2"/></w:rPr><w:t>${tag}</w:t></w:r></w:p>`;
}

// Paragraph with bottom border = section title underline
function titleRule(text: string, col: string, sz = 26, before = 180, after = 80): string {
  return `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="${col}"/></w:pBdr><w:spacing w:before="${before}" w:after="${after}"/></w:pPr><w:r>${rp({b:true, col, sz, font:FONT, lang:'el-GR'})}<w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`;
}

// Paragraph with thick left border = section accent bar
function titleBar(text: string, col: string, sz = 26, before = 180, after = 80): string {
  return `<w:p><w:pPr><w:pBdr><w:left w:val="single" w:sz="28" w:space="8" w:color="${col}"/></w:pBdr><w:ind w:left="220"/><w:spacing w:before="${before}" w:after="${after}"/></w:pPr><w:r>${rp({b:true, col, sz, font:FONT, lang:'el-GR'})}<w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`;
}

// Photo drawing XML (rId injected at render time by cvService)
function photoDraw(w = PHOTO_W, h = PHOTO_H): string {
  return `<w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${w}" cy="${h}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="1" name="EmployeePhoto"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="EmployeePhoto"/><pic:cNvPicPr><a:picLocks noChangeAspect="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="${PHOTO_RID}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing>`;
}

// Photo cell paragraph
function photoP(align = 'center', w = PHOTO_W, h = PHOTO_H): string {
  return `<w:p><w:pPr><w:jc w:val="${align}"/><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:rPr/>${photoDraw(w, h)}</w:r></w:p>`;
}

// Document wrapper with A4 sectPr + full namespace set
function doc(body: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:aink="http://schemas.microsoft.com/office/drawing/2016/ink" xmlns:am3d="http://schemas.microsoft.com/office/drawing/2017/model3d" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:oel="http://schemas.microsoft.com/office/2019/extlst" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:w16cex="http://schemas.microsoft.com/office/word/2018/wordml/cex" xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid" xmlns:w16="http://schemas.microsoft.com/office/word/2018/wordml" xmlns:w16sdtdh="http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash" xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh wp14">
<w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`;
}

// ─── Data table helpers ──────────────────────────────────────────────────────

const ROW_BORDER = 'E8ECF0'; // subtle row separator color

function colHeaderRow(headers: string[], cols: number[], col: string): string {
  const B = bbot(col, 8); // thick bottom border under headers
  return trow(headers.map((h, i) =>
    cell(para(run(h, {b: true, sz: 18, col, font: FONT, lang: 'el-GR'}), {before: 60, after: 60}), {w: cols[i], borders: B})
  ).join(''));
}

function dataRow(loopName: string, phs: string[], cols: number[]): string {
  const B = bbot(ROW_BORDER);
  const cells = phs.map((ph, i) => {
    let text = ph;
    if (i === 0)              text = `{#${loopName}}${ph}`;
    if (i === phs.length - 1) text = `${ph}{/${loopName}}`;
    return cell(para(run(text, {sz: 20, font: FONT, lang: 'el-GR', col: '2D3748'}), {before: 70, after: 70}), {w: cols[i], borders: B});
  }).join('');
  return trow(cells);
}

// ─── Layout 1: CONTEMPORARY ──────────────────────────────────────────────────
//  Photo (left) | Name / Contact (right) header
//  Section titles: bold colored text with colored bottom rule
//  Data: no table borders, subtle gray horizontal row separators
// ─────────────────────────────────────────────────────────────────────────────
function buildContemporary(hc: string): string {
  // Photo cell: ~3.3cm wide
  const PCW = 1870;               // photo cell width in twips (~3.3 cm)
  const ICW = PW - PCW;           // info cell

  // Header table: photo | info
  const infoContent =
    para(run('{firstName} {lastName}', {b: true, col: hc, sz: 52, font: FONT}), {before: 100, after: 30}) +
    para(run('ΒΙΟΓΡΑΦΙΚΟ ΣΗΜΕΙΩΜΑ', {i: true, col: '888888', sz: 16, font: FONT}), {before: 0, after: 60}) +
    para(
      run('{email}', {col: '444444', sz: 18, font: FONT}) +
      run('   ·   ', {col: 'AAAAAA', sz: 18, font: FONT}) +
      run('{phone}', {col: '444444', sz: 18, font: FONT}),
      {before: 0, after: 20},
    ) +
    para(run('{homeAddress}', {col: '666666', sz: 18, font: FONT}), {before: 0, after: 20}) +
    para(
      run('{dateOfBirth}', {col: '888888', sz: 16, font: FONT}) +
      run('   ·   ', {col: 'CCCCCC', sz: 16, font: FONT}) +
      run('{placeOfBirth}', {col: '888888', sz: 16, font: FONT}),
      {before: 0, after: 20},
    ) +
    para(
      run('Πατρώνυμο: ', {b: true, col: '777777', sz: 16, font: FONT}) +
      run('{fatherName}', {col: '555555', sz: 16, font: FONT}) +
      run('   Μητρώνυμο: ', {b: true, col: '777777', sz: 16, font: FONT}) +
      run('{motherName}', {col: '555555', sz: 16, font: FONT}),
      {before: 0, after: 100},
    );

  const headerTbl = tbl([PCW, ICW],
    trow(
      cell(photoP('center'), {w: PCW, borders: NB, vAlign: 'center', pad: [0, 120, 0, 0]}) +
      cell(infoContent,      {w: ICW, borders: NB, vAlign: 'center', pad: [80, 0, 60, 120]}),
      1700,
    ),
    {borders: 'none'},
  );

  // Education
  const EC = [3400, 2400, 2300, 1538];
  const eduTbl = tbl(EC,
    colHeaderRow(['Ίδρυμα / Σχολή', 'Τίτλος Πτυχίου', 'Ειδικότητα', 'Ημερομηνία'], EC, hc) +
    dataRow('educationOnlyRows', ['{institutionFull}', '{degreeTitle}', '{specialization}', '{dateAwarded}'], EC),
    {borders: 'none'},
  );

  // Languages
  const LC = [3200, 3200, 3238];
  const langTbl = tbl(LC,
    colHeaderRow(['Γλώσσα', 'Τίτλος / Πιστοποιητικό', 'Επίπεδο'], LC, hc) +
    dataRow('languageRows', ['{language}', '{degreeTitle}', '{level}'], LC),
    {borders: 'none'},
  );

  // Publications
  const pubTbl = tbl([PW],
    trow(cell(
      para(run('{#publicationRows}{publicationText}{/publicationRows}', {sz: 20, font: FONT, col: '2D3748'}), {before: 70, after: 70}),
      {w: PW, borders: bbot(ROW_BORDER)},
    )),
    {borders: 'none'},
  );

  const body =
    headerTbl +
    // Strong colored divider below header
    `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="12" w:space="1" w:color="${hc}"/></w:pBdr><w:spacing w:before="80" w:after="80"/></w:pPr></w:p>` +
    titleRule('ΕΚΠΑΙΔΕΥΣΗ', hc) +
    eduTbl +
    cond('{#hasLanguages}') +
    titleRule('ΓΛΩΣΣΕΣ', hc) +
    langTbl +
    cond('{/hasLanguages}') +
    cond('{#hasPublications}') +
    titleRule('ΔΗΜΟΣΙΕΥΣΕΙΣ', hc) +
    pubTbl +
    cond('{/hasPublications}');

  return doc(body);
}

// ─── Layout 2: SIDEBAR ───────────────────────────────────────────────────────
//  Left sidebar (colored): photo, name, contact, personal details, languages
//  Right column (white): education, publications
//  The most visually distinctive of the 3 layouts
// ─────────────────────────────────────────────────────────────────────────────
function buildSidebar(hc: string): string {
  const SBW = 2900;           // sidebar width in twips
  const MCW = PW - SBW;      // main content width = 6738

  // Sidebar label / value helpers
  const slbl = (t: string) => para(run(t, {b: true, col: 'B0BFDF', sz: 16, font: FONT}), {before: 40, after: 10});
  const sval = (ph: string) => para(run(ph, {col: 'FFFFFF', sz: 18, font: FONT}), {before: 0, after: 40});
  const ssec = (t: string)  => para(run(t, {b: true, col: 'FFFFFF', sz: 20, font: FONT, lang: 'el-GR'}), {before: 140, after: 50});

  // Language loop inside sidebar (2-col nested)
  const LSBW = [SBW - 1, 1];   // single-column trick: full width minus padding
  const sbLang = tbl([SBW - 320],
    trow(cell(
      para(run('{#languageRows}{language}', {col: 'FFFFFF', sz: 18, font: FONT}), {before: 40, after: 10}) +
      para(run('{degreeTitle}', {col: 'B0BFDF', sz: 16, font: FONT}), {before: 0, after: 5}) +
      para(run('{level}{/languageRows}', {i: true, col: 'A0AEC0', sz: 16, font: FONT}), {before: 0, after: 30}),
      {w: SBW - 320, borders: NB, pad: [0, 0, 0, 0]},
    )),
    {borders: 'none'},
  );
  void LSBW; // suppress unused warning

  const sidebarBody =
    // Photo
    para(run('', {}), {before: 0, after: 0}) +  // anchor
    photoP('center', 900000, 1080000) +          // 2.5cm × 3cm for sidebar
    EP +
    // Name
    para(run('{firstName} {lastName}', {b: true, col: 'FFFFFF', sz: 38, font: FONT}), {align: 'center', before: 100, after: 20}) +
    para(run('ΒΙΟΓΡΑΦΙΚΟ ΣΗΜΕΙΩΜΑ', {col: 'B0BFDF', sz: 14, i: true, font: FONT}), {align: 'center', before: 0, after: 60}) +
    // Contact
    ssec('ΕΠΙΚΟΙΝΩΝΙΑ') +
    slbl('Email') + sval('{email}') +
    slbl('Τηλέφωνο') + sval('{phone}') +
    slbl('Διεύθυνση') + sval('{homeAddress}') +
    // Personal
    ssec('ΠΡΟΣΩΠΙΚΑ') +
    slbl('Ημ. Γέννησης') + sval('{dateOfBirth}') +
    slbl('Τόπος Γέν.') + sval('{placeOfBirth}') +
    slbl('Πατρώνυμο') + sval('{fatherName}') +
    slbl('Μητρώνυμο') + sval('{motherName}') +
    // Languages
    cond('{#hasLanguages}') +
    ssec('ΓΛΩΣΣΕΣ') +
    sbLang +
    cond('{/hasLanguages}');

  // Main content: education
  const EC = [Math.round(MCW * 0.38), Math.round(MCW * 0.35), MCW - Math.round(MCW * 0.38) - Math.round(MCW * 0.35)];
  const eduTbl = tbl(EC,
    colHeaderRow(['Ίδρυμα / Σχολή', 'Τίτλος Πτυχίου', 'Ειδικότητα & Ημ/νία'], EC, hc) +
    dataRow('educationOnlyRows', ['{institutionFull}', '{degreeTitle}', '{specialization} {dateAwarded}'], EC),
    {borders: 'none'},
  );

  const pubTbl = tbl([MCW],
    trow(cell(
      para(run('{#publicationRows}{publicationText}{/publicationRows}', {sz: 20, font: FONT, col: '2D3748'}), {before: 70, after: 70}),
      {w: MCW, borders: bbot(ROW_BORDER)},
    )),
    {borders: 'none'},
  );

  const mainBody =
    titleRule('ΕΚΠΑΙΔΕΥΣΗ', hc, 24, 100, 80) +
    eduTbl +
    cond('{#hasPublications}') +
    titleRule('ΔΗΜΟΣΙΕΥΣΕΙΣ', hc, 24, 160, 80) +
    pubTbl +
    cond('{/hasPublications}');

  // Outer 2-column table (the whole page)
  const outer = tbl([SBW, MCW],
    trow(
      cell(sidebarBody, {w: SBW, fill: hc, borders: NB, vAlign: 'top', pad: [160, 200, 200, 200]}) +
      cell(mainBody,    {w: MCW, borders: NB, vAlign: 'top', pad: [160, 0, 160, 200]}),
    ),
    {borders: 'none'},
  );

  return doc(outer);
}

// ─── Layout 3: BOLD HEADER ───────────────────────────────────────────────────
//  Full-width colored banner: large name (left) + photo (right)
//  Light personal info strip below header
//  Section titles with thick left accent bar
//  Borderless data, generous spacing
// ─────────────────────────────────────────────────────────────────────────────
function buildBoldHeader(hc: string, lt: string /* light tint */): string {
  const NLEFT = Math.round(PW * 0.62);   // name area in header
  const PRIGHT = PW - NLEFT;            // photo area in header

  // Big colored header: name left + photo right
  const nameContent =
    para(run('{firstName}', {b: true, col: 'FFFFFF', sz: 64, font: FONT}), {before: 160, after: 0}) +
    para(run('{lastName}',  {b: true, col: 'FFFFFF', sz: 64, font: FONT}), {before: 0,   after: 30}) +
    para(run('ΒΙΟΓΡΑΦΙΚΟ ΣΗΜΕΙΩΜΑ', {col: 'A8C4CA', sz: 16, i: true, font: FONT}), {before: 0, after: 30}) +
    para(
      run('{email}', {col: 'D0E8EC', sz: 18, font: FONT}) +
      run('   ·   ', {col: '6AACB6', sz: 18, font: FONT}) +
      run('{phone}', {col: 'D0E8EC', sz: 18, font: FONT}),
      {before: 0, after: 160},
    );

  const headerTbl = tbl([NLEFT, PRIGHT],
    trow(
      cell(nameContent, {w: NLEFT,  fill: hc, borders: NB, vAlign: 'center', pad: [0, 160, 0, 160]}) +
      cell(photoP('right', PHOTO_W, PHOTO_H), {w: PRIGHT, fill: hc, borders: NB, vAlign: 'center', pad: [100, 100, 100, 80]}),
    ),
    {borders: 'none'},
  );

  // Personal info strip (light tint background)
  const PAD = [60, 160, 60, 160] as [number,number,number,number];
  const pinfo = (lbl: string, ph: string) =>
    cell(
      para(run(lbl + ': ', {b: true, col: '444444', sz: 16, font: FONT}) + run(ph, {col: '222222', sz: 16, font: FONT}), {before: 50, after: 50}),
      {w: Math.round(PW / 2), fill: lt, borders: NB, pad: PAD},
    );

  const infoStrip = tbl([Math.round(PW / 2), Math.round(PW / 2)],
    trow(pinfo('Ημ. Γέννησης', '{dateOfBirth}') + pinfo('Τόπος Γέννησης', '{placeOfBirth}')) +
    trow(pinfo('Πατρώνυμο', '{fatherName}') + pinfo('Μητρώνυμο', '{motherName}')) +
    trow(
      cell(para(run('Διεύθυνση: ', {b: true, col: '444444', sz: 16, font: FONT}) + run('{homeAddress}', {col: '222222', sz: 16, font: FONT}), {before: 50, after: 50}),
        {w: PW, span: 2, fill: lt, borders: NB, pad: PAD},
      ),
    ),
    {borders: 'none'},
  );

  // Education
  const EC = [3400, 2400, 2300, 1538];
  const eduTbl = tbl(EC,
    colHeaderRow(['Ίδρυμα / Σχολή', 'Τίτλος Πτυχίου', 'Ειδικότητα', 'Ημερομηνία'], EC, hc) +
    dataRow('educationOnlyRows', ['{institutionFull}', '{degreeTitle}', '{specialization}', '{dateAwarded}'], EC),
    {borders: 'none'},
  );

  // Languages
  const LC = [3200, 3200, 3238];
  const langTbl = tbl(LC,
    colHeaderRow(['Γλώσσα', 'Τίτλος / Πιστοποιητικό', 'Επίπεδο'], LC, hc) +
    dataRow('languageRows', ['{language}', '{degreeTitle}', '{level}'], LC),
    {borders: 'none'},
  );

  // Publications
  const pubTbl = tbl([PW],
    trow(cell(
      para(run('{#publicationRows}{publicationText}{/publicationRows}', {sz: 20, font: FONT, col: '2D3748'}), {before: 70, after: 70}),
      {w: PW, borders: bbot(ROW_BORDER)},
    )),
    {borders: 'none'},
  );

  const body =
    headerTbl +
    infoStrip +
    titleBar('ΕΚΠΑΙΔΕΥΣΗ', hc) +
    eduTbl +
    cond('{#hasLanguages}') +
    titleBar('ΓΛΩΣΣΕΣ', hc) +
    langTbl +
    cond('{/hasLanguages}') +
    cond('{#hasPublications}') +
    titleBar('ΔΗΜΟΣΙΕΥΣΕΙΣ', hc) +
    pubTbl +
    cond('{/hasPublications}');

  return doc(body);
}

// ─── Generate files ──────────────────────────────────────────────────────────

const LAYOUTS = [
  { name: 'navy',   xml: () => buildContemporary('1B2A4A')              },
  { name: 'indigo', xml: () => buildSidebar('2D2170')                   },
  { name: 'teal',   xml: () => buildBoldHeader('0A5260', 'DEF0F3')      },
] as const;

const baseContent = fs.readFileSync(BASE_DOCX, 'binary');

for (const { name, xml } of LAYOUTS) {
  const docXml = xml();
  const zip = new PizZip(baseContent);
  zip.file('word/document.xml', docXml);
  const buf: Buffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });

  const outPath = path.join(OUT_DIR, `cv_job_${name}_placeholders.docx`);
  fs.writeFileSync(outPath, buf);

  const v = new PizZip(buf.toString('binary')).files['word/document.xml'].asText();
  const ok = v.includes('{firstName}') && v.includes('{#educationOnlyRows}') && v.includes(PHOTO_RID);
  console.log(`cv_job_${name}_placeholders.docx  [${ok ? 'OK' : 'FAIL'}]`);
}
