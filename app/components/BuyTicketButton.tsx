import React, { useState } from 'react';

const BuyTicketButton: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleBuyTicket = async () => {
    try {
      setError(null);
      const response = await fetch('/api/buy-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1000, // Amount in cents
          currency: 'JPY',
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create payment link:', data.error, data.details);
        setError(data.error || 'Failed to create payment link');
      }
    } catch (error) {
      console.error('Error during payment link creation:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <button
        onClick={handleBuyTicket}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Buy Ticket
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default BuyTicketButton;
