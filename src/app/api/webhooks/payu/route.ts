import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const PAYU_API_KEY = process.env.PAYU_API_KEY!; // Your PayU API key
const MERCHANT_ID = process.env.PAYU_MERCHANT_ID!; // Your PayU Merchant ID

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

    // Update subscription status
    if (state_pol === '4') { // Approved
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayU webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}