# Projects Assessment App — Claude Context

Employee/Partner Project Participation Monitoring System for CMT ΠΡΟΟΠΤΙΚΗ ΕΠΕ.

---

## Stack

- **Backend**: `backend/` — Node.js + Express + TypeScript + Sequelize + MySQL, port 3001
- **Frontend**: `frontend/` — Next.js 14 + TypeScript + Tailwind + Recharts, port 3000
- **Deployment**: Docker + Portainer stack at `tracker.cmtprooptiki.gr`
- **Auth**: Azure AD (employees sync via `/api/employees/sync`), JWT sessions

---

## Backend Structure

```
backend/src/
  app.ts                        # entry point
  config/database.ts            # Sequelize connection
  config/sequelize.config.js    # sequelize-cli config
  models/                       # Sequelize models + index.ts (associations)
  migrations/                   # JS migration files (sequelize-cli)
  services/                     # business logic
  controllers/                  # thin request/response handlers
  routes/                       # index.ts wires all sub-routers under /api
  middleware/errorHandler.ts    # AppError class + global handler
  middleware/validate.ts        # express-validator middleware
  validators/                   # express-validator rule sets
  scripts/prepareTemplate.ts    # one-time CV template preparation script
  types/index.ts
templates/
  cv_template.docx              # original Word template
  cv_template_placeholders.docx # generated template with {placeholders}
uploads/employees/              # employee photo files
```

---

## Database Schema (current)

### employees
| column | type | notes |
|---|---|---|
| id | int unsigned PK | |
| azureId | varchar(50) | null = external partner |
| firstName, lastName | varchar(100) | |
| email | varchar(255) unique | |
| department | varchar(100) | |
| isActive | boolean | default true |
| isExternal | boolean | default false — external partners |
| photo | varchar(500) | path to uploaded file |
| fatherName, motherName | varchar(100) | |
| dateOfBirth | date | |
| placeOfBirth | varchar(200) | |
| phone | varchar(50) | |
| homeAddress | text | |

### projects
| column | type | notes |
|---|---|---|
| id | int unsigned PK | |
| projectCode | varchar unique | |
| name, acronym | varchar | |
| description | text | |
| clientId | FK → clients | |
| cashflowId | varchar | |
| startDate, endDate | computed | derived from linked contracts |

### contracts
| column | type | notes |
|---|---|---|
| id | int unsigned PK | |
| code | varchar unique | |
| name | varchar | |
| clientId | FK → clients | |
| projectId | FK → projects nullable | |
| startDate | date | |
| endDate | date nullable | |
| status | enum: Υπογεγραμμένο / Ολοκληρωμένο / Αποπληρωμένο | |
| budget | decimal | |

### project_participations
| column | type | notes |
|---|---|---|
| id | int unsigned PK | |
| employeeId | FK → employees | |
| projectId | FK → projects | |
| roleId | FK → roles | |
| startDate | date | |
| endDate | date nullable | |
| notes | text | |

### employee_history_projects
| column | type | notes |
|---|---|---|
| id | int unsigned PK | |
| employeeId | FK → employees | |
| projectName | varchar(300) | |
| role | varchar(200) nullable | free text |
| employerName | varchar(200) nullable | |
| startDate | date | |
| endDate | date nullable | |
| description | text nullable | |

### employee_education
| column | type |
|---|---|
| id | PK |
| employeeId | FK |
| institutionName | varchar(300) |
| schoolName, departmentName | varchar(300) nullable |
| degreeTitle | varchar(300) |
| degreeType | varchar(200) nullable |
| specialization | varchar(200) nullable |
| dateAwarded | date nullable |
| recognized | enum: yes/no nullable |

### employee_languages
| column | type |
|---|---|
| id | PK |
| employeeId | FK |
| language | varchar(100) |
| degreeTitle | varchar(200) nullable |
| level | varchar(100) nullable |

### employee_availability_periods
| column | type | notes |
|---|---|---|
| id | PK | |
| employeeId | FK | |
| startDate | date | |
| endDate | date nullable | null = active/present |
| notes | text nullable | |

### clients, roles, departments, users — standard CRUD tables

---

## API Routes

```
/api/auth                               login, refresh
/api/users                              CRUD users
/api/employees                          CRUD + filters (department, isActive, isExternal, search)
/api/employees/:id/education            CRUD education records
/api/employees/:id/languages            CRUD language records
/api/employees/:id/availability         CRUD availability periods
/api/employees/:id/history-projects     CRUD pre-company history projects
/api/projects                           CRUD + filters
/api/contracts                          CRUD + filters
/api/clients                            CRUD
/api/roles                              CRUD
/api/departments                        CRUD
/api/participations                     CRUD + filters
/api/participations/recalculate         POST — caps internal employee end dates to today
/api/dashboard/summary                  overview stats
/api/dashboard/project/:projectId       project-level stats
/api/dashboard/employee/:employeeId     employee-level stats
/api/cv/:employeeId                     GET — download CV as .docx
```

---

## Key Business Logic

### Internal vs External employees
- **Internal**: `isExternal = false`, has `azureId` (synced from Microsoft 365)
- **External**: `isExternal = true`, added manually, no `azureId`

### Participation creation logic (`participationService.createParticipations`)
- **Internal employees**: auto-splits participation periods by intersecting employee availability periods with project contract dates. End dates are capped at today (no future dates).
- **External employees**: manual `startDate`/`endDate` provided by user. Validates dates fall within the project's contract date range.

### Recalculate participations (`POST /api/participations/recalculate`)
- Only affects **internal** employees
- Finds all their participations where `endDate IS NULL OR endDate > today`
- Sets them to today
- External employee participations are never touched

### Availability periods — `endDate = null`
- Means the employee is currently active / present
- The system treats `null` as today when computing participation date ranges

### Project dates
- `project.startDate` and `project.endDate` are computed from linked contracts (min startDate, max endDate)
- If any contract has `endDate = null`, the project is considered ongoing (`endDate = null`)

---

## CV Export

- Library: `docxtemplater` + `pizzip` (CommonJS `require()` — not ESM import)
- Template: `backend/templates/cv_template_placeholders.docx` (generated by `prepareTemplate.ts`)
- Route: `GET /api/cv/:employeeId` → returns `.docx` buffer

### Template structure (3 tables in Word)
- **Table[0]**: Personal info + education rows (`{#educationRows}...{/educationRows}`)
- **Table[1]**: Standalone "ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ" header (never modified)
- **Table[2]**: Experience rows (`{#experienceRows}...{/experienceRows}`)

### Experience row placeholders
`{projectText}` | `{employerName}` | `{roleName}` | `{period}`

### Experience rows data source
Both combined and sorted by `startDate DESC`:
1. `project_participations` → `employerName = 'CMT ΠΡΟΟΠΤΙΚΗ ΕΠΕ'`
2. `employee_history_projects` → `employerName = h.employerName`

### To regenerate the template after editing `prepareTemplate.ts`:
```bash
cd backend
npx ts-node src/scripts/prepareTemplate.ts
```
Then commit the updated `templates/cv_template_placeholders.docx`.

---

## Deployment

- Docker image built from `backend/Dockerfile` (multi-stage: builder → production)
- `COPY templates ./templates` is in the Dockerfile — template files are baked into the image
- **After any backend change: rebuild the image in Portainer** (do not just restart)
- Migrations run automatically on container start: `npx sequelize-cli db:migrate`
- Frontend is a separate Next.js container

---

## Frontend Structure

```
frontend/src/
  app/(dashboard)/              # Next.js app router pages
    employees/                  # list, new, [id]/edit
    projects/                   # list, new, [id]/edit
    contracts/                  # list, new, [id]/edit
    participations/             # list, new, [id]/edit
    clients/                    # list, new, [id]/edit
    roles/                      # list
    departments/                # list
    cv/                         # CV export page
    statistics/                 # stats page
  components/
    ui/                         # Button, Card, Badge, Input, Select, DatePicker, Modal, etc.
    employees/                  # EmployeeForm, EmployeeTable, EmployeeFilters
    participations/             # ParticipationForm, ParticipationTable, ParticipationFilters
    projects/                   # ProjectForm, ProjectTable
    ...
  hooks/                        # React Query hooks (useEmployees, useParticipations, etc.)
  types/index.ts                # all TypeScript interfaces
  lib/api.ts                    # axios instance
```

### Badge variants: `success` | `warning` | `danger` | `info` | `default`

---

## Patterns & Conventions

- Migrations: `backend/src/migrations/20240101000NNN-description.js` (sequential NNN)
- Nested routes follow pattern: `router.use('/employees/:employeeId/X', xRoutes)` with `mergeParams: true`
- FormData (multipart) is used for employee create/update (photo upload) — boolean fields come as strings `"true"`/`"false"` and must be parsed explicitly in the controller
- `isActive` and `isExternal` both require `=== 'true' || === true` parsing in `employeeController.ts`
- Date-only fields use `DATEONLY` Sequelize type → stored/returned as `YYYY-MM-DD` strings
- All API responses: `{ success: true, data: ... }` or `{ success: false, message: ... }`
- Pagination response: `{ success: true, data: [...], meta: { total, page, limit, totalPages } }`
