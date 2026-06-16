import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export async function updateSession(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/transactions") ||
    request.nextUrl.pathname.startsWith("/budgets") ||
    request.nextUrl.pathname.startsWith("/insights") ||
    request.nextUrl.pathname.startsWith("/settings");

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (isProtected && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    const response = NextResponse.redirect(url);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  if (isAuthPage && session) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
