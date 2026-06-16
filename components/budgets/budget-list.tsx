"use client";

import { useState, useTransition } from "react";
import { Edit3, Loader2, Trash2 } from "lucide-react";
import { deleteBudgetAction } from "@/app/actions/finance-actions";
import { BudgetForm } from "@/components/budgets/budget-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercent } from "@/lib/utils";

type CategoryOption = { id: string; name: string };

type BudgetCard = {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  utilization: number;
  categoryName: string;
  categoryId?: string | null;
};

export function BudgetList({
  budgets,
  categories,
  currency
}: {
  budgets: BudgetCard[];
  categories: CategoryOption[];
  currency: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {budgets.map((budget) => (
        <Card key={budget.id}>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{budget.name}</h3>
                  {budget.utilization >= 100 ? (
                    <Badge variant="destructive">critical</Badge>
                  ) : budget.utilization >= 80 ? (
                    <Badge variant="warning">warning</Badge>
                  ) : (
                    <Badge variant="success">healthy</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{budget.categoryName}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" title="Edit budget" aria-label="Edit budget" onClick={() => setEditingId(editingId === budget.id ? null : budget.id)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete budget"
                  aria-label="Delete budget"
                  disabled={isPending && deletingId === budget.id}
                  onClick={() => {
                    setDeletingId(budget.id);
                    startTransition(async () => {
                      await deleteBudgetAction(budget.id);
                    });
                  }}
                >
                  {isPending && deletingId === budget.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Progress value={budget.utilization} />
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Spent</p>
                <p className="font-medium">{formatCurrency(budget.spent, currency)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Remaining</p>
                <p className="font-medium">{formatCurrency(budget.remaining, currency)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Used</p>
                <p className="font-medium">{formatPercent(budget.utilization)}</p>
              </div>
            </div>

            {editingId === budget.id && (
              <div className="border-t pt-4">
                <BudgetForm
                  categories={categories}
                  initial={{
                    id: budget.id,
                    name: budget.name,
                    amount: budget.amount,
                    categoryId: budget.categoryId ?? null,
                    month: currentMonth
                  }}
                  onDone={() => setEditingId(null)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
