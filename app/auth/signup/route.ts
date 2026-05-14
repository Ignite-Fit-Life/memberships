import { createServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error) redirect("/signup?error=invalid");
  redirect("/dashboard");
}
