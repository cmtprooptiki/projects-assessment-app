// Generates 3 modern color-themed CV template variants from the classic placeholder template.
// Run with: npx ts-node src/scripts/buildModernTemplates.ts
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PizZip = require('pizzip');
import fs from 'fs';
import path from 'path';

const INPUT_PATH = path.resolve(__dirname, '../../templates/cv_template_placeholders.docx');
const OUT_DIR    = path.resolve(__dirname, '../../templates');

const THEMES = [
  { name: 'navy',   headerFill: '1B2A4A', columnFill: 'D0D8EE' },
  { name: 'indigo', headerFill: '2D2170', columnFill: 'D5D2F0' },
  { name: 'teal',   headerFill: '0A5260', columnFill: 'C8E3E7' },
] as const;

// The 5 section-header cells that will receive colored backgrounds + white text.
const HEADER_TEXTS = [
  'ΒΙΟΓΡΑΦΙΚΟ ΣΗΜΕΙΩΜΑ',
  'ΠΡΟΣΩΠΙΚΑ ΣΤΟΙΧΕΙΑ',
  'ΕΚΠΑΙΔΕΥΣΗ',
  'ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ',
  'ΔΗΜΟΣΙΕΥΣΕΙΣ',
];

// Exact rPr in the classic template for all header text runs.
const CLASSIC_RPR = '<w:rPr><w:b/><w:sz w:val="18"/><w:szCs w:val="18"/><w:lang w:val="el-GR"/></w:rPr>';
const WHITE_RPR   = '<w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/><w:szCs w:val="18"/><w:lang w:val="el-GR"/></w:rPr>';

function applyTheme(xml: string, headerFill: string, columnFill: string): string {
  // 1. pct10 shading → solid colored fill (the 5 section-header cells)
  let out = xml.split('w:val="pct10" w:color="auto" w:fill="auto"')
               .join(`w:val="clear" w:color="auto" w:fill="${headerFill}"`);

  // 2. Make each section header text white (targeted by exact text content)
  for (const text of HEADER_TEXTS) {
    out = out.replace(
      `${CLASSIC_RPR}<w:t>${text}</w:t>`,
      `${WHITE_RPR}<w:t>${text}</w:t>`,
    );
  }

  // 3. Experience / publications column-header fill (E6E6E6 → light theme tint)
  out = out.split('w:fill="E6E6E6"').join(`w:fill="${columnFill}"`);

  return out;
}

if (!fs.existsSync(INPUT_PATH)) {
  console.error(`Input template not found: ${INPUT_PATH}`);
  console.error('Run prepareTemplate.ts first.');
  process.exit(1);
}

const baseContent = fs.readFileSync(INPUT_PATH, 'binary');
const baseZip     = new PizZip(baseContent);
const baseXml: string = baseZip.files['word/document.xml'].asText();

for (const theme of THEMES) {
  const modXml = applyTheme(baseXml, theme.headerFill, theme.columnFill);

  const zip = new PizZip(baseContent);
  zip.file('word/document.xml', modXml);
  const buf: Buffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });

  const outPath = path.join(OUT_DIR, `cv_modern_${theme.name}_placeholders.docx`);
  fs.writeFileSync(outPath, buf);

  // Sanity check
  const verify = new PizZip(buf.toString('binary')).files['word/document.xml'].asText();
  const hasFill    = verify.includes(theme.headerFill);
  const hasWhite   = verify.includes('FFFFFF');
  const noPct10    = !verify.includes('pct10');
  const noE6E6E6   = !verify.includes('E6E6E6');

  const ok = hasFill && hasWhite && noPct10 && noE6E6E6;
  console.log(`cv_modern_${theme.name}_placeholders.docx  [${ok ? 'OK' : 'FAIL'}]`);
  if (!ok) {
    console.log(`  hasFill=${hasFill} hasWhite=${hasWhite} noPct10=${noPct10} noE6E6E6=${noE6E6E6}`);
  }
}
