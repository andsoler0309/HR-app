'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PayUSubscriptionFormProps {
  isLoading: boolean;
  user: { id: string; email: string };
  fullName: string;
  handleBeforeSubmit?: () => Promise<void>;
  amount: string;
  currency: string;
  description: string;
}

const PayUSubscriptionForm = ({
  isLoading,
  user,
  fullName,
  handleBeforeSubmit,
  amount,
  currency,
  description
}: PayUSubscriptionFormProps) => {
  const t = useTranslations('PayUSubscriptionForm');
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [referenceCode] = useState(() =>
    `SUB_${Date.now().toString()}_${user?.id?.slice(0, 8)}`
  );
  const [baseUrl, setBaseUrl] = useState('');
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const fetchSignature = useCallback(async () => {
    if (hasFetchedRef.current) return;

    try {
      hasFetchedRef.current = true;
      const response = await fetch('/api/payu/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceCode,
          amount,
          currency,
        }),
      });
      const data = await response.json();
      if (data.signature) {
        setSignature(data.signature);
      }
    } catch (error) {
      console.error(t('errorFetchingSignature'), error);
      hasFetchedRef.current = false; // Reset flag on error to allow retry
    }
  }, [referenceCode, amount, currency, t]);

  useEffect(() => {
    fetchSignature();

    return () => {
      hasFetchedRef.current = false;
    };
  }, [fetchSignature]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (handleBeforeSubmit) {
        await handleBeforeSubmit();
      }

      if (formRef) {
        formRef.submit();
      }
    } catch (error) {
      console.error(t('errorProcessingSubscription'), error);
    }
  };

  // PayU Environment variables
  const merchantId = process.env.NEXT_PUBLIC_PAYU_MERCHANT_ID;
  const accountId = process.env.NEXT_PUBLIC_PAYU_ACCOUNT_ID;
  const payUrl =
    process.env.NEXT_PUBLIC_PAYU_TEST === 'true'
      ? 'https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/'
      : 'https://checkout.payulatam.com/ppp-web-gateway-payu/';

  if (!baseUrl) {
    return (
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form
      ref={setFormRef}
      method="post"
      action={payUrl}
      onSubmit={handleSubmit}
    >
      <input name="merchantId" type="hidden" value={merchantId} />
      <input name="accountId" type="hidden" value={accountId} />
      <input name="description" type="hidden" value={description} />
      <input name="referenceCode" type="hidden" value={referenceCode} />
      <input name="amount" type="hidden" value={amount} />
      <input name="tax" type="hidden" value="3193" />
      <input name="taxReturnBase" type="hidden" value="16806" />
      <input name="currency" type="hidden" value={currency} />
      <input name="signature" type="hidden" value={signature} />
      <input name="test" type="hidden" value="1" />
      <input name="buyerEmail" type="hidden" value={user?.email} />
      <input name="buyerFullName" type="hidden" value={fullName} />
      <input
        name="responseUrl"
        type="hidden"
        value={baseUrl ? `${baseUrl}/api/payu/response` : ''}
      />
      <input
        name="confirmationUrl"
        type="hidden"
        value={baseUrl ? `${baseUrl}/api/payu/confirmation` : ''}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="bg-green-500 px-6 py-3 text-base disabled:opacity-50 rounded-lg w-full text-black"
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          t('upgradeButton', { amount, currency })
        )}
      </button>
    </form>
  );
};

export default PayUSubscriptionForm;
