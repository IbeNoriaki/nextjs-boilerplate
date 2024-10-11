/**
 * SquareからのWebhookを受け取るエンドポイント
 * 
 * ローカルでのWebhookのテストにはngrokを使用する
 * https://ngrok.com/docs/integrations/square/webhooks/
 */
import { WebhooksHelper } from 'square';
import { NextResponse } from 'next/server';
import { SQUARE_WEBHOOK_SIGNATURE_KEY, NOTIFICATION_URL } from '@/lib/constants';
import { handlePaymentUpdate } from './handle-payment-update';

export async function POST(request: Request) {
  // 生のリクエストボディを取得
  const rawBody = await request.text();

  // Webhookのシグネチャを取得
  const signature = request.headers.get('x-square-hmacsha256-signature')
  
  if (!signature) {
    return NextResponse.json({ message: 'Signature is required' }, { status: 400 });
  }
  
  try {
    // Squareから来たWebhookのシグネチャを検証
    const isValid = WebhooksHelper.isValidWebhookEventSignature(
      rawBody,
      signature,
      SQUARE_WEBHOOK_SIGNATURE_KEY,
      NOTIFICATION_URL
    );
    
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }
    
    // 正しくSquareから来たリクエストの場合、Webhookのイベントを処理する
    const event = JSON.parse(rawBody.toString());

    // development portalでは、'payment.updated'イベントをサブスクライブ設定する
    if (event.type === 'payment.updated') {
      const payment = event.data.object.payment;

      await handlePaymentUpdate(payment)
    }

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (error) {
    console.error('Invalid signature:', error);
    return NextResponse.json({ message: 'Invalid request' }, { status: 500 });
  }
}
