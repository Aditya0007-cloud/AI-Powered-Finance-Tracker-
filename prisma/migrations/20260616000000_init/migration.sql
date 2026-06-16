CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE "RecurrenceFrequency" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY');
CREATE TYPE "InsightSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL', 'SUCCESS');

CREATE TABLE "users" (
  "id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT,
  "full_name" TEXT,
  "monthly_goal" DECIMAL(12,2),
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL DEFAULT '#2563eb',
  "icon" TEXT NOT NULL DEFAULT 'CircleDollarSign',
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "transactions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "category_id" UUID,
  "amount" DECIMAL(12,2) NOT NULL,
  "description" TEXT NOT NULL,
  "type" "TransactionType" NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "predicted_category" TEXT,
  "confidence_score" DECIMAL(5,4),
  "recurrence" "RecurrenceFrequency" NOT NULL DEFAULT 'NONE',
  "recurring_source_id" UUID,
  "next_occurrence_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "budgets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "category_id" UUID,
  "name" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "month" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "insights" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "severity" "InsightSeverity" NOT NULL DEFAULT 'INFO',
  "metric" TEXT,
  "value" DECIMAL(12,2),
  "generated_by" TEXT NOT NULL DEFAULT 'AI',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "categories_user_id_name_key" ON "categories"("user_id", "name");
CREATE UNIQUE INDEX "budgets_user_id_name_month_key" ON "budgets"("user_id", "name", "month");

CREATE INDEX "categories_user_id_name_idx" ON "categories"("user_id", "name");
CREATE INDEX "transactions_user_id_date_idx" ON "transactions"("user_id", "date" DESC);
CREATE INDEX "transactions_user_id_type_date_idx" ON "transactions"("user_id", "type", "date");
CREATE INDEX "transactions_user_id_category_id_idx" ON "transactions"("user_id", "category_id");
CREATE INDEX "transactions_recurring_source_id_idx" ON "transactions"("recurring_source_id");
CREATE INDEX "budgets_user_id_month_idx" ON "budgets"("user_id", "month");
CREATE INDEX "budgets_user_id_category_id_month_idx" ON "budgets"("user_id", "category_id", "month");
CREATE INDEX "insights_user_id_created_at_idx" ON "insights"("user_id", "created_at" DESC);

ALTER TABLE "categories"
  ADD CONSTRAINT "categories_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transactions"
  ADD CONSTRAINT "transactions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transactions"
  ADD CONSTRAINT "transactions_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "budgets"
  ADD CONSTRAINT "budgets_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "budgets"
  ADD CONSTRAINT "budgets_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "insights"
  ADD CONSTRAINT "insights_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
