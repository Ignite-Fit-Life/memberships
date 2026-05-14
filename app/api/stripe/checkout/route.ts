import { createServerSupabaseClient } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const priceId = process.env.STRIPE_MEMBERSHIP_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: "Missing STRIPE_MEMBERSHIP_PRICE_ID" }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email || undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/dashboard?checkout=cancelled`,
    metadata: {
      supabase_user_id: user.id
    }
  });

  return NextResponse.json({ url: session.url });
}
