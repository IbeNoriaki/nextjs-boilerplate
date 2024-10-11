'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import TicketHistoryDialog from './TicketHistoryDialog'

const TicketHistoryButton: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black gap-2 hover:bg-gray-200 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        History
      </Button>
      {isDialogOpen && <TicketHistoryDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />}
    </>
  )
}

export default TicketHistoryButton