'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AlertCircle, GlassWater, Wine, Plus, Minus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import SquareCheckoutButton from './SquareCheckoutButton'
import { useRouter } from 'next/navigation'
import DrinkTicketSender from './drink-ticket-sender'

// 既存の Ticket インターフェース定義をそのまま使用します
interface Ticket {
  name: string;
  price: number;
  quantity: number;
}

const DrinkTicketApp: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tickets, setTickets] = useState<{ [key: string]: Ticket }>({
    glass: { name: 'グラスチケット', price: 1000, quantity: 0 },
    bottle: { name: 'ボトルチケット', price: 5000, quantity: 0 },
  })
  const [error, setError] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [userId] = useState<string>(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    return isDevelopment ? 'dev_user_1234567888' : `user_${Math.random().toString(36).substr(2, 9)}`;
  });
  const [email, setEmail] = useState('');
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const newTotalAmount = Object.values(tickets).reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0)
    setTotalAmount(newTotalAmount)

    // チケットが選択されたらエラーメッセージをクリア
    if (newTotalAmount > 0) {
      setError(null)
    }
  }, [tickets])

  useEffect(() => {
    const paymentPending = localStorage.getItem('paymentPending');
    if (paymentPending === 'true') {
      localStorage.removeItem('paymentPending');
      setIsDialogOpen(true);
      setError('決済が完了していません。購入を再度行ってください。');
    }
  }, []);

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
        body: JSON.stringify({ tickets: selectedTickets, totalAmount, userId, email }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('paymentPending', 'true');
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'チェックアウトURLの取得に失敗しました');
      }
    } catch (err) {
      console.error('チェックアウトプロセス中にエラーが発生しました:', err)
      setError('チェックアウトプロセス中にエラーが発生しました')
    } finally {
      setIsCheckingOut(false)
    }
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ja-JP')
  }

  const handleShowHistory = async () => {
    try {
      const response = await fetch(`/api/payment-history?userId=${userId}`);
      const data = await response.json();
      console.log('Fetched payment history:', data); // 追加: 履歴をコンソールに出力
      if (data.orders) {
        setPurchaseHistory(data.orders);
        setIsHistoryModalOpen(true);
        console.log('Successfully set purchase history'); // 追加: 成功メッセージ
      } else {
        console.error('No orders found in the response'); // 追加: エラーメッセージ
        setError('購入履歴の取得に失敗しました');
      }
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      setError('購入履歴の取得に失敗しました');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="buy-ticket-button"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] md:max-w-[600px] bg-black text-white rounded-2xl shadow-2xl overflow-hidden" aria-describedby="dialog-description">
            <DialogDescription id="dialog-description" className="sr-only">
              このダイアログではチケットの購入と購入履歴の確認ができます。
            </DialogDescription>
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
                        <p className="text-xs text-gray-400 whitespace-nowrap">期限: 2025年6月末</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
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
                      {key === 'glass' && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => updateQuantity(key, 50 - ticket.quantity)}
                            className="h-6 w-12 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-full"
                          >
                            50枚
                          </Button>
                          <Button
                            onClick={() => updateQuantity(key, 100 - ticket.quantity)}
                            className="h-6 w-12 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-full"
                          >
                            100枚
                          </Button>
                        </div>
                      )}
                      {key === 'bottle' && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => updateQuantity(key, 10 - ticket.quantity)}
                            className="h-6 w-12 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-full"
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
            {error && (
              <Alert variant="destructive" className="mt-4 bg-red-900 text-white">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button
                onClick={handleShowHistory}
                className="w-full sm:w-auto text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-full px-4 py-2"
              >
                購入履歴を表示
              </Button>
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
      {isHistoryModalOpen && (
        <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
          <DialogContent className="sm:max-w-[500px] md:max-w-[600px] bg-black text-white rounded-2xl shadow-2xl">
            <DialogTitle>最近の購入履歴（直近5件）</DialogTitle>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
              {purchaseHistory.length > 0 ? (
                purchaseHistory.slice(0, 5).map((purchase, index) => (
                  <div key={purchase.id} className="p-4 bg-gray-900 rounded-lg mb-4">
                    <p>注文ID: {purchase.id}</p>
                    <p>日時: {new Date(purchase.createdAt).toLocaleString()}</p>
                    <p>合計: {formatAmount(purchase.totalMoney.amount)}円</p>
                    {purchase.tenders && purchase.tenders[0] && (
                      <p>メモ: {purchase.tenders[0].note || 'なし'}</p>
                    )}
                    <ul className="mt-2">
                      {purchase.lineItems.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          {item.name}: {item.quantity}枚
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p>購入履歴がありません。</p>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsHistoryModalOpen(false)}>閉じる</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default DrinkTicketApp