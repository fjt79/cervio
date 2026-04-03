import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession
        const userId = session.metadata?.userId
        if (userId) {
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'active',
            subscription_id: session.subscription as string,
          }).eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (userId) {
          const planNickname = sub.items.data[0]?.price?.nickname?.toLowerCase() || 'solo'
          await supabaseAdmin.from('profiles').update({
            subscription_status: sub.status,
            subscription_plan: planNickname,
          }).eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (userId) {
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'cancelled',
            subscription_plan: 'trial',
          }).eq('id', userId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        await supabaseAdmin.from('profiles').update({
          subscription_status: 'past_due',
        }).eq('stripe_customer_id', customerId)
        break
      }
    }
  } catch (err: any) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
