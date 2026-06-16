export const CATEGORIES = [
  { name: "Food", color: "#f97316", icon: "Utensils" },
  { name: "Travel", color: "#0ea5e9", icon: "Plane" },
  { name: "Shopping", color: "#ec4899", icon: "ShoppingBag" },
  { name: "Entertainment", color: "#8b5cf6", icon: "Popcorn" },
  { name: "Bills", color: "#64748b", icon: "Receipt" },
  { name: "Health", color: "#10b981", icon: "HeartPulse" },
  { name: "Education", color: "#f59e0b", icon: "GraduationCap" },
  { name: "Other", color: "#525252", icon: "CircleDollarSign" }
] as const;

export const CATEGORY_NAMES = CATEGORIES.map((category) => category.name);

export type CategoryName = (typeof CATEGORIES)[number]["name"];
