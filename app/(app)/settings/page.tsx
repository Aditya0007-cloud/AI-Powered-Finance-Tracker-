import { SettingsForm } from "@/components/settings/settings-form";
import { requireUser } from "@/lib/auth";
import { toNumber } from "@/lib/utils";

export default async function SettingsPage() {
  const { dbUser } = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Profile and analytics preferences</p>
        <h1 className="text-3xl font-semibold tracking-normal">Settings</h1>
      </div>
      <SettingsForm
        user={{
          fullName: dbUser.fullName,
          email: dbUser.email,
          currency: dbUser.currency,
          timezone: dbUser.timezone,
          monthlyGoal: dbUser.monthlyGoal ? toNumber(dbUser.monthlyGoal) : null
        }}
      />
    </div>
  );
}
