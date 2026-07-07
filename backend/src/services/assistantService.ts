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

INSTRUCTIONS:
- Always query with LIMIT (max 100 rows) unless the user needs a full list.
- When recommending employees for a project, query their education, languages, participations, and history projects to build a complete picture.
- Answer in the same language the user writes in (Greek or English).
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

// ── OpenAI client (fails loudly at startup if key is missing) ─────────────────
if (!process.env.OPENAI_API_KEY) {
  console.error('[Assistant] OPENAI_API_KEY is not set — assistant will not work');
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Main function ─────────────────────────────────────────────────────────────
export async function runAssistant(messages: ChatMessage[]): Promise<string> {

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
