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

export async function createPendingSubscription(userId: string, mercadopagoSubscriptionId?: string) {
  const supabase = createClientComponentClient();
  
  // Check if user already has a subscription
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existingSubscription) {
    // Update existing subscription to pending
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'pending',
        mercadopago_subscription_id: mercadopagoSubscriptionId,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  } else {
    // Create new pending subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        status: 'pending',
        plan_type: 'premium',
        mercadopago_subscription_id: mercadopagoSubscriptionId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    return { data, error };
  }
}

export async function cancelSubscription(userId: string, reason?: string, cancelAtPeriodEnd: boolean = true) {
  const supabase = createClientComponentClient();
  
  const updateData: any = {
    updated_at: new Date().toISOString(),
    cancelled_at: new Date().toISOString(),
    cancel_at_period_end: cancelAtPeriodEnd
  };

  if (reason) {
    updateData.cancellation_reason = reason;
  }

  // If not canceling at period end, cancel immediately
  if (!cancelAtPeriodEnd) {
    updateData.status = 'cancelled';
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('user_id', userId)
    .eq('status', 'active')
    .select()
    .single();

  // Update profile if immediate cancellation
  if (!cancelAtPeriodEnd && !error) {
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'free',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  }

  return { data, error };
}

export async function reactivateSubscription(userId: string) {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      cancel_at_period_end: false,
      cancelled_at: null,
      cancellation_reason: null,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (!error) {
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'premium',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  }

  return { data, error };
}

export async function checkExpiredSubscriptions() {
  const supabase = createClientComponentClient();
  const now = new Date().toISOString();

  // Find subscriptions that have expired
  const { data: expiredSubscriptions } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')
    .lt('current_period_end', now);

  if (expiredSubscriptions && expiredSubscriptions.length > 0) {
    // Update expired subscriptions
    for (const subscription of expiredSubscriptions) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'expired',
          updated_at: now
        })
        .eq('user_id', subscription.user_id);

      // Update profile
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'free',
          updated_at: now
        })
        .eq('id', subscription.user_id);
    }
  }

  return expiredSubscriptions;
}

export async function handleFailedSubscriptionActivation(userId: string, reason: string) {
  const supabase = createClientComponentClient();
  
  try {
    // Update any pending subscription to cancelled status
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: `Activation failed: ${reason}`,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'pending');

    // Ensure user profile is set to free
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'free',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (subscriptionError) {
      console.error('Error updating failed subscription:', subscriptionError);
    }
    if (profileError) {
      console.error('Error updating profile after failed activation:', profileError);
    }

    console.log(`Failed activation handled for user: ${userId}, reason: ${reason}`);
    
    return { success: !subscriptionError && !profileError };
  } catch (error) {
    console.error('Error handling failed activation:', error);
    return { success: false, error };
  }
}

export async function cleanupExpiredPendingSubscriptions() {
  const supabase = createClientComponentClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Find pending subscriptions older than 1 hour
  const { data: expiredPending } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'pending')
    .lt('created_at', oneHourAgo);

  if (expiredPending && expiredPending.length > 0) {
    // Cancel expired pending subscriptions
    for (const subscription of expiredPending) {
      await handleFailedSubscriptionActivation(
        subscription.user_id, 
        'Pending subscription expired after 1 hour'
      );
    }
  }

  return expiredPending;
}

export async function cleanupOldPendingSubscriptions() {
  const supabase = createClientComponentClient();
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  // Find pending subscriptions older than 10 minutes (our activation window)
  const { data: expiredPending } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'pending')
    .lt('created_at', tenMinutesAgo);

  if (expiredPending && expiredPending.length > 0) {
    // Cancel expired pending subscriptions
    for (const subscription of expiredPending) {
      await handleFailedSubscriptionActivation(
        subscription.user_id, 
        'Pending subscription expired - activation window closed'
      );
    }
  }

  return expiredPending;
}