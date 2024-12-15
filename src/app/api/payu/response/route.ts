// app/api/payu/response/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const state_pol = formData.get('state_pol');
    const reference_sale = formData.get('reference_sale');
    
    // Determine redirect URL based on payment status
    let redirectUrl = '/dashboard';
    
    if (state_pol === '4') { // Approved
      redirectUrl = '/dashboard?payment=success';
    } else if (state_pol === '6' || state_pol === '5') { // Declined or Expired
      redirectUrl = '/dashboard?payment=failed';
    } else { // Pending or other states
      redirectUrl = '/dashboard?payment=pending';
    }

    // Redirect the user
    return redirect(redirectUrl);
  } catch (error) {
    console.error('PayU response error:', error);
    return redirect('/dashboard?payment=error');
  }
}
