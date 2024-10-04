import { NextRequest, NextResponse } from 'next/server';
import { Client, Environment } from 'square';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox, // 本番環境では Environment.Production
});

// BigIntを含むオブジェクトを安全にシリアライズするためのヘルパー関数
function safeStringify(obj: any) {
  return JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
}

export async function POST(req: NextRequest) {
  try {
    const { amount, currency } = await req.json();
    console.log('Received request:', { amount, currency }); // Log the received data

    const idempotencyKey = new Date().toISOString();

    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey: idempotencyKey,
      quickPay: {
        name: 'Ticket Purchase',
        priceMoney: {
          amount: BigInt(amount),
          currency: currency,
        },
        locationId: process.env.SQUARE_LOCATION_ID,
      },
      checkoutOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id={CHECKOUT_ID}`,
        // 以下の行を追加
        askForShippingAddress: false,
      },
    });

    console.log('Square API response:', safeStringify(response.result)); // Log the Square API response

    if (response.result.paymentLink && response.result.paymentLink.url) {
      return NextResponse.json({
        url: response.result.paymentLink.url,
        orderId: response.result.paymentLink.id,
      });
    } else {
      throw new Error('Payment link URL not found in the response');
    }
  } catch (error) {
    console.error('Detailed error:', error); // Log the detailed error
    return NextResponse.json({ error: 'Payment link creation failed', details: error.message }, { status: 500 });
  }
}
