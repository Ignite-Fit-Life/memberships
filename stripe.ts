import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      appInfo: {
        name: "Ignite Fit Life Members"
      }
    });
  }

  return stripeClient;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe() as unknown as Record<PropertyKey, unknown>;
    const value = client[prop];

    return typeof value === "function" ? value.bind(client) : value;
  }
});
