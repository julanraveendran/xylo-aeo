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

    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

    let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    let status = 'active';

    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      status = sub.status;
      // current_period_end is a unix timestamp on the Subscription object
      const ts = (sub as unknown as { current_period_end: number }).current_period_end;
      if (ts) periodEnd = new Date(ts * 1000).toISOString();
    }

    await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId ?? null,
        status,
        current_period_end: periodEnd,
      }, { onConflict: 'user_id' });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/stripe/verify-session]', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
