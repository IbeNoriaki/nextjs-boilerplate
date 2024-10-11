import { zeroHash } from "viem"

// トークンを管理するウォレットの秘密鍵
export const PRIVATE_KEY = process.env.PRIVATE_KEY || zeroHash
// PrexのポリシーID
export const PREX_POLICY_ID = process.env.NEXT_PUBLIC_PREX_POLICY_ID || ""
// PrexのAPIキー
export const PREX_API_KEY = process.env.NEXT_PUBLIC_PREX_API_KEY || ""
// Arbitrum、またはArbitrum SepoliaのチェーンID
export const CHAIN_ID = 421614 // 42161 for mainnet


// WebhookのURLを指定
export const NOTIFICATION_URL = process.env.NOTIFICATION_URL || '';
// from square developer portal
export const SQUARE_WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '';
// ドリンクチケットのトークンアドレス
export const TOKEN_ADDRESS = '0xAa0ebd8c37f4E00425cC82b2E19fee54a097e769'