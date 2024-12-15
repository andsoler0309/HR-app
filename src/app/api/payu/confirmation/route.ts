
// app/api/payu/confirmation/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const PAYU_API_KEY = process.env.PAYU_API_KEY!;
const MERCHANT_ID = process.env.PAYU_MERCHANT_ID!;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Verify PayU signature
    const receivedSignature = req.headers.get('payu-signature');
    if (!receivedSignature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Create signature string according to PayU documentation
    const signatureString = `${MERCHANT_ID}~${body.reference_sale}~${body.value}~${body.currency}~${body.state_pol}`;
    
    // Generate signature
    const calculatedSignature = createHmac('md5', PAYU_API_KEY)
      .update(signatureString)
      .digest('hex');

    // Verify signature
    if (receivedSignature !== calculatedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const {
      reference_sale,
      transaction_id,
      state_pol,
      value,
      currency,
    } = body;

    // Handle different payment states
    switch (state_pol) {
      case '4': // Approved
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_start: new Date(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            updated_at: new Date()
          })
          .eq('id', reference_sale);

        // Record payment
        await supabase
          .from('payments')
          .insert([{
            subscription_id: reference_sale,
            amount: value,
            currency,
            status: 'completed',
            provider_payment_id: transaction_id
          }]);
        break;

      case '6': // Declined
      case '5': // Expired
        await supabase
          .from('subscriptions')
          .update({
            status: 'failed',
            updated_at: new Date()
          })
          .eq('id', reference_sale);

        // Record failed payment
        await supabase
          .from('payments')
          .insert([{
            subscription_id: reference_sale,
            amount: value,
            currency,
            status: 'failed',
            provider_payment_id: transaction_id
          }]);
        break;

      case '7': // Pending
        await supabase
          .from('subscriptions')
          .update({
            status: 'pending',
            updated_at: new Date()
          })
          .eq('id', reference_sale);

        // Record pending payment
        await supabase
          .from('payments')
          .insert([{
            subscription_id: reference_sale,
            amount: value,
            currency,
            status: 'pending',
            provider_payment_id: transaction_id
          }]);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayU confirmation webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}