"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, sessionCookieOptions, signSessionToken } from "@/lib/session";
import { loginSchema, signupSchema } from "@/lib/validation";

export type AuthActionState = {
  ok: boolean;
  message?: string;
};

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (
      error.message.includes("Environment variable not found") ||
      error.message.includes("DATABASE_URL") ||
      error.message.includes("JWT_SECRET")
    ) {
      return "Authentication is not configured yet. Add DATABASE_URL, DIRECT_URL, and JWT_SECRET to .env, then restart the dev server.";
    }
  }

  return "Authentication failed. Please try again.";
}

export async function loginAction(input: unknown): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.errors[0]?.message };

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() }
    });

    if (!user?.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return { ok: false, message: "Invalid email or password." };
    }

    const token = await signSessionToken({ userId: user.id, email: user.email });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    return { ok: true };
  } catch (error) {
    return { ok: false, message: getAuthErrorMessage(error) };
  }
}

export async function signupAction(input: unknown): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.errors[0]?.message };

  try {
    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, message: "An account with this email already exists." };
    }

    await prisma.user.create({
      data: {
        id: randomUUID(),
        email,
        fullName: parsed.data.fullName,
        passwordHash: hashPassword(parsed.data.password)
      }
    });

    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return { ok: true, message: "Account created. Please log in to continue." };
  } catch (error) {
    return { ok: false, message: getAuthErrorMessage(error) };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/");
}
