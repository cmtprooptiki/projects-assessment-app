/**
 * Generates cv_sidebar_blue_placeholders.docx
 * Layout: light-blue sidebar (35%) | white content (65%)
 * Run with: node src/scripts/createSidebarTemplate.js
 */
const PizZip = require('pizzip');
const fs     = require('fs');
const path   = require('path');

// Sidebar palette — light-medium blue matching the Canva reference image
const SIDEBAR_BG     = '7AB2D3';   // light-medium blue sidebar fill
const SIDEBAR_DARK   = '1B3A52';   // near-navy for section header text
const SIDEBAR_BORDER = '4A86C8';   // medium blue for underline borders
const SIDEBAR_TEXT   = '1A202C';   // near-black for sidebar body text
const CONTENT_BLUE   = '2B6CB0';   // blue for right-column section headers & italics
const DARK           = '1A202C';   // near-black for right-column bold entries
const GRAY           = '4A5568';   // gray for right-column normal text
const WHITE          = 'FFFFFF';   // right cell and table cell backgrounds

// Photo size in EMUs — 1800000 ≈ 4.9 cm (larger than the previous 1440000 ≈ 3.8 cm)
const PHOTO_EMU = '1800000';

// ── Unique paragraph ID counter (must be 8-char hex) ─────────────────────────
let _pid = 0x10000001;
function pid() {
  return (_pid++).toString(16).toUpperCase().padStart(8, '0');
}

// ── Low-level builders ────────────────────────────────────────────────────────
function rpr(opts) {
  const { color, bold, sz, font, italic } = opts || {};
  let x = '<w:rPr>';
  if (font !== false) x += '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>';
  if (color)  x += `<w:color w:val="${color}"/>`;
  if (bold)   x += '<w:b/><w:bCs/>';
  if (italic) x += '<w:i/><w:iCs/>';
  if (sz)     x += `<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>`;
  x += '</w:rPr>';
  return x;
}

function run(text, opts) {
  return `<w:r>${rpr(opts)}<w:t xml:space="preserve">${text}</w:t></w:r>`;
}

function para(pprXml, runsXml) {
  return `<w:p w14:paraId="${pid()}" w14:textId="77777777" w:rsidR="00B11A48" w:rsidRDefault="00B11A48">`
       + pprXml + (runsXml || '') + '</w:p>';
}

function spacing(before, after) {
  return `<w:spacing w:before="${before}" w:after="${after}"/>`;
}

function jc(val) { return `<w:jc w:val="${val}"/>`; }

// ── Sidebar paragraph helpers ─────────────────────────────────────────────────
function sbHeader(text) {
  // Dark text on light sidebar; medium-blue underline border
  const ppr = '<w:pPr>'
    + `<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="${SIDEBAR_BORDER}"/></w:pBdr>`
    + spacing(200, 80)
    + rpr({ color: SIDEBAR_DARK, bold: true, sz: 20 })
    + '</w:pPr>';
  return para(ppr, run(text, { color: SIDEBAR_DARK, bold: true, sz: 20 }));
}

function sbText(text, opts) {
  const o = Object.assign({ color: SIDEBAR_TEXT, sz: 17 }, opts);
  const ppr = '<w:pPr>' + spacing(0, 60) + rpr(o) + '</w:pPr>';
  return para(ppr, run(text, o));
}

function sbEmpty() {
  const ppr = '<w:pPr>' + spacing(0, 80) + rpr({ color: SIDEBAR_TEXT, sz: 17 }) + '</w:pPr>';
  return para(ppr, '');
}

function loopPara(tag) {
  return para('<w:pPr>' + spacing(0, 0) + '</w:pPr>', `<w:r><w:t>${tag}</w:t></w:r>`);
}

// ── Photo (circular) ──────────────────────────────────────────────────────────
const photoPara =
  `<w:p w14:paraId="${pid()}" w14:textId="77777777" w:rsidR="00B11A48" w:rsidRDefault="00B11A48">`
+ '<w:pPr>' + spacing(240, 120) + jc('center') + '</w:pPr>'
+ '<w:r><w:rPr><w:noProof/></w:rPr>'
+ '<w:drawing>'
+ '<wp:inline distT="0" distB="0" distL="0" distR="0">'
+ `<wp:extent cx="${PHOTO_EMU}" cy="${PHOTO_EMU}"/>`
+ '<wp:effectExtent l="0" t="0" r="0" b="0"/>'
+ '<wp:docPr id="201" name="EmployeePhoto"/>'
+ '<wp:cNvGraphicFramePr>'
+ '<a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>'
+ '</wp:cNvGraphicFramePr>'
+ '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
+ '<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
+ '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
+ '<pic:nvPicPr>'
+ '<pic:cNvPr id="0" name="EmployeePhoto"/>'
+ '<pic:cNvPicPr><a:picLocks noChangeAspect="1"/></pic:cNvPicPr>'
+ '</pic:nvPicPr>'
+ '<pic:blipFill>'
+ '<a:blip r:embed="rId_employee_photo"/>'
+ '<a:stretch><a:fillRect/></a:stretch>'
+ '</pic:blipFill>'
+ '<pic:spPr>'
+ `<a:xfrm><a:off x="0" y="0"/><a:ext cx="${PHOTO_EMU}" cy="${PHOTO_EMU}"/></a:xfrm>`
+ '<a:prstGeom prst="ellipse"><a:avLst/></a:prstGeom>'
+ '</pic:spPr>'
+ '</pic:pic>'
+ '</a:graphicData>'
+ '</a:graphic>'
+ '</wp:inline>'
+ '</w:drawing>'
+ '</w:r>'
+ '</w:p>';

// ── Right content paragraph helpers ──────────────────────────────────────────
function ctHeader(text) {
  const ppr = '<w:pPr>'
    + `<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="${CONTENT_BLUE}"/></w:pBdr>`
    + spacing(280, 80)
    + rpr({ color: CONTENT_BLUE, bold: true, sz: 24 })
    + '</w:pPr>';
  return para(ppr, run(text, { color: CONTENT_BLUE, bold: true, sz: 24 }));
}

function ctBold(text) {
  const ppr = '<w:pPr>' + spacing(100, 0) + rpr({ color: DARK, bold: true, sz: 20 }) + '</w:pPr>';
  return para(ppr, run(text, { color: DARK, bold: true, sz: 20 }));
}

function ctItalic(text) {
  const ppr = '<w:pPr>' + spacing(0, 0) + rpr({ color: CONTENT_BLUE, sz: 18, italic: true }) + '</w:pPr>';
  return para(ppr, run(text, { color: CONTENT_BLUE, sz: 18, italic: true }));
}

function ctNormal(text) {
  const ppr = '<w:pPr>' + spacing(0, 0) + rpr({ color: GRAY, sz: 18 }) + '</w:pPr>';
  return para(ppr, run(text, { color: GRAY, sz: 18 }));
}

function ctEmpty() {
  return para('<w:pPr>' + spacing(0, 80) + '</w:pPr>', '');
}

// ── Assemble sidebar ──────────────────────────────────────────────────────────
const sidebarContent = [
  photoPara,

  // Name — dark text on light sidebar
  para(
    '<w:pPr>' + spacing(0, 40) + jc('center')
    + rpr({ color: SIDEBAR_DARK, bold: true, sz: 36 }) + '</w:pPr>',
    run('{firstName} {lastName}', { color: SIDEBAR_DARK, bold: true, sz: 36 })
  ),

  // Department (show nothing if empty/N/A is handled in cvService)
  para(
    '<w:pPr>' + spacing(0, 160) + jc('center')
    + rpr({ color: SIDEBAR_TEXT, sz: 18 }) + '</w:pPr>',
    run('{department}', { color: SIDEBAR_TEXT, sz: 18 })
  ),

  // ΕΠΙΚΟΙΝΩΝΙΑ
  sbHeader('ΕΠΙΚΟΙΝΩΝΙΑ'),
  sbText('Τηλ: {phone}'),
  sbText('Email: {email}'),
  sbText('{homeAddress}'),
  sbText('Ημ/νία: {dateOfBirth}'),
  sbText('Τόπος: {placeOfBirth}'),
  sbEmpty(),

  // ΣΧΕΤΙΚΑ ΜΕ ΕΜΕΝΑ (empty — user fills manually)
  sbHeader('ΣΧΕΤΙΚΑ ΜΕ ΕΜΕΝΑ'),
  sbEmpty(),
  sbEmpty(),
  sbEmpty(),
  sbEmpty(),

  // ΓΝΩΣΕΙΣ (skills from education specializations + languages)
  sbHeader('ΓΝΩΣΕΙΣ'),
  loopPara('{#skillRows}'),
  sbText('• {skillText}'),
  loopPara('{/skillRows}'),

].join('');

// ── Assemble right content ────────────────────────────────────────────────────
// {#projectText}...{/projectText} and {#roleName}...{/roleName} are docxtemplater
// conditionals — they render only when the value is truthy (non-empty string).
// This hides the blank italic/normal lines for CMT availability-period entries.
const rightContent = [

  // ΕΚΠΑΙΔΕΥΣΗ
  ctHeader('ΕΚΠΑΙΔΕΥΣΗ'),
  loopPara('{#educationOnlyRows}'),
  ctBold('{institutionFull}'),
  ctItalic('{degreeTitle}'),
  loopPara('{#degreeType}'),
  ctNormal('{degreeType}'),
  loopPara('{/degreeType}'),
  loopPara('{#specialization}'),
  ctNormal('{specialization}'),
  loopPara('{/specialization}'),
  ctNormal('{dateAwarded}'),
  ctEmpty(),
  loopPara('{/educationOnlyRows}'),

  // ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ
  ctHeader('ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ'),
  loopPara('{#workExperienceRows}'),
  ctBold('{employerName}'),
  loopPara('{#projectText}'),
  ctItalic('{projectText}'),
  loopPara('{/projectText}'),
  loopPara('{#roleName}'),
  ctNormal('{roleName}'),
  loopPara('{/roleName}'),
  ctNormal('{period}'),
  ctEmpty(),
  loopPara('{/workExperienceRows}'),

  // ΔΗΜΟΣΙΕΥΣΕΙΣ (conditional)
  loopPara('{#hasPublications}'),
  ctHeader('ΔΗΜΟΣΙΕΥΣΕΙΣ'),
  ctNormal('{publicationsText}'),
  loopPara('{/hasPublications}'),

  ctEmpty(),

].join('');

// ── Full table ────────────────────────────────────────────────────────────────
const tableXml =
  '<w:tbl>'
+ '<w:tblPr>'
+ '<w:tblW w:w="5000" w:type="pct"/>'
+ '<w:tblBorders>'
+ '<w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
+ '<w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
+ '<w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
+ '<w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
+ '<w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
+ '<w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
+ '</w:tblBorders>'
+ '<w:tblLook w:val="0000" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="0"/>'
+ '</w:tblPr>'
+ '<w:tblGrid><w:gridCol w:w="3203"/><w:gridCol w:w="6437"/></w:tblGrid>'
+ '<w:tr>'
+ '<w:trPr><w:trHeight w:val="100" w:hRule="atLeast"/></w:trPr>'

// ── LEFT SIDEBAR (light-medium blue) ──
+ '<w:tc>'
+ '<w:tcPr>'
+ '<w:tcW w:w="1750" w:type="pct"/>'
+ `<w:shd w:val="clear" w:color="auto" w:fill="${SIDEBAR_BG}"/>`
+ '<w:tcMar>'
+ '<w:top w:w="0" w:type="dxa"/>'
+ '<w:left w:w="200" w:type="dxa"/>'
+ '<w:right w:w="200" w:type="dxa"/>'
+ '<w:bottom w:w="0" w:type="dxa"/>'
+ '</w:tcMar>'
+ '<w:vAlign w:val="top"/>'
+ '</w:tcPr>'
+ sidebarContent
+ '</w:tc>'

// ── RIGHT CONTENT (white) ──
+ '<w:tc>'
+ '<w:tcPr>'
+ '<w:tcW w:w="3250" w:type="pct"/>'
+ `<w:shd w:val="clear" w:color="auto" w:fill="${WHITE}"/>`
+ '<w:tcMar>'
+ '<w:top w:w="200" w:type="dxa"/>'
+ '<w:left w:w="300" w:type="dxa"/>'
+ '<w:right w:w="200" w:type="dxa"/>'
+ '<w:bottom w:w="0" w:type="dxa"/>'
+ '</w:tcMar>'
+ '<w:vAlign w:val="top"/>'
+ '</w:tcPr>'
+ rightContent
+ '</w:tc>'

+ '</w:tr>'
+ '</w:tbl>';

// ── Build document.xml ────────────────────────────────────────────────────────
// Read navy as ZIP base — reuses styles, fonts, settings infrastructure.
const base    = fs.readFileSync(path.join(__dirname, '../../templates/cv_job_navy_placeholders.docx'), 'binary');
const zip     = new PizZip(base);
const navyXml = zip.files['word/document.xml'].asText();

// Capture XML declaration + full <w:document xmlns:...> opening tag (everything before <w:body).
const bodyStart  = navyXml.indexOf('<w:body');
const docOpenTag = navyXml.substring(0, bodyStart);

const newDocXml = docOpenTag
  + '<w:body>'
  + tableXml
  + '<w:sectPr>'
  + '<w:pgSz w:w="11906" w:h="16838"/>'
  + '<w:pgMar w:top="567" w:right="567" w:bottom="567" w:left="567" w:header="708" w:footer="708" w:gutter="0"/>'
  + '</w:sectPr>'
  + '</w:body>'
  + '</w:document>';

zip.file('word/document.xml', newDocXml);

const outPath = path.join(__dirname, '../../templates/cv_sidebar_blue_placeholders.docx');
const output  = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(outPath, output);
console.log('Created:', outPath);

// Sanity check
const check = new PizZip(fs.readFileSync(outPath, 'binary'));
const checkXml = check.files['word/document.xml'].asText();
const tags = [
  '{firstName}', '{lastName}', '{department}',
  '{phone}', '{email}', '{homeAddress}', '{dateOfBirth}', '{placeOfBirth}',
  '{#skillRows}', '{skillText}', '{/skillRows}',
  '{#educationOnlyRows}', '{/educationOnlyRows}',
  '{#workExperienceRows}', '{/workExperienceRows}',
  '{#hasPublications}', '{publicationsText}', '{/hasPublications}',
  'rId_employee_photo',
];
tags.forEach(t => console.log((checkXml.includes(t) ? '✓' : '✗ MISSING') + '  ' + t));
