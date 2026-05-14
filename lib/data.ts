import { createServerSupabaseClient } from "./supabase";

export async function getPrograms() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("workout_programs")
    .select("id,title,description,duration_weeks,level,cover_image_url")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getLessons() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("classroom_lessons")
    .select("id,title,description,category,video_url,thumbnail_url")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getCommunities() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("communities")
    .select("id,name,description,visibility")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getHabits() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("habits")
    .select("id,title,description,frequency,target_value,target_unit")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getCheckInTemplates() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("check_in_templates")
    .select("id,title,description,frequency")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
