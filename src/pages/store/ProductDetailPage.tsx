import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  Star,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  Sparkles,
  Upload,
  CheckCircle2,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Heart,
  Eye,
  Flame,
  Gift,
  MessageSquare,
  Plus,
  Minus,
  Award,
  Clock,
  Layers,
  MapPin,
} from "lucide-react"
import { catalogApi, reviewApi, uploadApi } from "../../lib/api"
import { formatPrice, getImageUrl, getZoneTransformStyle } from "../../lib/utils"
import { useCart } from "../../context/CartContext"
import { useWishlist } from "../../context/WishlistContext"
import { useAuth } from "../../context/AuthContext"
import { SEO } from "../../components/ui/SEO"
import { ImageZoomLens } from "../../components/store/ImageZoomLens"
import { PersonalizationModal, ENGRAVING_FONTS } from "../../components/store/PersonalizationModal"

interface SelectedAddonState {
  addonId: string
  title: string
  variantName: string
  price: number
  message?: string
  requiresMessage?: boolean
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { isAuthenticated, openAuthModal } = useAuth()

  // Gallery
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  // Quantity & Personalization
  const [quantity, setQuantity] = useState(1)
  const [customText, setCustomText] = useState("")
  const [customImage, setCustomImage] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [added, setAdded] = useState(false)

  // Giftana Personalization Studio Modal
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false)
  const [itemizedEngraving, setItemizedEngraving] = useState<Record<string, string>>({})
  
  // Helper to get font CSS class from font ID or name
  const getEngravingFontClass = (fontIdOrName?: string) => {
    if (!fontIdOrName || fontIdOrName === "sans") return "font-sans font-black"
    const match = ENGRAVING_FONTS.find(
      (f) => f.id === fontIdOrName || f.name.toLowerCase() === fontIdOrName.toLowerCase()
    )
    return match ? match.cssClass : "font-sans font-black"
  }

  const [selectedFontClass, setSelectedFontClass] = useState<string>("font-sans font-black")

  // Selected Tier
  const [selectedTierIndex, setSelectedTierIndex] = useState(0)

  // Selected Addons: map of addonId -> SelectedAddonState
  const [selectedAddonsMap, setSelectedAddonsMap] = useState<Record<string, SelectedAddonState>>({})
  // Variant dropdown selection per addon: map of addonId -> variantName
  const [selectedVariantsMap, setSelectedVariantsMap] = useState<Record<string, string>>({})

  // Dynamic Viewer Counter (Giftana CRO feature)
  const [viewersCount, setViewersCount] = useState(14)
  useEffect(() => {
    const interval = setInterval(() => {
      setViewersCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1
        const next = prev + delta
        return next < 8 ? 9 : next > 22 ? 18 : next
      })
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  // Review Form Modal
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  // Delivery Pincode Estimator State
  const [pincode, setPincode] = useState(() => localStorage.getItem("psg_user_pincode") || "")
  const [pincodeStatus, setPincodeStatus] = useState<{
    checked: boolean
    valid: boolean
    message: string
    estimatedDate?: string
  }>(() => {
    const saved = localStorage.getItem("psg_user_pincode")
    if (saved && /^\d{6}$/.test(saved)) {
      const d = new Date()
      d.setDate(d.getDate() + 4)
      return {
        checked: true,
        valid: true,
        message: "Free Express Delivery Available",
        estimatedDate: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
      }
    }
    return { checked: false, valid: false, message: "" }
  })

  const handleCheckPincode = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const clean = pincode.replace(/\D/g, "").slice(0, 6)
    if (clean.length === 6) {
      const d = new Date()
      d.setDate(d.getDate() + 4)
      const dateStr = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
      setPincodeStatus({
        checked: true,
        valid: true,
        message: "Free Express Delivery available via Delhivery One",
        estimatedDate: dateStr,
      })
      localStorage.setItem("psg_user_pincode", clean)
    } else {
      setPincodeStatus({
        checked: true,
        valid: false,
        message: "Please enter a valid 6-digit Indian PIN code",
      })
    }
  }

  // 1. Fetch Product
  const { data: productData, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => catalogApi.getProductBySlug(slug!),
    enabled: !!slug,
  })
  const product = productData?.data?.data
  const isWishlisted = product ? isInWishlist(product._id) : false

  // Sync initial font with product's zone configuration
  useEffect(() => {
    const zoneFont = product?.personalizationZones?.[0]?.fontFamily
    if (zoneFont) {
      setSelectedFontClass(getEngravingFontClass(zoneFont))
    }
  }, [product])

  // 2. Fetch Applicable Addons for this product
  const { data: addonsData } = useQuery({
    queryKey: ["addons-product", product?._id],
    queryFn: () => catalogApi.getAddonsForProduct(product._id),
    enabled: !!product?._id,
  })
  const addons: any[] = addonsData?.data?.data || []

  // 3. Fetch Reviews
  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", product?._id],
    queryFn: () => reviewApi.getForProduct(product._id),
    enabled: !!product?._id,
  })
  const reviews = reviewsData?.data?.data || []

  // Tiers calculation (use product bulkPricingTiers if present, otherwise Giftana default 3 tiers)
  const pricingTiers = useMemo(() => {
    if (product?.bulkPricingTiers && product.bulkPricingTiers.length > 0) {
      return product.bulkPricingTiers
    }
    return [
      {
        title: "Buy 1 Gift",
        subtitle: "Standard price",
        minQty: 1,
        maxQty: 1,
        discountPercent: 0,
        badgeText: "",
      },
      {
        title: "Buy 2 - 20 Gifts",
        subtitle: "Best option",
        minQty: 2,
        maxQty: 20,
        discountPercent: 45,
        badgeText: "Save 45%",
      },
      {
        title: "More than 21 Gifts",
        subtitle: "Save more",
        minQty: 21,
        maxQty: 9999,
        discountPercent: 48,
        badgeText: "Save 48%",
        isMostPopular: true,
      },
    ]
  }, [product])

  // Sync selected tier when quantity changes
  useEffect(() => {
    const matchingIdx = pricingTiers.findIndex(
      (t: any) => quantity >= (t.minQty || 1) && quantity <= (t.maxQty || 9999)
    )
    if (matchingIdx !== -1 && matchingIdx !== selectedTierIndex) {
      setSelectedTierIndex(matchingIdx)
    }
  }, [quantity, pricingTiers])

  // Active Tier
  const currentTier = pricingTiers[selectedTierIndex] || pricingTiers[0]

  // Calculate Unit Price
  const basePrice = product?.price || 0
  const tierDiscount = currentTier?.discountPercent || 0
  const unitPrice =
    tierDiscount > 0 ? Math.round(basePrice * (1 - tierDiscount / 100)) : basePrice

  // Calculate Addons Total
  const selectedAddonsList = Object.values(selectedAddonsMap)
  const addonsTotalPerUnit = selectedAddonsList.reduce((sum, a) => sum + (a.price || 0), 0)

  // Overall Total
  const grandTotal = unitPrice * quantity + addonsTotalPerUnit * quantity

  // Check personalization
  const isPersonalizable = Boolean(product?.isPersonalizable)
  const allowCustomImage = Boolean(product?.allowCustomImageUpload)

  // Click on a Tier Radio Card
  const handleSelectTier = (idx: number) => {
    setSelectedTierIndex(idx)
    const tier = pricingTiers[idx]
    if (tier) {
      if (quantity < tier.minQty || quantity > tier.maxQty) {
        setQuantity(tier.minQty)
      }
    }
  }

  // Toggle Addon Selection
  const handleToggleAddon = (addon: any) => {
    const existing = selectedAddonsMap[addon._id]
    if (existing) {
      setSelectedAddonsMap((prev) => {
        const next = { ...prev }
        delete next[addon._id]
        return next
      })
    } else {
      const variants = addon.variants || []
      const chosenVariantName = selectedVariantsMap[addon._id] || variants[0]?.name || "Standard"
      const chosenVariant = variants.find((v: any) => v.name === chosenVariantName) || variants[0]
      const price = chosenVariant?.price || 0

      setSelectedAddonsMap((prev) => ({
        ...prev,
        [addon._id]: {
          addonId: addon._id,
          title: addon.title,
          variantName: chosenVariantName,
          price,
          message: "",
          requiresMessage: Boolean(addon.requiresMessage),
        },
      }))
    }
  }

  // Change Addon Variant
  const handleChangeVariant = (addon: any, variantName: string) => {
    setSelectedVariantsMap((prev) => ({ ...prev, [addon._id]: variantName }))
    const chosenVariant = (addon.variants || []).find((v: any) => v.name === variantName)
    const price = chosenVariant?.price || 0

    if (selectedAddonsMap[addon._id]) {
      setSelectedAddonsMap((prev) => ({
        ...prev,
        [addon._id]: {
          ...prev[addon._id],
          variantName,
          price,
        },
      }))
    }
  }

  // Update greeting message on an addon
  const handleUpdateAddonMessage = (addonId: string, message: string) => {
    setSelectedAddonsMap((prev) => {
      if (!prev[addonId]) return prev
      return {
        ...prev,
        [addonId]: {
          ...prev[addonId],
          message,
        },
      }
    })
  }

  // Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const res = await uploadApi.uploadFile(file)
      setCustomImage(res.data.data.url)
    } catch {
      alert("Failed to upload image. Please try a different image.")
    } finally {
      setUploadingImage(false)
    }
  }

  // Construct Add to Cart Payload
  const prepareCartPayload = () => {
    const selectedTierPayload = {
      tierTitle: currentTier.title,
      unitPrice,
      discountPercent: tierDiscount,
    }
    const selectedAddonsPayload = Object.values(selectedAddonsMap).map((a) => ({
      addonId: a.addonId,
      title: a.title,
      variantName: a.variantName,
      price: a.price,
      message: a.message?.trim() || undefined,
    }))

    return {
      selectedTierPayload,
      selectedAddonsPayload,
    }
  }

  const handleAddToCart = async () => {
    // If product requires personalization and user hasn't entered anything,
    // open the Personalization Studio instead of browser alert!
    if (isPersonalizable && !customText.trim()) {
      setShowPersonalizeModal(true)
      return
    }

    const { selectedTierPayload, selectedAddonsPayload } = prepareCartPayload()

    await addToCart(
      product._id,
      quantity,
      isPersonalizable ? customText.trim() : undefined,
      isPersonalizable ? customImage : undefined,
      selectedTierPayload,
      selectedAddonsPayload,
      product
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  // Callback from PersonalizationModal
  const handleAddToCartFromModal = async (data: {
    engravingText: string
    itemizedEngraving: Record<string, string>
    font: string
    quantity: number
    logoUrl?: string
  }) => {
    const { selectedTierPayload, selectedAddonsPayload } = prepareCartPayload()

    // Sync inline state with modal selections
    setCustomText(data.engravingText)
    setItemizedEngraving(data.itemizedEngraving || {})
    if (data.font) {
      const found = ENGRAVING_FONTS.find((f) => f.name === data.font || f.id === data.font)
      if (found) setSelectedFontClass(found.cssClass)
    }
    setQuantity(data.quantity)

    await addToCart(
      product._id,
      data.quantity,
      data.engravingText,
      data.logoUrl || (isPersonalizable ? customImage : undefined),
      selectedTierPayload,
      selectedAddonsPayload,
      product
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  const handleBuyNow = async () => {
    const { selectedTierPayload, selectedAddonsPayload } = prepareCartPayload()

    await addToCart(
      product._id,
      quantity,
      isPersonalizable && customText.trim() ? customText.trim() : undefined,
      isPersonalizable ? customImage : undefined,
      selectedTierPayload,
      selectedAddonsPayload,
      product
    )
    navigate("/checkout")
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      openAuthModal()
      return
    }
    setSubmittingReview(true)
    try {
      await reviewApi.create({
        productId: product._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      })
      setShowReviewModal(false)
      setReviewComment("")
      setReviewTitle("")
      refetchReviews()
    } finally {
      setSubmittingReview(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 py-28 flex items-center justify-center">
        <Loader2 className="w-9 h-9 text-amber-600 animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Gift Item Not Found</h2>
        <p className="text-xs text-zinc-500 mb-6">This product might have been updated or removed.</p>
        <Link
          to="/products"
          className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
        >
          View All Gifts
        </Link>
      </div>
    )
  }

  const images = product.images && product.images.length > 0 ? product.images : [""]
  const compareDiscount =
    product.comparePrice && product.comparePrice > unitPrice
      ? Math.round(((product.comparePrice - unitPrice) / product.comparePrice) * 100)
      : tierDiscount

  return (
    <div className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 space-y-8">
      <SEO title={`${product.name} — Printed Soul Gift`} description={product.description} />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500">
        <Link to="/" className="hover:text-zinc-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <Link
          to={`/products?category=${product.category?.slug || ""}`}
          className="hover:text-zinc-900 transition-colors"
        >
          {product.category?.name || "Catalog"}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-900 font-medium truncate max-w-[320px]">{product.name}</span>
      </nav>

      {/* Main Grid: Gallery & Specifications (Left 7 cols) & Buy Box (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
        
        {/* ═════════════════════════════════════════════════════════
            LEFT COLUMN: GALLERY + GIFT HIGHLIGHTS & SPECIFICATIONS
           ═════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Showcase Gallery */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 items-start">
            {/* Vertical Thumbnail Strip (No scrollbars, clean spacious layout) */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[620px] shrink-0 w-full sm:w-28 p-1 sm:p-1.5 pb-2 sm:pb-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:overflow-x-hidden">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-20 sm:w-[96px] sm:h-[96px] rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-zinc-50 cursor-pointer ${
                      activeImageIdx === idx
                        ? "border-amber-600 shadow-md ring-2 ring-amber-500/30 scale-[1.02]"
                        : "border-zinc-200 hover:border-zinc-400 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Showcase Image (With Mouse-Tracking Zoom Lens & Chevrons) */}
            <div className="flex-1 w-full aspect-square max-w-[620px] mx-auto rounded-3xl overflow-hidden bg-zinc-50 border border-zinc-200 relative group shadow-sm">
              <ImageZoomLens
                src={getImageUrl(images[activeImageIdx])}
                alt={product.name}
                className="w-full h-full"
                zoomLevel={2.2}
              >
                {/* Live Laser Engraving Overlay — Inside ImageZoomLens so it zooms in/out with the lens */}
                {isPersonalizable && activeImageIdx === 0 && product?.personalizationZones?.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden">
                    {product.personalizationZones.map((zone: any, idx: number) => {
                      const textValue =
                        itemizedEngraving[zone.name] ||
                        (customText && !customText.includes("•")
                          ? customText
                          : (zone.sampleText || "Your Name"))
                      const curvature = zone.curveRadius ?? 35
                      const arcHeight = (curvature / 100) * 36
                      const pathId = `showcase-curve-${zone.id || idx}`
                      const textColor = zone.textColor || "#ffffff"
                      const activeFontClass = selectedFontClass || getEngravingFontClass(zone.fontFamily)

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
                                padding: zone.hasBackground ? "3px 6px" : "0",
                                borderRadius: zone.hasBackground ? "6px" : "0",
                              }}
                            >
                              <svg viewBox="0 0 240 80" className="w-48 h-18 overflow-visible">
                                <defs>
                                  <path
                                    id={pathId}
                                    d={`M 10,${40 + arcHeight} Q 120,${40 - arcHeight} 230,${40 + arcHeight}`}
                                    fill="none"
                                  />
                                </defs>
                                <text
                                  fill={textColor}
                                  fontSize={zone.fontSize || 18}
                                  fontWeight="900"
                                  textAnchor="middle"
                                  className={activeFontClass}
                                  style={{
                                    filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.95))",
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
                                padding: zone.hasBackground ? "3px 8px" : "0",
                                borderRadius: zone.hasBackground ? "6px" : "0",
                                color: textColor,
                                fontSize: `${zone.fontSize || 18}px`,
                                textShadow: "0 1px 3px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.85)",
                              }}
                              className={`font-black tracking-wide ${activeFontClass}`}
                            >
                              {textValue}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </ImageZoomLens>

              {/* Discount Badge */}
              {compareDiscount > 0 && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-600 to-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg tracking-wider pointer-events-none z-10">
                  SAVE {compareDiscount}%
                </span>
              )}

              {/* Wishlist Heart Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-zinc-700 hover:text-rose-600 flex items-center justify-center shadow-lg transition-all cursor-pointer z-20 active:scale-90"
                title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isWishlisted ? "fill-rose-600 text-rose-600" : ""
                  }`}
                />
              </button>

              {/* Carousel Left / Right Chevrons */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════
              LUXURY GIFTING TRUST CARDS
             ═════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center space-y-1">
              <Sparkles className="w-5 h-5 text-amber-600 mx-auto" />
              <h4 className="text-xs font-bold text-amber-950">Free Engraving</h4>
              <p className="text-[10px] text-amber-800">Precision Laser Tech</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-center space-y-1">
              <Gift className="w-5 h-5 text-rose-600 mx-auto" />
              <h4 className="text-xs font-bold text-rose-950">Luxury Gift Box</h4>
              <p className="text-[10px] text-rose-800">Satin Finish Ribbon</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center space-y-1">
              <Truck className="w-5 h-5 text-emerald-600 mx-auto" />
              <h4 className="text-xs font-bold text-emerald-950">Express Dispatch</h4>
              <p className="text-[10px] text-emerald-800">24–48h Delhivery</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <ShieldCheck className="w-5 h-5 text-slate-700 mx-auto" />
              <h4 className="text-xs font-bold text-slate-950">Damage-Free</h4>
              <p className="text-[10px] text-slate-700">100% Transit Safe</p>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════
              PRODUCT HIGHLIGHTS, WHAT'S INSIDE & SPECIFICATIONS
             ═════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-serif font-black text-zinc-950 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span>What Makes This Gift Special</span>
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed mt-2.5">
                {product.description ||
                  "Handcrafted with exquisite attention to detail, this luxury gift hamper represents the highest standard of modern personalized gifting. Designed to create a lasting impression for your clients, family, or loved ones."}
              </p>
            </div>

            {/* Inclusions & Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-600" />
                  <span>Hamper Inclusions</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-zinc-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>1 × {product.name}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Laser Engraved Custom Name / Message</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Deluxe Hardbound Satin Lined Gift Box</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Handwritten Greeting Card Envelope</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>Key Specifications</span>
                </h4>
                <div className="space-y-1.5 text-xs text-zinc-600">
                  <div className="flex justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-400">Material</span>
                    <span className="font-semibold text-zinc-800">Food-Grade SS 304 / Premium</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-400">Finish</span>
                    <span className="font-semibold text-zinc-800">Matte Anti-Scratch Powder Coat</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-400">Personalization</span>
                    <span className="font-semibold text-zinc-800">Permanent Fiber Laser Engraved</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Packaging</span>
                    <span className="font-semibold text-zinc-800">Luxury Satin Gift Box Included</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Occasions & Recipients */}
            {((product.giftOccasions && product.giftOccasions.length > 0) ||
              (product.recipient && product.recipient.length > 0)) && (
              <div className="pt-4 border-t border-zinc-100 space-y-2.5">
                <h4 className="text-xs font-bold text-zinc-800">Ideal For:</h4>
                <div className="flex flex-wrap gap-2">
                  {(product.giftOccasions || []).map((occ: string) => (
                    <span
                      key={occ}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/80"
                    >
                      🎉 {occ}
                    </span>
                  ))}
                  {(product.recipient || []).map((rec: string) => (
                    <span
                      key={rec}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-900 border border-rose-200/80"
                    >
                      🎁 For {rec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════
            RIGHT COLUMN: DETAILS, TIERED PRICING & ADDONS (Sticky Buy Box)
           ═════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
          
          {/* Header & Badges */}
          <div>
            {product.category?.name && (
              <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-widest block mb-1">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-zinc-950 leading-tight">
              {product.name}
            </h1>

            {/* Rating & In-Stock Status */}
            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              <div className="flex items-center gap-1 bg-amber-50 text-zinc-900 px-2 py-0.5 rounded text-xs font-bold border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.ratings?.average ? Number(product.ratings.average).toFixed(1) : "4.9"}</span>
              </div>
              <span className="text-xs text-zinc-500">
                ({reviews.length > 0 ? reviews.length : "42"} verified reviews)
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> In Stock &amp; Ready to Ship
              </span>
            </div>
          </div>

          {/* Pricing Row with "FREE Name Engraving" Pill */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-1">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-black text-zinc-950 font-sans tracking-tight">
                {formatPrice(unitPrice)}
              </span>
              {product.comparePrice && product.comparePrice > unitPrice && (
                <span className="text-base text-zinc-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
              {isPersonalizable && (
                <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" /> FREE Name Engraving
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">
              Inclusive of 18% GST. 100% Free Express Delivery Pan-India on all orders.
            </p>
          </div>

          {/* ═════════════════════════════════════════════════════════
              CRO URGENCY STRIPS: VIEWER COUNT & STOCK URGENCY BAR
             ═════════════════════════════════════════════════════════ */}
          <div className="space-y-2.5 pt-1">
            {/* Viewer Counter */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
              </span>
              <Eye className="w-4 h-4 text-zinc-500 ml-0.5" />
              <span>
                <strong className="text-zinc-900">{viewersCount} customers</strong> are viewing this gift right now
              </span>
            </div>

            {/* Stock Urgency Bar */}
            <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-orange-900">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-600 fill-orange-600" />
                  <span>HURRY! ONLY A FEW LEFT IN STOCK</span>
                </span>
                <span className="text-[11px] text-orange-700 font-semibold">6 Units Left</span>
              </div>
              <div className="w-full bg-orange-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-rose-600 h-full rounded-full transition-all duration-500"
                  style={{ width: "24%" }}
                />
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════
              1. "BUY MORE, SAVE MORE" BULK TIERED PRICING (Giftana Style)
             ═════════════════════════════════════════════════════════ */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wide flex items-center gap-1.5">
                <span>Buy More, Save More</span>
              </h3>
              <span className="text-[11px] font-semibold text-amber-700">Volume Discounts</span>
            </div>

            <div className="space-y-2.5">
              {pricingTiers.map((tier: any, idx: number) => {
                const isSelected = selectedTierIndex === idx
                const tierDisc = tier.discountPercent || 0
                const tierUnitPrice =
                  tierDisc > 0 ? Math.round(basePrice * (1 - tierDisc / 100)) : basePrice

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectTier(idx)}
                    className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-amber-600 bg-amber-50/40 shadow-xs"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    {/* Left: Radio & Title */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-amber-600 bg-amber-600 text-white"
                            : "border-zinc-300 bg-white"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-zinc-950">
                            {tier.title}
                          </span>
                          {tier.badgeText && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                              {tier.badgeText}
                            </span>
                          )}
                          {tier.isMostPopular && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-zinc-900 text-white shadow-2xs">
                              ⭐ Most popular
                            </span>
                          )}
                        </div>
                        {tier.subtitle && (
                          <p className="text-[11px] text-zinc-500 mt-0.5">{tier.subtitle}</p>
                        )}
                      </div>
                    </div>

                    {/* Right: Calculated Price */}
                    <div className="text-right">
                      <span className="font-sans font-black text-sm sm:text-base text-zinc-950 block">
                        {formatPrice(tierUnitPrice)}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">/ gift piece</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════
              2. "MAKE IT EXTRA SPECIAL ✉️ 🍫 🎁" ADD-ONS SYSTEM
             ═════════════════════════════════════════════════════════ */}
          {addons.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-50/70 to-rose-50/40 border border-amber-200/80 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-950 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-700" />
                  <span>Make it extra special ✉️ 🍫 🎁</span>
                </h3>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  Enhance this gift with greeting cards, premium chocolates, or luxury wrap.
                </p>
              </div>

              <div className="space-y-3">
                {addons.map((addon: any) => {
                  const isSelected = Boolean(selectedAddonsMap[addon._id])
                  const variants = addon.variants || []
                  const currentSelectedVariant =
                    selectedVariantsMap[addon._id] || variants[0]?.name || "Standard"
                  const activeVariantObj =
                    variants.find((v: any) => v.name === currentSelectedVariant) || variants[0]
                  const addonPrice = activeVariantObj?.price || 0

                  return (
                    <div
                      key={addon._id}
                      className={`p-3.5 rounded-xl border bg-white transition-all space-y-3 ${
                        isSelected
                          ? "border-amber-500 ring-1 ring-amber-400/50 shadow-sm"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                        {/* Title & Subtitle */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          {addon.image ? (
                            <img
                              src={getImageUrl(addon.image)}
                              alt={addon.title}
                              className="w-10 h-10 rounded-lg object-cover border border-zinc-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0 text-base">
                              {addon.title.toLowerCase().includes("chocolate")
                                ? "🍫"
                                : addon.title.toLowerCase().includes("card")
                                ? "✉️"
                                : "🎁"}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-zinc-900 truncate">
                              {addon.title}
                            </h4>
                            {addon.subtitle && (
                              <p className="text-[10px] text-zinc-500 truncate">{addon.subtitle}</p>
                            )}
                          </div>
                        </div>

                        {/* Variant Selector (if variants exist) & Price & Action */}
                        <div className="flex items-center gap-3 shrink-0 ml-auto">
                          {variants.length > 1 && (
                            <select
                              value={currentSelectedVariant}
                              onChange={(e) => handleChangeVariant(addon, e.target.value)}
                              className="px-2 py-1 text-xs rounded-lg border border-zinc-300 bg-white font-medium text-zinc-800 focus:outline-none focus:border-amber-600"
                            >
                              {variants.map((v: any, vIdx: number) => (
                                <option key={vIdx} value={v.name}>
                                  {v.name} (+₹{v.price})
                                </option>
                              ))}
                            </select>
                          )}

                          <span className="font-black text-xs text-zinc-900">
                            +{formatPrice(addonPrice)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleAddon(addon)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              isSelected
                                ? "bg-emerald-700 text-white shadow-2xs"
                                : "bg-zinc-900 hover:bg-black text-white"
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Greeting Message Input Box */}
                      {addon.requiresMessage && isSelected && (
                        <div className="pt-2.5 border-t border-amber-200/80 animate-in fade-in space-y-1.5">
                          <label className="block text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                            <span>Write A Message On {addon.title}:</span>
                          </label>
                          <textarea
                            rows={2}
                            value={selectedAddonsMap[addon._id]?.message || ""}
                            onChange={(e) => handleUpdateAddonMessage(addon._id, e.target.value)}
                            placeholder={
                              addon.messagePlaceholder ||
                              "Write your heartfelt personal greeting message here..."
                            }
                            className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-amber-50/30 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 resize-none"
                          />
                          <p className="text-[10px] text-zinc-500 italic">
                            This message will be beautifully printed inside the {addon.title.toLowerCase()}!
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              GIFT PERSONALIZATION CARD (With Live Studio Launcher)
             ═════════════════════════════════════════════════════════ */}
          {isPersonalizable && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3.5">
              <div className="flex items-center justify-between text-amber-950">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Laser Engraving Personalization
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPersonalizeModal(true)}
                  className="text-[11px] font-extrabold text-amber-700 hover:text-amber-900 underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Preview Studio</span>
                  <span>↗</span>
                </button>
              </div>

              {/* Quick Inline Input */}
              {/* Multi-zone or Single Input */}
              {product.personalizationZones && product.personalizationZones.length > 1 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.personalizationZones.map((zone: any, zIdx: number) => (
                      <div key={zone.id || zIdx} className="space-y-1">
                        <label className="block text-[11px] font-bold text-zinc-800">
                          {zone.name} Engraving:
                        </label>
                        <input
                          type="text"
                          value={itemizedEngraving[zone.name] || ""}
                          onChange={(e) => {
                            const val = e.target.value
                            setItemizedEngraving((prev) => {
                              const updated = { ...prev, [zone.name]: val }
                              const summary = Object.entries(updated)
                                .filter(([_, t]) => typeof t === "string" && t.trim())
                                .map(([k, t]) => `${k}: ${(t as string).trim()}`)
                                .join(" • ")
                              setCustomText(summary)
                              return updated
                            })
                          }}
                          placeholder={zone.sampleText || "Your Name"}
                          className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-xs font-semibold text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">
                      Laser engraved permanently on each item.
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPersonalizeModal(true)}
                      className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Studio &amp; Fonts</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    {product.personalizationPrompt || "Name or Custom Text to Engrave"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="e.g. Radhe & Krishna"
                      className="flex-1 px-3.5 py-2.5 rounded-lg border border-amber-300 bg-white text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPersonalizeModal(true)}
                      className="px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-lg border border-amber-300 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                      title="Open Live Font & Mockup Studio"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>Fonts & Preview</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-500 block mt-1">
                    Precision laser engraved permanently on the gift.
                  </span>

                  {/* Live Laser Engraving Preview */}
                  {customText.trim() && (
                    <div className="mt-2.5 p-3 rounded-xl bg-amber-100/70 border border-amber-300 flex items-center justify-between text-xs animate-in fade-in">
                      <span className="text-amber-900 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Engraving Text:</span>
                      </span>
                      <span className="font-serif font-black text-amber-950 tracking-wider text-sm italic bg-white/95 px-3 py-1 rounded-md border border-amber-300 shadow-2xs">
                        {customText.trim()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Logo / Image Upload ONLY IF allowCustomImageUpload */}
              {allowCustomImage && (
                <div className="pt-2 border-t border-amber-200/60">
                  <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Upload Photo / Brand Logo (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-3.5 py-2 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-zinc-800 hover:bg-amber-100/60 transition-colors flex items-center gap-2 shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-amber-700" />
                      <span>{uploadingImage ? "Uploading..." : "Select File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {customImage && (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Photo Uploaded
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              QUANTITY SELECTOR & TOTAL CALCULATION & CTAS
             ═════════════════════════════════════════════════════════ */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-700">Quantity:</span>
                <div className="flex items-center border border-zinc-300 rounded-lg bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-zinc-600 hover:text-zinc-950 font-bold transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 font-black text-xs text-zinc-900 min-w-[28px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 text-zinc-600 hover:text-zinc-950 font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Grand Total */}
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 font-medium block">Total Payable</span>
                <span className="text-lg font-black text-zinc-950 font-sans">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                  added
                    ? "bg-emerald-700 text-white"
                    : "bg-zinc-950 hover:bg-black text-white active:scale-98"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Gift Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  isWishlisted
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "bg-white border-zinc-200 hover:border-zinc-400 text-zinc-700 hover:text-rose-600"
                }`}
                title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? "fill-rose-600 text-rose-600" : ""}`}
                />
              </button>
            </div>

            {/* ═════════════════════════════════════════════════════════
                PRIMARY ACTIONS: "PERSONALIZE IT" & "BUY NOW"
               ═════════════════════════════════════════════════════════ */}
            {isPersonalizable ? (
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPersonalizeModal(true)}
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-zinc-950" />
                  <span>Personalize &amp; Preview Studio</span>
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3 px-6 rounded-xl font-bold text-xs sm:text-sm bg-zinc-900 hover:bg-black text-white shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Buy Now • Fast Checkout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Buy Now • Fast Checkout</span>
              </button>
            )}
          </div>

          {/* Interactive Delivery Estimator & Trust Reassurances */}
          <div className="space-y-3 pt-2">
            {/* Pincode Estimator Card */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-900">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Delhivery Delivery Estimate</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  100% Free Express Delivery
                </span>
              </div>

              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit Pincode"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white font-mono focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Check
                </button>
              </form>

              {pincodeStatus.checked && (
                <div
                  className={`text-[11px] p-2.5 rounded-xl flex items-start gap-2 animate-in fade-in duration-200 ${
                    pincodeStatus.valid
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-200/80"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {pincodeStatus.valid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">
                          Expected Delivery by {pincodeStatus.estimatedDate}
                        </p>
                        <p className="text-[10px] text-emerald-700 mt-0.5">
                          Dispatches in 24 hrs via <strong>Delhivery Express</strong> • Free Pan-India Shipping
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="font-medium">{pincodeStatus.message}</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Safe PayU Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Luxury Hardbound Box</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          CUSTOMER REVIEWS SECTION
         ═════════════════════════════════════════════════════════ */}
      <section className="pt-10 border-t border-zinc-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-zinc-950">Customer Reviews</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Verified buyers who received this gift</p>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 rounded-lg bg-zinc-950 text-white font-semibold text-xs hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Write a Review
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 rounded-xl border border-zinc-200/60 text-xs text-zinc-500">
            No customer reviews yet. Be the first to share your gifting experience!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev: any) => (
              <div key={rev._id} className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s < rev.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-zinc-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                {rev.title && <h5 className="font-bold text-xs text-zinc-900">{rev.title}</h5>}
                <p className="text-xs text-zinc-600 leading-relaxed">{rev.comment}</p>
                <div className="pt-1 text-[11px] text-zinc-700 flex items-center gap-1.5">
                  <span className="font-semibold">{rev.userName}</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded font-medium border border-emerald-200">
                    Verified Buyer
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h3 className="font-serif font-bold text-lg text-zinc-950">Write Your Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setReviewRating(s)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= reviewRating ? "fill-amber-400 text-amber-400" : "text-zinc-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Title</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Excellent Hamper Quality!"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Your Feedback</label>
                <textarea
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe the packaging, product finish, and recipient reaction..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2 rounded-lg border border-zinc-300 font-semibold text-xs text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-2 rounded-lg bg-zinc-950 text-white font-semibold text-xs hover:bg-black transition-colors cursor-pointer"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          GIFTANA PERSONALIZATION STUDIO MODAL
         ═════════════════════════════════════════════════════════ */}
      {isPersonalizable && (
        <PersonalizationModal
          isOpen={showPersonalizeModal}
          onClose={() => setShowPersonalizeModal(false)}
          product={product}
          currentQuantity={quantity}
          unitPrice={unitPrice}
          onAddToCartWithPersonalization={handleAddToCartFromModal}
        />
      )}

      {/* ═════════════════════════════════════════════════════════
          MOBILE STICKY BUY BAR WITH GRAND TOTAL
         ═════════════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 p-2.5 flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={getImageUrl(images[0])}
            alt=""
            className="w-10 h-10 rounded-lg object-cover border border-zinc-200 bg-zinc-50 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold text-xs text-zinc-900 truncate max-w-[130px]">{product.name}</p>
            <p className="font-black text-sm text-zinc-950 font-sans">{formatPrice(grandTotal)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isPersonalizable ? (
            <button
              onClick={() => setShowPersonalizeModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
              <span>Personalize It</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                className="px-3.5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Buy Now</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
