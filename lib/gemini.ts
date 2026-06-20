import { GoogleGenerativeAI } from "@google/generative-ai";
import { CATEGORY_NAMES, type CategoryName } from "@/lib/constants";
import { titleCase } from "@/lib/utils";

type Categorization = {
  category: CategoryName;
  confidence: number;
};

const fallbackRules: Array<[CategoryName, RegExp]> = [
  ["Food", /coffee|starbucks|restaurant|pizza|grocery|food|cafe|lunch|dinner|breakfast/i],
  ["Travel", /uber|lyft|flight|train|taxi|hotel|airbnb|fuel|gas|parking/i],
  ["Shopping", /amazon|target|walmart|order|store|mall|clothes|shoe|electronics/i],
  ["Entertainment", /movie|netflix|spotify|game|concert|ticket|cinema|hulu/i],
  ["Bills", /rent|electric|utility|internet|phone|insurance|bill|water/i],
  ["Health", /doctor|pharmacy|medicine|hospital|clinic|gym|therapy/i],
  ["Education", /course|tuition|book|school|college|udemy|class/i]
];

function normalizeCategory(value: string): CategoryName {
  const match = CATEGORY_NAMES.find((category) => category.toLowerCase() === value.toLowerCase());
  return (match ?? "Other") as CategoryName;
}

export async function categorizeExpense(description: string): Promise<Categorization> {
  const fallback = fallbackRules.find(([, rule]) => rule.test(description));
  const fallbackResult: Categorization = {
    category: fallback?.[0] ?? "Other",
    confidence: fallback ? 0.78 : 0.55
  };

  if (!process.env.GEMINI_API_KEY) return fallbackResult;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const prompt = `Classify this finance transaction description into one category: ${CATEGORY_NAMES.join(", ")}.
Return strict JSON only with shape {"category":"Food","confidence":0.92}.
Description: ${description}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text) as { category?: string; confidence?: number };
    return {
      category: normalizeCategory(titleCase(parsed.category ?? "Other")),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? fallbackResult.confidence)))
    };
  } catch {
    return fallbackResult;
  }
}

export async function generateInsightNarratives(context: {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  largestCategory: string;
  largestCategorySpend: number;
  foodChangePct: number;
  entertainmentChangePct: number;
  budgetUtilization: number;
  daysUntilBudgetExceeded: number | null;
}) {
  const deterministic = [
    {
      title: "Largest spending category",
      body: `Your largest spending category is ${context.largestCategory}, with ${context.largestCategorySpend.toFixed(0)} spent this month.`,
      severity: "INFO" as const,
      metric: "largest_category",
      value: context.largestCategorySpend
    },
    {
      title: "Savings rate",
      body: `Your current savings rate is ${context.savingsRate.toFixed(1)}% based on this month's income and expenses.`,
      severity: context.savingsRate >= 20 ? ("SUCCESS" as const) : ("WARNING" as const),
      metric: "savings_rate",
      value: context.savingsRate
    }
  ];

  if (!process.env.GEMINI_API_KEY) return deterministic;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const prompt = `Create 4 concise personalized finance insights as strict JSON array.
Each item must include title, body, severity one of INFO WARNING CRITICAL SUCCESS, metric, value number.
Use this context: ${JSON.stringify(context)}.
Mention food change, entertainment change, budget risk, and largest category when relevant.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text) as Array<{
      title: string;
      body: string;
      severity: "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";
      metric?: string;
      value?: number;
    }>;
    return parsed.slice(0, 6);
  } catch {
    return deterministic;
  }
}
