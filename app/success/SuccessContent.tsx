'use client';

import { useSearchParams } from 'next/navigation';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  // 既存のコンポーネントのロジックをここに移動します
  return (
    <div>
      <h1>支払い成功</h1>
      <p>セッションID: {sessionId}</p>
      {/* その他の必要なコンテンツ */}
    </div>
  );
}
