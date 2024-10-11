'use client'

import React from 'react'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { AlertCircle, GlassWater, Wine } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import confetti from 'canvas-confetti'
import axios from 'axios'
import TicketItem from './TicketItem'
import { GiMedal } from 'react-icons/gi'

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
    '300': { price: 300, quantity: 0, icon: <GlassWater className="h-6 w-6" aria-hidden="true" />, name: 'コイン', availableQuantity: 7, expirationDate: '2025年6月末' },
    '5000': { quantity: 0, icon: <GiMedal className="h-6 w-6" />, name: 'メダル', availableQuantity: 8 }
  })
  const [error, setError] = useState('')
  const [isCreatingLink, setIsCreatingLink] = useState(false)
  const [activeTicket, setActiveTicket] = useState<string | null>(null)

  const resetTickets = () => {
    setTickets(prev => Object.fromEntries(Object.entries(prev).map(([key, ticket]) => [key, {...ticket, quantity: 0}])))
    setActiveTicket(null)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    resetTickets()
  }

  const handleQuantityChange = (price: string, change: number) => {
    setTickets(prev => {
      const newQuantity = Math.max(0, Math.min(prev[price].availableQuantity, prev[price].quantity + change));
      const updatedTickets = {
        ...prev,
        [price]: { ...prev[price], quantity: newQuantity }
      };
      
      if (newQuantity > 0) {
        setActiveTicket(price);
      } else if (newQuantity === 0) {
        setActiveTicket(null);
      }

      return updatedTickets;
    });
  }

  const handleCreateLink = async () => {
    if (Object.values(tickets).every(ticket => ticket.quantity === 0)) {
      setError('少なくとも1枚のチケットを選択してください。');
      return;
    }
    setError('');
    setIsCreatingLink(true);

    try {
      // Call your API to send the ticket
      await axios.post('/api/send-ticket', { tickets: activeTicket });

      // Register transaction in Smaregi
      await axios.post('/api/register-transaction', {
        transactionDetails: {
          // Add necessary transaction details here
          // Include the shop code for the selected bar
        }
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      const selectedTicket = Object.values(tickets).find(ticket => ticket.quantity > 0);
      alert(`送付リンクが作成されました。${selectedTicket?.name}チケット ${selectedTicket?.quantity}`);
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
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black gap-2 hover:bg-gray-200 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
        Share
      </Button>

      <AnimatePresence>
        {isDialogOpen && (
          <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
            <DialogContent className="sm:max-w-[425px] bg-black text-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="py-6 space-y-6">
                <div className="space-y-4">
                  {Object.entries(tickets).map(([price, ticket]) => (
                    <TicketItem
                      key={price}
                      price={price}
                      ticket={ticket}
                      activeTicket={activeTicket}
                      onQuantityChange={handleQuantityChange}
                      hidePrice={price === '5000'}
                    />
                  ))}
                </div>
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
                  className="w-full h-12 text-lg bg-[#ffbc04] hover:bg-[#e5a800] text-black font-semibold rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                  disabled={isCreatingLink}
                >
                  {isCreatingLink ? '作成中...' : 'チケットシェアリンクを作成'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}

export default DrinkTicketSender