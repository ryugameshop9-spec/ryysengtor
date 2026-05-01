'use client'

import { useGameStore } from '@/lib/game-store'
import { useQuery } from '@tanstack/react-query'
import { Search, Sparkles } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
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

const categories = [
  { key: '', label: 'Semua' },
  { key: 'action', label: 'Action' },
  { key: 'rpg', label: 'RPG' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'sports', label: 'Sports' },
]

const formatPrice = (price: number) => {
  return `Rp ${price.toLocaleString('id-ID')}`
}

// Skeleton grid for loading state
function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden bg-card border border-border/50">
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Empty state when no games found
function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Game Tidak Ditemukan</h3>
      <p className="text-muted-foreground max-w-md">
        Tidak ada game yang cocok dengan pencarian &quot;{searchQuery}&quot;. Coba kata kunci lain atau jelajahi kategori yang tersedia.
      </p>
    </motion.div>
  )
}

// Single game card
function GameCard({ product }: { product: Product }) {
  const { navigate } = useGameStore()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.03 }}
      className="group relative rounded-xl overflow-hidden bg-card border border-border/50 hover:border-neon-blue/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] transition-all duration-300 cursor-pointer"
      onClick={() => navigate('detail', { productId: product.id })}
    >
      {/* Featured badge */}
      {product.featured && (
        <div className="absolute top-3 left-3 z-20">
          <Badge className="bg-gradient-to-r from-neon-purple to-purple-400 text-white border-0 gap-1 px-2.5 py-1 text-xs font-semibold shadow-lg">
            <Sparkles className="w-3 h-3" />
            Featured
          </Badge>
        </div>
      )}

      {/* Game cover image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

        {/* Price overlay on image */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="text-neon-blue font-bold text-lg glow-text">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4 space-y-2">
        <h3 className="text-white font-bold text-base leading-tight line-clamp-1 group-hover:text-neon-blue transition-colors">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {product.shortDesc}
        </p>

        <Button
          className="w-full mt-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/30 hover:bg-neon-blue hover:text-dark-deepest hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all duration-300 font-semibold"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            navigate('checkout', { productId: product.id })
          }}
        >
          Beli Sekarang
        </Button>
      </div>
    </motion.div>
  )
}

export default function GameCatalog() {
  const { searchQuery, setSearchQuery, navigate } = useGameStore()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Build query params
  const queryParams = new URLSearchParams()
  if (debouncedSearch) queryParams.set('q', debouncedSearch)
  if (selectedCategory) queryParams.set('category', selectedCategory)

  const queryString = queryParams.toString()
  const apiUrl = `/api/products${queryString ? `?${queryString}` : ''}`

  // Fetch products with react-query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', debouncedSearch, selectedCategory],
    queryFn: async () => {
      const res = await fetch(apiUrl)
      if (!res.ok) throw new Error('Failed to fetch products')
      const json = await res.json()
      return json.products as Product[]
    },
  })

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    [setSearchQuery]
  )

  return (
    <div className="min-h-screen bg-dark-deepest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            <span className="text-gradient">Game</span> Katalog
          </h1>
          <p className="text-muted-foreground">
            Temukan game favoritmu dan langsung download setelah pembayaran
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative mb-6"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari game..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 h-11 bg-dark-card border-border/50 focus:border-neon-blue/50 focus:ring-neon-blue/20 text-white placeholder:text-muted-foreground"
          />
        </motion.div>

        {/* Category filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {categories.map((cat) => (
            <Button
              key={cat.key}
              variant={selectedCategory === cat.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.key)}
              className={
                selectedCategory === cat.key
                  ? 'bg-neon-blue text-dark-deepest font-semibold shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                  : 'border-border/50 text-muted-foreground hover:text-white hover:border-neon-blue/30 bg-transparent'
              }
            >
              {cat.label}
            </Button>
          ))}
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <CatalogSkeleton />
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg">Gagal memuat game. Silakan coba lagi.</p>
            <Button
              variant="outline"
              className="mt-4 border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10"
              onClick={() => window.location.reload()}
            >
              Coba Lagi
            </Button>
          </div>
        ) : data && data.length === 0 ? (
          <EmptyState searchQuery={debouncedSearch || selectedCategory} />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {data?.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <GameCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
