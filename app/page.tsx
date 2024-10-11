'use client';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import AwabarHub from './components/AwabarHub';
import NicknameEditor from './components/NicknameEditor';
import { SpecificTradeInfoPopup } from './components/SpecificTradeInfoPopup';

export default function Home() {
  const [nickname, setNickname] = useState('Your Nickname');
  const [medalCount, setMedalCount] = useState(0);

  const fetchMedalCount = async () => {
    // Placeholder: Replace with actual API call
    return 0;
  };

  useEffect(() => {
    const getMedalCount = async () => {
      const count = await fetchMedalCount();
      setMedalCount(count);
    };
    getMedalCount();
  }, []);

  const getMedalSrc = (count: number) => {
    if (count >= 9) return "/asset/medal_9.svg";
    return `/asset/medal_${count}.svg`;
  };

  const getNextMedalSrc = (count: number) => {
    if (count >= 8) return "/asset/medal_9.svg";
    return `/asset/medal_${count + 1}.svg`;
  };

  return (
    <div className="flex flex-col min-h-screen p-8 pb-20 gap-6 sm:p-12 font-[family-name:var(--font-geist-sans)] text-white bg-black">
      <header className="flex flex-col items-center gap-8 pt-8">
        <div className="flex items-center gap-0 -space-x-1">
          <Image
            src="/asset/awabar_t2c.svg"
            alt="Awabar logo"
            width={200}
            height={42}
            priority
          />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF4500" className="w-10 h-10 animate-pulse transform -translate-y-1">
            <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="[&_svg]:fill-white [&_svg]:w-[220px] [&_svg]:h-[55px]">
              <Image
                src={getMedalSrc(medalCount)}
                alt="Current Member Status"
                width={220}
                height={55}
              />
              {medalCount === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">No Medal</span>
                </div>
              )}
            </div>
            {medalCount < 9 && (
              <div className="absolute bottom-0 right-0 flex flex-col items-center transform translate-x-[30%]">
                <Image
                  src={getNextMedalSrc(medalCount)}
                  alt="Next Member Status"
                  width={66}
                  height={16.5}
                  className="opacity-50"
                />
                <span className="text-[10px] sm:text-xs font-bold mt-1">Next: {medalCount + 1}</span>
              </div>
            )}
          </div>
          <NicknameEditor nickname={nickname} setNickname={setNickname} maxLength={20} />
        </div>
      </header>

      <main className="flex flex-col gap-6 items-center flex-grow">
        <h1 className="text-lg sm:text-xl font-bold text-center">
          Unlock the social experience:
          <span className="block mt-1 text-white text-base sm:text-lg">
            Drink. Share. Connect.
          </span>
        </h1>

        <AwabarHub />
      </main>

      <footer className="mt-auto flex justify-center">
        <SpecificTradeInfoPopup />
      </footer>
    </div>
  );
}