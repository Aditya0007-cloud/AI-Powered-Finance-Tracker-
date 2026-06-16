"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateSettingsAction } from "@/app/actions/finance-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { settingsSchema } from "@/lib/validation";

export function SettingsForm({
  user
}: {
  user: {
    fullName: string | null;
    email: string;
    currency: string;
    timezone: string;
    monthlyGoal: number | null;
  };
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      fullName: user.fullName ?? "",
      currency: user.currency,
      timezone: user.timezone,
      monthlyGoal: user.monthlyGoal ?? 0
    }
  });

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateSettingsAction(values);
      setMessage(result.message ?? (result.ok ? "Saved." : "Unable to save."));
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Settings</CardTitle>
        <CardDescription>Preferences used for analytics, display, and future budget recommendations.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input {...form.register("fullName")} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select {...form.register("currency")}>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input placeholder="America/New_York" {...form.register("timezone")} />
            </div>
            <div className="space-y-2">
              <Label>Monthly savings goal</Label>
              <Input type="number" step="0.01" min="0" {...form.register("monthlyGoal")} />
            </div>
          </div>
          {message && <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{message}</p>}
          <div className="flex justify-end">
            <Button disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
