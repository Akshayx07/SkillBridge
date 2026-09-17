# 🌉 SkillBridge

**One platform connecting students, industry professionals, academicians, and admins — with AI-powered career tools.**

SkillBridge is a four-sided career ecosystem. It goes beyond a traditional job board: students get a quantified match score for any job, a list of the exact skills they're missing, curated learning paths, and a personalized mock interview. Recruiters get a ranked, explainable shortlist of candidates instead of a pile of résumés. Universities run programs, mentorship, and research collaborations on the same platform — and admins see the whole ecosystem, including which skills are most in demand across every job posting.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [How It Works](#-how-it-works)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Using SkillBridge](#-using-skillbridge)
- [Demo Accounts](#-demo-accounts)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Data Model](#-data-model)
- [Available Scripts](#-available-scripts)
- [Deployment](#-deployment)
- [Current Status & Roadmap](#-current-status--roadmap)
- [Troubleshooting](#-troubleshooting)

---

## 🧭 Overview

### The problem

A student applies to dozens of jobs and hears back from almost none — and when they do, it's one line: *"we went with someone else."* No reason, no roadmap. Meanwhile a company receives a hundred résumés and has no fast, fair way to tell who fits. And universities teach without knowing what the market actually wants.

**Everyone is guessing. Everyone loses.**

### The solution

SkillBridge closes the loop between *what students learn* and *where they're needed*:

| For… | SkillBridge provides… |
| --- | --- |
| **Students** | A living skills profile, job match scores, skill-gap analysis with learning resources, mock interviews, and mentorship |
| **Industry** | Job postings with required skills, ranked candidate shortlists with transparent scoring, and mentorship |
| **Academicians** | Hackathon organization, industry immersion / faculty development programs, and a research collaboration hub |
| **Admins** | Platform analytics, user management, and credential verification |

> **Why it wins:** A job board ends at "apply." SkillBridge continues into scoring, gap analysis, learning paths, and interview practice — one continuous loop. And because every score is transparent and explainable, both sides can trust it.

---

## ✨ Key Features

### 👩‍🎓 Student dashboard
- **Living profile** — bio, headline, education/company, social links, and skills rated 1–5.
- **Job & internship browsing** — search and view openings with their required skills.
- **Application pipeline** — track applications by status (Pending → Reviewing → Accepted / Rejected).
- **Mentorship** — connect with industry professionals and academicians.
- **🤖 AI Skill-Gap Analyzer** — picks a target job and returns a 0–100 match score plus three honest buckets:
  - ✅ **Matched** skills (proficiency ≥ 3)
  - ❌ **Gaps** with curated learning resources for each missing skill
  - ✨ **Bonus** skills that set you apart
- **🤖 AI Mock Interview** — 3 personalized technical questions chosen from a curated question bank based on the student's own skills, a 1–100 score per answer, and detailed strengths / improvements feedback.

### 🏢 Industry dashboard
- **Post jobs** — full-time, part-time, internship, or faculty development programs, with required skills attached.
- **Track postings** — per-job applicant counts and status.
- **🤖 Candidate Shortlisting Engine** — every applicant is scored and bucketed into **Strong / Good / Partial / Weak Match** tiers, with the skill match and profile completeness shown separately — ranked for recruiters, not hidden in a black box.
- **Mentorship** — manage mentees.

### 🎓 Academician dashboard
- **Hackathon organization** — create and manage events with dates, location, and team size.
- **Industry Immersion & FDP board** — browse and publish industry immersions, faculty development programs, and summer internships.
- **Research Collaboration Hub** — publish and find consultancy work, student projects, joint research, and thesis guidance.
- **Mentee tracking** — view and manage student mentees.

### 🛡️ Admin dashboard
- **Platform analytics** — total users, hackathons, jobs, and applications; hiring rate; role breakdown.
- **Top Skills in Demand** — computed with raw SQL across all job postings: a direct market signal for universities about what to teach next.
- **Industry partner & immersion tracking**.
- **Credential Verification** — approve or reject student certifications, degrees, courses, and achievements (with a reason on rejection), with filterable queues and full audit trail (who verified what, and when).

### 🔐 Platform-wide
- **Four-role RBAC** enforced at three layers: edge middleware, server components/API routes, and admin-only endpoint checks.
- **Secure authentication** with NextAuth (JWT sessions) and bcrypt-hashed passwords (cost 12).
- **Responsive, accessible UI** built with Tailwind CSS and Radix UI primitives, with light/dark theming.

> **A note on the "AI":** The Skill-Gap Analyzer, Mock Interview coach, and Candidate Compatibility scorer are **deterministic, rule-based engines** — no external LLM calls. This means zero API cost, zero rate limits, 100% explainable scores, and a demo that never flakes. Because each is a simple `POST → JSON` endpoint, swapping in a real LLM later is a drop-in change.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
| --- | --- | --- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) | One deployable for UI, API, and auth. Server Components render data-heavy pages on the server, shipping almost no JavaScript for read-only views. |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | End-to-end type safety from database to UI. |
| **Database** | [PostgreSQL](https://www.postgresql.org/) on [Neon](https://neon.tech/) | The domain is deeply relational (skills connect to profiles, jobs, immersions, and research). Neon is serverless, scales to zero when idle, and supports instant database branching for safe testing. |
| **ORM** | [Prisma](https://www.prisma.io/) | Type-safe client, readable schema-as-documentation, and one-command migrations. |
| **Auth** | [NextAuth.js](https://next-auth.js.org/) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Industry-standard JWT sessions with role data baked in; passwords hashed at cost 12. |
| **UI** | [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) (shadcn-style) | Utility-first styling with accessible, headless primitives. |
| **Icons** | [Lucide](https://lucide.dev/) | Consistent, lightweight icon set. |
| **Deployment** | [Vercel](https://vercel.com/) | Git-push deploys, per-PR previews, global edge network. |
| **Neon tooling** | `@neon/config`, `@neon/env` + `neon.ts` | Infrastructure-as-code for Neon branches and type-safe environment variables. |

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│   React Client Components (forms, chat, dashboards) +       │
│   Server Components (data-heavy read-only pages)            │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  NEXT.JS 15 (App Router)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Middleware   │  │  Server      │  │  API Routes      │  │
│  │  (edge RBAC)  │  │  Components  │  │  /api/ai/*       │  │
│  │  JWT check →  │  │  read data   │  │  /api/jobs ...   │  │
│  │  role guard   │  │  via Prisma  │  │  (mutations +    │  │
│  └──────────────┘  └──────────────┘  │   AI engines)     │  │
│                                       └────────┬─────────┘  │
└──────────────────────────────────────────────────┼──────────┘
                                                   │ Prisma Client
┌──────────────────────────────────────────────────▼──────────┐
│          POSTGRESQL ON NEON (serverless, branchable)        │
│  users · profiles · skills (M2M) · jobs · applications ·    │
│  mentorships · hackathons · immersions · research ·         │
│  credential_verifications                                   │
└─────────────────────────────────────────────────────────────┘
```

**The request → response flow:**

1. **Sign in** — the login page posts credentials to NextAuth. The password is verified with `bcrypt.compare`; on success a JWT carrying `id` + `role` is issued.
2. **Middleware guards every request** (`src/middleware.ts`) at the edge, enforcing role-based routing. Students can't even load an admin URL; unauthenticated users are redirected to login with a `callbackUrl`.
3. **Server Components render dashboards**, querying the database directly through Prisma — often in parallel with `Promise.all`.
4. **Interactive features call API routes**, which re-check the session server-side (defense in depth) before returning JSON.
5. **Rule-based engines** compute match scores, interview questions/evaluations, and candidate rankings in-memory.

---

## 📁 Project Structure

```
skillbridge/
├── prisma/
│   ├── schema.prisma          # Database schema (models, enums, relations)
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── api/               # REST API routes
│   │   │   ├── admin/credentials/   # Admin credential verification (GET, PATCH)
│   │   │   ├── ai/
│   │   │   │   ├── compatibility/   # Candidate shortlisting engine
│   │   │   │   ├── interview/       # Mock interview question bank + scorer
│   │   │   │   └── skill-gap/       # Skill-gap analysis engine
│   │   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   │   ├── immersions/          # Industry immersions / FDP
│   │   │   ├── jobs/                # Job list, create, detail
│   │   │   ├── research/            # Research collaborations
│   │   │   └── skills/              # Skill catalog
│   │   ├── auth/login/        # Sign-in page (with demo-account quick login)
│   │   ├── dashboard/
│   │   │   ├── student/       # + interview, skill-gap
│   │   │   ├── industry/      # + jobs/new, jobs/[id]
│   │   │   ├── academician/   # + immersions, research
│   │   │   └── admin/         # + credentials
│   │   ├── globals.css        # Tailwind layers + CSS theme variables
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Redirects by session role
│   ├── components/
│   │   ├── layout/            # Sidebar, header, session provider
│   │   └── ui/                # Reusable UI primitives (button, card, …)
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config + role helpers
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── session.ts         # Session helpers
│   │   └── utils.ts           # `cn()` class-merge helper
│   └── middleware.ts          # Edge RBAC middleware
├── docs/                      # Pitch, presentation, tech-stack & walkthrough docs
├── neon.ts                    # Neon branch configuration (infra-as-code)
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind theme
└── package.json               # Scripts and dependencies
```

---

## 🚀 Installation

### Prerequisites

- **Node.js 18.18 or newer** (Node 20 LTS recommended)
- **npm** (a `package-lock.json` is committed)
- **A PostgreSQL database** — either a free [Neon](https://neon.tech) project (recommended, and what this project is wired for) or a local PostgreSQL instance
- *(Optional)* **Git** to clone the repository

### Step 1 — Clone the repository

```bash
git clone <your-repository-url>
cd skillbridge
```

### Step 2 — Install dependencies

```bash
npm install
```

This also runs `prisma generate` automatically via the `postinstall` script, generating the type-safe Prisma client.

### Step 3 — Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Then open `.env` and set:

```env
DATABASE_URL="postgresql://user:password@host:5432/skillbridge?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="a-long-random-secret"
```

Generate a strong secret with:

```bash
openssl rand -base64 32
```

> ⚠️ **Never commit `.env`.** It is already excluded by `.gitignore`.

**Using Neon (recommended):** create a project at [neon.tech](https://neon.tech), copy the connection string from your project dashboard, and paste it as `DATABASE_URL`. Neon's serverless Postgres scales to zero when idle, so it costs nothing while you develop.

**Using local PostgreSQL:**

```bash
createdb skillbridge
# then set DATABASE_URL to:
# postgresql://postgres:postgres@localhost:5432/skillbridge?schema=public
```

### Step 4 — Set up the database

Push the Prisma schema to your database. (The repo does not include migration files, so `db:push` is the quickest path for a fresh setup.)

```bash
npm run db:push
```

If you'd prefer versioned migrations, run `npm run db:migrate` instead and give the migration a name — this creates a `prisma/migrations/` folder you can commit.

### Step 5 — Seed demo data

```bash
npm run db:seed
```

This creates realistic demo data: **12 skills**, **5 users across all 4 roles**, **2 job postings**, **3 applications**, **3 mentorships**, and **3 hackathons**. It prints the demo account emails at the end.

### Step 6 — Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to the login page.

---

## 🎯 Using SkillBridge

### Signing in

1. Go to [http://localhost:3000](http://localhost:3000) — you'll land on the login page at `/auth/login`.
2. Either **enter credentials manually** or click one of the **Demo Accounts** buttons (Student / Industry / Academician / Admin) for one-click sign-in.
3. You're redirected to the dashboard for your role. Admins can view any role's dashboard.

### Suggested walkthrough: Student

1. Sign in as **Student** → you land on the student dashboard (profile, stats, skills, application pipeline).
2. Click **AI Skill Gap Analyzer**.
3. Select a job (e.g. *Junior Full-Stack Engineer*) and click **Analyze**.
4. Review your match score, the matched skills, the gaps (each with learning resources), and your bonus skills.
5. Click **Start Interview** → answer the 3 personalized questions → see your score and feedback.
6. Return to the dashboard to view your skills and applications.

### Suggested walkthrough: Industry

1. Sign in as **Industry** → dashboard shows your postings, applications, and mentees.
2. Click **Post a Job**, choose a type, fill in the details, and search/add required skills.
3. Publish → you're taken to that job's detail page.
4. See the **Candidate Shortlisting Engine** rank applicants by compatibility, with matched/missing skills and tier labels.

### Suggested walkthrough: Academician

1. Sign in as **Academician** → dashboard shows your hackathons and mentees.
2. Open **Immersion & FDP** to browse and filter industry programs.
3. Open **Research Hub** → click **New Collaboration** to publish a consultancy request, student project, joint research, or thesis guidance.

### Suggested walkthrough: Admin

1. Sign in as **Admin** → platform stats, hiring rate, role breakdown, and Top Skills in Demand.
2. Open **Credentials** to review pending certifications and **verify** or **reject** them (with a reason).

---

## 🔑 Demo Accounts

After running `npm run db:seed`, all accounts use the password **`password123`**:

| Role | Email |
| --- | --- |
| 👩‍🎓 Student | `alex@student.com` |
| 👩‍🎓 Student | `priya@student.com` |
| 🏢 Industry | `jordan@industry.com` |
| 🎓 Academician | `sarah@academician.com` |
| 🛡️ Admin | `admin@skillbridge.com` |

> These are demo credentials only. Never ship seeded accounts to production.

---

## 🔧 Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Neon, Supabase, Vercel Postgres, or local). |
| `NEXTAUTH_URL` | ✅ | Base URL of the app. Use `http://localhost:3000` locally; your production domain on Vercel. |
| `NEXTAUTH_SECRET` | ✅ | Secret used to sign JWT tokens. Generate with `openssl rand -base64 32`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ❌ | Only needed if you add the Google OAuth provider. |
| `GITHUB_ID` / `GITHUB_SECRET` | ❌ | Only needed if you add the GitHub OAuth provider. |

The project currently ships with the **Credentials provider** (email + password) only. OAuth is scaffolded in `.env.example` but not wired up in `src/lib/auth.ts`.

---

## 🔌 API Reference

All routes live under `/api`. Routes marked 🔒 require a session; admin-only is noted separately.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/jobs` | Public | List active jobs with required skills. |
| `POST` | `/api/jobs` | 🔒 | Create a job posting (`title`, `description`, `company` required). |
| `GET` | `/api/jobs/:id` | Public | Job detail with skills and application count. |
| `GET` | `/api/skills` | Public | Full skill catalog, sorted by category then name. |
| `GET` | `/api/immersions` | Public | List industry immersions, FDPs, and internships. |
| `POST` | `/api/immersions` | 🔒 | Create an immersion/FDP posting. |
| `GET` | `/api/research` | Public | List research collaborations. |
| `POST` | `/api/research` | 🔒 | Publish a consultancy / student project / joint research / thesis opportunity. |
| `POST` | `/api/ai/skill-gap` | 🔒 | Analyze the signed-in student's skills against a job (`{ jobId }`). |
| `POST` | `/api/ai/interview` | 🔒 | `{ action: "start" }` returns 3 personalized questions; `{ action: "evaluate", answer, question, skill }` scores an answer. |
| `POST` | `/api/ai/compatibility` | 🔒 | Rank all applicants for a job (`{ jobId }`) by compatibility. |
| `GET` | `/api/admin/credentials` | 🛡️ Admin | List credentials, optionally filtered by `?status=PENDING\|VERIFIED\|REJECTED`. |
| `PATCH` | `/api/admin/credentials` | 🛡️ Admin | Verify or reject a credential (`{ id, status, rejectReason? }`). |
| `GET/POST` | `/api/auth/[...nextauth]` | — | NextAuth sign-in/session/callback handler. |

---

## 🗃️ Data Model

Defined in [`prisma/schema.prisma`](prisma/schema.prisma). Core entities:

- **User** — a person with one of four roles (`STUDENT`, `INDUSTRY`, `ACADEMICIAN`, `ADMIN`) and an optional **Profile** (bio, headline, location, links, university/company).
- **Skill** — a reusable skill (name + category). Connected to profiles, jobs, immersions, and research via junction tables (`SkillOnProfile` carries a 1–5 proficiency level; the others just require presence).
- **Job** → **Application** (status: PENDING / REVIEWING / ACCEPTED / REJECTED / WITHDRAWN).
- **Mentorship** — a mentor ↔ mentee pairing with status (PENDING / ACTIVE / COMPLETED / CANCELLED) and notes.
- **Hackathon** — organized event with status (DRAFT / OPEN / IN_PROGRESS / JUDGING / COMPLETED), dates, location, and team size.
- **IndustryImmersion** → **ImmersionApplication** — immersion / faculty development / summer internship programs.
- **ResearchCollaboration** → **ResearchApplication** — consultancy, student project, joint research, or thesis guidance.
- **CredentialVerification** — a certification / degree / course / achievement awaiting admin verification, with verifier + timestamp + rejection reason.
- **Account / Session / VerificationToken** — standard NextAuth supporting models.

---

## 📜 Available Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the development server with hot reload at `http://localhost:3000`. |
| `npm run build` | Generate the Prisma client and build for production. |
| `npm run start` | Run the production build. |
| `npm run lint` | Run ESLint (Next.js config). |
| `npm run db:generate` | Regenerate the Prisma client after schema changes. |
| `npm run db:push` | Push the schema to the database without creating migration files (fastest for fresh setups). |
| `npm run db:migrate` | Create and apply a versioned Prisma migration (use for tracked schema changes). |
| `npm run db:seed` | Populate the database with demo data. |
| `npm run db:studio` | Open Prisma Studio — a visual database browser. |

---

## ☁️ Deployment

The project is configured for **Vercel** (`vercel.json`) with a **Neon** database. The build command already runs `prisma generate` before `next build`.

1. Push your repository to GitHub.
2. Create a [Neon](https://neon.tech) project and copy its pooled connection string.
3. Import the repository into [Vercel](https://vercel.com/new).
4. Add the environment variables in the Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your production domain, e.g. `https://skillbridge.vercel.app`)
   - `NEXTAUTH_SECRET` (a fresh secret — never reuse the dev one)
5. Deploy. Then run the schema push + seed once against the production database:

   ```bash
   npx prisma db push
   npx prisma db seed
   ```

   (Run these locally with `DATABASE_URL` pointed at your production database, or from a CI job.)

6. **Remove or replace the seeded demo accounts** before real users sign up.

---

## 🚧 Current Status & Roadmap

**Implemented and working end-to-end:** authentication + RBAC, all four role dashboards, job posting, the three AI career tools, industry immersion / FDP board, research collaboration hub, and admin credential verification.

**Not yet implemented:**

- Several **sidebar navigation links** have no backing page yet and will 404 — for example `hackathons`, `jobs` (list), `applications`, `mentors`, `messages`, `analytics`, `users`, and `settings` for various roles. The dashboards, AI features, job posting, immersions, research, and credentials pages are fully built.
- **Automated tests** — there is currently no test runner or test suite configured. The AI scoring engines are pure functions and are the best first candidates for unit tests.
- **Application submission** as a student is not yet wired to a UI form (the API and data model support it).
- **OAuth providers** are configured in `.env.example` but not enabled in `src/lib/auth.ts`.

**Ideas for the next iteration:**

- Swap the deterministic scoring engines for a real LLM behind the same API surface.
- Résumé parsing to auto-populate profile skills.
- Email and in-app notifications for applications and mentorship requests.
- Full-text search over jobs, plus migrations run on a Neon branch per pull request.

---

## 🩺 Troubleshooting

| Problem | Likely cause & fix |
| --- | --- |
| `Environment variable not found: DATABASE_URL` | `.env` is missing or not created. Run `cp .env.example .env` and fill it in. |
| Prisma client errors about missing types | Run `npm run db:generate`. |
| "Invalid email or password" on every login | The database isn't seeded. Run `npm run db:seed`. |
| Demo login says *"Is the database seeded?"* | Same as above — seed the database, or check that `DATABASE_URL` points to the right database. |
| Redirected to login in a loop | `NEXTAUTH_URL` or `NEXTAUTH_SECRET` is missing/incorrect. Ensure `NEXTAUTH_URL` matches the URL you're visiting. |
| A sidebar link returns a 404 | That page isn't built yet — see [Current Status & Roadmap](#-current-status--roadmap). |
| Database connection refused | Check `DATABASE_URL`, and confirm the database is running and reachable (Neon projects must be active). |

---

## 📄 License

No license file is currently included in this repository. Until one is added, all rights are reserved by the project authors. Add a `LICENSE` file (e.g. MIT) before distributing or open-sourcing the project.

---

**Built with ❤️ for students, industry, and academia — because every student deserves to know what to do next.**
