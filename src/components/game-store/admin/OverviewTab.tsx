'use client'

import { useQuery } from '@tanstack/react-query'
import { Package, ShoppingCart, Clock, DollarSign, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface OverviewTabProps {
  token: string
}

export default function OverviewTab({ token }: OverviewTabProps) {
  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
  })

  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch orders')
      return res.json()
    },
  })

  const productsList = products?.products || []
  const orders = ordersData?.orders || []
  const pendingOrders = orders.filter((o: { status: string }) => o.status === 'pending')
  const paidOrders = orders.filter((o: { status: string }) => o.status === 'paid')
  const revenue = paidOrders.reduce((sum: number, o: { amount: number }) => sum + o.amount, 0)

  const stats = [
    {
      title: 'Total Produk',
      value: productsList.length,
      icon: Package,
      color: 'from-neon-blue to-cyan-400',
      glow: 'glow-blue',
    },
    {
      title: 'Total Pesanan',
      value: orders.length,
      icon: ShoppingCart,
      color: 'from-neon-purple to-purple-400',
      glow: 'glow-purple',
    },
    {
      title: 'Pesanan Pending',
      value: pendingOrders.length,
      icon: Clock,
      color: 'from-yellow-500 to-orange-400',
      glow: '',
    },
    {
      title: 'Pendapatan',
      value: `Rp ${revenue.toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-400',
      glow: '',
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient">Dashboard Overview</h2>
        <p className="text-muted-foreground text-sm mt-1">Ringkasan toko GameVault</p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="bg-card/50 border-white/5 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center ${stat.glow}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-blue" />
              Pesanan Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Belum ada pesanan</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {orders.slice(0, 10).map((order: {
                  id: string
                  orderId: string
                  status: string
                  amount: number
                  email: string
                  product: { name: string }
                  createdAt: string
                }) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${order.status === 'paid' ? 'bg-green-500' : order.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-sm font-medium">{order.product?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{order.orderId} &middot; {order.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">Rp {order.amount.toLocaleString('id-ID')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
