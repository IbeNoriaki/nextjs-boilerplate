'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AlertCircle, GlassWater, Wine, Plus, Minus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import confetti from 'canvas-confetti'
// import axios from 'axios'  // コメントアウト

interface Ticket {
  price: number;
  quantity: number;
  icon: React.ReactElement;
  name: string;
  availableQuantity: number;
  expirationDate: string; // 新しく追加
}

const DrinkTicketSender: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tickets, setTickets] = useState<{ [key: string]: Ticket }>({
    '1000': { price: 1000, quantity: 0, icon: <GlassWater className="h-6 w-6" aria-hidden="true" />, name: 'ドリンク', availableQuantity: 7, expirationDate: '2025年6月末' },
    '5000': { price: 5000, quantity: 0, icon: <Wine className="h-6 w-6" aria-hidden="true" />, name: 'ボトル', availableQuantity: 8, expirationDate: '2025年6月末' }
  })
  const [error, setError] = useState('')
  const [isCreatingLink, setIsCreatingLink] = useState(false)
  const [activeTicket, setActiveTicket] = useState<string | null>(null)

  const handleQuantityChange = (price: string, change: number) => {
    setTickets(prev => {
      const newQuantity = Math.max(0, Math.min(prev[price].availableQuantity, prev[price].quantity + change))
      const updatedTickets = {
        ...prev,
        [price]: { ...prev[price], quantity: newQuantity }
      }
      
      // Reset the quantity of the other ticket type
      const otherPrice = price === '1000' ? '5000' : '1000'
      updatedTickets[otherPrice] = { ...updatedTickets[otherPrice], quantity: 0 }

      // Update activeTicket based on the new quantity
      if (newQuantity > 0) {
        setActiveTicket(price)
      } else if (updatedTickets[otherPrice].quantity === 0) {
        setActiveTicket(null)
      }

      return updatedTickets
    })
  }

  const handleCreateLink = async () => {
    if (Object.values(tickets).every(ticket => ticket.quantity === 0)) {
      setError('少なくとも1枚のチケットを選択してください。');
      return;
    }
    setError('');
    setIsCreatingLink(true);

    try {
      // 以下の部分をコメントアウト
      /*
      // Call your API to send the ticket
      await axios.post('/api/send-ticket', { tickets: activeTicket });

      // Register transaction in Smaregi
      await axios.post('/api/register-transaction', {
        transactionDetails: {
          // Add necessary transaction details here
          // Include the shop code for the selected bar
        }
      });
      */

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      const selectedTicket = Object.values(tickets).find(ticket => ticket.quantity > 0);
      alert(`送付リンクが作成されました。${selectedTicket?.name}チケット ${selectedTicket?.quantity}枚`);
      setIsDialogOpen(false);
      setTickets(prev => Object.fromEntries(Object.entries(prev).map(([key, ticket]) => [key, {...ticket, quantity: 0}])));
      setActiveTicket(null);
    } catch (error) {
      console.error('Error creating link:', error);
      setError('リンク作成中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsCreatingLink(false);
    }
  };

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
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            Share Ticket
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
                  className={`bg-gray-900 p-4 rounded-xl shadow-sm transition duration-300 ease-in-out hover:shadow-md border ${activeTicket === price || activeTicket === null ? 'border-gray-700' : 'border-gray-800 opacity-50'}`}
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
                        <p className="text-xs text-gray-400 whitespace-nowrap">残り: {ticket.availableQuantity}枚</p>
                        <p className="text-xs text-gray-400 whitespace-nowrap">有効期限: {ticket.expirationDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleQuantityChange(price, -1)}
                        className="h-8 w-8 rounded-full p-0 bg-gray-700 hover:bg-gray-600 text-white"
                        aria-label={`${ticket.name}チケットの数量を減らす`}
                        disabled={activeTicket !== price && activeTicket !== null}
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
                        disabled={activeTicket !== price && activeTicket !== null}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {activeTicket !== null && activeTicket !== price && (
                    <p className="text-xs text-yellow-500 mt-2">他のチケットが選択されています</p>
                  )}
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
              <Button 
                onClick={handleCreateLink} 
                className="w-full h-10 sm:h-12 text-sm sm:text-base bg-[#ffbc04] hover:bg-[#e5a800] text-black font-semibold rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                disabled={isCreatingLink}
              >
                {isCreatingLink ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-t-2 border-black rounded-full"
                  />
                ) : (
                  '送付リンク作成'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default DrinkTicketSender