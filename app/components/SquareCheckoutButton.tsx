'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import { CreditCard } from 'lucide-react'

interface SquareCheckoutButtonProps {
  totalAmount: number;
  isCheckingOut: boolean;
  onCheckout: () => void;
  formatAmount: (amount: number) => string;
}

const SquareCheckoutButton: React.FC<SquareCheckoutButtonProps> = ({ totalAmount, isCheckingOut, onCheckout, formatAmount }) => {
  return (
    <Button 
      onClick={onCheckout} 
      className="w-full h-12 text-lg bg-[#ffbc04] hover:bg-[#e5a800] text-black font-semibold rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
      disabled={isCheckingOut}
    >
      {isCheckingOut ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-t-2 border-black rounded-full"
        />
      ) : (
        <div className="flex items-center justify-center space-x-2">
          <CreditCard className="h-6 w-6" />
          <span>Square決済で {formatAmount(totalAmount)}円 支払う</span>
        </div>
      )}
    </Button>
  )
}

export default SquareCheckoutButton
