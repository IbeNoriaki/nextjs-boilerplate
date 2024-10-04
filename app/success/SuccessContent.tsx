'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaymentDetails {
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  orderId: string;
}

export default function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID not found in URL');
      setCountdown(5);
    } else {
      checkPaymentStatus(orderId);
      setCountdown(30);
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, router]);

  const checkPaymentStatus = async (orderId: string) => {
    try {
      const response = await fetch(`/api/check-payment-status?order_id=${orderId}`);
      const data = await response.json();

      if (response.ok) {
        setPaymentDetails(data);
      } else {
        setError(data.error || 'Failed to check payment status');
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      setError('Error checking payment status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">決済完了</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {paymentDetails && (
        <div className="bg-green-100 p-4 rounded-lg mb-4">
          <p className="font-semibold mb-2">決済状況: {paymentDetails.paymentStatus}</p>
          <p className="mb-2">注文ID: {paymentDetails.orderId}</p>
          <p className="mb-2">金額: {paymentDetails.totalAmount.toFixed(2)} {paymentDetails.currency}</p>
          <p className="mb-2">決済日時: {formatDate(paymentDetails.createdAt)}</p>
        </div>
      )}
      {countdown !== null && <p className="text-sm text-gray-600">{countdown}秒後にホーム画面に戻ります...</p>}
    </div>
  );
}
