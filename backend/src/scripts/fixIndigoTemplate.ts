// eslint-disable-next-line @typescript-eslint/no-var-requires
const PizZip = require('pizzip');
import fs from 'fs';
import path from 'path';

const TEMPLATE = path.resolve(__dirname, '../../templates/cv_job_indigo_placeholders.docx');

const INV_OPEN  = '<w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:rPr><w:color w:val="FFFFFF"/><w:sz w:val="2"/><w:szCs w:val="2"/></w:rPr><w:t>{#languageRows}</w:t></w:r></w:p>';
const INV_CLOSE = '<w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:rPr><w:color w:val="FFFFFF"/><w:sz w:val="2"/><w:szCs w:val="2"/></w:rPr><w:t>{/languageRows}</w:t></w:r></w:p>';

// Exact paragraph from the user's template that contains {#languageRows}{language}
const OPEN_PARA =
  '<w:p><w:pPr><w:spacing w:before="40" w:after="10"/></w:pPr>' +
  '<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>' +
  '<w:color w:val="FFFFFF"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>' +
  '<w:t xml:space="preserve">{#languageRows}{language}</w:t></w:r></w:p>';

// Same paragraph but with {language} only (after extracting the loop tag)
const OPEN_PARA_FIXED =
  INV_OPEN +
  '<w:p><w:pPr><w:spacing w:before="40" w:after="10"/></w:pPr>' +
  '<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>' +
  '<w:color w:val="FFFFFF"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>' +
  '<w:t xml:space="preserve">{language}</w:t></w:r></w:p>';

// Exact closing: {level}{/languageRows} inside <w:t>
const CLOSE_TEXT = '<w:t xml:space="preserve">{level}{/languageRows}</w:t></w:r></w:p>';
const CLOSE_TEXT_FIXED = '<w:t xml:space="preserve">{level}</w:t></w:r></w:p>' + INV_CLOSE;

const content = fs.readFileSync(TEMPLATE, 'binary');
const zip = new PizZip(content);
let xml: string = zip.files['word/document.xml'].asText();

if (!xml.includes(OPEN_PARA))  { console.error('ERROR: opening paragraph not found'); process.exit(1); }
if (!xml.includes(CLOSE_TEXT)) { console.error('ERROR: closing text not found'); process.exit(1); }

xml = xml.replace(OPEN_PARA, OPEN_PARA_FIXED);
xml = xml.replace(CLOSE_TEXT, CLOSE_TEXT_FIXED);

zip.file('word/document.xml', xml);
fs.writeFileSync(TEMPLATE, zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));
console.log('✓ Language loop tags fixed in cv_job_indigo_placeholders.docx');
