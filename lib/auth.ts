import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.email) return null;

  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      fullName: user.user_metadata?.full_name ?? user.user_metadata?.name
    },
    create: {
      id: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name ?? user.user_metadata?.name
    }
  });

  return { authUser: user, dbUser };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
