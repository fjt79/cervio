import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const PLANS = {
  solo: {
    name: 'Solo',
    price: 49,
    priceId: process.env.STRIPE_SOLO_PRICE_ID!,
    features: [
      '1 user',
      'All 4 core features',
      '100 interactions/month',
      'Standard memory',
    ],
  },
  pro: {
    name: 'Pro',
    price: 99,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      '1 user',
      'Unlimited interactions',
      'Priority AI processing',
      'Advanced memory engine',
    ],
  },
  team: {
    name: 'Team',
    price: 299,
    priceId: process.env.STRIPE_TEAM_PRICE_ID!,
    features: [
      'Up to 5 users',
      'Shared goals and context',
      'Admin dashboard',
      'Team analytics',
    ],
  },
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string,
  appUrl: string
) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
  })
}

export async function createBillingPortalSession(
  customerId: string,
  appUrl: string
) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/settings`,
  })
}

export async function getOrCreateCustomer(email: string, name: string) {
  const existing = await stripe.customers.list({ email, limit: 1 })
  if (existing.data.length > 0) return existing.data[0]

  return await stripe.customers.create({ email, name })
}
