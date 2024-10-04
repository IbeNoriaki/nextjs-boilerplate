'use client';
import React, { useState } from 'react';

const SquareTestButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-square-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 1000, currency: 'JPY' }),
      });

      const result = await response.json();

      if (result.error) {
        console.error('Error:', result.error);
        alert('決済リンクの作成に失敗しました: ' + result.details);
        return;
      }

      // Square Checkoutページにリダイレクト
      window.location.href = result.checkoutUrl;
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? '処理中...' : '1000円ドリンクチケットを購入（Square）'}
    </button>
  );
};

export default SquareTestButton;
