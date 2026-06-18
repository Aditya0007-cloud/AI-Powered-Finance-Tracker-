"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { loginAction, signupAction } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, signupSchema } from "@/lib/validation";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(
    mode === "login" && searchParams.get("created") === "1"
      ? "Account created. Please log in to continue."
      : null
  );
  const [isPending, startTransition] = useTransition();
  const schema = mode === "login" ? loginSchema : signupSchema;

  const form = useForm<Record<string, string>>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "login"
        ? { email: "", password: "" }
        : { fullName: "", email: "", password: "" }
  });

  function onSubmit(values: Record<string, string>) {
    setMessage(null);
    startTransition(async () => {
      const result = mode === "login" ? await loginAction(values) : await signupAction(values);
      if (!result.ok || result.message) {
        setMessage(result.message ?? "Something went wrong.");
      }
      if (mode === "signup" && result.ok) {
        router.push("/login?created=1");
        router.refresh();
        return;
      }
      if (result.ok && !result.message) {
        router.push(searchParams.get("next") ?? "/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Welcome back" : "Create your workspace"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Log in to view your live financial dashboard."
            : "Start tracking spending with AI categorization."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" autoComplete="name" {...form.register("fullName")} />
              <p className="text-xs text-destructive">{form.formState.errors.fullName?.message}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} {...form.register("password")} />
            <p className="text-xs text-destructive">{form.formState.errors.password?.message}</p>
          </div>
          {message && <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{message}</p>}
          <Button className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Log in" : "Create account"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "login" ? "New to LedgerAI?" : "Already have an account?"}{" "}
          <Link className="font-medium text-primary" href={mode === "login" ? "/signup" : "/login"}>
            {mode === "login" ? "Create an account" : "Log in"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
