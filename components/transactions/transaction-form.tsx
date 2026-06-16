"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { categorizeDescriptionAction, createTransactionAction, updateTransactionAction } from "@/app/actions/finance-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { transactionSchema } from "@/lib/validation";

type CategoryOption = {
  id: string;
  name: string;
};

type InitialTransaction = {
  id: string;
  amount: number;
  description: string;
  type: "INCOME" | "EXPENSE";
  categoryId: string | null;
  date: string;
  recurrence: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
};

export function TransactionForm({
  categories,
  initial,
  onDone
}: {
  categories: CategoryOption[];
  initial?: InitialTransaction;
  onDone?: () => void;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.input<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      id: initial?.id,
      amount: initial?.amount ?? 0,
      description: initial?.description ?? "",
      type: initial?.type ?? "EXPENSE",
      categoryId: initial?.categoryId ?? "",
      date: initial?.date ? new Date(initial.date) : new Date(),
      recurrence: initial?.recurrence ?? "NONE"
    }
  });

  function onSubmit(values: z.input<typeof transactionSchema>) {
    setMessage(null);
    startTransition(async () => {
      const result = initial
        ? await updateTransactionAction({ ...values, id: initial.id })
        : await createTransactionAction(values);
      setMessage(result.message ?? (result.ok ? "Saved." : "Unable to save."));
      if (result.ok) {
        if (!initial) form.reset({ amount: 0, description: "", type: "EXPENSE", categoryId: "", date: new Date(), recurrence: "NONE" });
        onDone?.();
      }
    });
  }

  function previewAI() {
    const description = form.getValues("description");
    setPrediction(null);
    startTransition(async () => {
      const result = await categorizeDescriptionAction(description);
      if (result.ok && result.data) {
        setPrediction(`${result.data.category} (${Math.round(result.data.confidence * 100)}% confidence)`);
        const category = categories.find((item) => item.name === result.data.category);
        if (category) form.setValue("categoryId", category.id);
      } else {
        setMessage(result.message ?? "AI categorization failed.");
      }
    });
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Description</Label>
          <div className="flex gap-2">
            <Input placeholder="Starbucks coffee" {...form.register("description")} />
            <Button type="button" variant="outline" size="icon" onClick={previewAI} title="Classify with AI" aria-label="Classify with AI">
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-destructive">{form.formState.errors.description?.message}</p>
          {prediction && <p className="text-xs text-primary">{prediction}</p>}
        </div>
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input type="number" step="0.01" min="0" {...form.register("amount")} />
          <p className="text-xs text-destructive">{form.formState.errors.amount?.message}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select {...form.register("type")}>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select {...form.register("categoryId")}>
            <option value="">AI suggested / none</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={form.watch("date") instanceof Date ? form.watch("date").toISOString().slice(0, 10) : String(form.watch("date")).slice(0, 10)}
            onChange={(event) => form.setValue("date", new Date(`${event.target.value}T00:00:00`))}
          />
        </div>
        <div className="space-y-2">
          <Label>Recurring</Label>
          <Select {...form.register("recurrence")}>
            <option value="NONE">None</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </Select>
        </div>
      </div>

      {message && <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{message}</p>}
      <div className="flex justify-end">
        <Button disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? "Update transaction" : "Add transaction"}
        </Button>
      </div>
    </form>
  );
}
