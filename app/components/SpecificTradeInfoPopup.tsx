import { useState } from 'react';

export function SpecificTradeInfoPopup() {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => setIsOpen(!isOpen);

  return (
    <>
      <button
        onClick={togglePopup}
        className="text-gray-400 hover:underline hover:underline-offset-4 hover:text-white transition-colors text-xs"
      >
        特定商取引法に基づく表記
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-8 rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">特定商取引法に基づく表記</h2>
            <dl className="space-y-4">
              <dt className="font-semibold">販売業者</dt>
              <dd>株式会社サンプルカンパニー</dd>

              <dt className="font-semibold">運営責任者</dt>
              <dd>山田 太郎</dd>

              <dt className="font-semibold">所在地</dt>
              <dd>〒100-0001 東京都千代田区千代田1-1-1</dd>

              <dt className="font-semibold">連絡先</dt>
              <dd>
                電話番号: 03-1234-5678<br />
                メールアドレス: info@example.com
              </dd>

              <dt className="font-semibold">商品の販売価格</dt>
              <dd>各商品ページに記載</dd>

              <dt className="font-semibold">商品以外の必要料金</dt>
              <dd>消費税</dd>

              <dt className="font-semibold">支払方法</dt>
              <dd>クレジットカード決済のみ</dd>

              <dt className="font-semibold">商品の引渡し時期</dt>
              <dd>決済完了後、即時にデジタルチケットを発行</dd>

              <dt className="font-semibold">返品・キャンセルについて</dt>
              <dd>デジタルコンテンツのため、原則として返品・キャンセルはお受けできません。</dd>
            </dl>
            <button
              onClick={togglePopup}
              className="mt-6 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}