import Link from "next/link"
import Image from "next/image"

const tickets = [
  {
    name: "プレミアムコーヒー",
    price: 5000,
    expiry: "2024年10月末",
    type: "drink",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "シグネチャーラテ",
    price: 5500,
    expiry: "2024年12月末",
    type: "drink",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "レアボトル2024",
    price: 25000,
    expiry: "2024年10月末",
    type: "bottle",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "リミテッドエディション",
    price: 30000,
    expiry: "2024年12月末",
    type: "bottle",
    image: "/placeholder.svg?height=400&width=400",
  },
]

export default function NFTStyleDrinkTickets() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4">
      <div className="w-[375px] h-[812px] bg-gray-800 rounded-[60px] shadow-xl overflow-hidden border-8 border-gray-700 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-gray-700 rounded-b-3xl"></div>
        <div className="w-full h-full overflow-y-auto bg-gradient-to-b from-gray-800 to-gray-900">
          <header className="bg-gray-900 text-white shadow-md w-full sticky top-0 z-10 px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-lg font-bold flex items-center">
                <span className="h-5 w-5 mr-1 text-blue-400">↗</span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                  Drink NFTs
                </span>
              </Link>
              <button className="text-blue-400 hover:bg-gray-800 px-3 py-1 rounded">
                接続
              </button>
            </div>
          </header>

          <main className="flex-grow container mx-auto px-3 py-4">
            <h1 className="text-xl font-bold text-center mb-4 text-white">
              限定ドリンクチケット
            </h1>
            <div className="grid grid-cols-2 gap-3">
              {tickets.map((ticket, index) => (
                <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <Image
                    src={ticket.image}
                    alt={ticket.name}
                    width={400}
                    height={400}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-2">
                    <div className="text-sm text-white flex items-center justify-between">
                      <span>{ticket.name}</span>
                      {ticket.type === 'drink' ? (
                        <span className="h-4 w-4 text-blue-400">☕</span>
                      ) : (
                        <span className="h-4 w-4 text-purple-400">🍷</span>
                      )}
                    </div>
                  </div>
                  <div className="p-2 text-center">
                    <p className="text-xs text-gray-400">{ticket.expiry}まで</p>
                    <p className="text-lg font-bold mt-1 text-green-400">{(ticket.price / 1000).toFixed(3)} ETH</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded-full transition-all duration-300">
                      今すぐ購入
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>

          <footer className="bg-gray-900 py-3 text-center text-xs text-gray-400 w-full mt-4">
            <div className="container mx-auto px-3">
              <p>&copy; 2024 Drink NFTs. All rights reserved.</p>
              <div className="mt-1 space-x-2">
                <Link href="/privacy" className="hover:text-blue-400">
                  プライバシー
                </Link>
                <Link href="/terms" className="hover:text-blue-400">
                  利用規約
                </Link>
                <Link href="/contact" className="hover:text-blue-400">
                  お問い合わせ
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
