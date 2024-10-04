'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    if (orderId) {
      checkPaymentStatus(orderId);
    } else {
      setError('Order ID not found in URL');
    }
  }, [searchParams]);

  const checkPaymentStatus = async (orderId: string) => {
    try {
      const response = await fetch(`/api/check-payment-status?order_id=${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }
      const data = await response.json();
      setPaymentStatus(data.status);
      // 必要に応じて、文字列として返される数値を処理
      if (data.totalMoney && data.totalMoney.amount) {
        const amount = parseInt(data.totalMoney.amount, 10);
        console.log('Total amount:', amount);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to check payment status');
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!paymentStatus) {
    return <div>Loading payment status...</div>;
  }

  return (
    <div>
      <h1>Payment Successful</h1>
      <p>Payment Status: {paymentStatus}</p>
    </div>
  );
}
