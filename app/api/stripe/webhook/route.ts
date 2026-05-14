import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook config" }, { status: 400 });
  }

  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.supabase_user_id;

    if (userId) {
      await supabaseAdmin.from("memberships").upsert({
        user_id: userId,
        stripe_customer_id: String(session.customer || ""),
        stripe_subscription_id: String(session.subscription || ""),
        status: "active"
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    await supabaseAdmin
      .from("memberships")
      .update({ status: "cancelled" })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}
