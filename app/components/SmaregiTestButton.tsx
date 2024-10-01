'use client';
import React, { useState } from 'react';

const SmaregiTestButton: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      const response = await fetch('/api/test-smaregi-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1000,
          productName: 'テスト商品',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register transaction');
      }

      const data = await response.json();
      console.log('Transaction registered:', data);
      // 成功時の処理をここに追加
    } catch (error) {
      console.error('Error registering transaction:', error);
      
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        スマレジテスト取引登録
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default SmaregiTestButton;
