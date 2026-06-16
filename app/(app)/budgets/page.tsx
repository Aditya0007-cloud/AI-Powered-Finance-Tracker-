import { PiggyBank, Plus } from "lucide-react";
import { BudgetForm } from "@/components/budgets/budget-form";
import { BudgetList } from "@/components/budgets/budget-list";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardAnalytics } from "@/lib/analytics";
import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/queries";

export default async function BudgetsPage() {
  const { dbUser } = await requireUser();
  const [categories, analytics] = await Promise.all([
    getCategories(dbUser.id),
    getDashboardAnalytics(dbUser.id)
  ]);
  const categoryOptions = categories.map((category) => ({ id: category.id, name: category.name }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Monthly budget planning and alerts</p>
        <h1 className="text-3xl font-semibold tracking-normal">Budgets</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetForm categories={categoryOptions} />
        </CardContent>
      </Card>

      {analytics.budgets.length ? (
        <BudgetList budgets={analytics.budgets} categories={categoryOptions} currency={analytics.currency} />
      ) : (
        <EmptyState icon={PiggyBank} title="No budgets yet" description="Create monthly budgets to track utilization and spending risk." />
      )}
    </div>
  );
}
