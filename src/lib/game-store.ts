import { create } from 'zustand'

type Page = 'home' | 'catalog' | 'detail' | 'checkout' | 'order-status' | 'admin-login' | 'admin-dashboard'

interface GameStore {
  currentPage: Page
  selectedProductId: string | null
  selectedOrderId: string | null
  searchQuery: string

  navigate: (page: Page, data?: { productId?: string; orderId?: string }) => void
  setSearchQuery: (query: string) => void
}

export const useGameStore = create<GameStore>((set) => ({
  currentPage: 'home',
  selectedProductId: null,
  selectedOrderId: null,
  searchQuery: '',

  navigate: (page, data) => set({
    currentPage: page,
    selectedProductId: data?.productId ?? null,
    selectedOrderId: data?.orderId ?? null,
  }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
