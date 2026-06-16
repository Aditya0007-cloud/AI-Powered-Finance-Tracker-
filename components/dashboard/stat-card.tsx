import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "default"
}: {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "default" | "good" | "bad" | "warn";
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
          <div
            className={cn(
              "rounded-md p-2",
              tone === "good" && "bg-emerald-500/10 text-emerald-600",
              tone === "bad" && "bg-destructive/10 text-destructive",
              tone === "warn" && "bg-amber-500/15 text-amber-700",
              tone === "default" && "bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
