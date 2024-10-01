import { NextResponse } from 'next/server';

const SMAREGI_API_ENDPOINT = 'https://api.smaregi.dev/';
const SMAREGI_AUTH_ENDPOINT = 'https://id.smaregi.jp/app/token'; // 注意: .jp ドメインを使用
const SMAREGI_CLIENT_ID = process.env.SMAREGI_CLIENT_ID!;
const SMAREGI_CLIENT_SECRET = process.env.SMAREGI_CLIENT_SECRET!;

async function getAccessToken() {
  try {
    console.log('Attempting to get access token...');
    console.log('Auth Endpoint:', SMAREGI_AUTH_ENDPOINT);
    console.log('Client ID:', SMAREGI_CLIENT_ID);
    console.log('Client Secret:', SMAREGI_CLIENT_SECRET.substring(0, 5) + '...');

    const tokenResponse = await fetch(SMAREGI_AUTH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: SMAREGI_CLIENT_ID,
        client_secret: SMAREGI_CLIENT_SECRET,
        scope: 'pos.transactions:write',
      }),
    });

    console.log('Token Response Status:', tokenResponse.status);
    console.log('Token Response Headers:', JSON.stringify(Object.fromEntries(tokenResponse.headers), null, 2));

    const responseText = await tokenResponse.text();
    console.log('Token Response Body:', responseText);

    if (!tokenResponse.ok) {
      throw new Error(`Failed to obtain access token: ${responseText}`);
    }

    const tokenData = JSON.parse(responseText);
    return tokenData.access_token;
  } catch (error) {
    console.error('Detailed token error:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const accessToken = await getAccessToken();
    const { amount, productName } = await request.json();

    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedDateTime = now.toISOString().replace('Z', '+00:00');

    const transactionData = {
      "transactionHeadDivision": "1",
      "cancelDivision": "0",
      "subtotal": amount.toString(),
      "subtotalDiscountPrice": "0",
      "total": amount.toString(),
      "taxInclude": Math.floor(amount / 1.1).toString(),
      "taxExclude": "0",
      "storeId": "1",
      "terminalId": "1",
      "terminalTranId": Date.now().toString().slice(-10),
      "terminalTranDateTime": formattedDateTime,
      "sumDivision": "2",
      "sumDate": formattedDate,
      "sellDivision": "0",
      "taxRate": "10",
      "taxRounding": "1",
      "details": [
        {
          "productId": "1",
          "productCode": "TEST_DRINK_TICKET",
          "productName": productName,
          "taxDivision": "1",
          "price": amount.toString(),
          "quantity": "1",
          "unitPrice": amount.toString(),
          "subtotal": amount.toString(),
          "unitDiscountPrice": "0",
          "unitDiscountRate": "0",
          "unitDiscountDivision": "0",
          "costPrice": "0",
        }
      ],
      "depositOthers": [
        {
          "depositOtherId": "1",
          "depositOtherName": "テスト支払い",
          "depositOtherPrice": amount.toString(),
        }
      ]
    };

    console.log('Sending transaction data:', JSON.stringify(transactionData, null, 2));

    const smaregiResponse = await fetch(`${SMAREGI_API_ENDPOINT}${SMAREGI_CLIENT_ID}/pos/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(transactionData),
    });

    console.log('Smaregi API Response Status:', smaregiResponse.status);
    console.log('Smaregi API Response Headers:', JSON.stringify(Object.fromEntries(smaregiResponse.headers), null, 2));

    const smaregiResponseText = await smaregiResponse.text();
    console.log('Smaregi API Response Body:', smaregiResponseText);

    if (!smaregiResponse.ok) {
      throw new Error(`Failed to register transaction with Smaregi: ${smaregiResponseText}`);
    }

    const smaregiData = JSON.parse(smaregiResponseText);
    console.log('Smaregi API response:', smaregiData);

    return NextResponse.json({ transactionId: smaregiData.id });
  } catch (error) {
    console.error('Detailed error:', error);
    
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json(
      { error: 'Failed to register transaction', details: errorMessage },
      { status: 500 }
    );
  }
}
