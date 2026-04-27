import type { User } from "@supabase/supabase-js";

interface SupabaseLikeClient {
  from: (table: "profiles") => {
    upsert: (
      values: {
        user_id: string;
        display_name: string | null;
        username: string | null;
        updated_at: string;
      },
      options: { onConflict: "user_id" }
    ) => PromiseLike<{ error: { message: string } | null }>;
  };
}

export async function ensureProfileRow(
  supabase: SupabaseLikeClient,
  user: User
) {
  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const displayName =
    typeof metadata["display_name"] === "string"
      ? metadata["display_name"]
      : null;
  const username =
    typeof metadata["username"] === "string" ? metadata["username"] : null;

  const result = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: user.id,
        display_name: displayName,
        username,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (result && "error" in result && result.error) {
    throw new Error(result.error.message);
  }
}
