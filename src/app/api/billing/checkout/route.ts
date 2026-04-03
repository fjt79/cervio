import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { stripe, PLANS, createCheckoutSession, getOrCreateCustomer } from '@/lib/stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { plan } = await request.json()
    const planConfig = PLANS[plan as keyof typeof PLANS]
    if (!planConfig) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, full_name, email')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    let customerId = profile.stripe_customer_id
    if (!customerId) {
      const customer = await getOrCreateCustomer(profile.email, profile.full_name || '')
      customerId = customer.id
      await supabaseAdmin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const session = await createCheckoutSession(customerId, planConfig.priceId, user.id, appUrl)

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
