'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { GlassWater, Wine, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

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
    if (activeTicket !== null && activeTicket !== price) {
      setMessage('チケットはそれぞれ利用してください');
      return;
    }

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
                  <motion.div
                    key={price}
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
                          {price === '5000' ? <Wine className="h-6 w-6 text-black" /> : <GlassWater className="h-6 w-6 text-black" />}
                        </motion.div>
                        <div>
                          <Label className="text-base sm:text-lg font-semibold text-white">{ticket.name}</Label>
                          <p className="text-sm text-gray-300">{ticket.price.toLocaleString()}円</p>
                          <p className="text-xs text-gray-400">期限: {ticket.expirationDate}</p>
                          <p className="text-xs text-gray-400">保有数: {ticket.availableQuantity}枚</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleQuantityChange(price, -1)}
                            className="h-8 w-8 rounded-full p-0 bg-gray-700 hover:bg-gray-600 text-white"
                            aria-label={`${ticket.name}の数量を減らす`}
                            disabled={activeTicket !== null && activeTicket !== price}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <motion.span
                            key={ticket.quantity}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-white font-bold"
                          >
                            {ticket.quantity}
                          </motion.span>
                          <Button
                            onClick={() => handleQuantityChange(price, 1)}
                            className="h-8 w-8 rounded-full p-0 bg-[#ffbc04] hover:bg-[#e5a800] text-black"
                            aria-label={`${ticket.name}の数量を増やす`}
                            disabled={activeTicket !== null && activeTicket !== price}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {price === '1000' && (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleQuantityChange(price, 50 - ticket.quantity)}
                              className="h-6 w-12 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-full"
                              disabled={activeTicket !== null && activeTicket !== price}
                            >
                              50枚
                            </Button>
                            <Button
                              onClick={() => handleQuantityChange(price, 100 - ticket.quantity)}
                              className="h-6 w-12 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-full"
                              disabled={activeTicket !== null && activeTicket !== price}
                            >
                              100枚
                            </Button>
                          </div>
                        )}
                        {price === '5000' && (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleQuantityChange(price, 10 - ticket.quantity)}
                              className="h-6 w-12 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-full"
                              disabled={activeTicket !== null && activeTicket !== price}
                            >
                              10枚
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
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