import { NextRequest, NextResponse } from 'next/server';
import { Client, Environment } from 'square';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox,
});

// BigIntを含むオブジェクトを安全にシリアライズするためのヘルパー関数
function safeStringify(obj: any) {
  return JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
}

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('order_id');
  
  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    const response = await client.ordersApi.retrieveOrder(orderId);
    
    if (response.result && response.result.order) {
      const order = response.result.order;
      // BigIntを含む可能性のあるデータを安全にシリアライズ
      const safeOrder = JSON.parse(safeStringify({
        status: order.state,
        totalMoney: order.totalMoney,
        // 必要に応じて他の情報も追加
      }));
      return NextResponse.json(safeOrder);
    } else {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 });
  }
}
