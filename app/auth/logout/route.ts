import { createServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}
