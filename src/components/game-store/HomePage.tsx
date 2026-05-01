'use client'

import { useGameStore } from '@/lib/game-store'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Zap,
  Shield,
  Tag,
  Gamepad2,
  Star,
  ChevronRight,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'

/* ─── Types ─────────────────────────────────────────── */
interface Banner {
  id: string
  imageUrl: string
  title: string
  subtitle: string
  active: boolean
  order: number
}

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

interface Testimonial {
  id: string
  name: string
  text: string
  rating: number
  avatar: string | null
  active: boolean
}

/* ─── Animation Variants ────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ─── Price formatter ───────────────────────────────── */
function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

/* ═══════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════ */
function HeroSection() {
  const navigate = useGameStore((s) => s.navigate)
  const { data: bannerData } = useQuery({
    queryKey: ['banners'],
    queryFn: () => fetch('/api/banners').then((r) => r.json()),
  })
  const banners: Banner[] = bannerData?.banners ?? []
  const [currentBanner, setCurrentBanner] = useState(0)

  const nextBanner = useCallback(() => {
    if (banners.length > 1) {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }
  }, [banners.length])

  useEffect(() => {
    const interval = setInterval(nextBanner, 5000)
    return () => clearInterval(interval)
  }, [nextBanner])

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d24] to-[#0a0a0f]" />

      {/* Animated stars/particles - CSS only */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 animate-pulse"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} custom={0} className="mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-sm font-medium">
                <Sparkles className="size-4" />
                #1 Game Store Indonesia
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
            >
              Beli Game Steam{' '}
              <span className="text-gradient">Murah</span> &{' '}
              <span className="text-gradient">Otomatis</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-lg"
            >
              Download game favorit dalam hitungan menit setelah pembayaran.
              Proses otomatis 24/7 tanpa ribet.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap gap-4"
            >
              <Button
                onClick={() => navigate('catalog')}
                className="h-12 px-8 text-base font-semibold bg-neon-blue text-[#0a0a0f] hover:bg-neon-blue/90 glow-blue animate-pulse-glow rounded-xl"
              >
                <ShoppingBag className="size-5 mr-2" />
                Beli Sekarang
              </Button>
              <Button
                onClick={() => navigate('catalog')}
                variant="outline"
                className="h-12 px-8 text-base font-semibold border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10 hover:text-neon-purple rounded-xl"
              >
                Lihat Game
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right - Banner Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            {banners.length > 0 ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <div
                  className="relative aspect-[3/1.2] bg-cover bg-center transition-all duration-700 ease-in-out"
                  style={{
                    backgroundImage: `url(${banners[currentBanner]?.imageUrl})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1 text-white">
                      {banners[currentBanner]?.title}
                    </h3>
                    <p className="text-sm text-white/70">
                      {banners[currentBanner]?.subtitle}
                    </p>
                  </div>
                </div>

                {/* Banner indicators */}
                {banners.length > 1 && (
                  <div className="absolute bottom-3 right-6 flex gap-2">
                    {banners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentBanner(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i === currentBanner
                            ? 'bg-neon-blue w-6'
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[3/1.2] rounded-2xl bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 border border-white/10 flex items-center justify-center">
                <Gamepad2 className="size-16 text-neon-blue/30" />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   ADVANTAGES SECTION
   ═══════════════════════════════════════════════════════ */
const advantages = [
  {
    icon: Zap,
    title: 'Proses Instan Otomatis',
    desc: 'Link download dikirim otomatis setelah pembayaran dikonfirmasi. Tidak perlu menunggu lama!',
  },
  {
    icon: Shield,
    title: 'Pembayaran Aman',
    desc: 'Semua transaksi dilindungi enkripsi SSL. Data pembayaran kamu 100% aman bersama kami.',
  },
  {
    icon: Tag,
    title: 'Harga Murah',
    desc: 'Dapatkan game dengan harga terbaik. Lebih murah dibanding toko game digital lainnya.',
  },
  {
    icon: Gamepad2,
    title: 'Banyak Pilihan Game',
    desc: 'Koleksi game lengkap dan selalu update. Dari game AAA hingga indie gems.',
  },
]

function AdvantagesSection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-blue/[0.02] to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Kenapa Pilih <span className="text-gradient">GameVault</span>?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Kami memberikan pengalaman beli game terbaik dengan layanan premium
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {advantages.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={i}
                className="group relative p-6 rounded-2xl bg-[#111827]/80 border border-white/5 hover:border-neon-blue/30 transition-all duration-500 hover:glow-blue"
              >
                {/* Gradient border glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-blue/0 to-neon-purple/0 group-hover:from-neon-blue/5 group-hover:to-neon-purple/5 transition-all duration-500" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center mb-4 group-hover:bg-neon-blue/20 transition-colors duration-300">
                    <Icon className="size-6 text-neon-blue" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   FEATURED GAMES SECTION
   ═══════════════════════════════════════════════════════ */
function FeaturedGamesSection() {
  const navigate = useGameStore((s) => s.navigate)
  const { data: productData, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () =>
      fetch('/api/products?featured=true').then((r) => r.json()),
  })
  const products: Product[] = productData?.products ?? []
  const displayProducts = products.slice(0, 4)

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Game <span className="text-gradient">Populer</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg">
            Game paling laris dan diminati oleh para gamer
          </motion.p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {displayProducts.map((product, i) => (
              <motion.div
                key={product.id}
                variants={fadeUp}
                custom={i}
                onClick={() => navigate('detail', { productId: product.id })}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-[#111827] border border-white/5 hover:border-neon-blue/30 transition-all duration-500 hover:glow-blue"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-60" />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-neon-blue/90 text-[#0a0a0f] text-xs font-bold">
                    {product.category.toUpperCase()}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-neon-blue transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                    {product.shortDesc}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-neon-blue">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs text-muted-foreground">Steam Key</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Button
            onClick={() => navigate('catalog')}
            variant="outline"
            className="border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10 hover:text-neon-blue rounded-xl px-8 h-11"
          >
            Lihat Semua Game
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   HOW TO BUY SECTION
   ═══════════════════════════════════════════════════════ */
const steps = [
  {
    num: 1,
    title: 'Pilih Game',
    desc: 'Pilih game yang kamu inginkan dari katalog kami',
    icon: Gamepad2,
  },
  {
    num: 2,
    title: 'Isi Data',
    desc: 'Masukkan email dan nomor WhatsApp',
    icon: Shield,
  },
  {
    num: 3,
    title: 'Bayar',
    desc: 'Pilih metode pembayaran dan bayar',
    icon: Tag,
  },
  {
    num: 4,
    title: 'Download',
    desc: 'Terima link download otomatis',
    icon: Zap,
  },
]

function HowToBuySection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-purple/[0.02] to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-14"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Cara <span className="text-gradient">Membeli</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg">
            Hanya 4 langkah mudah untuk mendapatkan game favoritmu
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.num}
                variants={fadeUp}
                custom={i}
                className="relative flex flex-col items-center text-center"
              >
                {/* Connector line - hidden on last item and mobile */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] right-[calc(-50%+32px)] h-px bg-gradient-to-r from-neon-blue/30 to-neon-purple/30" />
                )}

                {/* Step number circle */}
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center mb-5 shadow-lg shadow-neon-blue/20">
                  <span className="text-2xl font-bold text-white">{step.num}</span>
                </div>

                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-3">
                  <Icon className="size-5 text-neon-blue" />
                </div>

                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                  {step.desc}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   TESTIMONIALS SECTION
   ═══════════════════════════════════════════════════════ */
function TestimonialsSection() {
  const { data: testimonialData, isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => fetch('/api/testimonials').then((r) => r.json()),
  })
  const testimonials: Testimonial[] = testimonialData?.testimonials ?? []

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Apa Kata <span className="text-gradient">Mereka</span>?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg">
            Testimoni dari pelanggan setia GameVault
          </motion.p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin lg:grid lg:grid-cols-4 lg:overflow-visible">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="snap-start shrink-0 w-[280px] sm:w-auto p-6 rounded-2xl bg-[#111827]/80 border border-white/5 hover:border-neon-purple/30 transition-all duration-500 hover:glow-purple"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`size-4 ${
                        si < t.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-4">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-neon-purple/30"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-sm font-bold text-white">
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   CTA SECTION
   ═══════════════════════════════════════════════════════ */
function CTASection() {
  const navigate = useGameStore((s) => s.navigate)

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-neon-blue/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f] opacity-60" />

      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-neon-blue/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
        className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <motion.h2
          variants={fadeUp}
          custom={0}
          className="text-3xl sm:text-5xl font-extrabold mb-6"
        >
          Siap Beli <span className="text-gradient">Game</span>?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={1}
          className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
        >
          Dapatkan game favoritmu sekarang dengan harga terbaik. Proses cepat,
          aman, dan otomatis 24/7.
        </motion.p>
        <motion.div variants={fadeUp} custom={2}>
          <Button
            onClick={() => navigate('catalog')}
            className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:opacity-90 glow-blue rounded-xl transition-all duration-300"
          >
            <ShoppingBag className="size-5 mr-2" />
            Mulai Belanja
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   HOME PAGE (Main Export)
   ═══════════════════════════════════════════════════════ */
export function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <HeroSection />
      <AdvantagesSection />
      <FeaturedGamesSection />
      <HowToBuySection />
      <TestimonialsSection />
      <CTASection />
    </main>
  )
}
