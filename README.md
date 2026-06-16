# AI-Powered Finance Tracker

A production-ready SaaS finance tracker built with Next.js 15, TypeScript, Supabase Auth/PostgreSQL, Prisma, Gemini, Recharts, React Hook Form, Zod, Tailwind CSS, and shadcn/ui-style components.

## Features

- Supabase email/password auth with protected App Router routes.
- User-isolated transactions, budgets, categories, insights, and settings.
- AI expense categorization with Gemini, confidence scores, and category persistence.
- AI financial insights based on current and previous month spending.
- Dashboard analytics, cached server calculations, and lazy-loaded Recharts visualizations.
- Transaction CRUD with search, filters, pagination, and sorting.
- Monthly budget CRUD with utilization, remaining spend, and 80%/100% alerts.
- Daily, weekly, and monthly recurring transactions with server-side generation.
- Dark mode, responsive SaaS UI, empty states, loading states, and error handling.
- Supabase RLS SQL setup for multi-user data isolation.

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres.your-ref:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.your-ref:password@aws-0-region.pooler.supabase.com:5432/postgres
GEMINI_API_KEY=your-gemini-api-key
```

## Supabase Setup

1. Create a Supabase project.
2. Copy the project URL and anon key into `.env`.
3. Copy the pooled connection string into `DATABASE_URL`.
4. Copy the direct connection string into `DIRECT_URL`.
5. Run `npm run db:migrate`.
6. Run the SQL in `supabase/rls.sql` from the Supabase SQL editor.
7. Enable Email auth in Supabase Authentication settings.

## Vercel Deployment

1. Push this repository to GitHub.
2. Import it in Vercel.
3. Add all environment variables from `.env.example`.
4. Set the build command to `npm run build`.
5. Run `npm run db:deploy` locally or from CI before production traffic.
6. Confirm the Supabase Site URL and Redirect URLs include the Vercel domain.

## Resume Talking Points

- Built an AI-powered finance tracking platform using Next.js, Supabase, Prisma ORM, and Gemini API, automating categorization and reducing manual transaction labeling.
- Designed optimized PostgreSQL schemas, indexes, and RLS policies for secure multi-user financial analytics.
- Implemented server actions, Zod validation, cached analytics, real-time dashboard refreshes, and production-ready deployment documentation.
