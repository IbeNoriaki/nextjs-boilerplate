import { Client, Environment } from 'square';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox,
});

const { ordersApi } = client;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id');

  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Order ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await ordersApi.retrieveOrder(orderId);
    
    if (!response.result.order) {
      throw new Error('Order not found');
    }

    const order = response.result.order;
    const paymentStatus = order.state;
    const totalAmount = order.totalMoney?.amount 
      ? Number(order.totalMoney.amount) / 100 
      : 0; // Convert cents to dollars/yen and ensure it's a number
    const currency = order.totalMoney?.currency || 'Unknown';
    const createdAt = order.createdAt;

    return new Response(JSON.stringify({
      paymentStatus,
      totalAmount,
      currency,
      createdAt,
      orderId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to check payment status', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
