'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Eye, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface OrdersTabProps {
  token: string
}

interface Order {
  id: string
  orderId: string
  email: string
  whatsapp: string
  status: string
  amount: number
  paymentMethod: string | null
  downloadToken: string
  tokenExpiry: string
  invoiceId: string | null
  tripayRef: string | null
  checkoutUrl: string | null
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    image: string
    shortDesc: string
    price: number
  }
}

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', icon: Clock, label: 'Pending' },
  paid: { color: 'bg-green-500/10 text-green-500 border-green-500/30', icon: CheckCircle, label: 'Dibayar' },
  expired: { color: 'bg-red-500/10 text-red-500 border-red-500/30', icon: XCircle, label: 'Expired' },
  failed: { color: 'bg-red-500/10 text-red-500 border-red-500/30', icon: XCircle, label: 'Gagal' },
  refunded: { color: 'bg-orange-500/10 text-orange-500 border-orange-500/30', icon: XCircle, label: 'Refund' },
}

export default function OrdersTab({ token }: OrdersTabProps) {
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch orders')
      return res.json()
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error('Failed to update order status')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
  })

  const orders: Order[] = ordersData?.orders || []

  const viewDetail = (order: Order) => {
    setSelectedOrder(order)
    setDetailOpen(true)
  }

  const markAsPaid = (orderId: string) => {
    updateStatusMutation.mutate({ id: orderId, status: 'paid' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient">Pesanan</h2>
        <p className="text-muted-foreground text-sm mt-1">Kelola pesanan pelanggan</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>Belum ada pesanan</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-white/5 bg-card/50 backdrop-blur-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Order ID</TableHead>
                  <TableHead className="text-muted-foreground">Produk</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Jumlah</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Tanggal</TableHead>
                  <TableHead className="text-muted-foreground">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const config = statusConfig[order.status] || statusConfig.pending
                  const StatusIcon = config.icon
                  return (
                    <TableRow
                      key={order.id}
                      className="border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <TableCell className="font-mono text-sm">{order.orderId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-muted/50 overflow-hidden shrink-0">
                            <img
                              src={order.product?.image}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          </div>
                          <span className="text-sm truncate max-w-32">
                            {order.product?.name || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{order.email}</TableCell>
                      <TableCell className="font-semibold">
                        Rp {order.amount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${config.color} border text-xs gap-1`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewDetail(order)}
                            className="text-neon-blue hover:text-neon-blue hover:bg-neon-blue/10 h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsPaid(order.id)}
                              disabled={updateStatusMutation.isPending}
                              className="text-green-500 hover:text-green-500 hover:bg-green-500/10 h-8 w-8 p-0"
                              title="Tandai sebagai dibayar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-gradient">Detail Pesanan</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Order ID" value={selectedOrder.orderId} />
                <DetailField label="Status" value={statusConfig[selectedOrder.status]?.label || selectedOrder.status} />
                <DetailField label="Email" value={selectedOrder.email} />
                <DetailField label="WhatsApp" value={selectedOrder.whatsapp} />
                <DetailField label="Jumlah" value={`Rp ${selectedOrder.amount.toLocaleString('id-ID')}`} />
                <DetailField label="Metode Bayar" value={selectedOrder.paymentMethod || '-'} />
                <DetailField label="Produk" value={selectedOrder.product?.name || '-'} />
                <DetailField
                  label="Tanggal"
                  value={new Date(selectedOrder.createdAt).toLocaleString('id-ID')}
                />
              </div>
              {selectedOrder.checkoutUrl && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Checkout URL</p>
                  <a
                    href={selectedOrder.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neon-blue hover:underline break-all"
                  >
                    {selectedOrder.checkoutUrl}
                  </a>
                </div>
              )}
              {selectedOrder.status === 'pending' && (
                <Button
                  onClick={() => {
                    markAsPaid(selectedOrder.id)
                    setDetailOpen(false)
                  }}
                  disabled={updateStatusMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Tandai sebagai Dibayar
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}
