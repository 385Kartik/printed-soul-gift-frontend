import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { cartApi } from "../lib/api"
import { useAuth } from "./AuthContext"

export interface CartItem {
  product: {
    _id: string
    name: string
    price: number
    comparePrice?: number
    images: string[]
    slug: string
    stock: number
  }
  quantity: number
  customText?: string
  customImage?: string
}

interface CartContextType {
  items: CartItem[]
  totalAmount: number
  totalItems: number
  isLoading: boolean
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  addToCart: (productId: string, quantity?: number, customText?: string, customImage?: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  const refreshCart = async () => {
    if (!isAuthenticated) {
      // Local storage fallback for guest
      const local = localStorage.getItem("psg_guest_cart")
      if (local) {
        try {
          const parsed = JSON.parse(local)
          setItems(parsed)
          const total = parsed.reduce((sum: number, i: any) => sum + (i.product?.price || 0) * i.quantity, 0)
          setTotalAmount(total)
        } catch {
          setItems([])
          setTotalAmount(0)
        }
      } else {
        setItems([])
        setTotalAmount(0)
      }
      return
    }

    try {
      const res = await cartApi.get()
      setItems(res.data.data?.items || [])
      setTotalAmount(res.data.data?.totalAmount || 0)
    } catch {
      setItems([])
    }
  }

  useEffect(() => {
    refreshCart()
  }, [isAuthenticated])

  const addToCart = async (productId: string, quantity = 1, customText?: string, customImage?: string) => {
    setIsLoading(true)
    try {
      if (isAuthenticated) {
        await cartApi.add({ productId, quantity, customText, customImage })
        await refreshCart()
      } else {
        // Guest cart
        openCart()
      }
      openCart()
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    setIsLoading(true)
    try {
      if (isAuthenticated) {
        await cartApi.update({ productId, quantity })
        await refreshCart()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (productId: string) => {
    setIsLoading(true)
    try {
      if (isAuthenticated) {
        await cartApi.remove(productId)
        await refreshCart()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = async () => {
    setIsLoading(true)
    try {
      if (isAuthenticated) {
        await cartApi.clear()
      }
      setItems([])
      setTotalAmount(0)
    } finally {
      setIsLoading(false)
    }
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        totalAmount,
        totalItems,
        isLoading,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
