// eslint-disable-next-line @typescript-eslint/no-var-requires
const Docxtemplater = require('docxtemplater');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PizZip = require('pizzip');
import fs from 'fs';
import path from 'path';

// ── Job CV templates embed photos at render-time ──────────────────────────────
const JOB_TEMPLATES = new Set(['navy', 'indigo', 'teal']);
const PHOTO_RID      = 'rId_employee_photo';
const IMG_REL_TYPE   = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image';

function injectPhoto(zip: typeof PizZip, photoFilePath: string): void {
  const ext  = path.extname(photoFilePath).toLowerCase().replace('.', '');
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const mediaName = `employee_photo.${ext}`;

  // 1. Embed the image binary
  const imgBuf = fs.readFileSync(photoFilePath);
  zip.file(`word/media/${mediaName}`, imgBuf);

  // 2. Add relationship entry
  let rels: string = zip.files['word/_rels/document.xml.rels'].asText();
  rels = rels.replace(
    '</Relationships>',
    `<Relationship Id="${PHOTO_RID}" Type="${IMG_REL_TYPE}" Target="media/${mediaName}"/></Relationships>`,
  );
  zip.file('word/_rels/document.xml.rels', rels);

  // 3. Add content type if missing
  let ct: string = zip.files['[Content_Types].xml'].asText();
  if (!ct.includes(mime)) {
    const def = `<Default Extension="${ext === 'jpg' ? 'jpeg' : ext}" ContentType="${mime}"/>`;
    ct = ct.replace('</Types>', `${def}</Types>`);
    zip.file('[Content_Types].xml', ct);
  }
}

function removePhotoDrawing(zip: typeof PizZip): void {
  let xml: string = zip.files['word/document.xml'].asText();
  // Remove the entire <w:drawing> element that references the placeholder rId
  xml = xml.replace(/<w:drawing>(?:(?!<\/w:drawing>)[\s\S])*?rId_employee_photo(?:(?!<\/w:drawing>)[\s\S])*?<\/w:drawing>/g, '');
  zip.file('word/document.xml', xml);
}
import { Education, Employee, EmployeeHistoryProject, EmployeePublication, Language, ProjectParticipation, Project, Role } from '../models';

// process.cwd() = /app in Docker, .../backend/ locally — templates/ lives there in both envs
const TEMPLATES_DIR = path.join(process.cwd(), 'templates');
const TEMPLATE_PATHS: Record<string, string> = {
  classic: path.join(TEMPLATES_DIR, 'cv_template_placeholders.docx'),
  navy:    path.join(TEMPLATES_DIR, 'cv_job_navy_placeholders.docx'),
  indigo:  path.join(TEMPLATES_DIR, 'cv_job_indigo_placeholders.docx'),
  teal:    path.join(TEMPLATES_DIR, 'cv_job_teal_placeholders.docx'),
};

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

export async function generateCVBuffer(employeeId: number, template = 'classic'): Promise<Buffer> {
  const employee = await Employee.findByPk(employeeId, {
    include: [
      { model: Education, as: 'education' },
      { model: Language,  as: 'languages' },
    ],
  }) as (Employee & { education: Education[]; languages: Language[] }) | null;

  if (!employee) throw new Error('Employee not found');

  const [participations, historyProjects, publications] = await Promise.all([
    (ProjectParticipation.findAll({
      where: { employeeId },
      include: [
        { model: Project, as: 'project' },
        { model: Role,    as: 'role'    },
      ],
      order: [['startDate', 'DESC']],
    })) as Promise<(ProjectParticipation & { project: Project; role: Role })[]>,
    EmployeeHistoryProject.findAll({
      where: { employeeId },
      order: [['startDate', 'DESC']],
    }),
    EmployeePublication.findAll({
      where: { employeeId },
      order: [['createdAt', 'ASC']],
    }),
  ]);

  // ── educationRows (classic template): formal education merged with language certs
  const educationRows = [
    ...(employee.education ?? []).map((edu) => {
      const parts = [edu.institutionName, edu.schoolName, edu.departmentName].filter(Boolean);
      return {
        institutionFull: parts.join(' – '),
        degreeTitle:     edu.degreeTitle ?? '',
        specialization:  edu.specialization ?? '',
        dateAwarded:     fmtMY(edu.dateAwarded),
      };
    }),
    ...(employee.languages ?? []).map((lang) => ({
      institutionFull: '',
      degreeTitle:     lang.degreeTitle ?? lang.language,
      specialization:  lang.level ?? '',
      dateAwarded:     '',
    })),
  ];

  // ── educationOnlyRows (job CV templates): formal education without language certs
  const educationOnlyRows = (employee.education ?? []).map((edu) => {
    const parts = [edu.institutionName, edu.schoolName, edu.departmentName].filter(Boolean);
    return {
      institutionFull: parts.join(' – '),
      degreeTitle:     edu.degreeTitle ?? '',
      specialization:  edu.specialization ?? '',
      dateAwarded:     fmtMY(edu.dateAwarded),
    };
  });

  // ── languageRows (job CV templates)
  const languageRows = (employee.languages ?? []).map((lang) => ({
    language:     lang.language,
    degreeTitle:  lang.degreeTitle ?? '',
    level:        lang.level ?? '',
  }));

  // ── Experience: participations + history projects sorted by startDate DESC
  const participationRows = participations.map((pp) => ({
    startDate:    pp.startDate,
    projectText:  pp.project?.name || '—',
    employerName: 'CMT ΠΡΟΟΠΤΙΚΗ ΕΠΕ',
    roleName:     pp.role?.name ?? '',
    period:       `${fmtMY(pp.startDate)} - ${fmtMY(pp.endDate)}`,
  }));

  const historyRows = historyProjects.map((h) => ({
    startDate:    h.startDate,
    projectText:  h.description || h.projectName || '—',
    employerName: h.employerName ?? '',
    roleName:     h.role ?? '',
    period:       `${fmtMY(h.startDate)} - ${fmtMY(h.endDate)}`,
  }));

  const experienceRows = [...participationRows, ...historyRows]
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .map(({ startDate: _s, ...rest }) => rest);

  const publicationsText = publications.map((pub) => pub.text).join('\n');

  const data = {
    // Personal info
    lastName:     employee.lastName    ?? '',
    firstName:    employee.firstName   ?? '',
    fatherName:   employee.fatherName  ?? '',
    motherName:   employee.motherName  ?? '',
    dateOfBirth:  fmtFull(employee.dateOfBirth),
    placeOfBirth: employee.placeOfBirth ?? '',
    phone:        employee.phone       ?? '',
    email:        employee.email       ?? '',
    homeAddress:  employee.homeAddress ?? '',
    // Classic template sections (education + languages merged)
    educationRows,
    // Job CV template sections (separated)
    educationOnlyRows,
    languageRows,
    hasLanguages: languageRows.length > 0,
    // Shared
    experienceRows,
    hasPublications: publications.length > 0,
    publicationsText,
  };

  const templatePath = TEMPLATE_PATHS[template] ?? TEMPLATE_PATHS.classic;
  if (!fs.existsSync(templatePath)) {
    throw new Error(`CV template not found at: ${templatePath}`);
  }

  const content = fs.readFileSync(templatePath, 'binary');
  const zip     = new PizZip(content);
  const doc     = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  doc.render(data);

  const renderedZip = doc.getZip() as typeof PizZip;

  // Job-CV templates embed a photo drawing — inject the actual image at runtime
  if (JOB_TEMPLATES.has(template)) {
    const photoFilePath = employee.photo
      ? path.join(process.cwd(), employee.photo)
      : null;

    if (photoFilePath && fs.existsSync(photoFilePath)) {
      injectPhoto(renderedZip, photoFilePath);
    } else {
      removePhotoDrawing(renderedZip);
    }
  }

  return renderedZip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }) as Buffer;
}
