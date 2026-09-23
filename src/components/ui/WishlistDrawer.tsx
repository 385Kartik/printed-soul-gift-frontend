import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { X, Heart, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react"
import { useWishlist } from "../../context/WishlistContext"
import { useCart } from "../../context/CartContext"
import { formatPrice, getImageUrl } from "../../lib/utils"

export const WishlistDrawer: React.FC = () => {
  const { wishlist, isWishlistOpen, closeWishlist, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  if (!isWishlistOpen) return null

  const handleMoveToCart = async (product: any) => {
    if (product.isPersonalizable) {
      closeWishlist()
      navigate(`/products/${product.slug}`)
      return
    }
    await addToCart(product._id, 1, undefined, undefined, undefined, undefined, product)
    removeFromWishlist(product._id)
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={closeWishlist} />

      {/* Drawer Panel */}
      <div
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-zinc-100 z-10 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-500" />
            <h3 className="font-display font-black text-lg text-zinc-900">Saved Wishlist</h3>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {wishlist.length}
            </span>
          </div>
          <button
            onClick={closeWishlist}
            className="p-1.5 text-zinc-400 hover:text-zinc-800 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Express Delivery Strip */}
        <div className="px-4 py-2.5 bg-rose-50/70 border-b border-rose-100/70 flex items-center justify-between text-xs font-semibold text-rose-900">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Saved Gifts &amp; Keepsakes</span>
          </span>
          <span className="text-[10px] bg-rose-200/70 text-rose-900 px-2 py-0.5 rounded-full font-bold">
            100% Free Shipping
          </span>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-1">
                <Heart className="w-8 h-8 stroke-1 fill-rose-100" />
              </div>
              <p className="font-bold text-zinc-800 text-base">Your wishlist is empty</p>
              <p className="text-xs text-zinc-500 max-w-[240px] leading-relaxed">
                Save your favorite gift hampers and personalized items by clicking the heart icon on any product!
              </p>
              <button
                onClick={() => {
                  closeWishlist()
                  navigate("/products")
                }}
                className="mt-3 px-5 py-2.5 bg-zinc-900 text-white rounded-full font-bold text-xs hover:bg-black transition-all shadow-sm"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            wishlist.map((item) => (
              <div
                key={item._id}
                className="flex gap-3.5 p-3.5 bg-white rounded-2xl border border-zinc-100 hover:border-zinc-200 shadow-sm transition-all duration-200"
              >
                {/* Fixed Thumbnail Image */}
                <Link
                  to={`/products/${item.slug}`}
                  onClick={closeWishlist}
                  className="w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 shrink-0 block relative group"
                >
                  <img
                    src={item.images?.[0] ? getImageUrl(item.images[0]) : "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Details & Actions */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/products/${item.slug}`}
                        onClick={closeWishlist}
                        className="text-xs font-bold text-zinc-900 hover:text-amber-700 line-clamp-2 transition-colors leading-snug"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeFromWishlist(item._id)}
                        className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.isPersonalizable && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full mt-1.5">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Free Engraving</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-100">
                    <div>
                      <span className="font-display font-black text-sm text-zinc-950">
                        {formatPrice(item.price)}
                      </span>
                      {item.comparePrice && item.comparePrice > item.price && (
                        <span className="text-[10px] text-zinc-400 line-through ml-1.5">
                          {formatPrice(item.comparePrice)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="px-3.5 py-1.5 bg-zinc-950 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{item.isPersonalizable ? "Personalize" : "Add to Bag"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="p-4 border-t border-zinc-100 bg-zinc-50/70 space-y-2">
            <button
              onClick={() => {
                closeWishlist()
                navigate("/products")
              }}
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="text-center">
              <button
                onClick={clearWishlist}
                className="text-[11px] text-zinc-400 hover:text-rose-600 underline transition-colors cursor-pointer"
              >
                Clear all saved items
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
