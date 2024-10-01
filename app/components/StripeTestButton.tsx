'use client';
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

// 注意: これは公開可能なキーです。サーバーサイドの秘密鍵とは異なります。
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const StripeTestButton: React.FC = () => {
  const handleClick = async () => {
    try {
      const stripe = await stripePromise;
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 1000, currency: 'jpy', mode: 'checkout' }),
      });

      const session = await response.json();

      if (session.error) {
        console.error('Error:', session.error);
        return;
      }

      const result = await stripe!.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error(result.error.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      1000円ドリンクチケットを購入
    </button>
  );
};

export default StripeTestButton;
