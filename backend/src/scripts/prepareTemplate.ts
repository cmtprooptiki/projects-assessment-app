/**
 * One-time script to create cv_template_placeholders.docx from cv_template.docx.
 * Run with: npx ts-node src/scripts/prepareTemplate.ts
 */
import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';

const templatePath = path.join(__dirname, '../../templates/cv_template.docx');
const outputPath   = path.join(__dirname, '../../templates/cv_template_placeholders.docx');

const content = fs.readFileSync(templatePath, 'binary');
const zip = new PizZip(content);

let xml = zip.files['word/document.xml'].asText();

// ──────────────────────────────────────────────────────────────────────────────
// 1. Personal info — simple text replacements
// ──────────────────────────────────────────────────────────────────────────────
const personalReplacements: [string, string][] = [
  ['Μαρκάτου ',          '{lastName} '],  // trailing space preserved
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
// 2. Locate all <w:tr …> start positions
// ──────────────────────────────────────────────────────────────────────────────
function getTrPositions(src: string): number[] {
  const re = /<w:tr[ >]/g;
  const positions: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) positions.push(m.index);
  return positions;
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. Education template row (replaces TR[17]–TR[20])
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
// 4. Experience template row (replaces TR[24]–TR[41])
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
// 5. Replace education data rows TR[17]–TR[20] with the template row
// ──────────────────────────────────────────────────────────────────────────────
let trPos = getTrPositions(xml);
// TR[17] = first edu data row, TR[21] = experience section header (boundary)
const eduDataStart = trPos[17];
const eduDataEnd   = trPos[21];  // keep TR[21] onwards

xml = xml.substring(0, eduDataStart) + eduTemplateRow + xml.substring(eduDataEnd);

// ──────────────────────────────────────────────────────────────────────────────
// 6. Replace experience data rows with the template row
//    After edu replacement: TR count went from 42 → 39 (removed 3 extra rows)
//    Original TR[24] is now TR[21] → new index 21
//    Original TR[41] is now TR[38] → new index 38, but that's empty row at end
//    We want TR[21..38] replaced: 18 rows → 1 template row
// ──────────────────────────────────────────────────────────────────────────────
trPos = getTrPositions(xml);
const expDataStart = trPos[21];
// TR[38] end = end of last TR in document (there's no TR after it before </w:tbl>)
// So end = next </w:tr> after expDataStart ... actually we want to find TR[38] end
// We have 39 TRs after edu replacement (0..38). Last TR is index 38.
// expDataEnd = position of next thing after TR[38], which is end of table.
// Since there's no TR[39], we find the end of the last TR:
const expDataEndPos = trPos.length > 38
  ? trPos[39]  // next TR (shouldn't exist)
  : xml.length;  // go to end and find </w:tbl>

// Find the closing </w:tbl> after expDataStart
const tblCloseIdx = xml.indexOf('</w:tbl>', expDataStart);
if (tblCloseIdx < 0) throw new Error('Could not find </w:tbl>');

xml = xml.substring(0, expDataStart) + expTemplateRow + xml.substring(tblCloseIdx);

// ──────────────────────────────────────────────────────────────────────────────
// 7. Save the modified template
// ──────────────────────────────────────────────────────────────────────────────
zip.file('word/document.xml', xml);
const output = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(outputPath, output);

console.log(`Template saved to: ${outputPath}`);
console.log(`XML length: original=${content.length}, modified=${xml.length}`);
