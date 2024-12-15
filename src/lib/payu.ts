import { createHash } from 'crypto';

interface PayUCheckoutRequest {
  reference: string;
  amount: number;
  currency: string;
  description: string;
  buyerEmail: string;
  buyerFullName: string;
}

export const createPayUCheckout = (data: PayUCheckoutRequest): string => {
  const merchantId = process.env.NEXT_PUBLIC_PAYU_MERCHANT_ID;
  const accountId = process.env.NEXT_PUBLIC_PAYU_ACCOUNT_ID;
  const apiKey = process.env.NEXT_PUBLIC_PAYU_API_KEY;

  if (!merchantId || !accountId || !apiKey) {
    throw new Error('PayU configuration is missing. Please set environment variables correctly.');
  }

  // Generate signature
  const signature = createHash('md5')
      .update(`${apiKey}~${merchantId}~${data.reference}~${data.amount.toFixed(2)}~${data.currency}`)
      .digest('hex');

  // Build PayU checkout URL with parameters
  const params = new URLSearchParams({
    merchantId: merchantId,
    accountId: accountId,
    description: data.description,
    referenceCode: data.reference,
    amount: data.amount.toFixed(2),
    currency: data.currency,
    signature: signature,
    buyerEmail: data.buyerEmail,
    buyerFullName: data.buyerFullName,
    responseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/response`,
    confirmationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/payu`,
    test: process.env.NEXT_PUBLIC_PAYU_TEST === 'true' ? '1' : '0',
    language: 'en', // Add language parameter if needed
  });

  return `https://${process.env.NEXT_PUBLIC_PAYU_TEST === 'true' ? 'sandbox.' : ''}checkout.payulatam.com/ppp-web-gateway-payu/?${params.toString()}`;
};
