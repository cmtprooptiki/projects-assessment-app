/**
 * Generates cv_sidebar_blue_placeholders.docx
 * Layout: left sidebar with blue photo area + gray body | right white content
 * Fonts: Montserrat (install in Windows for best results; falls back to Calibri)
 * Run: node src/scripts/createSidebarTemplate.js
 */
const PizZip = require('pizzip');
const fs     = require('fs');
const path   = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const BLUE    = '4472C4';   // medium blue: sidebar photo row + right-column headers
const GRAY_BG = 'F0F0F0';   // light gray: sidebar body
const T_DARK  = '2D2D2D';   // near-black: bold text
const T_GRAY  = '555555';   // medium gray: normal text
const WHITE   = 'FFFFFF';

// Photo diameter in EMU (1 inch = 914400 EMU; ~5 cm ≈ 1800000)
const P_EMU = '1800000';

// ── Paragraph ID counter ──────────────────────────────────────────────────────
let _pid = 0x10000001;
const pid = () => (_pid++).toString(16).toUpperCase().padStart(8, '0');

// ── XML primitives ────────────────────────────────────────────────────────────
const sp  = (b, a) => `<w:spacing w:before="${b}" w:after="${a}"/>`;
const jcX = v      => `<w:jc w:val="${v}"/>`;

function rPr({ color, bold, italic, sz, font } = {}) {
  const f = font || 'Montserrat';
  let r = `<w:rPr><w:rFonts w:ascii="${f}" w:hAnsi="${f}" w:cs="Calibri"/>`;
  if (color)  r += `<w:color w:val="${color}"/>`;
  if (bold)   r += '<w:b/><w:bCs/>';
  if (italic) r += '<w:i/><w:iCs/>';
  if (sz)     r += `<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>`;
  return r + '</w:rPr>';
}

// Icon run: uses Segoe UI Symbol for Unicode < 0x2FFF, Segoe UI Emoji for higher
function iRun(ch, sz) {
  if (!ch) return '';
  const isEmoji = ch.codePointAt(0) > 0x2FFF;
  const fnt = isEmoji ? 'Segoe UI Emoji' : 'Segoe UI Symbol';
  return `<w:r><w:rPr><w:rFonts w:ascii="${fnt}" w:hAnsi="${fnt}" w:cs="${fnt}"/>`
       + `<w:color w:val="${BLUE}"/><w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr>`
       + `<w:t xml:space="preserve">${ch} </w:t></w:r>`;
}

function run(txt, opts) {
  return `<w:r>${rPr(opts)}<w:t xml:space="preserve">${txt}</w:t></w:r>`;
}

function para(ppr, runs) {
  return `<w:p w14:paraId="${pid()}" w14:textId="77777777" w:rsidR="00B11A48" w:rsidRDefault="00B11A48">${ppr}${runs || ''}</w:p>`;
}

// Loop delimiter paragraph (no visible content, zero spacing)
const lp = tag => para(`<w:pPr>${sp(0, 0)}</w:pPr>`, `<w:r><w:t>${tag}</w:t></w:r>`);

// ── Photo paragraph — circular, white border ring ─────────────────────────────
const photoPara =
  `<w:p w14:paraId="${pid()}" w14:textId="77777777" w:rsidR="00B11A48" w:rsidRDefault="00B11A48">`
+ `<w:pPr>${sp(300, 200)}${jcX('center')}</w:pPr>`
+ '<w:r><w:rPr><w:noProof/></w:rPr><w:drawing>'
+ '<wp:inline distT="0" distB="0" distL="0" distR="0">'
+ `<wp:extent cx="${P_EMU}" cy="${P_EMU}"/><wp:effectExtent l="0" t="0" r="0" b="0"/>`
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
+ '<pic:blipFill><a:blip r:embed="rId_employee_photo"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
+ '<pic:spPr>'
+ `<a:xfrm><a:off x="0" y="0"/><a:ext cx="${P_EMU}" cy="${P_EMU}"/></a:xfrm>`
+ '<a:prstGeom prst="ellipse"><a:avLst/></a:prstGeom>'
// White ring border — w is in EMU (1pt = 12700 EMU; 4.5pt ≈ 57150)
+ '<a:ln w="57150"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:ln>'
+ '</pic:spPr>'
+ '</pic:pic>'
+ '</a:graphicData></a:graphic>'
+ '</wp:inline></w:drawing></w:r></w:p>';

// ── Sidebar helpers ───────────────────────────────────────────────────────────
// Section header with optional emoji icon, blue underline
function sbHead(icon, text) {
  const ppr = `<w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="${BLUE}"/></w:pBdr>${sp(180, 80)}</w:pPr>`;
  return para(ppr, iRun(icon, 22) + run(text, { color: T_DARK, bold: true, sz: 22 }));
}

// Contact/info line with optional emoji icon
function sbLine(icon, text) {
  return para(`<w:pPr>${sp(0, 60)}</w:pPr>`,
    (icon ? iRun(icon, 17) : '') + run(text, { color: T_GRAY, sz: 17 })
  );
}

function sbEmpty(after) {
  return para(`<w:pPr>${sp(0, after || 100)}</w:pPr>`, '');
}

// ── Inner nested sidebar table: blue row (photo) + gray row (text) ───────────
const NO_BORDERS =
  '<w:tblBorders>'
  + '<w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
  + '<w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
  + '<w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
  + '<w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
  + '<w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
  + '<w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
  + '</w:tblBorders>';

function tcMar(t, lr, b) {
  return `<w:tcMar><w:top w:w="${t}" w:type="dxa"/><w:left w:w="${lr}" w:type="dxa"/><w:right w:w="${lr}" w:type="dxa"/><w:bottom w:w="${b}" w:type="dxa"/></w:tcMar>`;
}

// Blue row: just the circular photo, centered
const blueRow =
  '<w:tr>'
  + '<w:tc>'
  + `<w:tcPr><w:tcW w:w="5000" w:type="pct"/><w:shd w:val="clear" w:color="auto" w:fill="${BLUE}"/>${tcMar(0, 200, 0)}</w:tcPr>`
  + photoPara
  + '</w:tc>'
  + '</w:tr>';

// Gray row: name + contact + about + skills
const grayContent = [

  // Name (large, bold, centered)
  para(`<w:pPr>${sp(0, 40)}${jcX('center')}</w:pPr>`,
    run('{firstName} {lastName}', { color: T_DARK, bold: true, sz: 40 })
  ),
  // Department subtitle (centered)
  para(`<w:pPr>${sp(0, 160)}${jcX('center')}</w:pPr>`,
    run('{department}', { color: T_GRAY, sz: 18 })
  ),

  // CONTACT section
  sbHead('☎', 'Contact'),          // ☎ Contact
  sbLine('☎', '{phone}'),          // ☎ phone
  sbLine('✉', '{email}'),          // ✉ email
  sbLine('\u{1F4CD}', '{homeAddress}'), // 📍 address
  sbLine(null, 'Ημ/νία: {dateOfBirth}'),
  sbLine(null, 'Τόπος: {placeOfBirth}'),
  sbEmpty(),

  // ABOUT ME section
  sbHead('\u{1F464}', 'About Me'),      // 👤 About Me
  sbEmpty(),
  sbEmpty(),
  sbEmpty(),
  sbEmpty(),
  sbEmpty(),

  // SKILLS section
  sbHead('⭐', 'Skills'),           // ⭐ Skills
  lp('{#skillRows}'),
  sbLine('▪', '{skillText}'),      // ▪ skill
  lp('{/skillRows}'),

].join('');

const grayRow =
  '<w:tr>'
  + '<w:tc>'
  + `<w:tcPr><w:tcW w:w="5000" w:type="pct"/><w:shd w:val="clear" w:color="auto" w:fill="${GRAY_BG}"/>${tcMar(120, 200, 0)}</w:tcPr>`
  + grayContent
  + '</w:tc>'
  + '</w:tr>';

const innerTable =
  '<w:tbl>'
  + `<w:tblPr><w:tblW w:w="5000" w:type="pct"/>${NO_BORDERS}`
  + '<w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/></w:tblCellMar>'
  + '</w:tblPr>'
  + '<w:tblGrid><w:gridCol w:w="3200"/></w:tblGrid>'
  + blueRow
  + grayRow
  + '</w:tbl>'
  // Required final paragraph for the outer sidebar cell (gray background to match)
  + para(`<w:pPr>${sp(0, 0)}<w:shd w:val="clear" w:color="auto" w:fill="${GRAY_BG}"/></w:pPr>`, '');

// ── Right-column helpers ──────────────────────────────────────────────────────
function ctHead(icon, text) {
  const ppr = `<w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="${BLUE}"/></w:pBdr>${sp(280, 80)}</w:pPr>`;
  return para(ppr, iRun(icon, 24) + run(text, { color: BLUE, bold: true, sz: 24 }));
}

// Entry title with blue ● bullet
function ctBold(text) {
  return para(`<w:pPr>${sp(100, 0)}</w:pPr>`,
    run('● ', { color: BLUE, sz: 16, font: 'Calibri' }) +
    run(text, { color: T_DARK, bold: true, sz: 20 })
  );
}

function ctItalic(text) {
  return para(`<w:pPr>${sp(0, 0)}</w:pPr>`, run(text, { color: BLUE, italic: true, sz: 18 }));
}

function ctNormal(text) {
  return para(`<w:pPr>${sp(0, 0)}</w:pPr>`, run(text, { color: T_GRAY, sz: 18 }));
}

function ctEmpty() { return para(`<w:pPr>${sp(0, 80)}</w:pPr>`, ''); }

// ── Right column content ──────────────────────────────────────────────────────
const rightContent = [

  ctHead('\u{1F393}', 'Education'),   // 🎓
  lp('{#educationOnlyRows}'),
  ctBold('{institutionFull}'),
  ctItalic('{degreeTitle}'),
  lp('{#degreeType}'),
  ctNormal('{degreeType}'),
  lp('{/degreeType}'),
  lp('{#specialization}'),
  ctNormal('{specialization}'),
  lp('{/specialization}'),
  ctNormal('{dateAwarded}'),
  ctEmpty(),
  lp('{/educationOnlyRows}'),

  ctHead('\u{1F4BC}', 'Experience'),  // 💼
  lp('{#workExperienceRows}'),
  ctBold('{employerName}'),
  lp('{#projectText}'),
  ctItalic('{projectText}'),
  lp('{/projectText}'),
  lp('{#roleName}'),
  ctNormal('{roleName}'),
  lp('{/roleName}'),
  ctNormal('{period}'),
  ctEmpty(),
  lp('{/workExperienceRows}'),

  lp('{#hasPublications}'),
  ctHead(null, 'Publications'),
  ctNormal('{publicationsText}'),
  lp('{/hasPublications}'),

  ctEmpty(),

].join('');

// ── Outer 2-column table ──────────────────────────────────────────────────────
const outerTable =
  '<w:tbl>'
+ `<w:tblPr><w:tblW w:w="5000" w:type="pct"/>${NO_BORDERS}`
+ '<w:tblLook w:val="0000" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="0"/>'
+ '</w:tblPr>'
+ '<w:tblGrid><w:gridCol w:w="3200"/><w:gridCol w:w="6440"/></w:tblGrid>'
+ '<w:tr><w:trPr><w:trHeight w:val="100" w:hRule="atLeast"/></w:trPr>'

// LEFT SIDEBAR — outer cell (gray fill to blend with inner table gray row)
+ '<w:tc>'
+ '<w:tcPr>'
+ '<w:tcW w:w="1750" w:type="pct"/>'
+ `<w:shd w:val="clear" w:color="auto" w:fill="${GRAY_BG}"/>`
+ tcMar(0, 0, 0)
+ '<w:vAlign w:val="top"/>'
+ '</w:tcPr>'
+ innerTable
+ '</w:tc>'

// RIGHT CONTENT
+ '<w:tc>'
+ '<w:tcPr>'
+ '<w:tcW w:w="3250" w:type="pct"/>'
+ `<w:shd w:val="clear" w:color="auto" w:fill="${WHITE}"/>`
+ tcMar(200, 300, 0)
+ '<w:vAlign w:val="top"/>'
+ '</w:tcPr>'
+ rightContent
+ '</w:tc>'

+ '</w:tr></w:tbl>';

// ── Build document.xml ────────────────────────────────────────────────────────
const base    = fs.readFileSync(path.join(__dirname, '../../templates/cv_job_navy_placeholders.docx'), 'binary');
const zip     = new PizZip(base);
const navyXml = zip.files['word/document.xml'].asText();

const bodyStart  = navyXml.indexOf('<w:body');
const docOpenTag = navyXml.substring(0, bodyStart);

const newDocXml = docOpenTag
  + '<w:body>'
  + outerTable
  + '<w:sectPr>'
  + '<w:pgSz w:w="11906" w:h="16838"/>'
  + '<w:pgMar w:top="567" w:right="567" w:bottom="567" w:left="567" w:header="708" w:footer="708" w:gutter="0"/>'
  + '</w:sectPr>'
  + '</w:body>'
  + '</w:document>';

zip.file('word/document.xml', newDocXml);

const outPath = path.join(__dirname, '../../templates/cv_sidebar_blue_placeholders.docx');
fs.writeFileSync(outPath, zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));
console.log('Created:', outPath);

// ── Sanity check ──────────────────────────────────────────────────────────────
const checkXml = new PizZip(fs.readFileSync(outPath, 'binary')).files['word/document.xml'].asText();
[
  '{firstName}', '{lastName}', '{department}',
  '{phone}', '{email}', '{homeAddress}', '{dateOfBirth}', '{placeOfBirth}',
  '{#skillRows}', '{skillText}', '{/skillRows}',
  '{#educationOnlyRows}', '{/educationOnlyRows}',
  '{#workExperienceRows}', '{/workExperienceRows}',
  '{#hasPublications}', '{publicationsText}', '{/hasPublications}',
  'rId_employee_photo',
].forEach(t => console.log((checkXml.includes(t) ? '✓' : '✗ MISSING') + '  ' + t));
