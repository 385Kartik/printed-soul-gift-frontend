import React, { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Star, ShoppingBag, Check, Sparkles, Heart, ArrowRight } from "lucide-react"
import { formatPrice, getImageUrl, getZoneTransformStyle } from "../../lib/utils"
import { useCart } from "../../context/CartContext"
import { useWishlist } from "../../context/WishlistContext"
import { useTheme } from "../../context/ThemeContext"

interface ProductCardProps {
  product: any
  className?: string
  aspectRatio?: "4:5" | "1:1" | "3:4" | "16:9"
  photoMode?: "single" | "multi"
  hoverBehavior?: "video" | "second_image" | "zoom" | "none"
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800"

export function ProductCard({
  product,
  className = "",
  aspectRatio: customAspect,
  photoMode: customPhotoMode,
  hoverBehavior: customHover,
}: ProductCardProps) {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { theme } = useTheme()
  const [added, setAdded] = useState(false)
  const isWishlisted = isInWishlist(product._id)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Customizer preferences (falls back to theme settings saved in Admin Panel)
  const effectiveAspect = customAspect || theme.products.aspectRatio || "4:5"
  const effectivePhotoMode = customPhotoMode || theme.products.photoMode || "multi"
  const effectiveHover = customHover || theme.products.hoverBehavior || "video"

  const imagesList: string[] =
    product.images && product.images.length > 0
      ? product.images
      : [FALLBACK_IMAGE]

  const [currentImgIdx, setCurrentImgIdx] = useState(0)
  const activeImgUrl = imagesList[effectivePhotoMode === "multi" ? currentImgIdx : 0] || FALLBACK_IMAGE

  const [imgSrc, setImgSrc] = useState(() => getImageUrl(activeImgUrl))

  // Sync if activeImgUrl changes
  useEffect(() => {
    setImgSrc(getImageUrl(activeImgUrl))
  }, [activeImgUrl])

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0

  const [isCardHovered, setIsCardHovered] = useState(false)

  // Hover media setup
  const rawHoverVideo = product.hoverMediaUrl || product.videoUrl
  const hasHoverVideo =
    effectiveHover === "video" &&
    Boolean(rawHoverVideo) &&
    (product.hoverMediaType === "video" || /\.(mp4|webm|mov)$/i.test(rawHoverVideo || ""))

  const secondImage =
    imagesList.length > 1
      ? imagesList[1]
      : product.hoverMediaUrl && !/\.(mp4|webm|mov)$/i.test(product.hoverMediaUrl)
      ? product.hoverMediaUrl
      : null

  const shouldShowSecondImage =
    (effectiveHover === "second_image" || (effectiveHover === "video" && !hasHoverVideo)) &&
    Boolean(secondImage)

  const hoverImageUrl = shouldShowSecondImage ? getImageUrl(secondImage) : null
  const hasHoverMedia = hasHoverVideo || Boolean(hoverImageUrl)

  const handleMouseEnter = () => {
    setIsCardHovered(true)
    if (hasHoverVideo && videoRef.current) {
      try {
        videoRef.current.currentTime = 0
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => {})
        }
      } catch (err) {}
    }
  }

  const handleMouseLeave = () => {
    setIsCardHovered(false)
    if (hasHoverVideo && videoRef.current) {
      try {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      } catch (err) {}
    }
  }

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.isPersonalizable) {
      window.location.href = `/products/${product.slug}`
      return
    }
    if (product.stock > 0) {
      await addToCart(product._id, 1, undefined, undefined, undefined, undefined, product)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  const aspectClass =
    effectiveAspect === "1:1"
      ? "aspect-square"
      : effectiveAspect === "3:4"
      ? "aspect-[3/4]"
      : effectiveAspect === "16:9"
      ? "aspect-video"
      : "aspect-[4/5]"

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group flex flex-col w-full bg-transparent p-0 transition-all duration-300 ${className}`}
    >
      {/* Product Image Container (Configurable Aspect Ratio & Surface) */}
      <div
        className={`relative ${aspectClass} w-full overflow-hidden rounded-xl block`}
        style={{ backgroundColor: theme.colors.surface || "rgba(0,0,0,0.4)" }}
      >
        <Link to={`/products/${product.slug}`} className="block w-full h-full relative">
          {/* Base Product Image */}
          <div
            className={`w-full h-full relative transition-transform duration-700 ease-out origin-center ${
              effectiveHover === "zoom" ? "group-hover:scale-105" : ""
            }`}
          >
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              onError={() => setImgSrc(FALLBACK_IMAGE)}
              className="w-full h-full object-cover"
            />

            {/* Laser Engraving Preview on Product Card (Only if sampleText is provided) */}
            {product.isPersonalizable &&
              product.personalizationZones &&
              product.personalizationZones.length > 0 && (
                <div
                  className={`absolute inset-0 pointer-events-none z-10 select-none overflow-hidden transition-opacity duration-300 ${
                    hasHoverMedia && isCardHovered ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                >
                  {product.personalizationZones.map((zone: any, idx: number) => {
                    if (!zone.sampleText || zone.sampleText.trim() === "") {
                      return null
                    }
                    const textValue = zone.sampleText
                    const curvature = zone.curveRadius ?? 35
                    const arcHeight = (curvature / 100) * 36
                    const pathId = `card-curve-${product._id || "prod"}-${zone.id || idx}`
                    const textColor = zone.textColor || "#ffffff"
                    const scaledFontSize = Math.max(8, Math.round((zone.fontSize || 16) * 0.58))
                    const cardFontClass =
                      zone.fontFamily === "signature"
                        ? "font-signature font-bold"
                        : zone.fontFamily === "serif"
                        ? "font-serif font-bold"
                        : zone.fontFamily === "lobster"
                        ? "font-lobster"
                        : zone.fontFamily === "pacifico"
                        ? "font-pacifico"
                        : zone.fontFamily === "cursive"
                        ? "font-cursive"
                        : zone.fontFamily === "elmessiri"
                        ? "font-elmessiri font-bold"
                        : "font-sans font-black"

                    return (
                      <div
                        key={zone.id || idx}
                        style={{
                          position: "absolute",
                          left: `${zone.x}%`,
                          top: `${zone.y}%`,
                          transform: getZoneTransformStyle(zone),
                        }}
                        className="text-center pointer-events-none whitespace-nowrap"
                      >
                        {zone.isCurved ? (
                          <div
                            style={{
                              backgroundColor: zone.hasBackground
                                ? zone.backgroundColor || "rgba(0,0,0,0.5)"
                                : "transparent",
                              padding: zone.hasBackground ? "2px 4px" : "0",
                              borderRadius: zone.hasBackground ? "4px" : "0",
                            }}
                          >
                            <svg viewBox="0 0 240 80" className="w-28 sm:w-32 h-10 overflow-visible">
                              <defs>
                                <path
                                  id={pathId}
                                  d={`M 10,${40 + arcHeight} Q 120,${40 - arcHeight} 230,${40 + arcHeight}`}
                                  fill="none"
                                />
                              </defs>
                              <text
                                fill={textColor}
                                fontSize={scaledFontSize * 1.5}
                                fontWeight="900"
                                textAnchor="middle"
                                className={cardFontClass}
                                style={{
                                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.95))",
                                  letterSpacing: "0.04em",
                                }}
                              >
                                <textPath href={`#${pathId}`} startOffset="50%">
                                  {textValue}
                                </textPath>
                              </text>
                            </svg>
                          </div>
                        ) : (
                          <div
                            style={{
                              backgroundColor: zone.hasBackground
                                ? zone.backgroundColor || "rgba(0,0,0,0.5)"
                                : "transparent",
                              padding: zone.hasBackground ? "2px 6px" : "0",
                              borderRadius: zone.hasBackground ? "4px" : "0",
                              color: textColor,
                              fontSize: `${scaledFontSize}px`,
                              textShadow: "0 1px 2px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.85)",
                            }}
                            className={`font-black tracking-wide ${cardFontClass}`}
                          >
                            {textValue}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
          </div>

          {/* On-Hover Video Clip */}
          {hasHoverVideo && (
            <video
              ref={videoRef}
              src={getImageUrl(rawHoverVideo)}
              muted
              loop
              playsInline
              preload="auto"
              className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 pointer-events-none z-[2] ${
                isCardHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* On-Hover Secondary Image */}
          {hoverImageUrl && (
            <img
              src={hoverImageUrl}
              alt={product.name}
              loading="lazy"
              className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ease-out pointer-events-none z-[2] ${
                isCardHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </Link>

        {/* Multi-Photo Carousel Dots (When configured in Admin Panel) */}
        {effectivePhotoMode === "multi" && imagesList.length > 1 && (
          <div className="absolute bottom-2.5 left-0 right-0 z-10 flex items-center justify-center gap-1.5 pointer-events-auto">
            {imagesList.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrentImgIdx(dotIdx)
                }}
                onMouseEnter={() => setCurrentImgIdx(dotIdx)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  currentImgIdx === dotIdx
                    ? "w-4 bg-white shadow-sm"
                    : "w-1.5 bg-white/40 hover:bg-white/80"
                }`}
                aria-label={`View photo ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isBestSeller && (
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              VIP PICK
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-red-600/90 text-white text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {product.stock > 0 && product.stock <= 40 && (
            <span className="bg-zinc-900/90 border border-amber-500/40 text-amber-300 text-[8px] font-bold px-1.5 py-0.5 rounded">
              Limited Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleWishlist(product)
          }}
          className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/90 text-zinc-300 hover:text-rose-500 flex items-center justify-center border border-white/10 transition-all z-10 cursor-pointer"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        {/* Customizable Badge */}
        {product.isPersonalizable && (
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <span className="bg-black/80 backdrop-blur-md text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/40">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>Bespoke Engraving</span>
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="pt-2.5 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-widest block mb-1">
            {product.category?.name || "CURATED HAMPER"}
          </span>

          <Link
            to={`/products/${product.slug}`}
            className="font-medium text-xs sm:text-sm text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>
        </div>

        <div className="pt-1">
          {/* Rating */}
          {Boolean(product.ratings?.count && product.ratings.count > 0) && (
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
              <span className="inline-flex items-center gap-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded">
                <span>{Number(product.ratings.average).toFixed(1)}</span>
                <Star className="w-2.5 h-2.5 fill-amber-300" />
              </span>
              <span className="text-zinc-500">({product.ratings.count})</span>
            </div>
          )}

          {/* Pricing Row */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-zinc-500 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleQuickAdd}
          disabled={product.stock === 0}
          className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1 active:scale-[0.98] ${
            added
              ? "bg-emerald-600 text-white"
              : product.isPersonalizable
              ? "bg-[#DC2626] hover:bg-[#EF4444] text-white shadow-lg shadow-red-950/40"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" /> Added to Cart
            </>
          ) : product.isPersonalizable ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Personalize Now
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  )
}
