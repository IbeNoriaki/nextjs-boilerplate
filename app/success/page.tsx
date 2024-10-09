'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface PaymentDetails {
  status: string;
  totalMoney?: {
    amount: string;
    currency: string;
  };
}

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    localStorage.removeItem('paymentPending');
    if (!orderId) {
      setError('Order ID not found in URL');
      return;
    }

    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/check-payment-status?order_id=${orderId}`);
        const data = await response.json();
        if (response.ok) {
          setPaymentDetails(data);
        } else {
          setError(data.error || 'Failed to fetch payment status');
        }
      } catch (error) {
        console.error('Error fetching payment status:', error);
        setError('Failed to fetch payment status');
      }
    };

    fetchPaymentStatus();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, router]);

  const handleGoHome = () => {
    router.push('/');
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl mb-8">{error}</p>
        <p className="mb-4">Redirecting to home in {countdown} seconds...</p>
        <button
          onClick={handleGoHome}
          className="px-4 py-2 bg-[#ffbc04] text-black rounded-full hover:bg-[#e5a800] transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <p className="text-xl mb-8">Loading payment status...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">Payment Successful</h1>
      <p className="text-xl mb-4">Payment Status: {paymentDetails.status}</p>
      {paymentDetails.totalMoney && (
        <p className="text-xl mb-8">Total Amount: {paymentDetails.totalMoney.amount} {paymentDetails.totalMoney.currency}</p>
      )}
      <p className="mb-4">Redirecting to home in {countdown} seconds...</p>
      <button
        onClick={handleGoHome}
        className="px-4 py-2 bg-[#ffbc04] text-black rounded-full hover:bg-[#e5a800] transition-colors"
      >
        Go to Home
      </button>
    </div>
  );
}