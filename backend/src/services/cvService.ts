import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import { Education, Employee, Language, ProjectParticipation, Project, Role } from '../models';

// A4 with ~2 cm margins: 11906 - 2×1134 = 9638 DXA
const W = 9638;

// ─── border presets ───────────────────────────────────────────────────────────
const NIL  = { style: BorderStyle.NONE,   size: 0, color: 'FFFFFF' };
const LINE = { style: BorderStyle.SINGLE, size: 6, color: 'AAAAAA' };

const TABLE_NO_BORDER = { top: NIL, bottom: NIL, left: NIL, right: NIL, insideHorizontal: NIL, insideVertical: NIL };
const CELL_BORDER     = { top: LINE, bottom: LINE, left: LINE, right: LINE };
const CELL_NO_BORDER  = { top: NIL,  bottom: NIL,  left: NIL,  right: NIL  };

// ─── tiny helpers ─────────────────────────────────────────────────────────────

function run(text: string, opts: { bold?: boolean; size?: number; italics?: boolean; color?: string } = {}): TextRun {
  return new TextRun({ text: text ?? '', bold: opts.bold, size: opts.size ?? 20, italics: opts.italics, color: opts.color, font: 'Calibri' });
}

function para(children: TextRun[], align?: string, before = 60, after = 60): Paragraph {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Paragraph({ children, alignment: align as any, spacing: { before, after } });
}

function makeCell(
  children: Paragraph[],
  width: number,
  opts: { shade?: string; borders?: object; span?: number; vAlign?: string } = {},
): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: opts.shade ? { type: ShadingType.CLEAR, fill: opts.shade, color: 'auto' } : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    borders: (opts.borders ?? CELL_BORDER) as any,
    columnSpan: opts.span,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verticalAlign: (opts.vAlign ?? VerticalAlign.TOP) as any,
    children,
  });
}

// ─── dark header row (full-width shaded bar) ──────────────────────────────────

function sectionHeader(text: string, isTitle = false): Table {
  return new Table({
    width: { size: W, type: WidthType.DXA },
    borders: TABLE_NO_BORDER,
    rows: [
      new TableRow({
        children: [
          makeCell(
            [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 140, after: 140 },
                children: [
                  new TextRun({ text, bold: true, color: 'FFFFFF', size: isTitle ? 40 : 24, font: 'Calibri' }),
                ],
              }),
            ],
            W,
            { shade: '1F3864', borders: CELL_NO_BORDER, vAlign: VerticalAlign.CENTER },
          ),
        ],
      }),
    ],
  });
}

function spacer(pts = 180): Paragraph {
  return new Paragraph({ children: [], spacing: { before: 0, after: pts } });
}

// ─── date formatters ──────────────────────────────────────────────────────────

function fmtFull(s?: string | null): string {
  if (!s) return '';
  const d = new Date(s + 'T00:00:00');
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function fmtMY(s?: string | null): string {
  if (!s) return 'Παρόν';
  const d = new Date(s + 'T00:00:00');
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

// ─── personal info table ──────────────────────────────────────────────────────

const LW = 1700; // label column width
const VW = 3119; // value column width (LW+VW)*2 = 9638

function piRow(l1: string, v1: string, l2: string, v2: string): TableRow {
  return new TableRow({
    children: [
      makeCell([para([run(l1, { bold: true, size: 18 })])], LW, { shade: 'D9E1F2', borders: CELL_BORDER }),
      makeCell([para([run(v1)])], VW, { borders: CELL_BORDER }),
      makeCell([para([run(l2, { bold: true, size: 18 })])], LW, { shade: 'D9E1F2', borders: CELL_BORDER }),
      makeCell([para([run(v2)])], VW, { borders: CELL_BORDER }),
    ],
  });
}

function piRowWide(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      makeCell([para([run(label, { bold: true, size: 18 })])], LW,        { shade: 'D9E1F2', borders: CELL_BORDER }),
      makeCell([para([run(value)])],                            W - LW, { span: 3, borders: CELL_BORDER }),
    ],
  });
}

// ─── table column header row ──────────────────────────────────────────────────

function colHeaderRow(cols: { label: string; width: number }[]): TableRow {
  return new TableRow({
    tableHeader: true,
    children: cols.map(({ label, width }) =>
      makeCell(
        [para([run(label, { bold: true, size: 18 })], AlignmentType.CENTER)],
        width,
        { shade: 'BDD7EE', borders: CELL_BORDER },
      ),
    ),
  });
}

// ─── main CV generator ────────────────────────────────────────────────────────

export async function generateCVBuffer(employeeId: number): Promise<Buffer> {
  const employee = await Employee.findByPk(employeeId, {
    include: [
      { model: Education, as: 'education' },
      { model: Language, as: 'languages' },
    ],
  }) as (Employee & { education: Education[]; languages: Language[] }) | null;

  if (!employee) throw new Error('Employee not found');

  const participations = (await ProjectParticipation.findAll({
    where: { employeeId },
    include: [
      { model: Project, as: 'project' },
      { model: Role,    as: 'role'    },
    ],
    order: [['startDate', 'DESC']],
  })) as (ProjectParticipation & { project: Project; role: Role })[];

  // ── PERSONAL INFO TABLE ───────────────────────────────────────────────────
  const personalTable = new Table({
    width: { size: W, type: WidthType.DXA },
    borders: TABLE_NO_BORDER,
    rows: [
      piRow('Επώνυμο:',             employee.lastName   ?? '', 'Όνομα:',           employee.firstName  ?? ''),
      piRow('Πατρώνυμο:',           employee.fatherName ?? '', 'Μητρώνυμο:',       employee.motherName ?? ''),
      piRow('Ημερομηνία Γέννησης:', fmtFull(employee.dateOfBirth), 'Τόπος Γέννησης:', employee.placeOfBirth ?? ''),
      piRow('Τηλέφωνο:',            employee.phone      ?? '', 'E-mail:',          employee.email       ?? ''),
      piRow('Fax:',                 '',                         '',                 ''),
      piRowWide('Διεύθυνση Κατοικίας:', employee.homeAddress ?? ''),
    ],
  });

  // ── EDUCATION TABLE ───────────────────────────────────────────────────────
  const EDU = [
    { label: 'Όνομα Ιδρύματος',                  width: 3500 },
    { label: 'Τίτλος Πτυχίου',                   width: 2638 },
    { label: 'Ειδικότητα',                        width: 1800 },
    { label: 'Ημερομηνία\nΑπόκτησης Πτυχίου',    width: 1700 },
  ];

  const eduBodyRows: TableRow[] = (employee.education ?? []).map((edu) => {
    const instParas: Paragraph[] = [
      para([run(edu.institutionName, { bold: true })], undefined, 60, 20),
    ];
    if (edu.schoolName)    instParas.push(para([run(edu.schoolName,    { size: 18 })], undefined, 0, 20));
    if (edu.departmentName) instParas.push(para([run(edu.departmentName, { size: 18 })], undefined, 0, 60));

    const titleParas: Paragraph[] = [];
    if (edu.degreeType) titleParas.push(para([run(edu.degreeType, { size: 18, italics: true })], undefined, 60, 20));
    titleParas.push(para([run(edu.degreeTitle)], undefined, edu.degreeType ? 0 : 60, 60));

    return new TableRow({
      children: [
        makeCell(instParas,                                                                 3500, { borders: CELL_BORDER }),
        makeCell(titleParas,                                                                2638, { borders: CELL_BORDER }),
        makeCell([para([run(edu.specialization ?? '')])],                                  1800, { borders: CELL_BORDER }),
        makeCell([para([run(fmtMY(edu.dateAwarded))], AlignmentType.CENTER)],             1700, { borders: CELL_BORDER }),
      ],
    });
  });

  const educationTable = new Table({
    width: { size: W, type: WidthType.DXA },
    borders: TABLE_NO_BORDER,
    rows: [
      colHeaderRow(EDU),
      ...(eduBodyRows.length > 0
        ? eduBodyRows
        : [new TableRow({ children: [makeCell([para([run('—')])], W, { span: 4, borders: CELL_BORDER })] })]),
    ],
  });

  // ── LANGUAGES TABLE ───────────────────────────────────────────────────────
  const LANG = [
    { label: 'Γλώσσα',        width: 2400 },
    { label: 'Τίτλος / Πιστοποιητικό', width: 4738 },
    { label: 'Επίπεδο',       width: 2500 },
  ];

  const langBodyRows: TableRow[] = (employee.languages ?? []).map((lang) =>
    new TableRow({
      children: [
        makeCell([para([run(lang.language)])],                 2400, { borders: CELL_BORDER }),
        makeCell([para([run(lang.degreeTitle ?? '')])],        4738, { borders: CELL_BORDER }),
        makeCell([para([run(lang.level ?? '')], AlignmentType.CENTER)], 2500, { borders: CELL_BORDER }),
      ],
    }),
  );

  const languagesTable = new Table({
    width: { size: W, type: WidthType.DXA },
    borders: TABLE_NO_BORDER,
    rows: [
      colHeaderRow(LANG),
      ...(langBodyRows.length > 0
        ? langBodyRows
        : [new TableRow({ children: [makeCell([para([run('—')])], W, { span: 3, borders: CELL_BORDER })] })]),
    ],
  });

  // ── EXPERIENCE TABLE ──────────────────────────────────────────────────────
  const EXP = [
    { label: 'Έργο',                                         width: 4000 },
    { label: 'Εργοδότης',                                    width: 1500 },
    { label: 'Θέση και Καθήκοντα\nστο Έργο',                width: 2638 },
    { label: 'Απασχόληση στο Έργο\nΠερίοδος\n(από - έως)',  width: 1500 },
  ];

  const expBodyRows: TableRow[] = participations.map((pp) => {
    const proj = pp.project;
    const projectText = pp.notes || proj?.description || (proj ? `${proj.name} (${proj.acronym})` : '—');
    const period = `${fmtMY(pp.startDate)} - ${fmtMY(pp.endDate)}`;
    return new TableRow({
      children: [
        makeCell([para([run(projectText)])],                                                      4000, { borders: CELL_BORDER }),
        makeCell([para([run('CMT ΠΡΟΟΠΤΙΚΗ ΕΠΕ', { size: 18 })], AlignmentType.CENTER)],        1500, { borders: CELL_BORDER }),
        makeCell([para([run(pp.role?.name ?? '')])],                                              2638, { borders: CELL_BORDER }),
        makeCell([para([run(period, { size: 18 })], AlignmentType.CENTER)],                      1500, { borders: CELL_BORDER }),
      ],
    });
  });

  const experienceTable = new Table({
    width: { size: W, type: WidthType.DXA },
    borders: TABLE_NO_BORDER,
    rows: [
      colHeaderRow(EXP),
      ...(expBodyRows.length > 0
        ? expBodyRows
        : [new TableRow({ children: [makeCell([para([run('—')])], W, { span: 4, borders: CELL_BORDER })] })]),
    ],
  });

  // ── BUILD DOCUMENT ────────────────────────────────────────────────────────
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, // ~2 cm
          },
        },
        children: [
          sectionHeader('ΒΙΟΓΡΑΦΙΚΟ ΣΗΜΕΙΩΜΑ', true),
          spacer(200),

          sectionHeader('ΠΡΟΣΩΠΙΚΑ ΣΤΟΙΧΕΙΑ'),
          personalTable,
          spacer(),

          sectionHeader('ΕΚΠΑΙΔΕΥΣΗ'),
          educationTable,
          spacer(),

          sectionHeader('ΞΕΝΕΣ ΓΛΩΣΣΕΣ'),
          languagesTable,
          spacer(),

          sectionHeader('ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ'),
          experienceTable,
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
