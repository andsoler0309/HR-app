import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // MercadoPago sends different event types
    const { type, data, action } = body;
    
    console.log('MercadoPago webhook received:', { type, action, data });
    
    // Handle payment events
    if (type === 'payment') {
      const paymentId = data.id;
      const externalReference = data.external_reference;
      
      if (externalReference) {
        const userId = externalReference;
        
        if (action === 'payment.created' || action === 'payment.updated') {
          // Check payment status - you might need to fetch full payment details from MercadoPago API
          // For now, assuming successful payment if webhook is received
          
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              status: 'active',
              plan_type: 'premium',
              mercadopago_subscription_id: paymentId,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });

          if (!subscriptionError) {
            // Update user profile subscription status
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'premium',
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);

            console.log(`Subscription activated for user: ${userId} via payment: ${paymentId}`);
          } else {
            console.error('Error updating subscription:', subscriptionError);
          }
        } else if (action === 'payment.rejected' || action === 'payment.cancelled') {
          // Handle failed payment - cancel any pending subscription
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
              cancellation_reason: `Payment ${action.split('.')[1]} via MercadoPago`,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('status', 'pending');

          if (!subscriptionError) {
            // Ensure user profile is set to free
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'free',
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);

            console.log(`Subscription cancelled for user: ${userId} due to ${action}`);
          }
        }
      }
    }
    
    // Handle subscription-specific events if MercadoPago sends them
    if (type === 'subscription') {
      const subscriptionId = data.id;
      const externalReference = data.external_reference;
      
      if (externalReference) {
        const userId = externalReference;
        
        if (action === 'subscription.created' || action === 'subscription.updated') {
          // Activate subscription
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              status: 'active',
              plan_type: 'premium',
              mercadopago_subscription_id: subscriptionId,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });

          if (!subscriptionError) {
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'premium',
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);
          }
        } else if (action === 'subscription.cancelled') {
          // Cancel subscription
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (!subscriptionError) {
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'free',
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing MercadoPago webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle GET requests (MercadoPago sometimes sends verification requests)
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'OK' });
}
