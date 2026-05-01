'use client'
import { useGameStore } from '@/lib/game-store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Clock, CheckCircle, Download, ArrowLeft, ExternalLink, RefreshCw, QrCode, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface OrderProduct {
  id: string
  name: string
  image: string
  shortDesc: string
  price: number
}

interface OrderData {
  id: string
  orderId: string
  status: string
  amount: number
  email: string
  whatsapp: string
  paymentMethod: string | null
  paymentCode: string | null
  checkoutUrl: string | null
  invoiceId: string | null
  downloadToken: string
  tokenExpiry: string
  createdAt: string
  product: OrderProduct
}

interface OrderResponse {
  order: OrderData
  downloadLink: string | null
  tokenExpired: boolean | null
}

function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString('id-ID')}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getPaymentLabel(code: string | null): string {
  if (!code) return '-'
  const labels: Record<string, string> = {
    QRIS: 'QRIS',
    MYQR2: 'GoPay',
    OVO2: 'OVO',
    DANA2: 'DANA',
    SHOPEEPAY2: 'ShopeePay',
    BCAVA: 'Virtual Account BCA',
    BNIVA: 'Virtual Account BNI',
    BRIVA: 'Virtual Account BRI',
    MANDIRIVA: 'Virtual Account Mandiri',
  }
  return labels[code] || code
}

export default function OrderStatus() {
  const { selectedOrderId, navigate } = useGameStore()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [searchInput, setSearchInput] = useState('')
  const [manualOrderId, setManualOrderId] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Derive active order ID: prefer manual search, fall back to store selection
  const activeOrderId = manualOrderId ?? selectedOrderId

  // Auto-refresh every 30 seconds when pending
  const { data: orderResponse, isLoading, isError } = useQuery<OrderResponse>({
    queryKey: ['order', activeOrderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${activeOrderId}`)
      if (!res.ok) throw new Error('Pesanan tidak ditemukan')
      return res.json()
    },
    enabled: !!activeOrderId,
    refetchInterval: (query) => {
      const status = query.state.data?.order?.status
      return status === 'pending' ? 30000 : false
    },
  })

  const order = orderResponse?.order ?? null
  const downloadLink = orderResponse?.downloadLink ?? null
  const isPending = order?.status === 'pending'
  const isPaid = order?.status === 'paid'

  const handleSearch = () => {
    const trimmed = searchInput.trim()
    if (trimmed) {
      setManualOrderId(trimmed)
    }
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast({
      title: 'Disalin!',
      description: `${field} berhasil disalin`,
    })
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Search form when no active order
  if (!activeOrderId) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="rounded-xl border border-white/5 bg-[#111827] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1a1a2e] flex items-center justify-center mx-auto mb-4">
              <Search className="size-8 text-[#00d4ff]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Cek Status Pesanan</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Masukkan Order ID untuk melihat status pesanan Anda
            </p>

            <div className="space-y-4">
              <Input
                placeholder="ORD-XXXXXX"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-[#1a1a2e] border-white/10 text-white text-center text-lg font-mono placeholder:text-muted-foreground focus-visible:border-[#00d4ff] focus-visible:ring-[#00d4ff]/20"
              />
              <Button
                onClick={handleSearch}
                className="w-full bg-[#00d4ff] text-[#0a0a0f] hover:bg-[#00bce6] glow-blue font-semibold"
              >
                <Search className="size-4 mr-2" />
                Cari Pesanan
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate('home')}
              className="mt-4 text-muted-foreground hover:text-white"
            >
              <ArrowLeft className="size-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <RefreshCw className="size-8 animate-spin text-[#00d4ff]" />
      </div>
    )
  }

  // Error / Not found
  if (isError || !order) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="rounded-xl border border-white/5 bg-[#111827] p-8">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Search className="size-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Pesanan Tidak Ditemukan</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Order ID &quot;{activeOrderId}&quot; tidak ditemukan. Pastikan ID pesanan benar.
            </p>
            <Button
              onClick={() => { setManualOrderId(null); setSearchInput('') }}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              Coba Lagi
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('home')}
            className="text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white">Status Pesanan</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Status Badge */}
          <div className="rounded-xl border border-white/5 bg-[#111827] p-6 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className={`
                w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4
                ${isPaid
                  ? 'bg-emerald-500/15 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                  : 'bg-amber-500/15 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                }
              `}
            >
              {isPaid ? (
                <CheckCircle className="size-10 text-emerald-500" />
              ) : (
                <Clock className="size-10 text-amber-500 animate-pulse" />
              )}
            </motion.div>

            <Badge
              className={`
                text-sm font-semibold px-4 py-1.5 border-0
                ${isPaid
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
                }
              `}
            >
              {isPaid ? 'Pembayaran Berhasil' : 'Menunggu Pembayaran'}
            </Badge>

            <div className="mt-3">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <button
                onClick={() => handleCopy(order.orderId, 'Order ID')}
                className="font-mono text-lg text-white hover:text-[#00d4ff] transition-colors inline-flex items-center gap-2"
              >
                {order.orderId}
                {copiedField === 'Order ID' ? (
                  <Check className="size-4 text-emerald-400" />
                ) : (
                  <Copy className="size-3.5 text-muted-foreground" />
                )}
              </button>
            </div>

            {isPending && (
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs text-amber-400/70 mt-2"
              >
                Status diperbarui otomatis setiap 30 detik
              </motion.p>
            )}
          </div>

          {/* Order Details */}
          <div className="rounded-xl border border-white/5 bg-[#111827] p-6">
            <h3 className="font-semibold text-white mb-4">Detail Pesanan</h3>

            <div className="flex gap-4 mb-4">
              <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                <img
                  src={order.product.image}
                  alt={order.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{order.product.name}</h4>
                <p className="text-sm text-muted-foreground mt-0.5">{order.product.shortDesc}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jumlah</span>
                <span className="text-white font-semibold text-gradient">{formatPrice(order.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metode Pembayaran</span>
                <span className="text-white">{getPaymentLabel(order.paymentMethod)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="text-white">{order.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">WhatsApp</span>
                <span className="text-white">{order.whatsapp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal Pesanan</span>
                <span className="text-white">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions - Pending */}
          {isPending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6"
            >
              <h3 className="font-semibold text-amber-400 mb-4 flex items-center gap-2">
                <QrCode className="size-5" />
                Instruksi Pembayaran
              </h3>

              {order.paymentCode && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Kode Pembayaran</p>
                  <div className="flex items-center gap-3 bg-[#1a1a2e] rounded-lg p-3 border border-white/5">
                    <code className="text-lg font-mono text-white flex-1">{order.paymentCode}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(order.paymentCode!, 'Kode Pembayaran')}
                      className="h-8 text-muted-foreground hover:text-white"
                    >
                      {copiedField === 'Kode Pembayaran' ? (
                        <Check className="size-4 text-emerald-400" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {order.checkoutUrl && (
                <Button
                  onClick={() => window.open(order.checkoutUrl!, '_blank')}
                  className="w-full bg-amber-500 text-[#0a0a0f] hover:bg-amber-400 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  <ExternalLink className="size-4 mr-2" />
                  Bayar Sekarang
                </Button>
              )}

              {!order.paymentCode && !order.checkoutUrl && (
                <p className="text-sm text-muted-foreground">
                  Silakan selesaikan pembayaran sesuai metode yang dipilih. Pesanan akan otomatis diproses setelah pembayaran dikonfirmasi.
                </p>
              )}
            </motion.div>
          )}

          {/* Download Section - Paid */}
          {isPaid && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6"
            >
              <h3 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                <Download className="size-5" />
                Download Game
              </h3>

              {downloadLink ? (
                <>
                  <Button
                    onClick={() => window.open(downloadLink, '_blank')}
                    size="lg"
                    className="w-full bg-emerald-500 text-[#0a0a0f] hover:bg-emerald-400 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <Download className="size-5 mr-2" />
                    Download Game
                  </Button>

                  <p className="text-xs text-emerald-400/70 text-center mt-3">
                    Link download berlaku selama 72 jam
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm mb-3">
                    Token download sudah kadaluarsa
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hubungi customer service untuk mendapatkan link download baru
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => { setManualOrderId(null); setSearchInput('') }}
              className="flex-1 border-white/10 text-white hover:bg-white/5"
            >
              <Search className="size-4 mr-2" />
              Cek Status Lain
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('home')}
              className="flex-1 border-white/10 text-white hover:bg-white/5"
            >
              <ArrowLeft className="size-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </div>

          {/* Manual refresh */}
          {isPending && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['order', activeOrderId] })}
                className="text-muted-foreground hover:text-[#00d4ff]"
              >
                <RefreshCw className="size-3.5 mr-1.5" />
                Refresh Status
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
