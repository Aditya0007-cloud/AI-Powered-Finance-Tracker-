import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignupPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="block text-center text-lg font-semibold">
          LedgerAI
        </Link>
        <Suspense fallback={<Skeleton className="h-[480px] w-full" />}>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </main>
  );
}
