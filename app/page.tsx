'use client';
import React from 'react';
import Image from "next/image";
import { ConnectToReceiveButton } from './components/ConnectToReceiveButton';
import DrinkTicketApp from './components/DrinkTicketApp';
import DrinkTicketSender from "./components/drink-ticket-sender";
import { SpecificTradeInfoPopup } from './components/SpecificTradeInfoPopup';
import UseTicketButton from './components/use-ticket-button';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] text-white bg-black">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex items-center gap-0 -space-x-1">
          <Image
            src="/asset/awabar_t2c.svg"
            alt="Awabar logo"
            width={180}
            height={38}
            priority
          />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF4500" className="w-10 h-10 animate-pulse transform -translate-y-1">
            <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
          </svg>
        </div>
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
          <UseTicketButton />
          <ConnectToReceiveButton />
        </div>
      </main>
      <footer className="row-start-3 flex justify-center">
        <SpecificTradeInfoPopup />
      </footer>
    </div>
  );
}