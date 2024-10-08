'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertCircle, GlassWater, Wine } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import SquareCheckoutButton from './SquareCheckoutButton'
import TicketItem from './TicketItem'
import { AnimatePresence } from 'framer-motion'

// 既存の Ticket インターフェース定義をそのまま使用します
interface Ticket {
  name: string;
  price: number;
  quantity: number;
  availableQuantity: number;
  expirationDate: string;
  icon?: JSX.Element;
}

const DrinkTicketApp: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tickets, _setTickets] = useState<{ [key: string]: Ticket }>({
    '1000': { name: 'ドリンク', price: 1000, quantity: 0, availableQuantity: 7, expirationDate: '2025年6月末', icon: <GlassWater className="h-6 w-6" aria-hidden="true" /> },
    '5000': { name: 'ボトル', price: 5000, quantity: 0, availableQuantity: 8, expirationDate: '2025年6月末', icon: <Wine className="h-6 w-6" aria-hidden="true" /> }
  })
  const [purchaseQuantities, setPurchaseQuantities] = useState<{ [key: string]: number }>({
    '1000': 0,
    '5000': 0
  })
  const [error, setError] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [userId] = useState<string>(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    return isDevelopment ? 'dev_user_1234567888' : `user_${Math.random().toString(36).substr(2, 9)}`;
  });
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  

  useEffect(() => {
    const newTotalAmount = Object.entries(purchaseQuantities).reduce((sum, [price, quantity]) => sum + parseInt(price) * quantity, 0)
    setTotalAmount(newTotalAmount)

    if (newTotalAmount > 0) {
      setError(null)
    }
  }, [purchaseQuantities])

  useEffect(() => {
    const paymentPending = localStorage.getItem('paymentPending');
    if (paymentPending === 'true') {
      localStorage.removeItem('paymentPending');
      setIsDialogOpen(true);
      setError('決済が完了していません。購入を再度行ってくさい。');
    }
  }, []);

  const handleQuantityChange = (price: string, change: number) => {
    setPurchaseQuantities(prev => ({
      ...prev,
      [price]: Math.max(0, prev[price] + change)
    }));
    
    if (purchaseQuantities[price] + change > 0) {
      setActiveTicket(price);
    } else if (purchaseQuantities[price] + change === 0) {
      setActiveTicket(null);
    }
  }

  const calculateTotal = () => {
    return Object.values(tickets).reduce((total, ticket) => total + ticket.price * ticket.quantity, 0)
  }

  const handleSquareCheckout = async () => {
    const selectedTickets = Object.entries(purchaseQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([price, quantity]) => ({
        name: tickets[price].name,
        price: parseInt(price),
        quantity: quantity
      }))

    if (totalAmount === 0) {
      setError('チケットを選択してください')
      return
    }

    setError(null)
    setIsCheckingOut(true)

    const ethAddress = '0x87C7019dF2f1813f207f1801cd054bFeA61ad5bE'

    try {
      const response = await fetch('/api/create-square-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickets: selectedTickets, totalAmount, userId, ethAddress }),
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
        setError('購履歴の取得に失敗しました');
      }
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      setError('購入履歴の取得に失敗しました');
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black gap-2 hover:bg-gray-200 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
        Buy Ticket
      </Button>

      <AnimatePresence>
        {isDialogOpen && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px] md:max-w-[600px] bg-black text-white rounded-2xl shadow-2xl overflow-hidden" aria-describedby="dialog-description">
              <DialogDescription id="dialog-description" className="sr-only">
                このダイアログではチケットの購入と購入履歴の確認ができます。
              </DialogDescription>
              <div className="py-6 space-y-6">
                {Object.entries(tickets).map(([price, ticket]) => (
                  <TicketItem
                    key={price}
                    price={price}
                    ticket={{...ticket, quantity: purchaseQuantities[price]}}
                    activeTicket={activeTicket}
                    onQuantityChange={handleQuantityChange}
                    isBuying={true}
                  />
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
                  purchaseHistory.slice(0, 5).map((purchase) => (
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
    </>
  )
}

export default DrinkTicketApp