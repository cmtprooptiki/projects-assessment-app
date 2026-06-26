/**
 * One-time script to create cv_template_placeholders.docx from cv_template.docx.
 * Run with: npx ts-node src/scripts/prepareTemplate.ts
 *
 * The original template has THREE tables:
 *   Table[0]  — personal info + education (all rows)
 *   Table[1]  — standalone "ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ" section header
 *   Table[2]  — experience column headers + data rows
 *
 * We modify ONLY inside each table; we never cut across table boundaries.
 */
import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';

const templatePath = path.join(__dirname, '../../templates/cv_template.docx');
const outputPath   = path.join(__dirname, '../../templates/cv_template_placeholders.docx');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const content = fs.readFileSync(templatePath, 'binary');
const zip = new (PizZip as any)(content);

let xml: string = zip.files['word/document.xml'].asText();

// ──────────────────────────────────────────────────────────────────────────────
// 1. Personal info — simple text replacements
// ──────────────────────────────────────────────────────────────────────────────
const personalReplacements: [string, string][] = [
  ['Μαρκάτου ',          '{lastName} '],
  ['Άρτεμις',            '{firstName}'],
  ['Διονύσιος',          '{fatherName}'],
  ['Ναταλία',            '{motherName}'],
  ['13/02/1980',         '{dateOfBirth}'],
  ['Ντένβερ Κολοράντο Η.Π.Α', '{placeOfBirth}'],
  ['6932607870',         '{phone}'],
  ['amark@cmtprooptiki.gr', '{email}'],
  [' Αρτάκης 6, Άνω Ηλιούπολη , Αθήνα Τ.Κ. 16345', '{homeAddress}'],
];
for (const [find, replace] of personalReplacements) {
  xml = xml.split(find).join(replace);
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function allMatches(src: string, pattern: RegExp): number[] {
  const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  const positions: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) positions.push(m.index);
  return positions;
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. Locate table boundaries
// ──────────────────────────────────────────────────────────────────────────────
const tblOpen  = allMatches(xml, /<w:tbl>/);
const tblClose = allMatches(xml, /<\/w:tbl>/);
// Table[0]: personal info + education   — tblOpen[0] … tblClose[0]
// Table[1]: ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ      — tblOpen[1] … tblClose[1]
// Table[2]: experience col headers + data — tblOpen[2] … tblClose[2]

// ──────────────────────────────────────────────────────────────────────────────
// 3. Education template row
// ──────────────────────────────────────────────────────────────────────────────
const eduTemplateRow =
  `<w:tr w:rsidR="00806261" w14:paraId="EDU00001" w14:textId="77777777">` +
  `<w:tc><w:tcPr><w:tcW w:w="2058" w:type="pct"/><w:gridSpan w:val="8"/>` +
  `<w:tcBorders>` +
  `<w:top w:val="double" w:sz="6" w:space="0" w:color="auto"/>` +
  `<w:left w:val="double" w:sz="6" w:space="0" w:color="auto"/>` +
  `<w:bottom w:val="single" w:sz="6" w:space="0" w:color="auto"/>` +
  `<w:right w:val="single" w:sz="6" w:space="0" w:color="auto"/>` +
  `</w:tcBorders></w:tcPr>` +
  `<w:p><w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="22"/><w:lang w:val="el-GR"/></w:rPr></w:pPr>` +
  `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="22"/><w:lang w:val="el-GR"/></w:rPr>` +
  `<w:t>{#educationRows}{institutionFull}</w:t></w:r></w:p></w:tc>` +

  `<w:tc><w:tcPr><w:tcW w:w="1247" w:type="pct"/><w:gridSpan w:val="4"/>` +
  `<w:tcBorders>` +
  `<w:top w:val="double" w:sz="6" w:space="0" w:color="auto"/>` +
  `<w:left w:val="nil"/>` +
  `<w:bottom w:val="single" w:sz="6" w:space="0" w:color="auto"/>` +
  `<w:right w:val="single" w:sz="6" w:space="0" w:color="auto"/>` +
  `</w:tcBorders><w:vAlign w:val="center"/></w:tcPr>` +
  `<w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="22"/><w:lang w:val="el-GR"/></w:rPr></w:pPr>` +
  `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="22"/><w:lang w:val="el-GR"/></w:rPr>` +
  `<w:t>{degreeTitle}</w:t></w:r></w:p></w:tc>` +

  `<w:tc><w:tcPr><w:tcW w:w="679" w:type="pct"/><w:gridSpan w:val="5"/>` +
  `<w:tcBorders>` +
  `<w:top w:val="double" w:sz="6" w:space="0" w:color="auto"/>` +
  `<w:left w:val="nil"/>` +
  `<w:bottom w:val="single" w:sz="6" w:space="0" w:color="auto"/>` +
  `<w:right w:val="single" w:sz="6" w:space="0" w:color="auto"/>` +
  `</w:tcBorders></w:tcPr>` +
  `<w:p><w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="22"/><w:lang w:val="el-GR"/></w:rPr></w:pPr>` +
  `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="22"/><w:lang w:val="el-GR"/></w:rPr>` +
  `<w:t>{specialization}</w:t></w:r></w:p></w:tc>` +

  `<w:tc><w:tcPr><w:tcW w:w="1016" w:type="pct"/>` +
  `<w:tcBorders>` +
  `<w:top w:val="double" w:sz="6" w:space="0" w:color="auto"/>` +
  `<w:left w:val="nil"/>` +
  `<w:bottom w:val="single" w:sz="6" w:space="0" w:color="auto"/>` +
  `<w:right w:val="double" w:sz="6" w:space="0" w:color="auto"/>` +
  `</w:tcBorders></w:tcPr>` +
  `<w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="22"/><w:lang w:val="el-GR"/></w:rPr></w:pPr>` +
  `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="22"/><w:lang w:val="el-GR"/></w:rPr>` +
  `<w:t>{dateAwarded}{/educationRows}</w:t></w:r></w:p></w:tc></w:tr>`;

// ──────────────────────────────────────────────────────────────────────────────
// 4. Experience template row
// ──────────────────────────────────────────────────────────────────────────────
const expTemplateRow =
  `<w:tr w:rsidR="000E7407" w14:paraId="EXP00001" w14:textId="77777777">` +
  `<w:trPr><w:cantSplit/></w:trPr>` +
  `<w:tc><w:tcPr><w:tcW w:w="2048" w:type="pct"/><w:vAlign w:val="center"/></w:tcPr>` +
  `<w:p><w:pPr><w:spacing w:before="0"/><w:jc w:val="left"/>` +
  `<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="el-GR"/></w:rPr></w:pPr>` +
  `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="el-GR"/></w:rPr>` +
  `<w:t>{#experienceRows}{projectText}</w:t></w:r></w:p></w:tc>` +

  `<w:tc><w:tcPr><w:tcW w:w="629" w:type="pct"/><w:vAlign w:val="center"/></w:tcPr>` +
  `<w:p><w:pPr><w:spacing w:before="0"/><w:jc w:val="center"/>` +
  `<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="el-GR"/></w:rPr></w:pPr>` +
  `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="el-GR"/></w:rPr>` +
  `<w:t>CMT ΠΡΟΟΠΤΙΚΗ ΕΠΕ</w:t></w:r></w:p></w:tc>` +

  `<w:tc><w:tcPr><w:tcW w:w="1316" w:type="pct"/><w:vAlign w:val="center"/></w:tcPr>` +
  `<w:p><w:pPr><w:jc w:val="center"/>` +
  `<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="el-GR"/></w:rPr></w:pPr>` +
  `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="el-GR"/></w:rPr>` +
  `<w:t>{roleName}</w:t></w:r></w:p></w:tc>` +

  `<w:tc><w:tcPr><w:tcW w:w="1007" w:type="pct"/><w:vAlign w:val="center"/></w:tcPr>` +
  `<w:p><w:pPr><w:jc w:val="center"/>` +
  `<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="el-GR"/></w:rPr></w:pPr>` +
  `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>` +
  `<w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="el-GR"/></w:rPr>` +
  `<w:t>{period}{/experienceRows}</w:t></w:r></w:p></w:tc></w:tr>`;

// ──────────────────────────────────────────────────────────────────────────────
// 5. Replace education data rows INSIDE Table[0] only
//    Table[0] closes at tblClose[0]. TR[17] is the first edu data row.
//    We keep Table[0]'s </w:tbl> intact; Table[1] and Table[2] are untouched.
// ──────────────────────────────────────────────────────────────────────────────
const trPos0 = allMatches(xml, /<w:tr[ >]/);
const eduDataStart = trPos0[17];          // first edu data row
const tbl0CloseTag = tblClose[0];        // position of </w:tbl> for Table[0]

// Replace edu data rows; keep </w:tbl> of Table[0] (and everything after it)
xml = xml.substring(0, eduDataStart) + eduTemplateRow + xml.substring(tbl0CloseTag);

// ──────────────────────────────────────────────────────────────────────────────
// 6. Replace experience data rows INSIDE Table[2] only
//    Table[2] now opens at tblOpen[2] (recalculated after step 5).
//    It has 2 header TRs then data TRs. We replace from the 3rd TR to the end.
// ──────────────────────────────────────────────────────────────────────────────
const newTblOpen  = allMatches(xml, /<w:tbl>/);
const newTblClose = allMatches(xml, /<\/w:tbl>/);
const tbl2Start   = newTblOpen[2];
const tbl2End     = newTblClose[2];      // position of </w:tbl> for Table[2]

// Find TRs that belong to Table[2]
const allTrPos = allMatches(xml, /<w:tr[ >]/);
const tbl2Trs  = allTrPos.filter((p) => p > tbl2Start && p < tbl2End);

if (tbl2Trs.length < 3) throw new Error(`Expected ≥3 TRs in Table[2], got ${tbl2Trs.length}`);
const expDataStart = tbl2Trs[2];        // 3rd TR in Table[2] = first data row

// Replace exp data rows; keep </w:tbl> of Table[2]
xml = xml.substring(0, expDataStart) + expTemplateRow + xml.substring(tbl2End);

// ──────────────────────────────────────────────────────────────────────────────
// 7. Save the modified template
// ──────────────────────────────────────────────────────────────────────────────
zip.file('word/document.xml', xml);
const output = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(outputPath, output);

const origSize  = (fs.readFileSync(templatePath) as Buffer).length;
console.log(`Template saved to: ${outputPath}`);
console.log(`Sizes — original: ${origSize} B  →  placeholders: ${(output as Buffer).length} B`);

// Quick sanity check
const checkZip = new (PizZip as any)(output.toString('binary'));
const checkXml: string = checkZip.files['word/document.xml'].asText();
const check = (tag: string) => checkXml.includes(tag) ? '✓' : '✗ MISSING';
console.log(`{#educationRows}  ${check('{#educationRows}')}`);
console.log(`{/educationRows}  ${check('{/educationRows}')}`);
console.log(`{#experienceRows} ${check('{#experienceRows}')}`);
console.log(`{/experienceRows} ${check('{/experienceRows}')}`);
console.log(`ΕΠΑΓΓΕΛΜΑΤΙΚΗ (standalone table) ${check('ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ')}`);
