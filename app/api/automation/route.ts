import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.XYLO_AUTOMATION_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url, query, customerId } = await req.json();
    if (!url || !query) {
      return NextResponse.json({ error: 'url and query required' }, { status: 400 });
    }

    // Reuse existing check logic by calling internal API
    const baseUrl = process.env.NEXTAUTH_URL || 'https://thisisxylo.com';
    const response = await fetch(`${baseUrl}/api/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, query }),
    });

    const data = await response.json();

    // Log automation run
    await supabaseAdmin.from('automation_runs').insert({
      customer_id: customerId ?? null,
      product_url: url,
      query,
      result: data,
      ran_at: new Date().toISOString(),
    }).then(({ error }) => {
      if (error) console.error('[automation log]', error.message);
    });

    return NextResponse.json({ success: true, customerId, url, query, result: data });
  } catch (err) {
    console.error('[/api/automation/check]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}