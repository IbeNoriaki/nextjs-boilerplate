export default function CheckoutPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4">
      <div className="w-[375px] h-[812px] bg-gray-800 rounded-[60px] shadow-xl overflow-hidden border-8 border-gray-700 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-gray-700 rounded-b-3xl"></div>
        <div className="w-full h-full overflow-y-auto bg-gradient-to-b from-gray-800 to-gray-900">
          <header className="bg-gray-900 text-white shadow-md w-full sticky top-0 z-10 px-4 py-3">
            {/* ヘッダーコンテンツ */}
          </header>

          <main className="flex-grow container mx-auto px-3 py-4">
            <h1 className="text-xl font-bold text-center mb-4 text-white">
              チェックアウト
            </h1>
            {/* チェックアウトフォームやコンテンツをここに追加 */}
          </main>

          <footer className="bg-gray-900 py-3 text-center text-xs text-gray-400 w-full mt-4">
            {/* フッターコンテンツ */}
          </footer>
        </div>
      </div>
    </div>
  )
}
