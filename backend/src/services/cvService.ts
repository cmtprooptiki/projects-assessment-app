import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';
import { Education, Employee, Language, ProjectParticipation, Project, Role } from '../models';

const TEMPLATE_PATH = path.join(__dirname, '../../templates/cv_template_placeholders.docx');

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

export async function generateCVBuffer(employeeId: number): Promise<Buffer> {
  const employee = await Employee.findByPk(employeeId, {
    include: [
      { model: Education, as: 'education' },
      { model: Language,  as: 'languages' },
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

  // Education rows: combine formal education + language certificates
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

  // Experience rows
  const experienceRows = participations.map((pp) => ({
    projectText: pp.notes || pp.project?.description || pp.project?.name || '—',
    roleName:    pp.role?.name ?? '',
    period:      `${fmtMY(pp.startDate)} - ${fmtMY(pp.endDate)}`,
  }));

  const data = {
    // Personal info
    lastName:     employee.lastName   ?? '',
    firstName:    employee.firstName  ?? '',
    fatherName:   employee.fatherName ?? '',
    motherName:   employee.motherName ?? '',
    dateOfBirth:  fmtFull(employee.dateOfBirth),
    placeOfBirth: employee.placeOfBirth ?? '',
    phone:        employee.phone      ?? '',
    email:        employee.email      ?? '',
    homeAddress:  employee.homeAddress ?? '',
    // Repeating sections
    educationRows,
    experienceRows,
  };

  const content = fs.readFileSync(TEMPLATE_PATH, 'binary');
  const zip     = new PizZip(content);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc     = new (Docxtemplater as any)(zip, { paragraphLoop: true, linebreaks: true });

  doc.render(data);

  return doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' }) as Buffer;
}
