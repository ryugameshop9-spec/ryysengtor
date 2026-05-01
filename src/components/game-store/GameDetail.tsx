'use client'

import { useGameStore } from '@/lib/game-store'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle, Download, Zap, Tag, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface Product {
  id: string
  name: string
  description: string
  shortDesc: string
  price: number
  image: string
  downloadLink: string
  category: string
  featured: boolean
  active: boolean
}

const formatPrice = (price: number) => {
  return `Rp ${price.toLocaleString('id-ID')}`
}

// Category label mapping
const categoryLabels: Record<string, string> = {
  action: 'Action',
  rpg: 'RPG',
  adventure: 'Adventure',
  strategy: 'Strategy',
  sports: 'Sports',
}

// Loading skeleton
function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-dark-deepest">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-32 mb-8 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-[3/4] w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-20 w-32 rounded-lg" />
              <Skeleton className="h-20 w-32 rounded-lg" />
              <Skeleton className="h-20 w-32 rounded-lg" />
            </div>
            <Skeleton className="h-14 w-full rounded-xl mt-6" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Error state
function ErrorState() {
  const { navigate } = useGameStore()

  return (
    <div className="min-h-screen bg-dark-deepest flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4 px-4"
      >
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Game Tidak Ditemukan</h2>
        <p className="text-muted-foreground max-w-md">
          Game yang kamu cari tidak tersedia atau sudah dihapus. Silakan kembali ke katalog.
        </p>
        <Button
          onClick={() => navigate('catalog')}
          className="bg-neon-blue text-dark-deepest hover:bg-neon-blue/90 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Katalog
        </Button>
      </motion.div>
    </div>
  )
}

// Info card component
function InfoCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-dark-card border border-border/50 text-center">
      <div className="w-10 h-10 rounded-full bg-neon-blue/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-neon-blue" />
      </div>
      <span className="text-white font-semibold text-sm">{title}</span>
      <span className="text-muted-foreground text-xs">{desc}</span>
    </div>
  )
}

export default function GameDetail() {
  const { selectedProductId, navigate } = useGameStore()

  // Fetch single product
  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', selectedProductId],
    queryFn: async () => {
      if (!selectedProductId) throw new Error('No product ID')
      const res = await fetch(`/api/products/${selectedProductId}`)
      if (!res.ok) throw new Error('Product not found')
      const json = await res.json()
      return json.product as Product
    },
    enabled: !!selectedProductId,
  })

  if (isLoading) return <DetailSkeleton />
  if (isError || !data) return <ErrorState />

  const product = data

  return (
    <div className="min-h-screen bg-dark-deepest">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('catalog')}
            className="text-muted-foreground hover:text-white hover:bg-white/5 mb-6 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Game image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative group"
          >
            <div className="relative rounded-xl overflow-hidden border border-border/30 shadow-2xl shadow-neon-blue/5">
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-deepest/30 to-transparent" />
            </div>

            {/* Featured badge on image */}
            {product.featured && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-gradient-to-r from-neon-purple to-purple-400 text-white border-0 gap-1 px-3 py-1 font-semibold shadow-lg">
                  <Zap className="w-3 h-3" />
                  Featured
                </Badge>
              </div>
            )}
          </motion.div>

          {/* Game info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col"
          >
            {/* Game name */}
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Category badge */}
            <div className="mb-4">
              <Badge
                variant="outline"
                className="border-neon-purple/40 text-neon-purple bg-neon-purple/10 gap-1.5 px-3 py-1"
              >
                <Tag className="w-3 h-3" />
                {categoryLabels[product.category] || product.category}
              </Badge>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl sm:text-4xl font-bold text-neon-blue glow-text">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Short description */}
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              {product.shortDesc}
            </p>

            {/* Full description */}
            <div className="mb-8">
              <h3 className="text-white font-semibold text-lg mb-3">Deskripsi</h3>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Info cards row */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <InfoCard icon={CheckCircle} title="Full Game" desc="Versi lengkap" />
              <InfoCard icon={Download} title="Siap Download" desc="Instan setelah bayar" />
              <InfoCard icon={Zap} title="Tidak Ribet" desc="Proses cepat" />
            </div>

            {/* Buy button */}
            <Button
              size="lg"
              onClick={() => navigate('checkout', { productId: product.id })}
              className="w-full h-14 text-lg font-bold bg-neon-blue text-dark-deepest hover:bg-neon-blue/90 animate-pulse-glow shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all duration-300 rounded-xl"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Beli Sekarang
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
