"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function RealtimeRefresh({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`finance-dashboard-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${userId}` },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "budgets", filter: `user_id=eq.${userId}` },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "insights", filter: `user_id=eq.${userId}` },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, userId]);

  return null;
}
