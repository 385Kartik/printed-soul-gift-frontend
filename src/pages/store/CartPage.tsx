import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { formatPrice, getImageUrl } from "../../lib/utils"
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ShieldCheck, Sparkles } from "lucide-react"
import { SEO } from "../../components/ui/SEO"

export function CartPage() {
  const { items, totalAmount, updateQuantity, removeFromCart } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-display font-black text-zinc-900">Your Gift Bag is Empty</h2>
        <p className="text-xs text-zinc-500 mt-2 mb-6">
          Looks like you haven't added any personalized gifts or hampers yet.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-xs shadow-lg transition-all"
        >
          <span>Explore Collections</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-10">
      <SEO title="Your Gift Bag — Printed Soul Gift" />

      <h1 className="text-2xl sm:text-3xl font-display font-black text-zinc-900 mb-8">
        Your Gift Bag ({items.length} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-3xl border border-zinc-100 shadow-sm"
            >
              <img
                src={getImageUrl(item.product?.images?.[0])}
                alt={item.product?.name}
                className="w-24 h-24 rounded-2xl object-cover border border-zinc-100 shrink-0 bg-zinc-50"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-zinc-900">{item.product?.name}</h3>
                {item.customText && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">
                    ✨ Engraved: "{item.customText}"
                  </p>
                )}
                {item.customImage && (
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">
                    📸 Custom Photo Attached
                  </p>
                )}
                <p className="font-display font-bold text-sm text-zinc-900 mt-2">
                  {formatPrice(item.product?.price)}
                </p>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                {/* Quantity Controls */}
                <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50 p-1">
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    className="p-1 text-zinc-500 hover:text-black font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold px-2">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    className="p-1 text-zinc-500 hover:text-black font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.product._id)}
                  className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-5 self-start">
          <h3 className="font-display font-bold text-base text-zinc-900 border-b border-zinc-100 pb-3">
            Order Summary
          </h3>

          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Free Express Delivery:</strong> All orders across India ship 100% free with priority tracking.</span>
          </div>

          <div className="space-y-2.5 text-xs text-zinc-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-zinc-900">{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Delhivery Express Shipping</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                FREE
              </span>
            </div>
            <div className="flex justify-between items-baseline text-sm font-black text-zinc-900 pt-3 border-t border-zinc-100">
              <div>
                <span>Total Amount</span>
                <span className="block text-[11px] font-normal text-emerald-700 mt-0.5">
                  Inclusive of 18% GST &amp; all taxes
                </span>
              </div>
              <span className="text-rose-600 font-display text-xl font-black">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Prepaid via PayU &amp; Handled with Love</span>
          </div>
        </div>
      </div>
    </div>
  )
}
