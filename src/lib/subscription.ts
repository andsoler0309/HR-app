// src/lib/subscription.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function checkSubscriptionStatus() {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  return subscription;
}

export async function isSubscribed() {
  const subscription = await checkSubscriptionStatus();
  return !!subscription;
}