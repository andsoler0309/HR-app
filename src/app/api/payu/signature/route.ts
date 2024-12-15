import { NextResponse } from 'next/server';

const generatePayUSignature = (
  apiKey: string,
  merchantId: string,
  referenceCode: string,
  amount: string,
  currency: string
) => {
  const signatureString = `${apiKey}~${merchantId}~${referenceCode}~${amount}~${currency}`;
  return require('crypto').createHash('md5').update(signatureString).digest('hex');
};

export async function POST(request: Request) {
  try {
    const { referenceCode, amount, currency } = await request.json();
    
    // Validate required parameters
    if (!referenceCode || !amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const apiKey = process.env.PAYU_API_KEY;
    const merchantId = process.env.NEXT_PUBLIC_PAYU_MERCHANT_ID;
    
    if (!apiKey || !merchantId) {
      throw new Error('Missing PayU configuration');
    }

    const signature = generatePayUSignature(
      apiKey,
      merchantId,
      referenceCode,
      amount,
      currency
    );

    console.log('apiKey', apiKey);
    console.log('merchantId', merchantId);
    console.log('referenceCode', referenceCode);
    console.log('amount', amount);
    console.log('currency', currency);

    console.log('signature', signature);
    return NextResponse.json({ signature });
  } catch (error) {
    console.error('Error generating signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    );
  }
} 