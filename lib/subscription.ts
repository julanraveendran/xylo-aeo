import { supabaseAdmin } from './supabase';

export async function isPaidUser(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .single();

  if (!data) return false;
  const active = data.status === 'active' || data.status === 'trialing';
  const notExpired = new Date(data.current_period_end) > new Date();
  return active && notExpired;
}
