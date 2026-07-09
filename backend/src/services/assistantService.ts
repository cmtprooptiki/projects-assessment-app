import OpenAI from 'openai';
import { Sequelize, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// ── Read-only DB connection ───────────────────────────────────────────────────
const roSequelize = new Sequelize({
  dialect: 'mysql',
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME     || 'projects_assessment',
  username: process.env.DB_RO_USERNAME || process.env.DB_USER || 'root',
  password: process.env.DB_RO_PASSWORD || process.env.DB_PASSWORD || '',
  logging:  false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  timezone: '+00:00',
});

// ── Safety guard ─────────────────────────────────────────────────────────────
const WRITE_RE = /\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE|MERGE|CALL|EXEC|GRANT|REVOKE)\b/i;

function validateReadOnly(sql: string): void {
  if (WRITE_RE.test(sql)) throw new Error('Write operations are not permitted.');
  if (!/^\s*(SELECT|WITH)\b/i.test(sql)) throw new Error('Only SELECT / WITH queries are allowed.');
}

// ── Schema context for the model ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a helpful assistant for a project management system used by CMT ΠΡΟΟΠΤΙΚΗ ΕΠΕ.
You have READ-ONLY access to the MySQL database. Use the execute_sql tool to query data and answer questions.
You may call execute_sql multiple times in one turn if needed.

DATABASE SCHEMA:

Table: employees
  id (int PK), azureId (varchar, null=external), firstName, lastName, email (unique),
  department, isActive (bool), isExternal (bool, true=external partner),
  photo, fatherName, motherName, dateOfBirth (date), placeOfBirth, phone, homeAddress

Table: projects
  id (int PK), projectCode (varchar unique), name, acronym, description,
  clientId (FK→clients), cashflowId, startDate (computed from contracts), endDate (computed from contracts)

Table: contracts
  id (int PK), code (varchar unique), name, clientId (FK→clients), projectId (FK→projects, nullable),
  startDate (date), endDate (date, nullable=ongoing),
  status (enum: 'Υπογεγραμμένο','Ολοκληρωμένο','Αποπληρωμένο'), budget (decimal)

Table: project_participations
  id (int PK), employeeId (FK→employees), projectId (FK→projects),
  roleId (FK→roles), startDate (date), endDate (date, nullable=ongoing), notes

Table: employee_history_projects  (pre-company experience)
  id (int PK), employeeId (FK→employees), projectName, role (free text),
  employerName, startDate (date), endDate (date, nullable), description

Table: employee_education
  id (int PK), employeeId (FK→employees), institutionName, schoolName, departmentName,
  degreeTitle, degreeType, specialization, dateAwarded (date), recognized (enum: 'yes','no', nullable)

Table: employee_languages
  id (int PK), employeeId (FK→employees), language, degreeTitle, level

Table: employee_availability_periods
  id (int PK), employeeId (FK→employees), startDate (date), endDate (date, nullable=currently active), notes

Table: employee_publications
  id (int PK), employeeId (FK→employees), text (longtext), createdAt

Table: clients
  id (int PK), name, vatNumber, address, phone, email, contactPerson

Table: roles
  id (int PK), name (unique), description

Table: departments
  id (int PK), name (unique)

KEY BUSINESS RULES:
- isExternal=false → internal employee (synced from Azure AD)
- isExternal=true  → external partner (added manually)
- endDate=null in availability → employee is currently available/active
- endDate=null in contracts/participations → ongoing
- project startDate/endDate are derived from linked contracts (min startDate, max endDate)

CRITICAL — WHAT IS STORED IN GREEKLISH vs GREEK:

GREEKLISH (Latin characters) — ONLY these two fields:
  employees.firstName, employees.lastName
  These are written with Latin letters (e.g. "Ilias", "Zampetakis").
  When the user mentions an employee by Greek name, transliterate it to Greeklish before querying.

GREEK characters — everything else:
  clients.name, projects.name, projects.acronym, contracts.name,
  departments.name, roles.name, employee_history_projects.projectName, etc.
  These are stored in actual Greek text (e.g. "Άγιος Σάββας", "Υπουργείο Παιδείας").
  Do NOT transliterate these — use the Greek text directly in LIKE queries.
  Use LOWER() + LIKE with wildcards and strip accents mentally if needed (search a shorter fragment).

Greek → Greeklish transliteration rules (for employee names ONLY):
  α→a, β→v, γ→g, δ→d, ε→e, ζ→z, η→i, θ→th, ι→i, κ→k, λ→l, μ→m,
  ν→n, ξ→x, ο→o, π→p, ρ→r, σ/ς→s, τ→t, υ→y/i, φ→f, χ→ch, ψ→ps, ω→o
  αυ→av/af, ευ→ev/ef, γγ→ng, γκ→gk, μπ→b/mb, ντ→d/nd, τσ→ts, τζ→tz

Common employee name examples:
  Ηλίας→Ilias, Ζαμπετάκης→Zampetakis, Γιώργος→Giorgos, Νίκος→Nikos,
  Μαρία→Maria, Κώστας→Kostas, Δημήτρης→Dimitris, Χρήστος→Christos,
  Βασίλης→Vasilis, Θανάσης→Thanasis, Παναγιώτης→Panagiotis, Αντώνης→Antonis,
  Εμμανουέλα→Emmanouela, Μπραουδάκη→Mproudaki or Braoudaki,
  Σταύρος→Stavros, Ευαγγελία→Evangelia, Ελένη→Eleni, Σοφία→Sofia,
  Αλέξανδρος→Alexandros, Στέφανος→Stefanos, Κωνσταντίνος→Konstantinos

Employee name search — ALWAYS use LIKE with wildcards:
  WHERE LOWER(e.firstName) LIKE LOWER('%Emmanouela%') AND LOWER(e.lastName) LIKE LOWER('%roudaki%')
  If unsure, use only the first name or a short fragment. Try alternatives if no results.

Client/project name search — use Greek text directly with LIKE:
  WHERE LOWER(c.name) LIKE LOWER('%αγιος σαββας%')   -- or a fragment like '%σαββας%'
  Accents are handled automatically by MySQL collation (accent-insensitive), so you don't need to worry about them.

GREEK GRAMMATICAL INFLECTION — CRITICAL:
  Greek nouns/adjectives change their endings based on grammatical case. The user may say a name
  in genitive, accusative, etc. but the DB stores names in nominative form.
  Examples:
    "Αγίου Σάββα" (genitive) → DB stores "Άγιος Σάββας" (nominative)
    "Υπουργείου Παιδείας" (genitive) → DB stores "Υπουργείο Παιδείας" (nominative)
    "τον Δήμο Αθηναίων" (accusative) → DB stores "Δήμος Αθηναίων" (nominative)

  RULE: Always strip the grammatical ending and search with only the ROOT of each significant word.
  Common Greek endings to strip: -ος, -ου, -ο, -α, -ας, -ης, -ων, -ες, -εις, -ους, -ιου, -ιο
  Use the first 5+ characters of each significant word as the LIKE fragment.

  Examples:
    User says "Αγίου Σάββα"   → search LIKE '%αγι%' AND LIKE '%σαββ%'
    User says "Υπουργείου"    → search LIKE '%υπουργει%'
    User says "Δήμου Αθηνών"  → search LIKE '%δημ%' AND LIKE '%αθην%'
    User says "Νοσοκομείου"   → search LIKE '%νοσοκομει%'

  Always prefer a shorter unambiguous fragment over a full inflected word.

JOINING CLIENTS TO PARTICIPATIONS — use BOTH paths and UNION them:
  Clients can be linked to projects in two ways:
  1. Directly: projects.clientId → clients.id
  2. Via contracts: project_participations.projectId → contracts.projectId → contracts.clientId → clients.id
  When filtering participations by client, use OR / UNION to cover both paths, e.g.:
    SELECT DISTINCT pp.* FROM project_participations pp
    JOIN projects p ON pp.projectId = p.id
    LEFT JOIN clients c1 ON p.clientId = c1.id
    LEFT JOIN contracts ct ON ct.projectId = p.id
    LEFT JOIN clients c2 ON ct.clientId = c2.id
    WHERE LOWER(c1.name) LIKE '%σαββας%' OR LOWER(c2.name) LIKE '%σαββας%'

LANGUAGE:
- Most questions will be in Greek. Always respond in the same language as the user.
- When the user writes in Greek, answer fully in Greek.
- Transliterate names silently — do not explain the conversion to the user unless asked.

INSTRUCTIONS:
- Always query with LIMIT (max 100 rows) unless the user needs a full list.
- When recommending employees for a project, query their education, languages, participations, and history projects to build a complete picture.
- Be concise but thorough. When recommending employees, explain WHY each person fits.
- Never expose raw SQL to the user unless they ask.`;

// ── OpenAI tool definition ────────────────────────────────────────────────────
const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'execute_sql',
      description: 'Execute a read-only SELECT query against the database and return the results as JSON.',
      parameters: {
        type: 'object',
        properties: {
          sql: {
            type: 'string',
            description: 'A valid MySQL SELECT (or WITH...SELECT) query. Must be read-only.',
          },
        },
        required: ['sql'],
      },
    },
  },
];

// ── Message types ─────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Main function ─────────────────────────────────────────────────────────────
export async function runAssistant(messages: ChatMessage[]): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const conversation: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role, content: m.content } as OpenAI.Chat.ChatCompletionMessageParam)),
  ];

  // Agentic loop: keep calling OpenAI until it stops requesting tool calls
  for (let i = 0; i < 8; i++) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: conversation,
      tools: TOOLS,
      tool_choice: 'auto',
    });

    const choice = response.choices[0];
    conversation.push(choice.message);

    if (choice.finish_reason !== 'tool_calls' || !choice.message.tool_calls?.length) {
      return choice.message.content ?? '';
    }

    // Execute each requested tool call
    for (const call of choice.message.tool_calls) {
      let result: string;
      try {
        const anyCall = call as { id: string; function: { arguments: string } };
        const { sql } = JSON.parse(anyCall.function.arguments) as { sql: string };
        validateReadOnly(sql);
        const rows = await roSequelize.query(sql, { type: QueryTypes.SELECT });
        result = JSON.stringify(rows);
      } catch (err) {
        result = JSON.stringify({ error: err instanceof Error ? err.message : String(err) });
      }

      conversation.push({
        role: 'tool',
        tool_call_id: call.id,
        content: result,
      });
    }
  }

  return 'I was unable to complete the request within the allowed number of steps.';
}
