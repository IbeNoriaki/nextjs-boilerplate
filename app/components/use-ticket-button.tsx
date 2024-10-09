'use client'

import React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Loader2 } from 'lucide-react'
// import { Plus, Minus } from 'lucide-react'
// import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { GlassWater, Wine } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import TicketItem from './TicketItem'

interface Ticket {
  price: number;
  quantity: number;
  icon: JSX.Element;
  name: string;
  availableQuantity: number;
  expirationDate: string;
}

const UseTicketButton: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tickets, setTickets] = useState<{ [key: string]: Ticket }>({
    '1000': { price: 1000, quantity: 0, icon: <GlassWater className="h-6 w-6" aria-hidden="true" />, name: 'ドリンク', availableQuantity: 7, expirationDate: '2025年6月末' },
    '5000': { price: 5000, quantity: 0, icon: <Wine className="h-6 w-6" aria-hidden="true" />, name: 'ボトル', availableQuantity: 8, expirationDate: '2025年6月末' }
  })
  const [activeTicket, setActiveTicket] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  const locations = [
    { name: '六本木', code: '1' },
    { name: '大阪', code: '2' },
    { name: '神戸', code: '3' },
    { name: '福岡', code: '4' },
    { name: '沖縄', code: '5' },
  ]

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

      setMessage(null);
      return updatedTickets;
    });
  }

  const handleUseTicket = async () => {
    if (Object.values(tickets).every(ticket => ticket.quantity === 0)) {
      setError('少なくとも1枚のチケットを選択してください。');
      return;
    }
    if (!selectedLocation) {
      setError('店舗を選択してください。');
      return;
    }
    setError('');

    try {
      // ここにチケット利のロジックを実装
      console.log('チケットを利用しました', selectedLocation);
      setIsDialogOpen(false);
      setTickets(prev => Object.fromEntries(Object.entries(prev).map(([key, ticket]) => [key, {...ticket, quantity: 0}])));
      setActiveTicket(null);
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error using ticket:', error);
      setError('チケット利用中にエラーが発生しました。もう一度お試しください。');
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black gap-2 hover:bg-gray-200 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
        </svg>
        Use Ticket
      </Button>

      <AnimatePresence>
        {isDialogOpen && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px] bg-black text-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="py-6 space-y-6">
                {Object.entries(tickets).map(([price, ticket]) => (
                  <TicketItem
                    key={price}
                    price={price}
                    ticket={ticket}
                    activeTicket={activeTicket}
                    onQuantityChange={handleQuantityChange}
                  />
                ))}
              </div>
              {message && (
                <p className="text-yellow-500 mt-2">{message}</p>
              )}
              {error && (
                <Alert variant="destructive" className="mt-4 bg-red-900 text-white">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>エラー</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="mt-6">
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {locations.map((location) => (
                    <Button
                      key={location.code}
                      onClick={() => setSelectedLocation(location.code)}
                      className={`h-10 text-xs px-2 flex-grow flex-shrink-0 basis-auto max-w-[calc(20%-0.4rem)] ${
                        selectedLocation === location.code
                          ? 'bg-[#ffbc04] hover:bg-[#e5a800] text-black'
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      } rounded-full transition-colors`}
                    >
                      {location.name}
                    </Button>
                  ))}
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button 
                  onClick={handleUseTicket} 
                  className="w-full h-12 text-lg bg-[#ffbc04] hover:bg-[#e5a800] text-black font-semibold rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                  disabled={!selectedLocation || Object.values(tickets).every(ticket => ticket.quantity === 0)}
                >
                  {selectedLocation 
                    ? `${locations.find(loc => loc.code === selectedLocation)?.name}のお店で利用する` 
                    : 'お店で利用する'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}

export default UseTicketButton