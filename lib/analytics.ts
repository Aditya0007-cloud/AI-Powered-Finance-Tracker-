import { unstable_cache } from "next/cache";
import { addMonths, differenceInCalendarDays, format, startOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { endOfMonth, monthKey, toNumber } from "@/lib/utils";

export type DashboardAnalytics = Awaited<ReturnType<typeof buildDashboardAnalytics>>;

async function buildDashboardAnalytics(userId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const previousStart = startOfMonth(subMonths(now, 1));
  const previousEnd = endOfMonth(subMonths(now, 1));
  const sixMonthsAgo = startOfMonth(subMonths(now, 5));

  const [user, currentTransactions, previousTransactions, trendTransactions, budgets] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        include: { category: true },
        orderBy: { date: "desc" }
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: previousStart, lte: previousEnd } },
        include: { category: true }
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: sixMonthsAgo, lte: monthEnd } },
        select: { amount: true, type: true, date: true }
      }),
      prisma.budget.findMany({
        where: { userId, month: monthStart },
        include: { category: true },
        orderBy: { amount: "desc" }
      })
    ]);

  const currentIncome = currentTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
  const managedMonthlyIncome = currentTransactions
    .filter((transaction) => transaction.type === "INCOME" && transaction.description === "Monthly income")
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
  const currentExpenses = currentTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
  const previousExpenses = previousTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);

  const categoryMap = new Map<string, { name: string; value: number; color: string }>();
  for (const transaction of currentTransactions.filter((item) => item.type === "EXPENSE")) {
    const name = transaction.category?.name ?? transaction.predictedCategory ?? "Other";
    const existing = categoryMap.get(name);
    categoryMap.set(name, {
      name,
      value: (existing?.value ?? 0) + toNumber(transaction.amount),
      color: transaction.category?.color ?? existing?.color ?? "#525252"
    });
  }

  const monthlySpendingTrend = Array.from({ length: 6 }).map((_, index) => {
    const date = addMonths(sixMonthsAgo, index);
    const key = monthKey(date);
    const expenses = trendTransactions
      .filter((transaction) => transaction.type === "EXPENSE" && monthKey(transaction.date) === key)
      .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
    const income = trendTransactions
      .filter((transaction) => transaction.type === "INCOME" && monthKey(transaction.date) === key)
      .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
    return { month: format(date, "MMM"), expenses, income };
  });

  const expenseBreakdown = Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  const largestCategory = expenseBreakdown[0]?.name ?? "Other";
  const largestCategorySpend = expenseBreakdown[0]?.value ?? 0;

  const totalBudget = budgets.reduce((sum, budget) => sum + toNumber(budget.amount), 0);
  const budgetUtilization = totalBudget > 0 ? (currentExpenses / totalBudget) * 100 : 0;
  const dailySpend = currentExpenses / Math.max(1, differenceInCalendarDays(now, monthStart) + 1);
  const remainingBudget = totalBudget - currentExpenses;
  const daysUntilBudgetExceeded = totalBudget > 0 && dailySpend > 0 && remainingBudget > 0
    ? Math.floor(remainingBudget / dailySpend)
    : remainingBudget <= 0
      ? 0
      : null;

  const categorySpend = (items: typeof currentTransactions, category: string) =>
    items
      .filter((transaction) => transaction.type === "EXPENSE")
      .filter((transaction) => (transaction.category?.name ?? transaction.predictedCategory) === category)
      .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);

  const foodCurrent = categorySpend(currentTransactions, "Food");
  const foodPrevious = categorySpend(previousTransactions, "Food");
  const entertainmentCurrent = categorySpend(currentTransactions, "Entertainment");
  const entertainmentPrevious = categorySpend(previousTransactions, "Entertainment");

  const pctChange = (current: number, previous: number) =>
    previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;

  const monthlySavings = currentIncome - currentExpenses;
  const savingsRate = currentIncome > 0 ? (monthlySavings / currentIncome) * 100 : 0;

  const budgetCards = budgets.map((budget) => {
    const spent = currentTransactions
      .filter((transaction) => transaction.type === "EXPENSE")
      .filter((transaction) => {
        if (!budget.categoryId) return true;
        return transaction.categoryId === budget.categoryId;
      })
      .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
    const amount = toNumber(budget.amount);
    return {
      id: budget.id,
      name: budget.name,
      categoryId: budget.categoryId,
      amount,
      spent,
      remaining: amount - spent,
      utilization: amount > 0 ? (spent / amount) * 100 : 0,
      categoryName: budget.category?.name ?? "All expenses"
    };
  });

  return {
    currency: user?.currency ?? "USD",
    summary: {
      totalIncome: currentIncome,
      managedMonthlyIncome,
      totalExpenses: currentExpenses,
      monthlySavings,
      savingsRate,
      budgetUtilization,
      previousExpenses
    },
    monthlySpendingTrend,
    expenseBreakdown,
    categoryAnalysis: expenseBreakdown.map((item) => ({
      category: item.name,
      amount: item.value
    })),
    budgets: budgetCards,
    insightContext: {
      totalIncome: currentIncome,
      totalExpenses: currentExpenses,
      savingsRate,
      largestCategory,
      largestCategorySpend,
      foodChangePct: pctChange(foodCurrent, foodPrevious),
      entertainmentChangePct: pctChange(entertainmentCurrent, entertainmentPrevious),
      budgetUtilization,
      daysUntilBudgetExceeded
    }
  };
}

export function getDashboardAnalytics(userId: string) {
  return unstable_cache(buildDashboardAnalytics, [`dashboard-${userId}`], {
    tags: [`analytics-${userId}`],
    revalidate: 60
  })(userId);
}
