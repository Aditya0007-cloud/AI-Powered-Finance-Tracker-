import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) return null;

  const dbUser = await prisma.user.findFirst({
    where: {
      id: session.sub,
      email: session.email
    }
  });

  if (!dbUser) return null;

  return {
    authUser: {
      id: session.sub,
      email: session.email
    },
    dbUser
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
