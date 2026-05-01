'use client'

import { useGameStore } from '@/lib/game-store'
import { Navigation } from '@/components/game-store/Navigation'
import { HomePage } from '@/components/game-store/HomePage'
import GameCatalog from '@/components/game-store/GameCatalog'
import GameDetail from '@/components/game-store/GameDetail'
import Checkout from '@/components/game-store/Checkout'
import OrderStatus from '@/components/game-store/OrderStatus'
import AdminLogin from '@/components/game-store/AdminLogin'
import AdminDashboard from '@/components/game-store/AdminDashboard'
import Footer from '@/components/game-store/Footer'

export default function Home() {
  const currentPage = useGameStore((s) => s.currentPage)

  // Admin pages have their own layout (no navigation/footer)
  if (currentPage === 'admin-login') {
    return <AdminLogin />
  }

  if (currentPage === 'admin-dashboard') {
    return <AdminDashboard />
  }

  // All other pages share the navigation and footer
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <Navigation />
      <div className="flex-1 pt-16">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'catalog' && <GameCatalog />}
        {currentPage === 'detail' && <GameDetail />}
        {currentPage === 'checkout' && <Checkout />}
        {currentPage === 'order-status' && <OrderStatus />}
      </div>
      <Footer />
    </div>
  )
}
