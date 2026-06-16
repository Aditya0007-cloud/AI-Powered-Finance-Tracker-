import { addDays, addMonths, addWeeks, isAfter, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";

function nextDate(date: Date, recurrence: "DAILY" | "WEEKLY" | "MONTHLY") {
  if (recurrence === "DAILY") return addDays(date, 1);
  if (recurrence === "WEEKLY") return addWeeks(date, 1);
  return addMonths(date, 1);
}

export async function generateDueRecurringTransactions(userId: string) {
  const today = startOfDay(new Date());
  const templates = await prisma.transaction.findMany({
    where: {
      userId,
      recurrence: { in: ["DAILY", "WEEKLY", "MONTHLY"] },
      recurringSourceId: null,
      nextOccurrenceAt: { lte: today }
    }
  });

  for (const template of templates) {
    let occurrenceDate = template.nextOccurrenceAt ?? nextDate(template.date, template.recurrence as "DAILY" | "WEEKLY" | "MONTHLY");
    let guard = 0;

    while (!isAfter(occurrenceDate, today) && guard < 24) {
      await prisma.transaction.create({
        data: {
          userId,
          categoryId: template.categoryId,
          amount: template.amount,
          description: template.description,
          type: template.type,
          date: occurrenceDate,
          predictedCategory: template.predictedCategory,
          confidenceScore: template.confidenceScore,
          recurrence: "NONE",
          recurringSourceId: template.id
        }
      });
      occurrenceDate = nextDate(occurrenceDate, template.recurrence as "DAILY" | "WEEKLY" | "MONTHLY");
      guard += 1;
    }

    await prisma.transaction.update({
      where: { id: template.id },
      data: { nextOccurrenceAt: occurrenceDate }
    });
  }
}
