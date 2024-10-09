import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, Minus } from 'lucide-react'

interface TicketItemProps {
  price: string;
  ticket: Ticket;
  activeTicket: string | null;
  onQuantityChange: (price: string, change: number) => void;
}

interface Ticket {
  price: number;
  quantity: number;
  icon: React.ReactElement;
  name: string;
  availableQuantity: number;
  expirationDate: string;
}

const TicketItem: React.FC<TicketItemProps> = ({ price, ticket, activeTicket, onQuantityChange }) => {
  const [message, setMessage] = useState<string | null>(null);

  const handleQuantityChange = (change: number) => {
    if (activeTicket === null || activeTicket === price) {
      onQuantityChange(price, change);
      setMessage(null);
    } else {
      setMessage('チケットは一種類のみ選択可能です');
    }
  };

  return (
    <motion.div
      className={`bg-gray-900 p-4 rounded-xl shadow-sm transition duration-300 ease-in-out hover:shadow-md border ${
        activeTicket === null || activeTicket === price ? 'border-gray-700' : 'border-gray-800 opacity-50'
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div
            className="bg-[#ffbc04] p-3 rounded-full flex-shrink-0"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            {ticket.icon}
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
              onClick={() => handleQuantityChange(-1)}
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
              onClick={() => handleQuantityChange(1)}
              className="h-8 w-8 rounded-full p-0 bg-[#ffbc04] hover:bg-[#e5a800] text-black"
              aria-label={`${ticket.name}の数量を増やす`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {price === '1000' && (
            <div className="flex space-x-2">
              <Button
                onClick={() => handleQuantityChange(50 - ticket.quantity)}
                className="h-6 w-12 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-full"
                disabled={activeTicket !== null && activeTicket !== price}
              >
                50枚
              </Button>
              <Button
                onClick={() => handleQuantityChange(100 - ticket.quantity)}
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
                onClick={() => handleQuantityChange(10 - ticket.quantity)}
                className="h-6 w-12 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-full"
                disabled={activeTicket !== null && activeTicket !== price}
              >
                10枚
              </Button>
            </div>
          )}
        </div>
      </div>
      {message && (
        <p className="text-yellow-500 mt-2 text-sm">{message}</p>
      )}
    </motion.div>
  )
}

export default TicketItem
