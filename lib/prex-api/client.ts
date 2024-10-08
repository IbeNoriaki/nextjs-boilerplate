import { PrexClient, RequestArguments, ProviderEventEmitter } from "@prex0/prex-client"
import { hashTypedData, Address, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts'
import { PRIVATE_KEY, PREX_POLICY_ID, PREX_API_KEY, CHAIN_ID } from '@/lib/constants';

class KeyProvider extends ProviderEventEmitter {
  async request(request: RequestArguments): Promise<any> {
    const { method, params } = request;

    const account = privateKeyToAccount(PRIVATE_KEY as Hex)

    // ユーザのアドレスを確認する
    // console.log(account)

    switch (method) {
      case 'eth_requestAccounts':
        return [account.address];
      case 'eth_accounts':
        return [account.address];
      case 'eth_signTypedData_v4':
        if (Array.isArray(params)) {
          const hash = hashTypedData(params[1])

          const signature = await account.signMessage({
            message: {
              raw: hash
            }
          })

          return signature
        } else {
          throw new Error('invalid params');
        }
      default:
        throw new Error('method not supported');
    }
  }

  async disconnect() {
  }

}

export async function sendTokenToUser(token: Address, ethAddress: Address, amount: number) {
  const client = new PrexClient(
    CHAIN_ID,
    PREX_POLICY_ID,
    {
      apiKey: PREX_API_KEY,
      provider: new KeyProvider()
    }
  )
  
  await client.load()

  await client.transfer(token, ethAddress, BigInt(amount))
}