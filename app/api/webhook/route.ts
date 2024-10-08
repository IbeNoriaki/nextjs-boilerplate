/**
 * SquareからのWebhookを受け取るエンドポイント
 * 
 * @description Squareからの支払い完了リクエストを受け取り、
 * ユーザーにドリンクチケットのトークンを送る。
 * 
 * ローカルでのWebhookのテストにはngrokを使用する
 * https://ngrok.com/docs/integrations/square/webhooks/
 */
import { Client, Environment, WebhooksHelper } from 'square';
import { NextResponse } from 'next/server';
import { sendTokenToUser } from '@/lib/prex-api/client';
import { SQUARE_WEBHOOK_SIGNATURE_KEY, NOTIFICATION_URL, TOKEN_ADDRESS } from '@/lib/constants';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox, // 本番環境の場合は Environment.Production に変更
});

const { ordersApi } = client;

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

      if (payment.status === 'COMPLETED') {
        const orderId = payment.order_id
        const order = await getOrderDetails(orderId)

        // checkout APIで指定したユーザーのEthereumアドレスを取得する
        const ethAddress = getEthAddressFromNote(payment.note)

        if(order && order.lineItems) {
          for(const item of order.lineItems) {
            // ドリンクチケットのトークンをユーザーに送る
            // TODO: 複数のアイテムを注文した場合の処理
            await sendTokenToUser(TOKEN_ADDRESS, ethAddress, Number(item.quantity))

            // TODO: 失敗した場合は、リトライするか、支払いをキャンセルする
          }
        }
      }
    }

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (error) {
    console.error('Invalid signature:', error);
    return NextResponse.json({ message: 'Invalid request' }, { status: 500 });
  }
}

/**
 * @description JSON形式のpaymentNoteからethAddressを取得する
 * @param note checkout APIで指定したpaymentNote
 * @returns ethAddress: ユーザのEthereumアドレス
 */
function getEthAddressFromNote(note: string) {
  try {
    const metadataObj = JSON.parse(note)

    return metadataObj.ethAddress  
  } catch (error) {
    console.error('paymentNote must be JSON format', error);

    throw new Error('Error getting eth address from note')
  }
}

/**
 * @description Square APIを使って、注文の詳細を取得する
 * @param orderId 
 * @returns Order or null
 */
async function getOrderDetails(orderId: string) {
  try {
    const response = await ordersApi.retrieveOrder(orderId);
    return response.result.order;
  } catch (error) {
    console.error('Error retrieving order:', error);
    return null;
  }
}
