import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth-actions";
import { AppNav, MobileNav } from "@/components/app-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { generateDueRecurringTransactions } from "@/lib/recurring";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { dbUser } = await requireUser();
  await generateDueRecurringTransactions(dbUser.id);

  return (
    <div className="min-h-screen bg-background">
      <RealtimeRefresh userId={dbUser.id} />
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <AppNav email={dbUser.email} />
        </div>
        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden">
            <div className="font-semibold">LedgerAI</div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <form action={logoutAction}>
                <Button variant="outline" size="icon" aria-label="Logout" title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl p-4 pb-20 md:p-6 lg:pb-6">{children}</main>
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
