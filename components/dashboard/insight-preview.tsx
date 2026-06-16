import { Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

type Insight = {
  id: string;
  title: string;
  body: string;
  severity: string;
};

export function InsightPreview({ insights }: { insights: Insight[] }) {
  if (!insights.length) {
    return <EmptyState icon={Brain} title="No AI insights yet" description="Generate insights once you have transactions and budgets." />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.slice(0, 4).map((insight) => (
          <div key={insight.id} className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-medium">{insight.title}</p>
              <Badge variant={insight.severity === "CRITICAL" ? "destructive" : insight.severity === "WARNING" ? "warning" : "default"}>
                {insight.severity.toLowerCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{insight.body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
