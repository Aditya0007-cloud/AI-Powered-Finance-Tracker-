"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validation";

export type AuthActionState = {
  ok: boolean;
  message?: string;
};

export async function loginAction(input: unknown): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.errors[0]?.message };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function signupAction(input: unknown): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.errors[0]?.message };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName }
    }
  });

  if (error) return { ok: false, message: error.message };

  if (data.user?.email) {
    await prisma.user.upsert({
      where: { id: data.user.id },
      update: { email: data.user.email, fullName: parsed.data.fullName },
      create: { id: data.user.id, email: data.user.email, fullName: parsed.data.fullName }
    });
  }

  return { ok: true, message: data.session ? undefined : "Check your email to confirm your account." };
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
