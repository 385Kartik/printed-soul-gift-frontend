import React, { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  Star,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Upload,
  CheckCircle2,
  Check,
  ChevronRight,
  Loader2,
  Package,
  Heart,
  Share2,
} from "lucide-react"
import { catalogApi, reviewApi, uploadApi } from "../../lib/api"
import { formatPrice, getImageUrl } from "../../lib/utils"
import { useCart } from "../../context/CartContext"
import { useWishlist } from "../../context/WishlistContext"
import { useAuth } from "../../context/AuthContext"
import { SEO } from "../../components/ui/SEO"

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { isAuthenticated, openAuthModal } = useAuth()

  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [customText, setCustomText] = useState("")
  const [customImage, setCustomImage] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [added, setAdded] = useState(false)

  // Review Form
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  const { data: productData, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => catalogApi.getProductBySlug(slug!),
    enabled: !!slug,
  })

  const product = productData?.data?.data
  const isWishlisted = product ? isInWishlist(product._id) : false

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", product?._id],
    queryFn: () => reviewApi.getForProduct(product._id),
    enabled: !!product?._id,
  })
  const reviews = reviewsData?.data?.data || []

  // Check if product actually supports personalization
  const isPersonalizable = Boolean(product?.isPersonalizable)
  const allowCustomImage = Boolean(product?.allowCustomImageUpload)

  // Image Upload for Gift Customization
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

  const handleAddToCart = async () => {
    if (isPersonalizable && !customText.trim()) {
      alert("Please enter the name or custom text for engraving.")
      return
    }
    await addToCart(
      product._id,
      quantity,
      isPersonalizable ? customText.trim() : undefined,
      isPersonalizable ? customImage : undefined
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  const handleBuyNow = async () => {
    if (isPersonalizable && !customText.trim()) {
      alert("Please enter the name or custom text for engraving.")
      return
    }
    await addToCart(
      product._id,
      quantity,
      isPersonalizable ? customText.trim() : undefined,
      isPersonalizable ? customImage : undefined
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
      <div className="max-w-7xl mx-auto px-4 py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
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
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
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
        <span className="text-zinc-900 font-medium truncate max-w-[240px]">{product.name}</span>
      </nav>

      {/* Product Detail Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-200/70 relative">
            <img
              src={getImageUrl(images[activeImageIdx])}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm">
                SAVE {discount}%
              </span>
            )}

            {/* Wishlist Heart Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-zinc-700 hover:text-rose-600 flex items-center justify-center shadow-md transition-all cursor-pointer z-10"
              title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isWishlisted ? "fill-rose-600 text-rose-600" : ""
                }`}
              />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIdx === idx
                      ? "border-amber-600 shadow-sm"
                      : "border-zinc-200 hover:border-zinc-400 opacity-80"
                  }`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Purchase Column */}
        <div className="space-y-6">
          <div>
            {product.category?.name && (
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-950 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Stock Status */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-amber-50 text-zinc-900 px-2 py-0.5 rounded text-xs font-semibold border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.ratings?.average ? Number(product.ratings.average).toFixed(1) : "4.9"}</span>
              </div>
              <span className="text-xs text-zinc-500">
                ({reviews.length > 0 ? reviews.length : "38"} verified reviews)
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-zinc-950 font-sans">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-base text-zinc-400 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Save {formatPrice(product.comparePrice - product.price)}
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Inclusive of all GST taxes. Free express shipping on orders over ₹500.
            </p>
          </div>

          {/* Description */}
          <div className="text-xs text-zinc-700 leading-relaxed">
            <p>{product.description}</p>
          </div>

          {/* ═════════════════════════════════════════════════════════
              GIFT PERSONALIZATION BOX (ONLY SHOWN IF isPersonalizable)
             ═════════════════════════════════════════════════════════ */}
          {isPersonalizable && (
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4">
              <div className="flex items-center gap-2 text-amber-950">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wide">
                  Custom Engraving &amp; Personalization
                </h3>
              </div>

              {/* Engraving Text Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                  {product.personalizationPrompt || "Name or Custom Text to Engrave"} *
                </label>
                <input
                  type="text"
                  required
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g. Radhe &amp; Krishna or Company Name"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-amber-300 bg-white text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
                <span className="text-[10px] text-zinc-500 block mt-1">
                  Will be laser engraved precisely as entered.
                </span>

                {/* Live Laser Engraving Preview */}
                {customText.trim() && (
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-100/70 border border-amber-300 flex items-center justify-between text-xs animate-in fade-in">
                    <span className="text-amber-900 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Engraving Preview:</span>
                    </span>
                    <span className="font-serif font-black text-amber-950 tracking-wider text-sm italic bg-white/90 px-3 py-1 rounded-md border border-amber-300 shadow-2xs">
                      {customText.trim()}
                    </span>
                  </div>
                )}
              </div>

              {/* Logo / Image Upload ONLY IF allowCustomImageUpload */}
              {allowCustomImage && (
                <div>
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

          {/* Quantity & CTAs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center border border-zinc-300 rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-zinc-600 hover:text-zinc-950 font-bold text-sm"
                >
                  -
                </button>
                <span className="px-3 font-semibold text-xs text-zinc-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-zinc-600 hover:text-zinc-950 font-bold text-sm"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm ${
                  added
                    ? "bg-emerald-700 text-white"
                    : "bg-zinc-950 hover:bg-zinc-800 text-white cursor-pointer"
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

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`px-4 py-3 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
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

            {/* Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full py-3 px-6 rounded-xl font-semibold text-xs sm:text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Buy Now • Fast Checkout</span>
            </button>
          </div>

          {/* Delivery Reassurance (Without pincode form) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-700">
            <Truck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Fast Dispatch:</strong> Ships in 24–48 hours across India via{" "}
              <strong>Delhivery Express</strong>.
            </span>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-zinc-600 border-t border-zinc-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Secure PayU Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Premium Luxury Packaging</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-10 border-t border-zinc-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-zinc-950">Customer Reviews</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Verified buyers who received this gift</p>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 rounded-lg bg-zinc-950 text-white font-semibold text-xs hover:bg-zinc-800 transition-colors"
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
                  className="flex-1 py-2 rounded-lg border border-zinc-300 font-semibold text-xs text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-2 rounded-lg bg-zinc-950 text-white font-semibold text-xs hover:bg-black transition-colors"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          MOBILE STICKY BUY BAR (Flipkart / Amazon CRO Standard)
         ═════════════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 p-2.5 flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={getImageUrl(images[0])}
            alt=""
            className="w-10 h-10 rounded-lg object-cover border border-zinc-200 bg-zinc-50 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold text-xs text-zinc-900 truncate max-w-[120px]">{product.name}</p>
            <p className="font-black text-sm text-zinc-950 font-sans">{formatPrice(product.price)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddToCart}
            className="px-3.5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}
