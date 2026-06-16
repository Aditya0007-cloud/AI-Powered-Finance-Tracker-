import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  ["Food", "#f97316", "Utensils"],
  ["Travel", "#0ea5e9", "Plane"],
  ["Shopping", "#ec4899", "ShoppingBag"],
  ["Entertainment", "#8b5cf6", "Popcorn"],
  ["Bills", "#64748b", "Receipt"],
  ["Health", "#10b981", "HeartPulse"],
  ["Education", "#f59e0b", "GraduationCap"],
  ["Other", "#525252", "CircleDollarSign"]
] as const;

async function main() {
  for (const [name, color, icon] of categories) {
    const existing = await prisma.category.findFirst({ where: { userId: null, name } });
    if (existing) {
      await prisma.category.update({ where: { id: existing.id }, data: { color, icon, isDefault: true } });
    } else {
      await prisma.category.create({ data: { name, color, icon, isDefault: true } });
    }
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
