import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json({ success: false, reason: 'Payment not complete' });
    }

    const userId = session.client_reference_id;
    if (!userId) {
      return NextResponse.json({ error: 'No user ID on session' }, { status: 400 });
    }

    const subscription = session.subscription as Stripe.Subscription;

    await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription?.id ?? null,
        status: subscription?.status ?? 'active',
        current_period_end: subscription
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // fallback: 30 days
      }, { onConflict: 'user_id' });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/stripe/verify-session]', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
