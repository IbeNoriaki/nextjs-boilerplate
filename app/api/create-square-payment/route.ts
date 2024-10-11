import { Client, CreatePaymentLinkRequest, Environment } from 'square';
import { randomUUID } from 'crypto';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox, // 本番環境の場合は Environment.Production に変更
});

const { checkoutApi } = client;

// SQUARE_LOCATION_ID が undefined の場合にエラーを投げる関数
function getLocationId(): string {
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) {
    throw new Error('SQUARE_LOCATION_ID is not defined in environment variables');
  }
  return locationId;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { tickets, totalAmount, userId, email, ethAddress } = body; // emailを追加

    const lineItems = tickets.map((ticket: any) => ({
      quantity: ticket.quantity.toString(),
      name: ticket.name,
      basePriceMoney: {
        amount: parseInt(ticket.price), // BigInt を使用せず、通常の整数として扱う
        currency: 'JPY'
      }
    }));

    const locationId = getLocationId();
    const idempotencyKey = randomUUID();

    console.log('Creating payment link with:', { locationId, idempotencyKey, lineItems, totalAmount });

    // Payment Link 作成
    const paymentLinkParams: CreatePaymentLinkRequest = {
      idempotencyKey,
      order: {
        locationId,
        lineItems
      },
      paymentNote: JSON.stringify({
        ethAddress
      }),
    };

    // emailが提供されている場合のみprePopulatedDataを追加
    if (email && email.includes('@')) {
      paymentLinkParams.prePopulatedData = {
        buyerEmail: email,
      };
    }

    const response = await checkoutApi.createPaymentLink(paymentLinkParams);

    console.log('Initial payment link created:', response.result);

    if (!response.result.paymentLink || !response.result.paymentLink.url || !response.result.paymentLink.id) {
      throw new Error('Failed to create initial payment link');
    }

    
    const paymentLinkId = response.result.paymentLink.id;
    const orderId = response.result.paymentLink.orderId;

    // Payment Link の更新
    const updateResponse = await checkoutApi.updatePaymentLink(
      paymentLinkId,
      {
        paymentLink: {
          version: 1, // 初期バージョンは1
          checkoutOptions: {
            redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id=${orderId}`,
          }
        }
      }
    );

    console.log('Updated payment link:', updateResponse.result);

    if (!updateResponse.result.paymentLink || !updateResponse.result.paymentLink.url) {
      throw new Error('Failed to update payment link');
    }

    const finalCheckoutUrl = updateResponse.result.paymentLink.url;

    return new Response(JSON.stringify({ checkoutUrl: finalCheckoutUrl, orderId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-square-payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Payment link creation failed', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}