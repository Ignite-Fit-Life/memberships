import { createServerSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

async function signUp(name: string, email: string, password: string, request: Request) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  const nextUrl = new URL(request.url);

  if (error) {
    const url = new URL("/signup", nextUrl.origin);
    url.searchParams.set("error", error.message);
    url.searchParams.set("name", name);
    url.searchParams.set("email", email);
    return NextResponse.redirect(url, 303);
  }

  if (!data.session) {
    const url = new URL("/login", nextUrl.origin);
    url.searchParams.set("message", "Check your email to confirm your account, then log in.");
    url.searchParams.set("email", email);
    return NextResponse.redirect(url, 303);
  }

  return NextResponse.redirect(new URL("/dashboard", nextUrl.origin), 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  return signUp(name, email, password, request);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || "";
  const email = url.searchParams.get("email") || "";
  const password = url.searchParams.get("password") || "";

  if (!email || !password) {
    return NextResponse.redirect(new URL("/signup", url.origin), 303);
  }

  return signUp(name, email, password, request);
}
