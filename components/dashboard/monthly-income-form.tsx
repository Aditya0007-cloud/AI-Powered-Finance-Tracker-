"use client";

import { format } from "date-fns";
import { useState, useTransition } from "react";
import { Loader2, Save, Wallet } from "lucide-react";
import { setMonthlyIncomeAction } from "@/app/actions/finance-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

export function MonthlyIncomeForm({
  initialAmount,
  currency
}: {
  initialAmount: number;
  currency: string;
}) {
  const [amount, setAmount] = useState(String(initialAmount || ""));
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const month = format(new Date(), "yyyy-MM");

  function saveIncome() {
    setMessage(null);
    startTransition(async () => {
      const result = await setMonthlyIncomeAction({
        amount: amount === "" ? 0 : Number(amount),
        month
      });
      setMessage(result.message ?? (result.ok ? "Saved." : "Unable to save."));
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Monthly Income
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="monthly-income">Total income for {format(new Date(), "MMMM yyyy")}</Label>
          <Input
            id="monthly-income"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="Enter monthly income"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Current managed income: {formatCurrency(initialAmount, currency)}
          </p>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
        <Button type="button" onClick={saveIncome} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save income
        </Button>
      </CardContent>
    </Card>
  );
}
