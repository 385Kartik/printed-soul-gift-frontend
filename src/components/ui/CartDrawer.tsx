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
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-zinc-100 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-600" />
            <h3 className="font-display font-black text-lg text-zinc-900">Your Gift Bag</h3>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1 text-zinc-400 hover:text-zinc-800 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Express Delivery Strip */}
        <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>🎉 100% Free Express Delivery Pan-India</span>
          </span>
          <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
            FREE
          </span>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-zinc-300" />
              </div>
              <p className="font-bold text-zinc-800 text-base">Your gift bag is empty</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">
                Explore our curated gift hampers and personalized items to surprise someone special!
              </p>
              <button
                onClick={() => {
                  closeCart()
                  navigate("/products")
                }}
                className="mt-5 px-5 py-2.5 bg-zinc-900 text-white rounded-full font-bold text-xs hover:bg-black transition-all"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-3 p-3 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:border-zinc-200 transition-colors"
              >
                <img
                  src={getImageUrl(item.product?.images?.[0])}
                  alt={item.product?.name}
                  className="w-20 h-20 rounded-xl object-cover border border-zinc-100 shrink-0 bg-zinc-50"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900 line-clamp-2">{item.product?.name}</h4>
                    {item.selectedTier && (
                      <p className="text-[10px] font-semibold text-amber-700 mt-0.5">
                        🏷️ {item.selectedTier.tierTitle} ({item.selectedTier.discountPercent}% off)
                      </p>
                    )}
                    {item.customText && (
                      <p className="text-[11px] text-rose-600 font-medium mt-0.5 truncate">
                        ✨ Engraved: "{item.customText}"
                      </p>
                    )}
                    {item.customImage && (
                      <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                        📸 Custom Photo Uploaded
                      </p>
                    )}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="mt-1 space-y-0.5 border-t border-zinc-100 pt-1">
                        {item.selectedAddons.map((addon, aIdx) => (
                          <div key={aIdx} className="text-[10px] text-zinc-600 flex flex-col">
                            <span className="font-medium text-zinc-800">
                              + {addon.title} ({addon.variantName}): <strong className="text-zinc-900">{formatPrice(addon.price)}</strong>
                            </span>
                            {addon.message && (
                              <span className="italic text-amber-800 pl-2 text-[9px] bg-amber-50/70 rounded px-1 py-0.5 mt-0.5">
                                ✉️ "{addon.message}"
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-display font-extrabold text-sm text-zinc-900">
                      {formatPrice(item.selectedTier?.unitPrice ?? item.product?.price)}
                    </span>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 border border-zinc-200 rounded-lg p-0.5 bg-zinc-50">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="p-1 text-zinc-500 hover:text-zinc-900 rounded transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-1 min-w-[16px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="p-1 text-zinc-500 hover:text-zinc-900 rounded transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-zinc-400 hover:text-red-600 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Strip */}
        {items.length > 0 && (
          <div className="p-5 border-t border-zinc-100 bg-zinc-50/50 space-y-3">
            <div className="space-y-1.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-zinc-900">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                  FREE Pan-India
                </span>
              </div>
              <div className="flex justify-between items-baseline text-sm font-black text-zinc-900 pt-1 border-t border-zinc-200">
                <div>
                  <span>Total Amount</span>
                  <span className="block text-[10px] font-normal text-emerald-700">Inclusive of 18% GST</span>
                </div>
                <span className="text-rose-600 font-display text-base">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Safe & Secure PayU Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
