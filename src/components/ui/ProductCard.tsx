import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Star, ShoppingBag, Check, Sparkles, Heart } from "lucide-react"
import { formatPrice, getImageUrl } from "../../lib/utils"
import { useCart } from "../../context/CartContext"
import { useWishlist } from "../../context/WishlistContext"

interface ProductCardProps {
  product: any
  className?: string
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800"

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [added, setAdded] = useState(false)
  const isWishlisted = isInWishlist(product._id)
  const [imgSrc, setImgSrc] = useState(() => {
    return product.images?.[0] ? getImageUrl(product.images[0]) : FALLBACK_IMAGE
  })

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.isPersonalizable) {
      window.location.href = `/products/${product.slug}`
      return
    }
    if (product.stock > 0) {
      await addToCart(product._id, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  return (
    <div className={`group flex flex-col w-full bg-transparent ${className}`}>
      {/* Product Image (Direct, Borderless, Crisp with 2nd Image Hover) */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 block border border-zinc-100/80">
        <Link to={`/products/${product.slug}`} className="block w-full h-full relative">
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className={`w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${
              product.images?.[1] ? "group-hover:opacity-0" : ""
            }`}
          />
          {product.images?.[1] && (
            <img
              src={getImageUrl(product.images[1])}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out group-hover:scale-105"
            />
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isBestSeller && (
            <span className="bg-zinc-950/90 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
              BESTSELLER
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-emerald-700 text-white text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {product.stock > 0 && product.stock <= 40 && (
            <span className="bg-amber-500/90 text-zinc-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded shadow-xs">
              🔥 Selling Fast
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleWishlist(product)
          }}
          className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-zinc-600 hover:text-rose-600 flex items-center justify-center shadow-xs transition-all z-10 cursor-pointer"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isWishlisted ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        {/* Customizable Badge */}
        {product.isPersonalizable && (
          <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
            <span className="bg-white/95 backdrop-blur-xs text-amber-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-amber-200/90">
              <Sparkles className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />
              <span>Personalizable</span>
            </span>
          </div>
        )}
      </div>

      {/* Product Details (Flush with Image, Clean & Compact) */}
      <div className="pt-2.5 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          {/* Category Tag */}
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-0.5">
            {product.category?.name || "GIFT SET"}
          </span>

          {/* Product Title */}
          <Link
            to={`/products/${product.slug}`}
            className="font-medium text-xs sm:text-[13px] text-zinc-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>
        </div>

        <div>
          {/* Rating Badge */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mb-0.5">
            <span className="inline-flex items-center gap-0.5 bg-emerald-700 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
              <span>{product.ratings?.average ? Number(product.ratings.average).toFixed(1) : "4.9"}</span>
              <Star className="w-2.5 h-2.5 fill-white" />
            </span>
            <span className="text-[10px] text-zinc-400">({product.ratings?.count || 48})</span>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-bold text-base sm:text-lg text-zinc-950 tracking-tight font-sans">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="text-xs text-zinc-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700">
                  Save {formatPrice(product.comparePrice - product.price)}
                </span>
              </>
            )}
          </div>

          {/* Delivery tag */}
          <p className="text-[10px] text-zinc-400 font-normal mt-0.5">
            🚚 Free Delivery across India
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleQuickAdd}
          disabled={product.stock === 0}
          className={`w-full py-2 px-3 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1 active:scale-[0.98] ${
            added
              ? "bg-emerald-700 text-white"
              : product.isPersonalizable
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-zinc-900 hover:bg-black text-white"
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" /> Added
            </>
          ) : product.isPersonalizable ? (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Personalize
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  )
}
