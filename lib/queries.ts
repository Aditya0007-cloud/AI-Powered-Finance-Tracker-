import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { startOfMonth } from "@/lib/utils";

export type TransactionSearchParams = {
  page?: string;
  q?: string;
  type?: string;
  category?: string;
  sort?: string;
};

export async function getCategories(userId: string) {
  return prisma.category.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }]
  });
}

export async function getTransactions(userId: string, params: TransactionSearchParams = {}) {
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = 10;
  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(params.q
      ? {
          OR: [
            { description: { contains: params.q, mode: "insensitive" } },
            { predictedCategory: { contains: params.q, mode: "insensitive" } },
            { category: { name: { contains: params.q, mode: "insensitive" } } }
          ]
        }
      : {}),
    ...(params.type === "INCOME" || params.type === "EXPENSE" ? { type: params.type } : {}),
    ...(params.category ? { categoryId: params.category } : {})
  };

  const orderBy: Prisma.TransactionOrderByWithRelationInput =
    params.sort === "amount-asc"
      ? { amount: "asc" }
      : params.sort === "amount-desc"
        ? { amount: "desc" }
        : params.sort === "date-asc"
          ? { date: "asc" }
          : { date: "desc" };

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.transaction.count({ where })
  ]);

  return {
    items,
    page,
    pageSize,
    total,
    pageCount: Math.max(1, Math.ceil(total / pageSize))
  };
}

export async function getBudgets(userId: string) {
  const month = startOfMonth();
  return prisma.budget.findMany({
    where: { userId, month },
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getInsights(userId: string) {
  return prisma.insight.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20
  });
}
