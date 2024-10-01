import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const SMAREGI_API_ENDPOINT = 'https://api.smaregi.jp/access/';
const SMAREGI_CONTRACT_ID = process.env.SMAREGI_CONTRACT_ID!;
const SMAREGI_ACCESS_TOKEN = process.env.SMAREGI_ACCESS_TOKEN!;

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    // Stripeセッションの詳細を取得
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 現在の日時を取得
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedDateTime = now.toISOString().replace('Z', '+00:00');

    // スマレジAPIに送信するデータを準備
    const transactionData = {
      "transactionHeadDivision": "1", // 通常取引
      "cancelDivision": "0", // 通常取引（取消しではない）
      "subtotal": session.amount_total?.toString(),
      "subtotalDiscountPrice": "0",
      "total": session.amount_total?.toString(),
      "taxInclude": Math.floor(Number(session.amount_total) / 1.1).toString(), // 10%の内税を仮定
      "taxExclude": "0",
      "storeId": "1", // 適切な店舗IDを設定
      "terminalId": "1", // 適切な端末IDを設定
      "terminalTranId": sessionId.slice(-10), // セッションIDの末尾10文字を使用
      "terminalTranDateTime": formattedDateTime,
      "sumDivision": "2", // 締め処理��み
      "sumDate": formattedDate,
      "customerCode": session.customer?.toString(),
      "sellDivision": "0", // 内税販売
      "taxRate": "10", // 10%の税率を仮定
      "taxRounding": "1", // 切り捨て
      "transactionUuid": sessionId,
      "details": [
        {
          "productId": "1", // 適切な商品IDを設定
          "productCode": "DRINK_TICKET",
          "productName": "ドリンクチケット",
          "taxDivision": "1", // 課税
          "price": session.amount_total?.toString(),
          "quantity": "1",
          "unitPrice": session.amount_total?.toString(),
          "subtotal": session.amount_total?.toString(),
          "unitDiscountPrice": "0",
          "unitDiscountRate": "0",
          "unitDiscountDivision": "0",
          "costPrice": "0",
        }
      ],
      "depositOthers": [
        {
          "depositOtherId": "1", // クレジットカード支払いを仮定
          "depositOtherName": "クレジットカード",
          "depositOtherPrice": session.amount_total?.toString(),
        }
      ]
    };

    // スマレジAPIを呼び出して取引を登録
    const smaregiResponse = await fetch(`${SMAREGI_API_ENDPOINT}${SMAREGI_CONTRACT_ID}/pos/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SMAREGI_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(transactionData),
    });

    if (!smaregiResponse.ok) {
      const errorData = await smaregiResponse.json();
      throw new Error(`Failed to register transaction with Smaregi: ${JSON.stringify(errorData)}`);
    }

    const smaregiData = await smaregiResponse.json();

    // 取引の登録が完了したことを確認
    const checkTransactionStatus = async (transactionId: string) => {
      const statusResponse = await fetch(`${SMAREGI_API_ENDPOINT}${SMAREGI_CONTRACT_ID}/pos/transactions/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${SMAREGI_ACCESS_TOKEN}`,
        },
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to check transaction status');
      }

      const statusData = await statusResponse.json();
      return statusData.status === 'completed'; // または適切なステータス
    };

    // 取引の完了を確認（最大10回、1秒間隔で確認）
    for (let i = 0; i < 10; i++) {
      if (await checkTransactionStatus(smaregiData.id)) {
        return NextResponse.json({ transactionId: smaregiData.id });
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Transaction registration timed out');
  } catch (error) {
    console.error('Error registering transaction:', error);
    return NextResponse.json({ error: 'Failed to register transaction' }, { status: 500 });
  }
}
