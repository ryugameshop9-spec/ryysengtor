'use client'

import { useGameStore } from '@/lib/game-store'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Gamepad2,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Image,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import OverviewTab from './admin/OverviewTab'
import ProductsTab from './admin/ProductsTab'
import OrdersTab from './admin/OrdersTab'
import SettingsTab from './admin/SettingsTab'
import BannersTab from './admin/BannersTab'
import TestimonialsTab from './admin/TestimonialsTab'

type TabKey = 'overview' | 'products' | 'orders' | 'settings' | 'banners' | 'testimonials'

interface TabConfig {
  key: TabKey
  label: string
  icon: typeof LayoutDashboard
}

const tabs: TabConfig[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'products', label: 'Produk', icon: Package },
  { key: 'orders', label: 'Pesanan', icon: ShoppingCart },
  { key: 'settings', label: 'Pengaturan', icon: Settings },
  { key: 'banners', label: 'Banners', icon: Image },
  { key: 'testimonials', label: 'Testimoni', icon: MessageSquare },
]

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token')
}

export default function AdminDashboard() {
  const navigate = useGameStore((s) => s.navigate)
  const [token, setToken] = useState<string | null>(getStoredToken)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const mountedRef = useRef(false)

  const handleNoToken = useCallback(() => {
    navigate('admin-login')
  }, [navigate])

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      if (!token) {
        handleNoToken()
      }
    }
  }, [token, handleNoToken])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    navigate('admin-login')
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab token={token} />
      case 'products':
        return <ProductsTab token={token} />
      case 'orders':
        return <OrdersTab token={token} />
      case 'settings':
        return <SettingsTab token={token} />
      case 'banners':
        return <BannersTab token={token} />
      case 'testimonials':
        return <TestimonialsTab token={token} />
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card/80 backdrop-blur-xl border-r border-white/5 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center glow-blue">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gradient">GameVault</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-neon-blue border border-neon-blue/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${isActive ? 'text-neon-blue' : ''}`} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold capitalize">
                  {tabs.find((t) => t.key === activeTab)?.label || 'Dashboard'}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('home')}
                className="text-muted-foreground hover:text-foreground"
              >
                Lihat Toko
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 lg:p-8"
        >
          {renderTab()}
        </motion.div>
      </main>
    </div>
  )
}
