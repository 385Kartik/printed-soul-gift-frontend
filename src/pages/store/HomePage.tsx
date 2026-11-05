import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { catalogApi } from "../../lib/api"
import { ProductCard } from "../../components/ui/ProductCard"
import { SEO } from "../../components/ui/SEO"
import { useTheme } from "../../context/ThemeContext"

interface BannerItem {
  _id?: string
  title?: string
  subtitle?: string
  tag?: string
  imageUrl?: string
  videoUrl?: string
  mediaType?: "image" | "video"
  size?: "auto" | "slim" | "medium" | "full"
  position?: "hero" | "middle" | "bottom"
  type?: string
  link?: string
  buttonText?: string
  order?: number
}

const DEFAULT_HERO_SLIDES: BannerItem[] = [
  {
    _id: "default-1",
    title: "Ferrari Haute Gifting",
    subtitle: "Curated hampers, merchandise and collectibles",
    tag: "Scuderia Collection",
    imageUrl: "/hero-ferrari-hamper.jpg",
    mediaType: "image",
    size: "full",
    position: "hero",
    link: "/products?category=gift-hampers",
    buttonText: "Shop Collection",
  },
  {
    _id: "default-2",
    title: "BMW M Motorsport",
    subtitle: "Performance engineered luxury hampers & executive merchandise",
    tag: "M Performance",
    imageUrl: "/hero-bmw-hamper.jpg",
    mediaType: "image",
    size: "full",
    position: "hero",
    link: "/products?category=corporate-gifts",
    buttonText: "Discover M",
  },
  {
    _id: "default-3",
    title: "Legends Edition",
    subtitle: "Golden football memorabilia and championship keepsakes",
    tag: "Haute Gifting",
    imageUrl: "/hero-legends-hamper.jpg",
    mediaType: "image",
    size: "full",
    position: "hero",
    link: "/products?category=personalized-gifts",
    buttonText: "Explore Legends",
  },
]

const DEFAULT_MIDDLE_BANNER: BannerItem = {
  _id: "default-middle",
  title: "Corporate Gifting That Drives Relationships",
  subtitle: "Premium executive gift sets for clients, teams and corporate partners.",
  tag: "Executive Suite",
  imageUrl: "/corporate-luxury-gifting.jpg",
  mediaType: "image",
  size: "auto",
  position: "middle",
  link: "/products?category=corporate-gifts",
  buttonText: "Get Custom Quote",
}

const DEFAULT_BOTTOM_BANNER: BannerItem = {
  _id: "default-bottom",
  title: "Bespoke Keepsakes & Legends Edition",
  subtitle: "Custom laser-engraved golden trophies and personalized memorabilia.",
  tag: "Bespoke Customization",
  imageUrl: "/hero-legends-hamper.jpg",
  mediaType: "image",
  size: "auto",
  position: "bottom",
  link: "/products?category=personalized-gifts",
  buttonText: "Personalize Keepsake",
}

function getBannerHeightClass(size?: string) {
  switch (size) {
    case "slim":
      // Patla (Slim Strip Banner)
      return "h-28 sm:h-44 md:h-56 lg:h-64"
    case "medium":
      // Medium (16:9 Standard Banner)
      return "h-56 sm:h-80 md:h-[450px] lg:h-[520px]"
    case "full":
      // Bada (Full Display Viewport)
      return "h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-4.5rem)]"
    case "auto":
    default:
      // Chhota (Natural Aspect Ratio, No Forced Crop)
      return "h-auto max-h-[85vh]"
  }
}

function BannerHeadingOverlay({
  banner,
  theme,
}: {
  banner: BannerItem
  theme: any
}) {
  if (!theme.banners?.showHeadings) return null

  const { fontFamily, headingSize, alignment, position, textColor, showSubtitle, showButton } =
    theme.banners

  const fontClass =
    fontFamily === "Cinzel"
      ? "font-cinzel"
      : fontFamily === "Cormorant Garamond"
      ? "font-serif"
      : fontFamily === "Montserrat"
      ? "font-sans font-bold"
      : fontFamily === "Inter"
      ? "font-sans"
      : "font-serif"

  const sizeClass =
    headingSize === "small"
      ? "text-xl sm:text-2xl lg:text-3xl"
      : headingSize === "medium"
      ? "text-2xl sm:text-3xl lg:text-4xl"
      : headingSize === "xlarge"
      ? "text-4xl sm:text-5xl lg:text-6xl"
      : "text-3xl sm:text-4xl lg:text-5xl"

  const positionClass =
    position === "bottom-left"
      ? "justify-end items-start text-left p-6 sm:p-12"
      : position === "bottom-center"
      ? "justify-end items-center text-center p-6 sm:p-12"
      : position === "bottom-right"
      ? "justify-end items-end text-right p-6 sm:p-12"
      : "justify-center items-center text-center p-6"

  const alignClass =
    alignment === "left"
      ? "text-left items-start"
      : alignment === "right"
      ? "text-right items-end"
      : "text-center items-center"

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col pointer-events-none z-10 ${positionClass}`}
    >
      <div className={`max-w-2xl flex flex-col ${alignClass}`}>
        {banner.tag && (
          <span
            className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] mb-2 px-2.5 py-0.5 rounded backdrop-blur-sm shadow-xs"
            style={{
              backgroundColor: `${theme.colors.primary}CC`,
              color: "#FFFFFF",
            }}
          >
            {banner.tag}
          </span>
        )}
        <h2
          className={`font-bold tracking-wide leading-tight drop-shadow-md ${fontClass} ${sizeClass}`}
          style={{ color: textColor || "#FFFFFF" }}
        >
          {banner.title}
        </h2>
        {showSubtitle && banner.subtitle && (
          <p
            className="text-xs sm:text-sm lg:text-base mt-2 opacity-90 max-w-lg leading-relaxed drop-shadow"
            style={{ color: theme.colors.textMuted || "#E4E4E7" }}
          >
            {banner.subtitle}
          </p>
        )}
        {showButton && banner.buttonText && (
          <div className="mt-4 pointer-events-auto">
            <span
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: theme.colors.primary || "#DC2626" }}
            >
              <span>{banner.buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function SingleBannerMedia({
  banner,
  theme,
}: {
  banner: BannerItem
  theme: any
}) {
  const isVideo =
    banner.mediaType === "video" ||
    /\.(mp4|webm|mov)$/i.test(banner.videoUrl || banner.imageUrl || "")
  const mediaSrc = isVideo ? banner.videoUrl || banner.imageUrl : banner.imageUrl
  const heightClass = getBannerHeightClass(banner.size)
  const isAuto = !banner.size || banner.size === "auto"

  return (
    <div className="relative w-full h-full">
      {isVideo ? (
        <video
          src={mediaSrc}
          autoPlay
          loop
          muted
          playsInline
          className={`w-full ${heightClass} ${
            isAuto ? "object-contain sm:object-cover" : "object-cover"
          } object-center block`}
        />
      ) : (
        <img
          src={mediaSrc}
          alt={banner.title || "Banner"}
          className={`w-full ${heightClass} ${
            isAuto ? "object-contain sm:object-cover" : "object-cover"
          } object-center block`}
        />
      )}
      <BannerHeadingOverlay banner={banner} theme={theme} />
    </div>
  )
}

export function HomePage() {
  const { theme } = useTheme()
  const [activeSlide, setActiveSlide] = useState(0)

  // Dynamic Banners Fetch from Backend API (connected directly to Admin Panel & Store)
  const { data: bannersData } = useQuery({
    queryKey: ["home-banners"],
    queryFn: () => catalogApi.getBanners(),
    staleTime: 30 * 1000,
  })

  const banners: BannerItem[] = bannersData?.data?.data || []

  // Filter banners by position configured in Admin Panel
  const heroBanners = banners.filter(
    (b) => b.position === "hero" || (!b.position && b.type === "hero")
  )
  const activeHeroSlides = heroBanners.length > 0 ? heroBanners : DEFAULT_HERO_SLIDES

  const middleBanner =
    banners.find((b) => b.position === "middle" || (!b.position && b.type === "middle")) ||
    DEFAULT_MIDDLE_BANNER

  const bottomBanner =
    banners.find((b) => b.position === "bottom" || (!b.position && b.type === "bottom")) ||
    DEFAULT_BOTTOM_BANNER

  // Auto-rotate hero slideshow
  useEffect(() => {
    if (activeHeroSlides.length <= 1) return
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % activeHeroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [activeHeroSlides.length])

  // Reset active slide index if out of bounds after edits
  useEffect(() => {
    if (activeSlide >= activeHeroSlides.length) {
      setActiveSlide(0)
    }
  }, [activeHeroSlides.length, activeSlide])

  // Dynamic Catalog Fetch from Backend API (connected directly to Admin Panel & Database)
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["home-products"],
    queryFn: () => catalogApi.getProducts({ limit: 50 }),
    staleTime: 60 * 1000,
  })

  const allProducts: any[] = productsData?.data?.data || []

  // Dynamic categorization driven by Admin Panel categories and tags
  const motorsportProducts = allProducts.filter(
    (p) =>
      p.category?.slug === "apparel" ||
      p.category?.slug === "accessories" ||
      p.category?.slug === "gift-hampers" ||
      p.tags?.some((t: string) => /ferrari|f1|motorsport|leclerc|corsa/i.test(t))
  )

  const corporateProducts = allProducts.filter(
    (p) =>
      p.category?.slug === "corporate-gifts" ||
      p.tags?.some((t: string) => /corporate|executive|valet|pen|tumbler|wallet|business/i.test(t))
  )

  const bespokeProducts = allProducts.filter(
    (p) =>
      p.isPersonalizable ||
      p.category?.slug === "personalized-gifts" ||
      p.tags?.some((t: string) => /bespoke|personalized|laser|custom|plaque|mug/i.test(t))
  )

  // Number of products per row configurable via Admin Customizer
  const prodsCount = theme.products.gridColumns === 2 ? 4 : theme.products.gridColumns === 3 ? 3 : 4
  const batch1 = (motorsportProducts.length >= prodsCount ? motorsportProducts : allProducts).slice(0, prodsCount)
  const batch2 = (corporateProducts.length >= prodsCount ? corporateProducts : allProducts.slice(prodsCount)).slice(0, prodsCount)
  const batch3 = (bespokeProducts.length >= prodsCount ? bespokeProducts : allProducts.slice(prodsCount * 2)).slice(0, prodsCount)

  const currentHeroSize = activeHeroSlides[activeSlide]?.size || "full"
  const heroContainerHeight = getBannerHeightClass(currentHeroSize)

  // Dynamic Grid Class configured from Admin Customizer
  const gridColsClass =
    theme.products.gridColumns === 2
      ? "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
      : theme.products.gridColumns === 3
      ? "grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4"
      : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3"

  return (
    <div
      className="w-full pb-16 selection:bg-red-600 selection:text-white transition-colors duration-500"
      style={{
        backgroundColor: theme.colors.background || "#0A0204",
        color: theme.colors.textPrimary || "#FFFFFF",
      }}
    >
      <SEO
        title="Printed Soul — Luxury Gift Hampers &amp; Bespoke Collectibles"
        description="India's haute gifting boutique for Ferrari, BMW and Legends inspired gift hampers, executive onboarding suites, and bespoke laser-engraved keepsakes."
      />

      {/* ═════════════════════════════════════════════════════════
          1. TOP HERO BANNER (Full Display or Admin-Configured Size)
             Supports Chhota, Patla, Bada, Medium &amp; Video
             Zero Horizontal Margins, Pure Visual or Styled Headings
         ═════════════════════════════════════════════════════════ */}
      <section
        className={`w-full ${heroContainerHeight} relative overflow-hidden px-0 mx-0 select-none transition-all duration-700`}
      >
        {activeHeroSlides.map((slide, idx) => {
          const isVideo =
            slide.mediaType === "video" ||
            /\.(mp4|webm|mov)$/i.test(slide.videoUrl || slide.imageUrl || "")
          const mediaSrc = isVideo ? slide.videoUrl || slide.imageUrl : slide.imageUrl
          const isAuto = !slide.size || slide.size === "auto"

          return (
            <Link
              key={slide._id || idx}
              to={slide.link || "/products"}
              className={`absolute inset-0 w-full h-full block transition-opacity duration-1000 ease-in-out cursor-pointer ${
                activeSlide === idx ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              {isVideo ? (
                <video
                  src={mediaSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`w-full h-full ${
                    isAuto ? "object-contain sm:object-cover" : "object-cover"
                  } object-center`}
                />
              ) : (
                <img
                  src={mediaSrc}
                  alt={slide.title || `Slide ${idx + 1}`}
                  className={`w-full h-full ${
                    isAuto ? "object-contain sm:object-cover" : "object-cover"
                  } object-center`}
                />
              )}
              <BannerHeadingOverlay banner={slide} theme={theme} />
            </Link>
          )
        })}

        {/* Minimal Subtle Slider Indicator Dots at Bottom Edge (if more than 1 slide) */}
        {activeHeroSlides.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2 pointer-events-auto">
            {activeHeroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setActiveSlide(idx)
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeSlide === idx ? "w-8" : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
                style={{
                  backgroundColor: activeSlide === idx ? theme.colors.primary || "#DC2626" : undefined,
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ═════════════════════════════════════════════════════════
          2. DIRECT BG PRODUCTS (Batch 1: Products Under Hero)
             Directly Below Hero with 0 Container &amp; 0 Side Margin
         ═════════════════════════════════════════════════════════ */}
      <section className="w-full px-2 sm:px-3 pt-8 pb-10">
        <div
          className="flex items-center justify-between pb-3 px-1 mb-4"
          style={{ borderBottom: `1px solid ${theme.colors.borderColor || "rgba(255,255,255,0.08)"}` }}
        >
          <div>
            <span
              className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] block"
              style={{ color: theme.colors.primary || "#DC2626" }}
            >
              SCUDERIA &amp; MOTORSPORT CURATIONS
            </span>
            <h2
              className="text-base sm:text-xl font-serif font-bold tracking-wide"
              style={{ color: theme.colors.textPrimary || "#FFFFFF" }}
            >
              Featured Gift Hampers &amp; Gear
            </h2>
          </div>
          <Link
            to="/products?category=gift-hampers"
            className="text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-colors hover:opacity-80"
            style={{ color: theme.colors.goldAccent || "#F59E0B" }}
          >
            <span>View All Hampers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {productsLoading ? (
          <div className={gridColsClass}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-white/[0.03] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : batch1.length > 0 ? (
          <div className={gridColsClass}>
            {batch1.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : null}
      </section>

      {/* ═════════════════════════════════════════════════════════
          3. DYNAMIC MIDDLE BANNER (Between Batch 1 &amp; Batch 2)
             Size: Auto, Slim, Medium, or Full; Video or Image
             0 Side Margin, Direct on Dark Background
         ═════════════════════════════════════════════════════════ */}
      {middleBanner && (
        <section className="w-full relative overflow-hidden px-0 mx-0 my-4 sm:my-6 select-none">
          <Link
            to={middleBanner.link || "/products?category=corporate-gifts"}
            className="block w-full h-full relative group cursor-pointer"
          >
            <SingleBannerMedia banner={middleBanner} theme={theme} />
          </Link>
        </section>
      )}

      {/* ═════════════════════════════════════════════════════════
          4. DIRECT BG PRODUCTS (Batch 2: Executive Products)
             0 Left &amp; Right Margin, Direct on Dynamic Background
         ═════════════════════════════════════════════════════════ */}
      <section className="w-full px-2 sm:px-3 pt-6 pb-10">
        <div
          className="flex items-center justify-between pb-3 px-1 mb-4"
          style={{ borderBottom: `1px solid ${theme.colors.borderColor || "rgba(255,255,255,0.08)"}` }}
        >
          <div>
            <span
              className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] block"
              style={{ color: theme.colors.goldAccent || "#F59E0B" }}
            >
              M PERFORMANCE &amp; EXECUTIVE SUITE
            </span>
            <h2
              className="text-base sm:text-xl font-serif font-bold tracking-wide"
              style={{ color: theme.colors.textPrimary || "#FFFFFF" }}
            >
              Executive Combos &amp; Accessories
            </h2>
          </div>
          <Link
            to="/products?category=corporate-gifts"
            className="text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-colors hover:opacity-80"
            style={{ color: theme.colors.goldAccent || "#F59E0B" }}
          >
            <span>Explore Range</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {productsLoading ? (
          <div className={gridColsClass}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-white/[0.03] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : batch2.length > 0 ? (
          <div className={gridColsClass}>
            {batch2.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : null}
      </section>

      {/* ═════════════════════════════════════════════════════════
          5. DYNAMIC BOTTOM BANNER (Between Batch 2 &amp; Batch 3)
             Size: Auto, Slim, Medium, or Full; Video or Image
             0 Side Margin, Direct on Dark Background
         ═════════════════════════════════════════════════════════ */}
      {bottomBanner && (
        <section className="w-full relative overflow-hidden px-0 mx-0 my-4 sm:my-6 select-none">
          <Link
            to={bottomBanner.link || "/products?category=personalized-gifts"}
            className="block w-full h-full relative group cursor-pointer"
          >
            <SingleBannerMedia banner={bottomBanner} theme={theme} />
          </Link>
        </section>
      )}

      {/* ═════════════════════════════════════════════════════════
          6. DIRECT BG PRODUCTS (Batch 3: Bespoke Keepsakes)
             0 Left &amp; Right Margin, Direct on Dynamic Background
         ═════════════════════════════════════════════════════════ */}
      <section className="w-full px-2 sm:px-3 pt-6 pb-10">
        <div
          className="flex items-center justify-between pb-3 px-1 mb-4"
          style={{ borderBottom: `1px solid ${theme.colors.borderColor || "rgba(255,255,255,0.08)"}` }}
        >
          <div>
            <span
              className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] block"
              style={{ color: theme.colors.primary || "#DC2626" }}
            >
              INDIVIDUALLY CUSTOMIZED
            </span>
            <h2
              className="text-base sm:text-xl font-serif font-bold tracking-wide"
              style={{ color: theme.colors.textPrimary || "#FFFFFF" }}
            >
              Bespoke Laser-Engraved Keepsakes
            </h2>
          </div>
          <Link
            to="/products?category=personalized-gifts"
            className="text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-colors hover:opacity-80"
            style={{ color: theme.colors.goldAccent || "#F59E0B" }}
          >
            <span>Custom Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {productsLoading ? (
          <div className={gridColsClass}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-white/[0.03] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : batch3.length > 0 ? (
          <div className={gridColsClass}>
            {batch3.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
