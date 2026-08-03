/**
 * Generates cv_sidebar_blue_placeholders.docx
 * Layout: blue sidebar (35%) | white content (65%)
 * Run with: node src/scripts/createSidebarTemplate.js
 */
const PizZip = require('pizzip');
const fs     = require('fs');
const path   = require('path');

const BLUE  = '2B6CB0';
const WHITE = 'FFFFFF';
const DARK  = '1A202C';
const GRAY  = '718096';

// ── Unique paragraph ID counter ───────────────────────────────────────────────
let _pid = 1;
function pid() {
  return 'SB' + String(_pid++).padStart(6, '0');
}

// ── Low-level builders ────────────────────────────────────────────────────────
function rpr(opts) {
  const { color, bold, sz, font, italic, spacing } = opts || {};
  let x = '<w:rPr>';
  if (font !== false) x += '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>';
  if (color)   x += `<w:color w:val="${color}"/>`;
  if (bold)    x += '<w:b/><w:bCs/>';
  if (italic)  x += '<w:i/><w:iCs/>';
  if (sz)      x += `<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>`;
  if (spacing) x += `<w:spacing w:val="${spacing}"/>`;
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
  const ppr = '<w:pPr>'
    + spacing(200, 80)
    + '<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="' + WHITE + '"/></w:pBdr>'
    + rpr({ color: WHITE, bold: true, sz: 20 })
    + '</w:pPr>';
  return para(ppr, run(text, { color: WHITE, bold: true, sz: 20 }));
}

function sbText(text, opts) {
  const o = Object.assign({ color: WHITE, sz: 17 }, opts);
  const ppr = '<w:pPr>' + spacing(0, 60) + rpr(o) + '</w:pPr>';
  return para(ppr, run(text, o));
}

function sbEmpty() {
  const ppr = '<w:pPr>' + spacing(0, 80) + rpr({ color: WHITE, sz: 17 }) + '</w:pPr>';
  return para(ppr, '');
}

function loopPara(tag) {
  return para('<w:pPr>' + spacing(0, 0) + '</w:pPr>', `<w:r><w:t>${tag}</w:t></w:r>`);
}

// ── Photo (circular) ──────────────────────────────────────────────────────────
const photoPara =
  `<w:p w14:paraId="${pid()}" w14:textId="77777777" w:rsidR="00B11A48" w:rsidRDefault="00B11A48">`
+ '<w:pPr>' + jc('center') + spacing(240, 120) + '</w:pPr>'
+ '<w:r><w:rPr><w:noProof/></w:rPr>'
+ '<w:drawing>'
+ '<wp:inline distT="0" distB="0" distL="0" distR="0">'
+ '<wp:extent cx="1440000" cy="1440000"/>'
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
+ '<a:xfrm><a:off x="0" y="0"/><a:ext cx="1440000" cy="1440000"/></a:xfrm>'
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
    + spacing(280, 80)
    + '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="' + BLUE + '"/></w:pBdr>'
    + rpr({ color: BLUE, bold: true, sz: 24 })
    + '</w:pPr>';
  return para(ppr, run(text, { color: BLUE, bold: true, sz: 24 }));
}

function ctBold(text) {
  const ppr = '<w:pPr>' + spacing(100, 0) + rpr({ color: DARK, bold: true, sz: 20 }) + '</w:pPr>';
  return para(ppr, run(text, { color: DARK, bold: true, sz: 20 }));
}

function ctItalic(text) {
  const ppr = '<w:pPr>' + spacing(0, 0) + rpr({ color: BLUE, sz: 18, italic: true }) + '</w:pPr>';
  return para(ppr, run(text, { color: BLUE, sz: 18, italic: true }));
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

  // Name
  para(
    '<w:pPr>' + jc('center') + spacing(0, 40)
    + rpr({ color: WHITE, bold: true, sz: 36 }) + '</w:pPr>',
    run('{firstName} {lastName}', { color: WHITE, bold: true, sz: 36 })
  ),

  // Department / position
  para(
    '<w:pPr>' + jc('center') + spacing(0, 160)
    + rpr({ color: WHITE, sz: 18 }) + '</w:pPr>',
    run('{department}', { color: WHITE, sz: 18 })
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
  sbText('• {skillText}'),   // • {skillText}
  loopPara('{/skillRows}'),

].join('');

// ── Assemble right content ────────────────────────────────────────────────────
const rightContent = [

  // ΕΚΠΑΙΔΕΥΣΗ
  ctHeader('ΕΚΠΑΙΔΕΥΣΗ'),
  loopPara('{#educationOnlyRows}'),
  ctBold('{institutionFull}'),
  ctItalic('{degreeTitle}'),
  ctNormal('{degreeType}'),
  ctNormal('{specialization}'),
  ctNormal('{dateAwarded}'),
  ctEmpty(),
  loopPara('{/educationOnlyRows}'),

  // ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ
  ctHeader('ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ'),
  loopPara('{#workExperienceRows}'),
  ctBold('{employerName}'),
  ctItalic('{projectText}'),
  ctNormal('{roleName}'),
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

// ── LEFT SIDEBAR ──
+ '<w:tc>'
+ '<w:tcPr>'
+ '<w:tcW w:w="1750" w:type="pct"/>'
+ `<w:shd w:val="clear" w:color="auto" w:fill="${BLUE}"/>`
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

// ── RIGHT CONTENT ──
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
// Read navy as base (reuse all infrastructure: styles, fonts, settings, etc.)
const base    = fs.readFileSync(path.join(__dirname, '../../templates/cv_job_navy_placeholders.docx'), 'binary');
const zip     = new PizZip(base);
const navyXml = zip.files['word/document.xml'].asText();

// Extract the root <w:document ...> opening tag with all namespaces
const docOpenEnd = navyXml.indexOf('>') + 1;
const docOpenTag = navyXml.substring(0, docOpenEnd);

const newDocXml = docOpenTag
  + '<w:body>'
  + tableXml
  + '<w:sectPr>'
  + '<w:pgSz w:w="11906" w:h="16838"/>'   // A4
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
