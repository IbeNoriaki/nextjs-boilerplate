'use client';
import Image from "next/image";
import { ConnectToReceiveButton } from './components/ConnectToReceiveButton';
import DrinkTicketApp from './components/DrinkTicketApp';
import DrinkTicketSender from "./components/drink-ticket-sender";
import { SpecificTradeInfoPopup } from './components/SpecificTradeInfoPopup';
import StripeTestButton from './components/StripeTestButton';
import SmaregiTestButton from './components/SmaregiTestButton'; // 新しいコンポーネントをインポート

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] text-white bg-black">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          src="/asset/awabar_t2c.svg"
          alt="Awabar logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)] text-gray-300">
          <li className="mb-2">
            Unlock the social experience:{" "}
            <code className="bg-white/[.1] px-1 py-0.5 rounded font-semibold text-white whitespace-nowrap">
              Buy. Share. Connect.
            </code>
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <DrinkTicketApp />
          <DrinkTicketSender />
          <ConnectToReceiveButton />
          <StripeTestButton /> 
          <SmaregiTestButton />  {/* 新しいテストボタンを追加 */}
        </div>
      </main>
      <footer className="row-start-3 flex justify-center">
        <SpecificTradeInfoPopup />
      </footer>
    </div>
  );
}