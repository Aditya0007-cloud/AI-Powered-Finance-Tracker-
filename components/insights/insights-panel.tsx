"use client";

import { useState, useTransition } from "react";
import { Brain, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { deleteInsightAction, generateInsightsAction } from "@/app/actions/finance-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type InsightRow = {
  id: string;
  title: string;
  body: string;
  severity: string;
  metric: string | null;
  value: number | null;
  createdAt: string;
};

function badgeVariant(severity: string) {
  if (severity === "CRITICAL") return "destructive" as const;
  if (severity === "WARNING") return "warning" as const;
  if (severity === "SUCCESS") return "success" as const;
  return "default" as const;
}

export function InsightsPanel({ insights }: { insights: InsightRow[] }) {
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Personalized narratives from your analytics engine</p>
          <h1 className="text-3xl font-semibold tracking-normal">AI Insights</h1>
        </div>
        <Button
          disabled={isPending && busyId === "generate"}
          onClick={() => {
            setBusyId("generate");
            startTransition(async () => {
              const result = await generateInsightsAction();
              setMessage(result.message ?? null);
            });
          }}
        >
          {isPending && busyId === "generate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Generate insights
        </Button>
      </div>
      {message && <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{message}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {insights.map((insight) => (
          <Card key={insight.id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant={badgeVariant(insight.severity)}>{insight.severity.toLowerCase()}</Badge>
                  <h2 className="mt-3 text-lg font-semibold">{insight.title}</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete insight"
                  aria-label="Delete insight"
                  disabled={isPending && busyId === insight.id}
                  onClick={() => {
                    setBusyId(insight.id);
                    startTransition(async () => {
                      await deleteInsightAction(insight.id);
                    });
                  }}
                >
                  {isPending && busyId === insight.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{insight.body}</p>
              <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span>{insight.metric ?? "ai_generated"}</span>
                <span>{formatDate(insight.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!insights.length && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <Brain className="h-9 w-9 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No insights generated</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Add transactions and budgets, then generate insights to see spending changes, budget risk, and category patterns.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
