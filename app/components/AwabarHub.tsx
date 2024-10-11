import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DrinkTicketApp from './DrinkTicketApp';
import DrinkTicketSender from "./drink-ticket-sender";
import UseTicketButton from './use-ticket-button';
import TicketHistoryButton from './TicketHistoryButton';

const AwabarHub: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="rounded-full border-2 border-white transition-colors flex items-center justify-center bg-transparent text-white hover:bg-white hover:text-black gap-2 text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        awabar Hub
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-black text-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-2 gap-4 py-6">
            <DrinkTicketSender />
            <DrinkTicketApp />
            <UseTicketButton />
            <TicketHistoryButton />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AwabarHub;
