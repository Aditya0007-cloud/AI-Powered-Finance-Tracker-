"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const chartLoading = () => <Skeleton className="h-80 w-full" />;

export const LazySpendingLineChart = dynamic(
  () => import("@/components/dashboard/charts").then((mod) => mod.SpendingLineChart),
  { ssr: false, loading: chartLoading }
);

export const LazyExpensePieChart = dynamic(
  () => import("@/components/dashboard/charts").then((mod) => mod.ExpensePieChart),
  { ssr: false, loading: chartLoading }
);

export const LazyCategoryBarChart = dynamic(
  () => import("@/components/dashboard/charts").then((mod) => mod.CategoryBarChart),
  { ssr: false, loading: chartLoading }
);
