'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ShoppingBag, Gift, Ticket, Copy } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"


interface HistoryItem {
  id: string
  destinationId: string
  sourceId: string
  type: string
  amount: number
  date: string
  userName?: string
  shopName?: string
  shareType?: 'sent' | 'receiveRequest'
  receiveRequestState?: 'pending' | 'received'
  orderId?: string
}

const mockHistory: HistoryItem[] = [
  { id: '1', destinationId: 'user123', sourceId: 'Headoffice', type: 'Standard', amount: 2, date: '2023-10-01T14:30:00', orderId: 'ORD-123456' },
  { id: '2', destinationId: 'shop', sourceId: 'user123', type: 'Premium', amount: 1, date: '2023-10-03T18:45:00', shopName: '六本木' },
  { id: '3', destinationId: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0', sourceId: 'user123', type: 'Standard', amount: 3, date: '2023-10-05T09:15:00', shareType: 'sent' },
  { id: '4', destinationId: 'user123', sourceId: '0xb47ce64fcaae0018B080482073D58eA6C1c1636D', type: 'VIP', amount: 1, date: '2023-10-07T21:00:00', shareType: 'receiveRequest', receiveRequestState: 'pending' },
  { id: '5', destinationId: 'shop', sourceId: 'user123', type: 'Standard', amount: 2, date: '2023-10-09T16:20:00', shopName: '大阪' },
  { id: '6', destinationId: 'user123', sourceId: '0x9876543210abcdef0123456789abcdef01234567', type: 'Premium', amount: 2, date: '2023-10-11T11:50:00', shareType: 'receiveRequest', receiveRequestState: 'received' },
]

type FilterType = 'all' | 'buy' | 'share' | 'use'

interface TicketHistoryDialogProps {
  isOpen: boolean
  onClose: () => void
}

const TicketHistoryDialog: React.FC<TicketHistoryDialogProps> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<FilterType>('all')
  const [unclaimedDialogOpen, setUnclaimedDialogOpen] = useState(false)
  const [selectedUnclaimedItem, setSelectedUnclaimedItem] = useState<HistoryItem | null>(null)
  const userId = 'user123' // This would normally come from your auth system

  const filteredHistory = useMemo(() => {
    const filtered = mockHistory.filter(item => {
      switch (filter) {
        case 'buy':
          return item.sourceId === 'Headoffice'
        case 'share':
          return item.shareType !== undefined
        case 'use':
          return item.destinationId === 'shop'
        default:
          return true
      }
    })
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [filter])

  const getIcon = (item: HistoryItem) => {
    if (item.sourceId === 'Headoffice') return <ShoppingBag className="w-6 h-6 text-green-500" />
    if (item.destinationId === 'shop') return <Ticket className="w-6 h-6 text-red-500" />
    return <Gift className="w-6 h-6 text-blue-500" />
  }

  const getDescription = (item: HistoryItem) => {
    if (item.sourceId === 'Headoffice') return 'Buy @'
    if (item.destinationId === 'shop') return 'Use @'
    if (item.sourceId === userId) return `Share to ${formatAddress(item.destinationId)}`
    return `Share from ${formatAddress(item.sourceId)}`
  }

  const getColor = (item: HistoryItem) => {
    if (item.sourceId === 'Headoffice') return 'bg-green-500/10 border-green-500/20'
    if (item.destinationId === 'shop') return 'bg-red-500/10 border-red-500/20'
    return 'bg-blue-500/10 border-blue-500/20'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const formatAddress = (address: string) => {
    if (address.startsWith('0x')) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    return address
  }

  const copyToClipboard = (text: string, type: 'address' | 'orderId') => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        description: `${type === 'address' ? 'アドレス' : 'Order ID'}がコピーされました: ${text}`,
      })
    }).catch(err => {
      console.error('Failed to copy: ', err)
    })
  }

  const handleUnclaimedClick = (item: HistoryItem) => {
    setSelectedUnclaimedItem(item)
    setUnclaimedDialogOpen(true)
  }

  const handleCancelShare = () => {
    // Implement cancel share logic here
    console.log('Cancelling share for unclaimed ticket:', selectedUnclaimedItem)
    setUnclaimedDialogOpen(false)
  }

  const handleCopyLink = () => {
    // Implement copy link logic here
    console.log('Copying link for unclaimed ticket:', selectedUnclaimedItem)
    setUnclaimedDialogOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] h-[90vh] sm:h-[80vh] flex flex-col p-0 bg-black text-white" closeButton={false}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <h2 className="text-xl font-bold">Ticket History</h2>
            <div className="flex">
              {['all', 'buy', 'share', 'use'].map((f) => (
                <Button 
                  key={f}
                  variant={filter === f ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setFilter(f as FilterType)}
                  className="px-2 py-1 text-xs"
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          <ScrollArea className="flex-grow">
            <div className="p-4 space-y-4">
              <AnimatePresence>
                {filteredHistory.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`rounded-lg border ${getColor(item)} overflow-hidden`}
                  >
                    <div className="flex items-center p-4">
                      <Avatar className="h-10 w-10 mr-4">
                        {getIcon(item)}
                      </Avatar>
                      <div className="flex-grow">
                        <div className="flex items-center">
                          <p className="font-semibold">{getDescription(item)}</p>
                          {item.sourceId === 'Headoffice' && (
                            <>
                              <span className="ml-2">Order_ID</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(item.orderId!, 'orderId')}
                                className="ml-2 p-1"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {item.destinationId === 'shop' && item.shopName && (
                            <Button
                              className="h-6 text-xs px-2 ml-2 bg-[#ffbc04] hover:bg-[#ffbc04] text-black rounded-full transition-colors"
                            >
                              {item.shopName}
                            </Button>
                          )}
                          {item.shareType && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(item.sourceId === userId ? item.destinationId : item.sourceId, 'address')}
                              className="ml-2 p-1"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{formatDate(item.date)}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {item.shareType === 'receiveRequest' && item.receiveRequestState === 'pending' && (
                          <Badge 
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleUnclaimedClick(item)}
                          >
                            Unclaimed
                          </Badge>
                        )}
                        <Badge variant="secondary">
                          {item.amount} {item.type}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
      <Dialog open={unclaimedDialogOpen} onOpenChange={setUnclaimedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unclaimed Ticket Options</DialogTitle>
            <DialogDescription>
              Choose an action for this unclaimed ticket.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={handleCancelShare}>
              Cancel Share
            </Button>
            <Button onClick={handleCopyLink}>
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

export default TicketHistoryDialog