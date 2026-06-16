import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDashboardAnalytics } from "@/lib/analytics";

export async function GET() {
  const { dbUser } = await requireUser();
  const analytics = await getDashboardAnalytics(dbUser.id);
  return NextResponse.json(analytics.summary);
}
