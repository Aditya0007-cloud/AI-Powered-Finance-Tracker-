# AI-Powered Finance Tracker

A full-stack SaaS-style finance management platform for tracking income, expenses, budgets, recurring transactions, and AI-generated financial insights.

Built with **Next.js 15 App Router**, **TypeScript**, **Prisma ORM**, **Supabase PostgreSQL**, **Gemini API**, **Recharts**, **React Hook Form**, **Zod**, **Tailwind CSS**, and shadcn/ui-style components.

## Highlights

- Secure JWT email/password authentication with HTTP-only cookies
- User-specific financial data isolation through authenticated server actions
- Monthly income input with savings and savings-rate analytics
- Transaction CRUD with search, filter, sort, pagination, and recurring entries
- Gemini-powered expense categorization with confidence scores
- AI-generated finance insights from real spending patterns
- Budget management with utilization, remaining balance, and warning states
- Responsive SaaS dashboard with dark mode and chart visualizations
- Prisma schema, migrations, indexes, and Supabase RLS setup
- Vercel-ready deployment flow with CI checks

## Demo Flow

1. Create an account.
2. Log in with the created credentials.
3. Add monthly income from the dashboard.
4. Add income or expense transactions.
5. Create monthly category budgets.
6. Generate AI insights from the Insights page.
7. Review dashboard analytics, charts, budget health, and category breakdowns.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 15, App Router |
| Language | TypeScript |
| Styling | Tailwind CSS, shadcn/ui-style primitives |
| Database | Supabase PostgreSQL |
| ORM | Prisma |
| Authentication | JWT, HTTP-only cookies, PBKDF2 password hashing |
| AI | Google Gemini API |
| Charts | Recharts |
| Forms | React Hook Form |
| Validation | Zod |
| Deployment | Vercel |
| CI | GitHub Actions |

## Core Features

### Authentication

- Email/password signup and login
- Password hashing with PBKDF2
- JWT sessions stored in HTTP-only cookies
- Protected App Router routes
- Explicit signup-to-login flow instead of automatic login

### Dashboard

The dashboard shows:

- Total income
- Total expenses
- Monthly savings
- Savings rate
- Budget utilization
- Monthly income input
- Monthly spending trend
- Expense breakdown
- Category analysis
- Budget health
- Recent AI insights

### Transactions

- Add, edit, and delete transactions
- Income and expense transaction types
- Category assignment
- AI category prediction for expenses
- Search, filters, pagination, and sorting
- Daily, weekly, and monthly recurring transaction support

### Budgets

- Create, edit, and delete monthly budgets
- Category-specific or all-expense budgets
- Remaining amount and utilization percentage
- Warning state at 80%
- Critical state at 100%

### AI Categorization

Gemini classifies descriptions such as:

- `Starbucks coffee` → Food
- `Uber ride` → Travel
- `Amazon order` → Shopping

Supported categories:

- Food
- Travel
- Shopping
- Entertainment
- Bills
- Health
- Education
- Other

### AI Insights

Gemini can generate insights such as:

- Food spending increased compared with last month
- Entertainment spending is trending upward
- Current pace may exceed the monthly budget
- Largest spending category this month
- Savings-rate observations

If `GEMINI_API_KEY` is not configured, the app falls back to deterministic local insights and rule-based categorization.

## Architecture

```text
app/
  (auth)/              Login and signup pages
  (app)/               Protected dashboard, transactions, budgets, insights, settings
  actions/             Server actions for auth and finance mutations
  api/                 Protected API routes

components/
  dashboard/           Charts, stat cards, monthly income form
  transactions/        Transaction forms and table
  budgets/             Budget forms and budget cards
  insights/            AI insights panel
  ui/                  shadcn/ui-style primitives

lib/
  analytics.ts         Cached dashboard analytics engine
  auth.ts              Current user helpers
  gemini.ts            Gemini categorization and insight generation
  password.ts          Password hashing and verification
  prisma.ts            Prisma client singleton
  session.ts           JWT signing and verification
  validation.ts        Zod schemas

prisma/
  schema.prisma        Database models, relations, indexes
  migrations/          Production database migrations

supabase/
  rls.sql              RLS policies, default categories, indexes
```

## Database Models

- `User`
- `Transaction`
- `Budget`
- `Category`
- `Insight`

The schema includes relations, indexes for user/date/category queries, decimal money fields, recurrence metadata, and AI prediction fields.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

```bash
cp .env.example .env
```

### 3. Configure environment variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-chars

DATABASE_URL=postgresql://postgres.project-ref:password@aws-region.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
DIRECT_URL=postgresql://postgres.project-ref:password@aws-region.pooler.supabase.com:5432/postgres?sslmode=require

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=your-gemini-api-key
```

Important:

- Never commit `.env`.
- If the database password contains special characters, URL-encode it.
- `DATABASE_URL` should use the Supabase transaction pooler on port `6543`.
- `DIRECT_URL` should use the Supabase session pooler on port `5432`.

### 4. Apply database migrations

```bash
npm run db:deploy
```

### 5. Seed default categories

```bash
node -r dotenv/config prisma/seed.ts
```

### 6. Run Supabase RLS SQL

Open Supabase SQL Editor and run:

```text
supabase/rls.sql
```

This adds row-level security policies, default categories, and helpful indexes.

### 7. Start development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Gemini Setup

1. Open Google AI Studio.
2. Create or copy an API key.
3. Add it to `.env`.

```bash
GEMINI_API_KEY=your-key
```

4. Restart the dev server.

```bash
npm run dev
```

5. Go to `/insights` and click **Generate insights**.

The app calls Gemini only from server-side code, so the API key is not exposed in the browser.

## Available Scripts

```bash
npm run dev          # Start local development server
npm run build        # Generate Prisma client and build production app
npm run start        # Start production server
npm run lint         # Run Next lint
npm run typecheck    # Run TypeScript checks
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Create/apply local migrations
npm run db:deploy    # Apply production migrations
npm run db:studio    # Open Prisma Studio
```

## Deployment

### Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add all environment variables from `.env.example`.
4. Set build command:

```bash
npm run build
```

5. Apply migrations before production traffic:

```bash
npm run db:deploy
```

6. Run `supabase/rls.sql` in the Supabase SQL Editor.

## Security Notes

- JWT sessions are stored in HTTP-only cookies.
- Passwords are hashed with PBKDF2 before storage.
- Server actions verify the authenticated user before mutations.
- Prisma queries are scoped by `userId`.
- Supabase RLS policies are included for database-level protection.
- `.env` is ignored and should never be committed.

## CI

GitHub Actions runs:

- dependency install
- Prisma client generation
- TypeScript checks
- lint checks
- production build

Workflow file:

```text
.github/workflows/ci.yml
```

## Resume Impact

Suggested resume bullet:

> Built an AI-powered finance tracking platform using Next.js, TypeScript, Supabase PostgreSQL, Prisma ORM, JWT authentication, and Gemini API, automating expense categorization and delivering real-time budget analytics through a production-ready SaaS dashboard.

Additional talking points:

- Designed PostgreSQL schemas, Prisma relations, and indexes for multi-user financial analytics.
- Implemented secure JWT authentication with HTTP-only cookies and hashed credentials.
- Integrated Gemini API for transaction categorization and personalized financial insights.
- Built responsive dashboards with Recharts, cached analytics, recurring transactions, and budget alerts.

## Project Status

Production build verified with:

```bash
npm run typecheck
npm run lint
npm run build
```
