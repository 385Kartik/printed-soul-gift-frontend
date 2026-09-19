import React, { createContext, useContext, useState, useEffect } from "react"

export interface WishlistItem {
  _id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  images: string[]
  category?: { name: string; slug: string }
  isPersonalizable?: boolean
}

interface WishlistContextType {
  wishlist: WishlistItem[]
  wishlistCount: number
  isWishlistOpen: boolean
  isInWishlist: (id: string) => boolean
  toggleWishlist: (product: any) => void
  removeFromWishlist: (id: string) => void
  clearWishlist: () => void
  openWishlist: () => void
  closeWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem("psg_wishlist")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [isWishlistOpen, setIsWishlistOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem("psg_wishlist", JSON.stringify(wishlist))
    } catch (e) {
      console.error("Failed to save wishlist", e)
    }
  }, [wishlist])

  const [toast, setToast] = useState<{
    visible: boolean
    message: string
    productName?: string
  } | null>(null)

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item._id === id)
  }

  const toggleWishlist = (product: any) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item._id === product._id)
      if (exists) {
        setToast({
          visible: true,
          message: "Removed from Wishlist",
          productName: product.name,
        })
        return prev.filter((item) => item._id !== product._id)
      } else {
        const item: WishlistItem = {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          comparePrice: product.comparePrice,
          images: product.images || [],
          category: product.category,
          isPersonalizable: product.isPersonalizable,
        }
        setToast({
          visible: true,
          message: "Added to your Wishlist ❤️",
          productName: product.name,
        })
        return [item, ...prev]
      }
    })
  }

  // Auto-dismiss toast
  useEffect(() => {
    if (toast?.visible) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item._id !== id))
    setToast({
      visible: true,
      message: "Removed from Wishlist",
    })
  }

  const clearWishlist = () => {
    setWishlist([])
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isWishlistOpen,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        openWishlist: () => setIsWishlistOpen(true),
        closeWishlist: () => setIsWishlistOpen(false),
      }}
    >
      {children}

      {/* Floating Wishlist Toast Notification */}
      {toast?.visible && (
        <div className="fixed bottom-5 right-5 z-[150] max-w-sm w-auto bg-zinc-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-zinc-800 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="text-xs">
            <p className="font-bold text-white flex items-center gap-1.5">
              <span>{toast.message}</span>
            </p>
            {toast.productName && (
              <p className="text-[11px] text-zinc-400 truncate max-w-[220px] mt-0.5">
                {toast.productName}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setToast(null)
              setIsWishlistOpen(true)
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
          >
            View
          </button>
        </div>
      )}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
