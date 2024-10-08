// pages/api/square-webhook.ts
import { Client, Environment, WebhooksHelper } from 'square';
import { NextResponse } from 'next/server';
import { sendTokenToUser } from '@/lib/prex-api/client';

// 複数の商品の場合どうするか？


// from square developer portal
const SQUARE_WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '';
// WebhookのURLを指定
const NOTIFICATION_URL = process.env.NOTIFICATION_URL || '';

const TOKEN_ADDRESS = '0xAa0ebd8c37f4E00425cC82b2E19fee54a097e769'

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox, // 本番環境の場合は Environment.Production に変更
});

const { ordersApi } = client;


export async function POST(request: Request) {
  // 生のリクエストボディを取得
  const rawBody = await request.text();

  // シグネチャを取得
  const signature = request.headers.get('x-square-hmacsha256-signature')

	if (!signature) {
		return NextResponse.json({ message: 'Signature is required' }, { status: 400 });
	}

  try {
    // シグネチャを検証
    const isValid = WebhooksHelper.isValidWebhookEventSignature(
      rawBody,                         // リクエストの生データ
      signature,                       // 送信されたシグネチャ
      SQUARE_WEBHOOK_SIGNATURE_KEY,    // シグネチャキー（シークレット）
			NOTIFICATION_URL
    );

		if (!isValid) {
			return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
		}

    // シグネチャが正しい場合、Webhookの処理
    const event = JSON.parse(rawBody.toString());
    console.log(event, event.data.object)
    if (event.type === 'payment.updated') {
      const payment = event.data.object.payment;

      if (payment.status === 'COMPLETED') {
				const orderId = payment.order_id
				const order = await getOrderDetails(orderId)

				const metadata = JSON.parse(payment.note)

				if(order && order.lineItems) {
					for(const item of order.lineItems) {
						console.log(item.name, item.quantity)
						await sendTokenToUser(TOKEN_ADDRESS, metadata.ethAddress, Number(item.quantity))
					}
				}
        console.log('Payment successful with note:', payment.note, order);
        // ここでmetadataを使用して追加処理を行う
      }
    }

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (error) {
    console.error('Invalid signature:', error);
    return NextResponse.json({ message: 'Invalid request' }, { status: 500 });
  }
}

async function getOrderDetails(orderId: string) {
  try {
    const response = await ordersApi.retrieveOrder(orderId);
    return response.result.order;
  } catch (error) {
    console.error('Error retrieving order:', error);
    return null;
  }
}

/*
{
  amount_money: { amount: 1000, currency: 'JPY' },
  application_details: {
    application_id: 'sandbox-sq0idb-lky4CaPAWmDnHY3YtYxINg',
    square_product: 'ECOMMERCE_API'
  },
  capabilities: [
    'EDIT_AMOUNT_UP',
    'EDIT_AMOUNT_DOWN',
    'EDIT_TIP_AMOUNT_UP',
    'EDIT_TIP_AMOUNT_DOWN'
  ],
  created_at: '2024-10-08T15:16:25.011Z',
  external_details: { source: 'Developer Control Panel', type: 'CARD' },
  id: '5UWl0iLqeWn7sS6MBXOs2EhO9MeZY',
  location_id: 'LWNRE29PNXVVX',
  note: 'User ID: dev_user_1234567888',
  order_id: 'hbNwlJItdhp8cY3IUiJsKhK1ihSZY',
  receipt_number: '5UWl',
  source_type: 'EXTERNAL',
  status: 'APPROVED',
  total_money: { amount: 1000, currency: 'JPY' },
  updated_at: '2024-10-08T15:16:25.011Z',
  version: 0
}
	*/