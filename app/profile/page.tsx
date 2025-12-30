import Header from "@/components/header";
import ProfileForm from "@/components/profile-form";
import { createServerClient } from "@/lib/auth-server";
import { redirect } from "next/navigation";

async function getProfilePageData() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const displayName =
    profile?.display_name ||
    (metadata["display_name"] as string | undefined) ||
    (metadata["username"] as string | undefined) ||
    user.email ||
    null;

  return {
    user,
    profile,
    displayName,
  };
}

export default async function ProfilePage() {
  const { user, profile, displayName } = await getProfilePageData();

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-70 dark:opacity-60 bg-fixed"
        style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-50/40 via-gray-50/30 to-gray-50/50 dark:from-black/30 dark:via-black/20 dark:to-black/40"
        aria-hidden
      />

      <div className="relative">
        <Header displayName={displayName} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ProfileForm
            initialDisplayName={profile?.display_name ?? ""}
            initialUsername={
              profile?.username ?? (user.user_metadata as any)?.username ?? ""
            }
            email={user.email ?? ""}
          />
        </main>
      </div>
    </div>
  );
}
