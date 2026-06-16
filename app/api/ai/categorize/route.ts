import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { categorizeExpense } from "@/lib/gemini";

const schema = z.object({
  description: z.string().trim().min(2).max(160)
});

export async function POST(request: Request) {
  await requireUser();
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const result = await categorizeExpense(parsed.data.description);
  return NextResponse.json(result);
}
