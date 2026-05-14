import { createServerSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

async function signIn(email: string, password: string, request: Request) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  const nextUrl = new URL(request.url);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=invalid", nextUrl.origin), 303);
  }

  return NextResponse.redirect(new URL("/dashboard", nextUrl.origin), 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  return signIn(email, password, request);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") || "";
  const password = url.searchParams.get("password") || "";

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login", url.origin), 303);
  }

  return signIn(email, password, request);
}
