'use client'

import { useGameStore } from '@/lib/game-store'
import { Gamepad2, Search, Menu, User } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

const navLinks = [
  { label: 'Beranda', page: 'home' as const },
  { label: 'Katalog Game', page: 'catalog' as const },
  { label: 'Cek Order', page: 'order-status' as const },
]

export function Navigation() {
  const { currentPage, navigate, searchQuery, setSearchQuery } = useGameStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate('catalog')
      setMobileOpen(false)
    }
  }

  const handleNavClick = (page: Parameters<typeof navigate>[0]) => {
    navigate(page)
    setMobileOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
      {/* Gradient bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 shrink-0 group"
          >
            <Gamepad2 className="size-7 text-neon-blue group-hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.5)] transition-all" />
            <span className="text-xl font-bold text-gradient">GameVault</span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNavClick(link.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === link.page
                    ? 'text-neon-blue bg-neon-blue/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-md mx-4"
          >
            <div className={`relative w-full transition-all duration-300 ${searchFocused ? 'drop-shadow-[0_0_10px_rgba(0,212,255,0.2)]' : ''}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`pl-10 h-9 bg-white/5 border-white/10 text-sm placeholder:text-muted-foreground/60 transition-all duration-300 ${
                  searchFocused
                    ? 'border-neon-blue/50 ring-1 ring-neon-blue/20'
                    : ''
                }`}
              />
            </div>
          </form>

          {/* Right side - Admin + Mobile menu */}
          <div className="flex items-center gap-2">
            {/* Admin link */}
            <button
              onClick={() => handleNavClick('admin-login')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-white/5 transition-all"
            >
              <User className="size-3.5" />
              <span>Admin</span>
            </button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground">
                  <Menu className="size-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a0a0f] border-white/10 w-72">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-6 pt-8">
                  {/* Mobile Logo */}
                  <div className="flex items-center gap-2 px-2">
                    <Gamepad2 className="size-6 text-neon-blue" />
                    <span className="text-lg font-bold text-gradient">GameVault</span>
                  </div>

                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="px-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Cari game..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 bg-white/5 border-white/10 focus:border-neon-blue/50"
                      />
                    </div>
                  </form>

                  {/* Mobile Nav Links */}
                  <div className="flex flex-col gap-1 px-2">
                    {navLinks.map((link) => (
                      <button
                        key={link.page}
                        onClick={() => handleNavClick(link.page)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium text-left transition-all duration-200 ${
                          currentPage === link.page
                            ? 'text-neon-blue bg-neon-blue/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                        }`}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>

                  {/* Mobile Admin Link */}
                  <div className="px-2 mt-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleNavClick('admin-login')}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-muted-foreground/60 hover:text-muted-foreground hover:bg-white/5 transition-all w-full"
                    >
                      <User className="size-4" />
                      <span>Admin Panel</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
