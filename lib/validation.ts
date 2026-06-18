import { z } from "zod";

export const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  description: z.string().trim().min(2, "Description is required").max(160),
  categoryId: z.string().uuid().optional().nullable(),
  date: z.coerce.date(),
  type: z.enum(["INCOME", "EXPENSE"]),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY"]).default("NONE")
});

export const budgetSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Budget name is required").max(80),
  amount: z.coerce.number().positive("Budget must be greater than zero"),
  categoryId: z.string().uuid().optional().nullable(),
  month: z.union([
    z
      .string()
      .regex(/^\d{4}-\d{2}$/, "Use YYYY-MM")
      .transform((value) => new Date(`${value}-01T00:00:00.000Z`)),
    z.date()
  ])
});

export const settingsSchema = z.object({
  fullName: z.string().trim().max(80).optional(),
  currency: z.string().trim().length(3),
  timezone: z.string().trim().min(2),
  monthlyGoal: z.coerce.number().nonnegative().optional().nullable()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2).max(80)
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type BudgetInput = z.input<typeof budgetSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
