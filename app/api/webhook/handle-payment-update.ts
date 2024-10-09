/**
 * payment.updatedイベントのためのハンドラ
 * @description Squareからの支払い完了リクエストを受け取り、
 * ユーザーにドリンクチケットのトークンを送る
 */
import { Client, Environment } from 'square';
import { sendTokenToUser } from '@/lib/prex-api/client';
import { TOKEN_ADDRESS } from '@/lib/constants';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox, // 本番環境の場合は Environment.Production に変更
});

const { ordersApi } = client;

type PaymentEvent = {
  id: string,
  amount_money: {
    amount: number,
    currency: string,
  },
  status: 'COMPLETED' | 'CANCELED' | 'APPROVED',
  order_id: string,
  note: string,
}

export async function handlePaymentUpdate(payment: PaymentEvent) {
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
