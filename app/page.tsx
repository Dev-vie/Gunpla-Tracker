import Header from "@/components/header";
import Footer from "@/components/footer";
import DashboardContent from "@/components/dashboard-content";
import { createServerClient } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch data in parallel
  const [profileData, kitsData] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, username")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("gunpla_kits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileData.data;
  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const displayName =
    profile?.display_name ||
    profile?.username ||
    (metadata["display_name"] as string | undefined) ||
    (metadata["username"] as string | undefined) ||
    user.email ||
    null;

  const kits = kitsData.data || [];

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-70 dark:opacity-60 bg-fixed"
        style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-50/40 via-gray-50/30 to-gray-50/50 dark:from-black/30 dark:via-black/20 dark:to-black/40"
        aria-hidden
      />

      <div className="relative flex flex-col min-h-screen">
        <Header displayName={displayName} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow">
          <DashboardContent initialKits={kits} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
