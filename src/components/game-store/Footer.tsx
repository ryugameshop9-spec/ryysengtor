'use client'

import { Gamepad2, Mail, Phone, MapPin } from 'lucide-react'
import { useGameStore } from '@/lib/game-store'

export default function Footer() {
  const navigate = useGameStore((s) => s.navigate)

  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="size-6 text-[#00d4ff]" />
              <span className="text-xl font-bold text-gradient">GameVault</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Toko game digital terpercaya di Indonesia. Beli game Steam murah dengan proses otomatis dan pengiriman instan.
            </p>
            <div className="flex gap-3">
              {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                <button
                  key={social}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-[#00d4ff] hover:border-[#00d4ff]/30 hover:bg-[#00d4ff]/5 transition-all duration-300"
                  aria-label={social}
                >
                  <span className="text-xs font-bold uppercase">{social[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Menu</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Beranda', page: 'home' as const },
                { label: 'Katalog Game', page: 'catalog' as const },
                { label: 'Cek Order', page: 'order-status' as const },
              ].map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-sm text-muted-foreground hover:text-[#00d4ff] transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kategori</h3>
            <ul className="space-y-2.5">
              {['Action', 'RPG', 'Adventure', 'Strategy', 'Sports'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => navigate('catalog')}
                    className="text-sm text-muted-foreground hover:text-[#00d4ff] transition-colors duration-200"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail className="size-4 text-[#00d4ff] mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">support@gamevault.id</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="size-4 text-[#00d4ff] mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">+62 812-3456-7890</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="size-4 text-[#00d4ff] mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment methods */}
        <div className="py-6 border-t border-white/5">
          <p className="text-xs text-muted-foreground mb-3 text-center">Metode Pembayaran</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['QRIS', 'GoPay', 'OVO', 'DANA', 'ShopeePay', 'BCA VA', 'BNI VA', 'BRI VA', 'Mandiri VA'].map((method) => (
              <span
                key={method}
                className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-muted-foreground"
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GameVault. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-muted-foreground hover:text-[#00d4ff] cursor-pointer transition-colors">
              Syarat & Ketentuan
            </span>
            <span className="text-xs text-muted-foreground hover:text-[#00d4ff] cursor-pointer transition-colors">
              Kebijakan Privasi
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
