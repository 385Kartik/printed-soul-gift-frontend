import React from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { formatPrice, getImageUrl } from "../../lib/utils"
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles, ShieldCheck } from "lucide-react"

export function CartDrawer() {
  const { isCartOpen, closeCart, items, totalAmount, updateQuantity, removeFromCart } = useCart()
  const { isAuthenticated, openAuthModal } = useAuth()
  const navigate = useNavigate()

  if (!isCartOpen) return null

  const handleCheckout = () => {
    closeCart()
    navigate("/checkout")
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#111114] text-zinc-100 h-full shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#15151A]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif font-bold text-lg text-white">Your VIP Gift Bag</h3>
            <span className="bg-red-600/90 text-white text-xs font-black px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Express Delivery Strip */}
        <div className="px-4 py-2.5 bg-red-950/40 border-b border-red-900/30 flex items-center justify-between text-xs font-semibold text-rose-300">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Complimentary White-Glove Air Dispatch Pan-India</span>
          </span>
          <span className="text-[10px] bg-red-900/60 text-rose-200 border border-red-700/50 px-2 py-0.5 rounded-full font-bold">
            FREE
          </span>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="font-bold text-white text-base font-serif">Your gift bag is empty</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-[240px]">
                Explore our curated luxury gift hampers and personalized collectibles.
              </p>
              <button
                onClick={() => {
                  closeCart()
                  navigate("/products")
                }}
                className="mt-5 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-full font-bold text-xs shadow-lg shadow-red-900/40 transition-all cursor-pointer"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-3 p-3 bg-[#17171C] rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
              >
                <img
                  src={getImageUrl(item.product?.images?.[0])}
                  alt={item.product?.name}
                  className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0 bg-black"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-xs text-white line-clamp-2">{item.product?.name}</h4>
                    {item.selectedTier && (
                      <p className="text-[10px] font-semibold text-amber-400 mt-0.5">
                        🏷️ {item.selectedTier.tierTitle} ({item.selectedTier.discountPercent}% off)
                      </p>
                    )}
                    {item.customText && (
                      <p className="text-[11px] text-rose-400 font-medium mt-0.5 truncate">
                        ✨ Engraved: "{item.customText}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="font-bold text-sm text-white">
                      {formatPrice((item.selectedTier ? item.selectedTier.unitPrice : item.product?.price) * item.quantity)}
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-white/15 rounded-lg bg-black/40">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="p-1 hover:text-white text-zinc-400 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="p-1 hover:text-white text-zinc-400 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-[#15151A] space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Subtotal</span>
              <span className="font-medium text-white">{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Insured Shipping</span>
              <span className="text-emerald-400 font-bold">FREE</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
              <span>Estimated Total</span>
              <span className="text-base text-amber-400">{formatPrice(totalAmount)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <span>Proceed to VIP Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>100% Secure 256-Bit Encrypted Payment</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
