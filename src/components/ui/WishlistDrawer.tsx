import React from "react"
import { Link } from "react-router-dom"
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { useWishlist } from "../../context/WishlistContext"
import { useCart } from "../../context/CartContext"
import { formatPrice, getImageUrl } from "../../lib/utils"

export const WishlistDrawer: React.FC = () => {
  const { wishlist, isWishlistOpen, closeWishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  if (!isWishlistOpen) return null

  const handleMoveToCart = async (product: any) => {
    if (product.isPersonalizable) {
      closeWishlist()
      window.location.href = `/products/${product.slug}`
      return
    }
    await addToCart(product._id, 1)
    removeFromWishlist(product._id)
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeWishlist}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-500" />
            <h2 className="text-base font-bold text-zinc-950">Saved Wishlist</h2>
            <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            onClick={closeWishlist}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                <Heart className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="text-sm font-bold text-zinc-800">Your Wishlist is Empty</h3>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                Save your favorite gift hampers and personalized items by clicking the heart icon on any product.
              </p>
              <button
                onClick={closeWishlist}
                className="mt-2 px-5 py-2 rounded-full bg-zinc-900 text-white text-xs font-bold hover:bg-black transition-colors"
              >
                Browse Gifts Catalog
              </button>
            </div>
          ) : (
            wishlist.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors bg-white"
              >
                <Link
                  to={`/products/${item.slug}`}
                  onClick={closeWishlist}
                  className="w-18 h-18 rounded-lg overflow-hidden bg-zinc-100 shrink-0 block"
                >
                  <img
                    src={item.images?.[0] ? getImageUrl(item.images[0]) : "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.slug}`}
                    onClick={closeWishlist}
                    className="text-xs font-semibold text-zinc-900 hover:text-amber-700 line-clamp-1 block"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs font-bold text-zinc-950 mt-0.5">{formatPrice(item.price)}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="px-3 py-1 bg-zinc-900 hover:bg-black text-white text-[11px] font-semibold rounded-md flex items-center gap-1 transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>{item.isPersonalizable ? "Personalize" : "Add to Cart"}</span>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="p-4 border-t border-zinc-100 bg-zinc-50">
            <Link
              to="/products"
              onClick={closeWishlist}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
