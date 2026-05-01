'use client'
import { useGameStore } from '@/lib/game-store'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, CreditCard, QrCode, Wallet, Building2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  description: string
  shortDesc: string
  price: number
  image: string
  category: string
  featured: boolean
}

const paymentMethods = [
  {
    category: 'QRIS',
    icon: QrCode,
    methods: [
      { code: 'QRIS', label: 'QRIS', icon: QrCode },
    ],
  },
  {
    category: 'E-Wallet',
    icon: Wallet,
    methods: [
      { code: 'MYQR2', label: 'GoPay', icon: Wallet },
      { code: 'OVO2', label: 'OVO', icon: Wallet },
      { code: 'DANA2', label: 'DANA', icon: Wallet },
      { code: 'SHOPEEPAY2', label: 'ShopeePay', icon: Wallet },
    ],
  },
  {
    category: 'Virtual Account',
    icon: Building2,
    methods: [
      { code: 'BCAVA', label: 'BCA', icon: Building2 },
      { code: 'BNIVA', label: 'BNI', icon: Building2 },
      { code: 'BRIVA', label: 'BRI', icon: Building2 },
      { code: 'MANDIRIVA', label: 'Mandiri', icon: Building2 },
    ],
  },
]

function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString('id-ID')}`
}

export default function Checkout() {
  const { selectedProductId, navigate } = useGameStore()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', selectedProductId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${selectedProductId}`)
      if (!res.ok) throw new Error('Product not found')
      return res.json()
    },
    enabled: !!selectedProductId,
  })

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!email) {
      newErrors.email = 'Email wajib diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid'
    }

    if (!whatsapp) {
      newErrors.whatsapp = 'Nomor WhatsApp wajib diisi'
    } else if (!/^(\+62|08)\d{8,13}$/.test(whatsapp.replace(/[\s-]/g, ''))) {
      newErrors.whatsapp = 'Nomor harus diawali 08 atau +62'
    }

    if (!selectedPayment) {
      newErrors.payment = 'Pilih metode pembayaran'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    if (!product) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          email,
          whatsapp,
          paymentMethod: selectedPayment,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat pesanan')
      }

      navigate('order-status', { orderId: data.order.orderId })
    } catch (err) {
      toast({
        title: 'Gagal',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="size-8 animate-spin text-[#00d4ff]" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Produk tidak ditemukan</p>
          <Button variant="outline" onClick={() => navigate('home')}>
            <ArrowLeft className="size-4 mr-2" /> Kembali
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('detail', { productId: product.id })}
            className="text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white">Checkout</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="rounded-xl border border-white/5 bg-[#111827] p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4">Ringkasan Pesanan</h2>

              <div className="flex gap-4">
                <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.shortDesc}</p>
                  <p className="text-[#00d4ff] font-semibold mt-2">{formatPrice(product.price)}</p>
                </div>
              </div>

              <div className="border-t border-white/5 my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harga</span>
                  <span className="text-white">{formatPrice(product.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Biaya Layanan</span>
                  <span className="text-white">Rp 0</span>
                </div>
              </div>

              <div className="border-t border-white/5 my-4" />

              <div className="flex justify-between items-center">
                <span className="text-white font-semibold text-lg">Total</span>
                <span className="text-gradient text-2xl font-bold">{formatPrice(product.price)}</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="rounded-xl border border-white/5 bg-[#111827] p-6">
              {/* Email */}
              <div className="space-y-2 mb-5">
                <Label htmlFor="email" className="text-white">
                  <Mail className="size-4 inline mr-1 -mt-0.5" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })) }}
                  className="bg-[#1a1a2e] border-white/10 text-white placeholder:text-muted-foreground focus-visible:border-[#00d4ff] focus-visible:ring-[#00d4ff]/20"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="whatsapp" className="text-white">
                  <Phone className="size-4 inline mr-1 -mt-0.5" />
                  Nomor WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={whatsapp}
                  onChange={(e) => { setWhatsapp(e.target.value); setErrors(prev => ({ ...prev, whatsapp: '' })) }}
                  className="bg-[#1a1a2e] border-white/10 text-white placeholder:text-muted-foreground focus-visible:border-[#00d4ff] focus-visible:ring-[#00d4ff]/20"
                />
                {errors.whatsapp && (
                  <p className="text-xs text-destructive">{errors.whatsapp}</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-3 mb-6">
                <Label className="text-white">
                  <CreditCard className="size-4 inline mr-1 -mt-0.5" />
                  Metode Pembayaran
                </Label>

                {paymentMethods.map((category) => {
                  const CategoryIcon = category.icon
                  return (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 first:mt-0">
                        <CategoryIcon className="size-3.5" />
                        <span>{category.category}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {category.methods.map((method) => {
                          const isSelected = selectedPayment === method.code
                          return (
                            <button
                              key={method.code}
                              type="button"
                              onClick={() => {
                                setSelectedPayment(method.code)
                                setErrors(prev => ({ ...prev, payment: '' }))
                              }}
                              className={`
                                relative flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all duration-200
                                ${isSelected
                                  ? 'border-[#00d4ff] bg-[#00d4ff]/10 shadow-[0_0_15px_rgba(0,212,255,0.15)]'
                                  : 'border-white/10 bg-[#1a1a2e] hover:border-white/20 hover:bg-white/5'
                                }
                              `}
                            >
                              <method.icon className={`size-5 ${isSelected ? 'text-[#00d4ff]' : 'text-muted-foreground'}`} />
                              <span className={`text-xs font-medium ${isSelected ? 'text-[#00d4ff]' : 'text-white'}`}>
                                {method.label}
                              </span>
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00d4ff]">
                                  <div className="absolute inset-0.5 rounded-full bg-[#0a0a0f]" />
                                  <div className="absolute inset-1 rounded-full bg-[#00d4ff]" />
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {errors.payment && (
                  <p className="text-xs text-destructive">{errors.payment}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold bg-[#00d4ff] text-[#0a0a0f] hover:bg-[#00bce6] glow-blue animate-pulse-glow disabled:opacity-50 disabled:animate-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-5 animate-spin mr-2" />
                    Memproses...
                  </>
                ) : (
                  'Bayar Sekarang'
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Dengan melanjutkan, Anda menyetujui syarat dan ketentuan
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
