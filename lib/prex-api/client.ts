import { PrexClient, RequestArguments, ProviderEventEmitter } from "@prex0/prex-client"
import { hashTypedData, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts'

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x"
const PREX_POLICY_ID = process.env.PREX_POLICY_ID || ""
const PREX_API_KEY = process.env.PREX_API_KEY || ""

class KeyProvider extends ProviderEventEmitter {
  async request(request: RequestArguments): Promise<any> {
    const { method, params } = request;

    const account = privateKeyToAccount(PRIVATE_KEY as Hex)

    console.log(account)

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

const client = new PrexClient(
  421614,
  PREX_POLICY_ID,
  {
    apiKey: PREX_API_KEY,
    provider: new KeyProvider()
  }
)

export async function sendTokenToUser(token: `0x${string}`, ethAddress: `0x${string}`, amount: number) {
  await client.load()
  await client.transfer(token, ethAddress, BigInt(amount))
}