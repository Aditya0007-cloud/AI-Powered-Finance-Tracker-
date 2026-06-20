import { BarChart3, CircleDollarSign, Gauge, PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { InsightPreview } from "@/components/dashboard/insight-preview";
import { LazyCategoryBarChart, LazyExpensePieChart, LazySpendingLineChart } from "@/components/dashboard/lazy-charts";
import { MonthlyIncomeForm } from "@/components/dashboard/monthly-income-form";
import { StatCard } from "@/components/dashboard/stat-card";
import { requireUser } from "@/lib/auth";
import { getDashboardAnalytics } from "@/lib/analytics";
import { getInsights } from "@/lib/queries";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default async function DashboardPage() {
  const { dbUser } = await requireUser();
  const [analytics, insights] = await Promise.all([
    getDashboardAnalytics(dbUser.id),
    getInsights(dbUser.id)
  ]);
  const { summary, currency } = analytics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl font-semibold tracking-normal">Financial Dashboard</h1>
        </div>
        <div className="rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground">
          Real-time updates enabled
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Income" value={formatCurrency(summary.totalIncome, currency)} helper="This month" icon={TrendingUp} tone="good" />
        <StatCard title="Total Expenses" value={formatCurrency(summary.totalExpenses, currency)} helper="This month" icon={TrendingDown} tone="bad" />
        <StatCard title="Monthly Savings" value={formatCurrency(summary.monthlySavings, currency)} helper="Income minus expenses" icon={PiggyBank} tone="default" />
        <StatCard title="Savings Rate" value={formatPercent(summary.savingsRate)} helper="Target 20% or higher" icon={Gauge} tone={summary.savingsRate >= 20 ? "good" : "warn"} />
        <StatCard title="Budget Utilization" value={formatPercent(summary.budgetUtilization)} helper="Across active budgets" icon={CircleDollarSign} tone={summary.budgetUtilization >= 100 ? "bad" : summary.budgetUtilization >= 80 ? "warn" : "good"} />
      </section>

      <MonthlyIncomeForm initialAmount={summary.managedMonthlyIncome} currency={currency} />

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LazySpendingLineChart data={analytics.monthlySpendingTrend} currency={currency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.expenseBreakdown.length ? (
              <LazyExpensePieChart data={analytics.expenseBreakdown} currency={currency} />
            ) : (
              <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">No expenses this month.</div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Category Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.categoryAnalysis.length ? (
              <LazyCategoryBarChart data={analytics.categoryAnalysis} currency={currency} />
            ) : (
              <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">Add expenses to unlock category analytics.</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Budget Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.budgets.length ? analytics.budgets.slice(0, 4).map((budget) => (
              <div key={budget.id} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{budget.name}</p>
                    <p className="text-sm text-muted-foreground">{budget.categoryName}</p>
                  </div>
                  <p className="text-sm font-medium">{formatPercent(budget.utilization)}</p>
                </div>
                <Progress value={budget.utilization} />
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(budget.remaining, currency)} remaining of {formatCurrency(budget.amount, currency)}
                </p>
              </div>
            )) : (
              <div className="rounded-lg border p-6 text-sm text-muted-foreground">Create a budget to monitor utilization and alerts.</div>
            )}
          </CardContent>
        </Card>
      </section>

      <InsightPreview insights={insights} />
    </div>
  );
}
