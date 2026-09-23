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
  selectedTier?: {
    tierTitle: string
    unitPrice: number
    discountPercent: number
  }
  selectedAddons?: Array<{
    addonId: string
    title: string
    variantName: string
    price: number
    message?: string
  }>
}

interface CartContextType {
  items: CartItem[]
  totalAmount: number
  totalItems: number
  isLoading: boolean
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  addToCart: (
    productId: string,
    quantity?: number,
    customText?: string,
    customImage?: string,
    selectedTier?: {
      tierTitle: string
      unitPrice: number
      discountPercent: number
    },
    selectedAddons?: Array<{
      addonId: string
      title: string
      variantName: string
      price: number
      message?: string
    }>,
    productData?: any
  ) => Promise<void>
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

  const calculateTotal = (cartItems: CartItem[]) => {
    return cartItems.reduce((sum: number, i: any) => {
      const unit = i.selectedTier?.unitPrice ?? i.product?.price ?? 0
      const addonsSum = (i.selectedAddons || []).reduce((aSum: number, a: any) => aSum + (a.price || 0), 0)
      return sum + unit * i.quantity + addonsSum * i.quantity
    }, 0)
  }

  const refreshCart = async () => {
    if (!isAuthenticated) {
      // Local storage fallback for guest
      const local = localStorage.getItem("psg_guest_cart")
      if (local) {
        try {
          const parsed = JSON.parse(local)
          setItems(parsed)
          setTotalAmount(calculateTotal(parsed))
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

  // Auto-sync guest cart to backend upon authentication
  useEffect(() => {
    const syncGuestCart = async () => {
      if (isAuthenticated) {
        const guestLocal = localStorage.getItem("psg_guest_cart")
        if (guestLocal) {
          try {
            const guestItems: CartItem[] = JSON.parse(guestLocal)
            if (guestItems.length > 0) {
              for (const gi of guestItems) {
                if (gi.product?._id) {
                  await cartApi.add({
                    productId: gi.product._id,
                    quantity: gi.quantity,
                    customText: gi.customText,
                    customImage: gi.customImage,
                    selectedTier: gi.selectedTier,
                    selectedAddons: gi.selectedAddons,
                  }).catch(() => {})
                }
              }
              localStorage.removeItem("psg_guest_cart")
            }
          } catch (e) {
            console.error("Failed to sync guest cart", e)
          }
        }
      }
      refreshCart()
    }

    syncGuestCart()
  }, [isAuthenticated])

  const saveToGuestCart = (
    productId: string,
    quantity: number,
    customText?: string,
    customImage?: string,
    selectedTier?: {
      tierTitle: string
      unitPrice: number
      discountPercent: number
    },
    selectedAddons?: Array<{
      addonId: string
      title: string
      variantName: string
      price: number
      message?: string
    }>,
    productData?: any
  ) => {
    const existingLocal = localStorage.getItem("psg_guest_cart")
    let currentGuestItems: CartItem[] = []
    if (existingLocal) {
      try {
        currentGuestItems = JSON.parse(existingLocal)
      } catch {
        currentGuestItems = []
      }
    }

    const targetTierTitle = selectedTier?.tierTitle || ""
    const existingIdx = currentGuestItems.findIndex(
      (i) =>
        i.product?._id === productId &&
        (i.customText || "") === (customText || "") &&
        (i.selectedTier?.tierTitle || "") === targetTierTitle
    )

    if (existingIdx > -1) {
      currentGuestItems[existingIdx].quantity += quantity
      if (selectedAddons) currentGuestItems[existingIdx].selectedAddons = selectedAddons
      if (selectedTier) currentGuestItems[existingIdx].selectedTier = selectedTier
    } else {
      const productObj = productData || {
        _id: productId,
        name: "Personalized Gift Item",
        price: selectedTier?.unitPrice || 999,
        images: [],
        slug: "",
        stock: 100,
      }

      currentGuestItems.push({
        product: {
          _id: productObj._id,
          name: productObj.name,
          price: productObj.price,
          comparePrice: productObj.comparePrice,
          images: productObj.images || [],
          slug: productObj.slug || "",
          stock: productObj.stock ?? 100,
        },
        quantity,
        customText,
        customImage,
        selectedTier,
        selectedAddons: Array.isArray(selectedAddons) ? selectedAddons : [],
      })
    }

    localStorage.setItem("psg_guest_cart", JSON.stringify(currentGuestItems))
    setItems(currentGuestItems)
    setTotalAmount(calculateTotal(currentGuestItems))
  }

  const addToCart = async (
    productId: string,
    quantity = 1,
    customText?: string,
    customImage?: string,
    selectedTier?: {
      tierTitle: string
      unitPrice: number
      discountPercent: number
    },
    selectedAddons?: Array<{
      addonId: string
      title: string
      variantName: string
      price: number
      message?: string
    }>,
    productData?: any
  ) => {
    setIsLoading(true)
    try {
      if (isAuthenticated) {
        try {
          await cartApi.add({
            productId,
            quantity,
            customText,
            customImage,
            selectedTier,
            selectedAddons,
          })
          await refreshCart()
        } catch (apiErr) {
          console.warn("Backend cart add failed, falling back to local guest cart:", apiErr)
          saveToGuestCart(
            productId,
            quantity,
            customText,
            customImage,
            selectedTier,
            selectedAddons,
            productData
          )
        }
      } else {
        saveToGuestCart(
          productId,
          quantity,
          customText,
          customImage,
          selectedTier,
          selectedAddons,
          productData
        )
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
      } else {
        const existingLocal = localStorage.getItem("psg_guest_cart")
        if (!existingLocal) return
        let currentGuestItems: CartItem[] = JSON.parse(existingLocal)

        if (quantity <= 0) {
          currentGuestItems = currentGuestItems.filter((i) => i.product?._id !== productId)
        } else {
          const idx = currentGuestItems.findIndex((i) => i.product?._id === productId)
          if (idx > -1) {
            currentGuestItems[idx].quantity = quantity
          }
        }

        localStorage.setItem("psg_guest_cart", JSON.stringify(currentGuestItems))
        setItems(currentGuestItems)
        setTotalAmount(calculateTotal(currentGuestItems))
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
      } else {
        const existingLocal = localStorage.getItem("psg_guest_cart")
        if (!existingLocal) return
        let currentGuestItems: CartItem[] = JSON.parse(existingLocal)
        currentGuestItems = currentGuestItems.filter((i) => i.product?._id !== productId)

        localStorage.setItem("psg_guest_cart", JSON.stringify(currentGuestItems))
        setItems(currentGuestItems)
        setTotalAmount(calculateTotal(currentGuestItems))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = async () => {
    setIsLoading(true)
    try {
      localStorage.removeItem("psg_guest_cart")
      if (isAuthenticated) {
        await cartApi.clear().catch(() => {})
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
