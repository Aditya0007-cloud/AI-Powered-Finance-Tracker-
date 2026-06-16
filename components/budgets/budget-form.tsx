"use client";

import { format } from "date-fns";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { upsertBudgetAction } from "@/app/actions/finance-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { budgetSchema } from "@/lib/validation";

type CategoryOption = { id: string; name: string };

type InitialBudget = {
  id: string;
  name: string;
  amount: number;
  categoryId: string | null;
  month: string;
};

export function BudgetForm({
  categories,
  initial,
  onDone
}: {
  categories: CategoryOption[];
  initial?: InitialBudget;
  onDone?: () => void;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.input<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      id: initial?.id,
      name: initial?.name ?? "",
      amount: initial?.amount ?? 0,
      categoryId: initial?.categoryId ?? "",
      month: initial?.month ?? format(new Date(), "yyyy-MM")
    }
  });

  function onSubmit(values: z.input<typeof budgetSchema>) {
    setMessage(null);
    startTransition(async () => {
      const result = await upsertBudgetAction(values);
      setMessage(result.message ?? (result.ok ? "Saved." : "Unable to save."));
      if (result.ok) {
        if (!initial) form.reset({ name: "", amount: 0, categoryId: "", month: format(new Date(), "yyyy-MM") });
        onDone?.();
      }
    });
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2 md:col-span-1">
          <Label>Name</Label>
          <Input placeholder="Monthly essentials" {...form.register("name")} />
          <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
        </div>
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input type="number" step="0.01" min="0" {...form.register("amount")} />
          <p className="text-xs text-destructive">{form.formState.errors.amount?.message}</p>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select {...form.register("categoryId")}>
            <option value="">All expenses</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Month</Label>
          <Input type="month" {...form.register("month")} />
          <p className="text-xs text-destructive">{form.formState.errors.month?.message}</p>
        </div>
      </div>
      {message && <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{message}</p>}
      <div className="flex justify-end">
        <Button disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? "Update budget" : "Create budget"}
        </Button>
      </div>
    </form>
  );
}
