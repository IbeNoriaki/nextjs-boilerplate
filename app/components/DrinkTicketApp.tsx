'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AlertCircle, GlassWater, Wine, Plus, Minus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import SquareCheckoutButton from './SquareCheckoutButton'

// 既存の Ticket インターフェース定義をそのまま使用します
interface Ticket {
  name: string;
  price: number;
  quantity: number;
}

const DrinkTicketApp: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tickets, setTickets] = useState<{ [key: string]: Ticket }>({
    bottle: { name: 'ボトルチケット', price: 5000, quantity: 0 },
    glass: { name: 'グラスチケット', price: 1000, quantity: 0 },
  })
  const [error, setError] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  useEffect(() => {
    const newTotalAmount = Object.values(tickets).reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0)
    setTotalAmount(newTotalAmount)

    // チケットが選択されたらエラーメッセージをクリア
    if (newTotalAmount > 0) {
      setError(null)
    }
  }, [tickets])

  const updateQuantity = (ticketKey: string, change: number) => {
    setTickets(prev => ({
      ...prev,
      [ticketKey]: {
        ...prev[ticketKey],
        quantity: Math.max(0, prev[ticketKey].quantity + change),
      },
    }))
  }

  const calculateTotal = () => {
    return Object.values(tickets).reduce((total, ticket) => total + ticket.price * ticket.quantity, 0)
  }

  const handleSquareCheckout = async () => {
    const selectedTickets = Object.entries(tickets)
      .filter(([, ticket]) => ticket.quantity > 0)
      .map(([, ticket]) => ({
        name: ticket.name,
        price: ticket.price,
        quantity: ticket.quantity
      }))

    const totalAmount = calculateTotal()

    if (totalAmount === 0) {
      setError('チケットを選択してください')
      return
    }

    setError(null)
    setIsCheckingOut(true)

    try {
      const response = await fetch('/api/create-square-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickets: selectedTickets, totalAmount }),
      })

      const data = await response.json()

      if (response.ok) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'チェックアウトURLの取得に失敗しました');
      }
    } catch (err) {
      console.error('チェックアウトプロセス中にエラーが発生しました:', err)
      setError('チェックアウトプロセス中にエラーが発生しました')
    }
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ja-JP')
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
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black gap-2 hover:bg-gray-200 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setIsDialogOpen(true)
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            Buy Ticket
          </a>
        </motion.div>
      )}
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] md:max-w-[600px] bg-black text-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="py-6 space-y-6">
              {Object.entries(tickets).map(([key, ticket]) => (
                <motion.div
                  key={key}
                  className="bg-gray-900 p-4 rounded-xl shadow-sm transition duration-300 ease-in-out hover:shadow-md border border-gray-700"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className="bg-[#ffbc04] p-3 rounded-full flex-shrink-0"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        {key === 'bottle' ? <Wine className="h-6 w-6 text-black" /> : <GlassWater className="h-6 w-6 text-black" />}
                      </motion.div>
                      <div>
                        <Label className="text-base sm:text-lg font-semibold text-white whitespace-nowrap">{ticket.name}</Label>
                        <p className="text-sm text-gray-300">{formatAmount(ticket.price)}円</p>
                        <p className="text-xs text-gray-400 whitespace-nowrap">有効期限: 2025年6月末</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => updateQuantity(key, -1)}
                        className="h-8 w-8 rounded-full p-0 bg-gray-700 hover:bg-gray-600 text-white"
                        aria-label={`${ticket.name}の数量を減らす`}
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
                        onClick={() => updateQuantity(key, 1)}
                        className="h-8 w-8 rounded-full p-0 bg-[#ffbc04] hover:bg-[#e5a800] text-black"
                        aria-label={`${ticket.name}の数量を増やす`}
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
            <DialogFooter className="mt-6">
              <SquareCheckoutButton
                totalAmount={totalAmount}
                isCheckingOut={isCheckingOut}
                onCheckout={handleSquareCheckout}
                formatAmount={formatAmount}
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default DrinkTicketApp