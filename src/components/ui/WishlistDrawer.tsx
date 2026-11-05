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
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={closeWishlist} />

      {/* Drawer Panel */}
      <div
        className="relative w-full max-w-md bg-[#111114] text-zinc-100 h-full shadow-2xl flex flex-col border-l border-white/10 z-10 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#15151A]">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h3 className="font-serif font-bold text-lg text-white">VIP Wishlist</h3>
            <span className="bg-red-600/90 text-white text-xs font-black px-2 py-0.5 rounded-full">
              {wishlist.length}
            </span>
          </div>
          <button
            onClick={closeWishlist}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Express Delivery Strip */}
        <div className="px-4 py-2.5 bg-red-950/40 border-b border-red-900/30 flex items-center justify-between text-xs font-semibold text-rose-300">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Saved Luxury Curations</span>
          </span>
          <span className="text-[10px] bg-red-900/60 text-rose-200 border border-red-700/50 px-2 py-0.5 rounded-full font-bold">
            Complimentary Shipping
          </span>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-rose-500 mb-1">
                <Heart className="w-8 h-8 stroke-1 fill-rose-900/40" />
              </div>
              <p className="font-bold text-white text-base font-serif">Your wishlist is empty</p>
              <p className="text-xs text-zinc-400 max-w-[240px] leading-relaxed">
                Save your favorite luxury gift hampers and personalized items by clicking the heart icon on any product!
              </p>
              <button
                onClick={() => {
                  closeWishlist()
                  navigate("/products")
                }}
                className="mt-3 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-full font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            wishlist.map((item) => (
              <div
                key={item._id}
                className="flex gap-3.5 p-3.5 bg-[#17171C] rounded-2xl border border-white/5 hover:border-white/10 transition-all"
              >
                <Link
                  to={`/products/${item.slug}`}
                  onClick={closeWishlist}
                  className="w-20 h-20 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0 block relative group"
                >
                  <img
                    src={item.images?.[0] ? getImageUrl(item.images[0]) : "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link
                      to={`/products/${item.slug}`}
                      onClick={closeWishlist}
                      className="font-medium text-xs sm:text-sm text-white hover:text-amber-300 transition-colors line-clamp-1 block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[10px] font-bold text-amber-400/90 uppercase tracking-widest mt-0.5">
                      {item.category?.name || "CURATED HAMPER"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="font-bold text-sm text-white">
                      {formatPrice(item.price)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move to Bag</span>
                      </button>

                      <button
                        onClick={() => removeFromWishlist(item._id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Remove from wishlist"
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

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-[#15151A] flex items-center justify-between">
            <button
              onClick={clearWishlist}
              className="text-xs text-zinc-400 hover:text-red-400 transition-colors font-medium"
            >
              Clear Wishlist
            </button>
            <button
              onClick={() => {
                closeWishlist()
                navigate("/products")
              }}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              <span>Explore More Gifts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
