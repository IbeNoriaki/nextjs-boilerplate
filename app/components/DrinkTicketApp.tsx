'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AlertCircle, GlassWater, Wine, Plus, Minus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import confetti from 'canvas-confetti'

// Ticket インターフェースを定義
interface Ticket {
  price: number;
  quantity: number;
  icon: React.ReactElement;
  name: string;
}

const DrinkTicketApp: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tickets, setTickets] = useState<{ [key: string]: Ticket }>({
    '1000': { price: 1000, quantity: 0, icon: <GlassWater className="h-6 w-6" aria-hidden="true" />, name: 'ドリンク' },
    '5000': { price: 5000, quantity: 0, icon: <Wine className="h-6 w-6" aria-hidden="true" />, name: 'ボトル' }
  })
  const [error, setError] = useState('')
  const [totalAmount, setTotalAmount] = useState(0)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  useEffect(() => {
    const newTotalAmount = Object.values(tickets).reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0)
    setTotalAmount(newTotalAmount)
  }, [tickets])

  const handleQuantityChange = (price: string, change: number) => {
    setTickets(prev => {
      const newQuantity = Math.max(0, prev[price].quantity + change)
      return {
        ...prev,
        [price]: { ...prev[price], quantity: newQuantity }
      }
    })
  }

  const handleCheckout = () => {
    if (Object.values(tickets).every(ticket => ticket.quantity === 0)) {
      setError('少なくとも1枚のチケットを選択してください。')
      return
    }
    setError('')
    setIsCheckingOut(true)
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      setTimeout(() => {
        alert(`合計金額: ${totalAmount}円のチケットを購入しました。`)
        setIsDialogOpen(false)
        setIsCheckingOut(false)
        setTickets(prev => Object.fromEntries(Object.entries(prev).map(([key, ticket]) => [key, {...ticket, quantity: 0}])))
      }, 1000)
    }, 500)
  }

  return (
    <AnimatePresence>
      {!isDialogOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.3 }}
        >
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black gap-2 hover:bg-gray-200 text-base font-semibold px-4 py-2 sm:px-5 sm:py-2.5"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setIsDialogOpen(true)
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-5 sm:h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            Buy Ticket
          </a>
        </motion.div>
      )}
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-black text-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="py-6 space-y-6">
              {Object.entries(tickets).map(([price, ticket]) => (
                <motion.div
                  key={price}
                  className="bg-gray-900 p-4 rounded-xl shadow-sm transition duration-300 ease-in-out hover:shadow-md border border-gray-700"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className="bg-[#ffbc04] p-3 rounded-full"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        {React.cloneElement(ticket.icon, { className: 'h-6 w-6 text-black' })}
                      </motion.div>
                      <div className="flex-shrink-0">
                        <Label className="text-base sm:text-lg font-semibold text-white whitespace-nowrap">{ticket.name}チケット</Label>
                        <p className="text-sm text-gray-300">{ticket.price}円</p>
                        <p className="text-xs text-gray-400 whitespace-nowrap">有効期限: 2025年6月末</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleQuantityChange(price, -1)}
                        className="h-8 w-8 rounded-full p-0 bg-gray-700 hover:bg-gray-600 text-white"
                        aria-label={`${ticket.name}チケットの数量を減らす`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <motion.span
                        key={ticket.quantity}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-lg font-semibold w-8 text-center text-white"
                      >
                        {ticket.quantity}
                      </motion.span>
                      <Button
                        onClick={() => handleQuantityChange(price, 1)}
                        className="h-8 w-8 rounded-full p-0 bg-[#ffbc04] hover:bg-[#e5a800] text-black"
                        aria-label={`${ticket.name}チケットの数量を増やす`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4 bg-red-900 text-white">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <motion.div
              key={totalAmount}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-6 text-right font-bold text-2xl text-white"
            >
              合計金額: {totalAmount}円
            </motion.div>
            <DialogFooter className="mt-6">
              <Button 
                onClick={handleCheckout} 
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
                  'チェックアウト'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default DrinkTicketApp