import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, mode } = body;

    if (mode === 'payment_intent') {
      // 既存の PaymentIntent 作成ロジック
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
      });

      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } else if (mode === 'checkout') {
      // 新しい Checkout Session 作成ロジック
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: 'ドリンクチケット',
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${request.headers.get('origin')}/success`,
        cancel_url: `${request.headers.get('origin')}/cancel`,
      });

      return NextResponse.json({ id: session.id });
    } else {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }
  } catch (error) {
    console.error('Server-side: Error:', error);
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: 'Stripe error', details: error.message },
        { status: error.statusCode || 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error', details: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
