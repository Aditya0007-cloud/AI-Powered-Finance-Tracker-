import Link from "next/link";
import { ArrowRight, Brain, LineChart, LockKeyhole, Sparkles, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <WalletCards className="h-5 w-5" />
          </span>
          LedgerAI
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-[0.95fr_1.05fr] md:py-20">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            AI categorization, budgets, and real-time analytics
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
              LedgerAI
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              A modern finance command center that classifies transactions, tracks monthly budgets,
              and turns spending patterns into decisions you can act on.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="default" asChild>
              <Link href="/signup">
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Open dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-soft">
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Income", "$8,420", "text-emerald-600"],
                ["Expenses", "$4,980", "text-destructive"],
                ["Savings", "40.8%", "text-primary"]
              ].map(([label, value, color]) => (
                <Card key={label}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`mt-2 text-xl font-semibold ${color}`}>{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium">Spending trend</p>
                  <LineChart className="h-4 w-4 text-primary" />
                </div>
                <div className="flex h-44 items-end gap-3">
                  {[42, 55, 38, 72, 66, 84].map((height, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-2">
                      <div className="w-full rounded-md bg-primary/80" style={{ height: `${height}%` }} />
                      <span className="text-xs text-muted-foreground">{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium">AI insights</p>
                  <Brain className="h-4 w-4 text-accent" />
                </div>
                <div className="space-y-3 text-sm">
                  <p className="rounded-md bg-muted p-3">Food spending is up 28% this month.</p>
                  <p className="rounded-md bg-muted p-3">Travel is your largest category.</p>
                  <p className="rounded-md bg-muted p-3">Budget risk in 8 days at current pace.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 md:grid-cols-3">
          {[
            [Brain, "Gemini-powered automation", "Classifies transaction descriptions and generates financial narratives."],
            [LockKeyhole, "Secure by design", "JWT cookies, protected server actions, and user-scoped queries isolate every user's data."],
            [LineChart, "Analytics engine", "Cached monthly rollups, charts, and budget utilization power a live dashboard."]
          ].map(([Icon, title, copy]) => (
            <div key={title as string} className="rounded-lg border bg-card p-5">
              <Icon className="mb-4 h-5 w-5 text-primary" />
              <h2 className="font-semibold">{title as string}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{copy as string}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
