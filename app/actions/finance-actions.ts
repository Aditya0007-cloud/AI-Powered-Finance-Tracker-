"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { addDays, addMonths, addWeeks, startOfMonth } from "date-fns";
import { InsightSeverity } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { CATEGORY_NAMES } from "@/lib/constants";
import { categorizeExpense, generateInsightNarratives } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { endOfMonth, toNumber } from "@/lib/utils";
import { getDashboardAnalytics } from "@/lib/analytics";
import { budgetSchema, monthlyIncomeSchema, settingsSchema, transactionSchema } from "@/lib/validation";

type ActionState<T = undefined> = {
  ok: boolean;
  message?: string;
  data?: T;
};

function invalidate(userId: string) {
  revalidateTag(`analytics-${userId}`);
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  revalidatePath("/insights");
}

function nextOccurrence(date: Date, recurrence: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY") {
  if (recurrence === "DAILY") return addDays(date, 1);
  if (recurrence === "WEEKLY") return addWeeks(date, 1);
  if (recurrence === "MONTHLY") return addMonths(date, 1);
  return null;
}

async function categoryForName(userId: string, name: string) {
  const normalized = CATEGORY_NAMES.includes(name as never) ? name : "Other";
  return prisma.category.findFirst({
    where: {
      name: normalized,
      OR: [{ userId }, { userId: null }]
    },
    orderBy: { userId: "desc" }
  });
}

export async function categorizeDescriptionAction(description: string) {
  await requireUser();
  if (!description || description.trim().length < 2) {
    return { ok: false, message: "Enter a description first." };
  }
  const result = await categorizeExpense(description);
  return { ok: true, data: result };
}

export async function createTransactionAction(input: unknown): Promise<ActionState> {
  const { dbUser } = await requireUser();
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.errors[0]?.message };

  let predictedCategory: string | null = null;
  let confidenceScore: number | null = null;
  let categoryId = parsed.data.categoryId ?? null;

  if (parsed.data.type === "EXPENSE") {
    const ai = await categorizeExpense(parsed.data.description);
    predictedCategory = ai.category;
    confidenceScore = ai.confidence;
    if (!categoryId) {
      const category = await categoryForName(dbUser.id, ai.category);
      categoryId = category?.id ?? null;
    }
  }

  await prisma.transaction.create({
    data: {
      userId: dbUser.id,
      amount: parsed.data.amount,
      description: parsed.data.description,
      type: parsed.data.type,
      date: parsed.data.date,
      categoryId,
      predictedCategory,
      confidenceScore,
      recurrence: parsed.data.recurrence,
      nextOccurrenceAt: nextOccurrence(parsed.data.date, parsed.data.recurrence)
    }
  });

  invalidate(dbUser.id);
  return { ok: true, message: "Transaction saved." };
}

export async function updateTransactionAction(input: unknown): Promise<ActionState> {
  const { dbUser } = await requireUser();
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success || !parsed.data.id) {
    return { ok: false, message: parsed.success ? "Transaction id is required." : parsed.error.errors[0]?.message };
  }

  const existing = await prisma.transaction.findFirst({
    where: { id: parsed.data.id, userId: dbUser.id }
  });
  if (!existing) return { ok: false, message: "Transaction not found." };

  let predictedCategory = existing.predictedCategory;
  let confidenceScore = existing.confidenceScore ? toNumber(existing.confidenceScore) : null;
  let categoryId = parsed.data.categoryId ?? null;

  if (parsed.data.type === "EXPENSE" && parsed.data.description !== existing.description) {
    const ai = await categorizeExpense(parsed.data.description);
    predictedCategory = ai.category;
    confidenceScore = ai.confidence;
    if (!categoryId) {
      const category = await categoryForName(dbUser.id, ai.category);
      categoryId = category?.id ?? null;
    }
  }

  await prisma.transaction.update({
    where: { id: existing.id },
    data: {
      amount: parsed.data.amount,
      description: parsed.data.description,
      type: parsed.data.type,
      date: parsed.data.date,
      categoryId,
      predictedCategory,
      confidenceScore,
      recurrence: parsed.data.recurrence,
      nextOccurrenceAt: nextOccurrence(parsed.data.date, parsed.data.recurrence)
    }
  });

  invalidate(dbUser.id);
  return { ok: true, message: "Transaction updated." };
}

export async function deleteTransactionAction(id: string): Promise<ActionState> {
  const { dbUser } = await requireUser();
  await prisma.transaction.deleteMany({ where: { id, userId: dbUser.id } });
  invalidate(dbUser.id);
  return { ok: true, message: "Transaction deleted." };
}

export async function setMonthlyIncomeAction(input: unknown): Promise<ActionState> {
  const { dbUser } = await requireUser();
  const parsed = monthlyIncomeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.errors[0]?.message };

  const month = startOfMonth(parsed.data.month);
  const existing = await prisma.transaction.findFirst({
    where: {
      userId: dbUser.id,
      type: "INCOME",
      description: "Monthly income",
      date: {
        gte: month,
        lte: endOfMonth(month)
      }
    },
    orderBy: { createdAt: "desc" }
  });

  if (parsed.data.amount === 0) {
    if (existing) {
      await prisma.transaction.delete({ where: { id: existing.id } });
    }
    invalidate(dbUser.id);
    return { ok: true, message: "Monthly income cleared." };
  }

  if (existing) {
    await prisma.transaction.update({
      where: { id: existing.id },
      data: {
        amount: parsed.data.amount,
        date: month
      }
    });
  } else {
    await prisma.transaction.create({
      data: {
        userId: dbUser.id,
        amount: parsed.data.amount,
        description: "Monthly income",
        type: "INCOME",
        date: month,
        recurrence: "NONE"
      }
    });
  }

  invalidate(dbUser.id);
  return { ok: true, message: "Monthly income saved." };
}

export async function upsertBudgetAction(input: unknown): Promise<ActionState> {
  const { dbUser } = await requireUser();
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.errors[0]?.message };

  if (parsed.data.id) {
    await prisma.budget.updateMany({
      where: { id: parsed.data.id, userId: dbUser.id },
      data: {
        name: parsed.data.name,
        amount: parsed.data.amount,
        categoryId: parsed.data.categoryId ?? null,
        month: parsed.data.month
      }
    });
  } else {
    await prisma.budget.create({
      data: {
        userId: dbUser.id,
        name: parsed.data.name,
        amount: parsed.data.amount,
        categoryId: parsed.data.categoryId ?? null,
        month: parsed.data.month
      }
    });
  }

  invalidate(dbUser.id);
  return { ok: true, message: "Budget saved." };
}

export async function deleteBudgetAction(id: string): Promise<ActionState> {
  const { dbUser } = await requireUser();
  await prisma.budget.deleteMany({ where: { id, userId: dbUser.id } });
  invalidate(dbUser.id);
  return { ok: true, message: "Budget deleted." };
}

export async function generateInsightsAction(): Promise<ActionState> {
  const { dbUser } = await requireUser();
  const analytics = await getDashboardAnalytics(dbUser.id);
  const narratives = await generateInsightNarratives(analytics.insightContext);

  await prisma.insight.createMany({
    data: narratives.map((insight) => ({
      userId: dbUser.id,
      title: insight.title,
      body: insight.body,
      severity: InsightSeverity[insight.severity] ?? InsightSeverity.INFO,
      metric: insight.metric,
      value: insight.value
    }))
  });

  invalidate(dbUser.id);
  return { ok: true, message: "Insights generated." };
}

export async function deleteInsightAction(id: string): Promise<ActionState> {
  const { dbUser } = await requireUser();
  await prisma.insight.deleteMany({ where: { id, userId: dbUser.id } });
  revalidatePath("/insights");
  return { ok: true, message: "Insight deleted." };
}

export async function updateSettingsAction(input: unknown): Promise<ActionState> {
  const { dbUser } = await requireUser();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.errors[0]?.message };

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      fullName: parsed.data.fullName,
      currency: parsed.data.currency.toUpperCase(),
      timezone: parsed.data.timezone,
      monthlyGoal: parsed.data.monthlyGoal
    }
  });

  invalidate(dbUser.id);
  return { ok: true, message: "Settings saved." };
}
