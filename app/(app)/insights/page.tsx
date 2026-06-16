import { InsightsPanel } from "@/components/insights/insights-panel";
import { requireUser } from "@/lib/auth";
import { getInsights } from "@/lib/queries";
import { toNumber } from "@/lib/utils";

export default async function InsightsPage() {
  const { dbUser } = await requireUser();
  const insights = await getInsights(dbUser.id);

  return (
    <InsightsPanel
      insights={insights.map((insight) => ({
        id: insight.id,
        title: insight.title,
        body: insight.body,
        severity: insight.severity,
        metric: insight.metric,
        value: insight.value ? toNumber(insight.value) : null,
        createdAt: insight.createdAt.toISOString()
      }))}
    />
  );
}
