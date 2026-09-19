import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  ShieldCheck,
  Truck,
  PackageCheck,
  Gift,
  CheckCircle2,
} from "lucide-react"
import { catalogApi } from "../../lib/api"
import { ProductCard } from "../../components/ui/ProductCard"
import { SEO } from "../../components/ui/SEO"

const FALLBACK_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&auto=format&fit=crop&q=80"

const HERO_SLIDES = [
  {
    title: "Royal Diwali Gift Hampers & Festive Sweets",
    tag: "FESTIVE COLLECTION 2026",
    subtitle:
      "Handcrafted wooden boxes with brass diyas, California almonds, cashews & gourmet treats. Perfect for personal & corporate gifting.",
    buttonText: "Shop Festive Hampers",
    link: "/products?category=diwali-gifts",
    bgImage:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1600&auto=format&fit=crop&q=80",
  },
  {
    title: "Precision Laser-Engraved Personalized Gifts",
    tag: "CUSTOM ENGRAVING STUDIO",
    subtitle:
      "Laser-engraved thermal flasks, glowing acrylic star sky lamps, and custom leather notebooks personalized with names & special dates.",
    buttonText: "Personalize Your Gift",
    link: "/products?category=personalized-gifts",
    bgImage:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&auto=format&fit=crop&q=80",
  },
  {
    title: "Bulk Corporate Gifting & Employee Welcome Kits",
    tag: "CORPORATE SOLUTIONS",
    subtitle:
      "Branded onboarding combos with company logo engraving. Custom boxes, premium notebooks & temperature bottles delivered pan-India.",
    buttonText: "Explore Corporate Kits",
    link: "/products?category=corporate-gifts",
    bgImage:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&auto=format&fit=crop&q=80",
  },
]

export function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeFilter, setActiveFilter] = useState<"all" | "festive" | "personalized" | "corporate" | "under999">("all")

  // Auto rotate hero slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // 1. Fetch Categories for Circular Strip
  const { data: homeCatsData } = useQuery({
    queryKey: ["home-categories"],
    queryFn: () => catalogApi.getHomeCategories(),
  })
  const homeCategories = homeCatsData?.data?.data || []

  // 2. Fetch Products
  const { data: allProductsData } = useQuery({
    queryKey: ["home-products"],
    queryFn: () => catalogApi.getProducts({ limit: 50 }),
  })
  const allProducts = allProductsData?.data?.data || []

  const bestsellers = allProducts.filter((p: any) => p.isBestSeller)

  const festiveHampers = allProducts.filter(
    (p: any) =>
      p.category?.slug === "diwali-gifts" ||
      p.category?.slug === "gift-hampers" ||
      p.name?.toLowerCase().includes("hamper") ||
      p.name?.toLowerCase().includes("diwali") ||
      p.name?.toLowerCase().includes("pooja") ||
      p.name?.toLowerCase().includes("dry fruit")
  )

  const personalizedGifts = allProducts.filter(
    (p: any) =>
      p.isPersonalizable ||
      p.category?.slug === "personalized-gifts" ||
      p.name?.toLowerCase().includes("personalized") ||
      p.name?.toLowerCase().includes("custom") ||
      p.name?.toLowerCase().includes("engraved")
  )

  const corporateGifts = allProducts.filter(
    (p: any) =>
      p.category?.slug === "corporate-gifts" ||
      p.category?.slug === "eco-friendly-gifts" ||
      p.name?.toLowerCase().includes("corporate") ||
      p.name?.toLowerCase().includes("executive") ||
      p.name?.toLowerCase().includes("onboarding") ||
      p.name?.toLowerCase().includes("laptop")
  )

  const under999 = allProducts.filter((p: any) => p.price <= 999)

  const displayedBestsellers = React.useMemo(() => {
    let list = bestsellers.length > 0 ? bestsellers : allProducts
    if (activeFilter === "festive") list = festiveHampers
    else if (activeFilter === "personalized") list = personalizedGifts
    else if (activeFilter === "corporate") list = corporateGifts
    else if (activeFilter === "under999") list = under999
    return list.slice(0, 8)
  }, [activeFilter, bestsellers, allProducts, festiveHampers, personalizedGifts, corporateGifts, under999])

  const newArrivals = allProducts.slice(4, 16)

  const customerReviews = [
    {
      name: "Rudra Sharma",
      title: "Superb Hamper Quality",
      review:
        "Ordered the festive hamper for our family. The packaging was royal, dry fruits were exceptionally fresh, and the presentation was top notch. Highly recommended!",
      city: "New Delhi",
    },
    {
      name: "Meera Nair",
      title: "Clean Engraving & Premium Feel",
      review:
        "Got the personalized combo for our company onboarding. The laser lettering on the flask and notebook is razor sharp. Fast dispatch via Delhivery too.",
      city: "Bengaluru",
    },
    {
      name: "Sourabh Bakliwal",
      title: "Prompt Express Delivery",
      review:
        "Delivered in just 2 days. The acrylic star lamp came in pristine condition with warm LED lighting. Made for a memorable anniversary gift.",
      city: "Mumbai",
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 bg-white">
      <SEO
        title="Printed Soul Gift — Curated Gift Hampers & Personalized Gifts"
        description="India's leading gifting platform for handcrafted festive hampers, custom engraved gifts, and executive corporate kits."
      />

      {/* ═════════════════════════════════════════════════════════
          1. FULL-WIDTH HERO CAROUSEL (Edge-to-Edge, Compact)
         ═════════════════════════════════════════════════════════ */}
      <section className="relative w-full bg-zinc-950 overflow-hidden h-[260px] sm:h-[320px] lg:h-[360px]">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center ${
              activeSlide === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Image with Dark Contrast Gradients */}
            <div className="absolute inset-0">
              <img
                src={slide.bgImage}
                alt={slide.title}
                className="w-full h-full object-cover opacity-50 scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
            </div>

            {/* Slide Content */}
            <div className="relative max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8">
              <div className="max-w-2xl space-y-3 sm:space-y-5">
                <span className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] sm:text-xs font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full">
                  <span>✨</span>
                  <span>{slide.tag}</span>
                </span>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
                  {slide.title}
                </h1>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-none font-normal">
                  {slide.subtitle}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    to={slide.link}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-amber-600/30 transition-all active:scale-95"
                  >
                    <span>{slide.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/products"
                    className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full text-xs sm:text-sm font-semibold backdrop-blur-xs transition-colors"
                  >
                    <span>Explore All</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Arrows */}
        <button
          onClick={() =>
            setActiveSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-xs"
          title="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-xs"
          title="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Dot Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeSlide === i ? "w-8 bg-amber-500" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          2. CIRCULAR CATEGORY STRIP (Clean & Direct)
         ═════════════════════════════════════════════════════════ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-zinc-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block mb-0.5">
              EXPLORE CURATIONS
            </span>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-zinc-950">
              Shop by Gifting Category
            </h2>
          </div>
          <Link
            to="/products"
            className="px-3.5 py-1.5 rounded-full border border-zinc-200 hover:border-zinc-900 text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-5 sm:gap-7 overflow-x-auto pb-2 no-scrollbar">
          {homeCategories.map((cat: any) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="flex flex-col items-center gap-2.5 shrink-0 group w-20 sm:w-24 text-center"
            >
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-300 to-amber-600 shadow-xs group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-zinc-100">
                  <img
                    src={cat.image || FALLBACK_CATEGORY_IMAGE}
                    alt={cat.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_CATEGORY_IMAGE
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs font-semibold text-zinc-800 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          3. TRENDING BESTSELLERS (Interactive Category Filter)
         ═════════════════════════════════════════════════════════ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-zinc-200 gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block mb-0.5">
              CUSTOMER FAVORITES
            </span>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-zinc-950">
              Trending Gifting Bestsellers
            </h2>
          </div>
          <Link
            to="/products"
            className="px-3.5 py-1.5 rounded-full border border-zinc-200 hover:border-zinc-900 text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <span>View All ({allProducts.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quick Filter Interactive Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-2 no-scrollbar">
          {[
            { id: "all", label: "All Bestsellers" },
            { id: "festive", label: "Diwali & Festive 🪔" },
            { id: "personalized", label: "Personalized Studio ✨" },
            { id: "corporate", label: "Corporate Kits 💼" },
            { id: "under999", label: "Under ₹999 🏷️" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeFilter === pill.id
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {displayedBestsellers.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          4. DIWALI & FESTIVE HAMPERS
         ═════════════════════════════════════════════════════════ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-zinc-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block mb-0.5">
              SEASONAL COLLECTION
            </span>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-zinc-950">
              Festive &amp; Diwali Gift Hampers
            </h2>
          </div>
          <Link
            to="/products?category=diwali-gifts"
            className="px-3.5 py-1.5 rounded-full border border-zinc-200 hover:border-zinc-900 text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>Explore Range</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {festiveHampers.slice(0, 8).map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          5. PERSONALIZED & ENGRAVED GIFTS
         ═════════════════════════════════════════════════════════ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-zinc-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-700 block mb-0.5">
              BESPOKE STUDIO
            </span>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-zinc-950">
              Personalized &amp; Laser Engraved Gifts
            </h2>
          </div>
          <Link
            to="/products?category=personalized-gifts"
            className="px-3.5 py-1.5 rounded-full border border-zinc-200 hover:border-zinc-900 text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>Personalize Now</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {personalizedGifts.slice(0, 8).map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          6. BULK CORPORATE COMBOS & EXECUTIVE KITS
         ═════════════════════════════════════════════════════════ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-zinc-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 block mb-0.5">
              CORPORATE EXCELLENCE
            </span>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-zinc-950">
              Bulk Corporate Combos &amp; Onboarding Kits
            </h2>
          </div>
          <Link
            to="/products?category=corporate-gifts"
            className="px-3.5 py-1.5 rounded-full border border-zinc-200 hover:border-zinc-900 text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>Corporate Catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {corporateGifts.slice(0, 8).map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          7. BUDGET-FRIENDLY GIFTS UNDER ₹999
         ═════════════════════════════════════════════════════════ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-zinc-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 block mb-0.5">
              VALUE PICKS
            </span>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-zinc-950">
              Pocket-Friendly Gifts Under ₹999
            </h2>
          </div>
          <Link
            to="/products"
            className="px-3.5 py-1.5 rounded-full border border-zinc-200 hover:border-zinc-900 text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>View All Under ₹999</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {under999.slice(0, 8).map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          8. NEW ARRIVALS & KEEPSAKES
         ═════════════════════════════════════════════════════════ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-zinc-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block mb-0.5">
              JUST LAUNCHED
            </span>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-zinc-950">
              New Arrivals &amp; Handcrafted Keepsakes
            </h2>
          </div>
          <Link
            to="/products"
            className="px-3.5 py-1.5 rounded-full border border-zinc-200 hover:border-zinc-900 text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>Browse All ({allProducts.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {newArrivals.slice(0, 8).map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          8.5 VALUE TRUST MICRO-STRIP (High-Converting 1-Line Trust Bar)
         ═════════════════════════════════════════════════════════ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="py-3.5 px-4 sm:px-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-950 leading-tight">Express Pan-India</p>
              <p className="text-[10px] text-zinc-500">Fast Delhivery Air & Surface</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-950 leading-tight">100% Buyer Protection</p>
              <p className="text-[10px] text-zinc-500">PayU 256-bit Encrypted Checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100/80 text-rose-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-950 leading-tight">Laser Inscription Studio</p>
              <p className="text-[10px] text-zinc-500">High-Precision Name Engraving</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-800 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-950 leading-tight">Luxury Presentation</p>
              <p className="text-[10px] text-zinc-500">Satin Finish Royal Gift Box</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          9. VERIFIED BUYER EXPERIENCES (Compact Row)
         ═════════════════════════════════════════════════════════ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-2">
        <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-zinc-200">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-950">
              Customer Experiences
            </h3>
            <p className="text-xs text-zinc-500">
              Real reviews from gift recipients across India
            </p>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>4.9 / 5.0 Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {customerReviews.map((rev, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-zinc-200 bg-white flex flex-col justify-between space-y-2.5"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
                <h4 className="font-bold text-xs text-zinc-900 leading-snug">&ldquo;{rev.title}&rdquo;</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">&ldquo;{rev.review}&rdquo;</p>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-zinc-900 block">{rev.name}</span>
                  <span className="text-[10px] text-zinc-500">{rev.city}</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
