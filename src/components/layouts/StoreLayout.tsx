import React, { useState, useRef, useEffect } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import {
  ShoppingBag,
  Search,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Gift,
  Truck,
  Sparkles,
  Phone,
  Heart,
  Home,
  Tag,
  Flame,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { useWishlist } from "../../context/WishlistContext"
import { catalogApi } from "../../lib/api"
import { formatPrice, getImageUrl } from "../../lib/utils"
import { AuthModal } from "../ui/AuthModal"
import { CartDrawer } from "../ui/CartDrawer"
import { WishlistDrawer } from "../ui/WishlistDrawer"
import { FloatingWhatsApp } from "../ui/FloatingWhatsApp"

export function StoreLayout() {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth()
  const { totalItems, totalAmount, openCart } = useCart()
  const { wishlistCount, openWishlist } = useWishlist()
  const navigate = useNavigate()
  const location = useLocation()

  const [searchInput, setSearchInput] = useState("")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  const POPULAR_SEARCHES = [
    "Personalized Diary",
    "Laser Engraved Pen",
    "Diwali Gift Hamper",
    "3D Illusion Lamp",
    "Corporate Kit",
    "Thermal Flask",
  ]

  // Live autocomplete query
  const { data: liveSearchData } = useQuery({
    queryKey: ["live-search", searchInput],
    queryFn: () => catalogApi.getProducts({ search: searchInput.trim(), limit: 6 }),
    enabled: searchInput.trim().length >= 1,
    staleTime: 60 * 1000,
  })
  const liveSearchResults = liveSearchData?.data?.data || []

  // Close search dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(target)
      ) {
        setShowSearchDropdown(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Close search dropdown on route change
  useEffect(() => {
    setShowSearchDropdown(false)
  }, [location.pathname])

  // Fetch dynamic navbar categories configured by admin
  const { data: navbarCategoriesData } = useQuery({
    queryKey: ["navbar-categories"],
    queryFn: () => catalogApi.getNavbarCategories(),
    staleTime: 5 * 60 * 1000,
  })

  const navCategories = navbarCategoriesData?.data?.data || []

  const matchingCategories = React.useMemo(() => {
    const query = searchInput.trim().toLowerCase()
    if (!query) return []
    return navCategories.filter(
      (c: any) =>
        c.displayName?.toLowerCase().includes(query) ||
        c.slug?.toLowerCase().includes(query)
    )
  }, [searchInput, navCategories])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setShowSearchDropdown(false)
      navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  const handleQuickSearch = (term: string) => {
    setSearchInput(term)
    setShowSearchDropdown(false)
    navigate(`/products?search=${encodeURIComponent(term)}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 font-sans">
      {/* ═════════════════════════════════════════════════════════
          0. TOP ANNOUNCEMENT TICKER (Subtle, High Conversion)
         ═════════════════════════════════════════════════════════ */}
      <div className="bg-zinc-950 text-white text-[11px] py-1.5 px-4 font-medium flex items-center justify-center gap-2 tracking-wide border-b border-zinc-800">
        <span className="text-amber-400 font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>FESTIVE SALE</span>
        </span>
        <span className="hidden sm:inline text-zinc-600">•</span>
        <span>Use Code <strong className="text-amber-300 font-mono tracking-wider font-bold">FESTIVE10</strong> for 10% Off</span>
        <span className="hidden md:inline text-zinc-600">•</span>
        <span className="hidden md:inline text-zinc-300">🚚 Free Express Delhivery Pan-India</span>
        <span className="hidden lg:inline text-zinc-600">•</span>
        <span className="hidden lg:inline text-zinc-400">🎁 Luxury Satin Gift Box Included</span>
      </div>

      {/* ═════════════════════════════════════════════════════════
          1. E-COMMERCE MAIN HEADER (Amazon / Flipkart / Giftana style)
         ═════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        {/* Top Tier: Logo, Central Search, Account, Cart */}
        <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4 lg:gap-8">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xl tracking-tight text-zinc-950 leading-none">
                  PRINTED SOUL
                </span>
                <span className="text-[9px] tracking-[0.25em] font-extrabold text-amber-600 uppercase leading-tight mt-1">
                  LUXURY GIFTING
                </span>
              </div>
            </Link>

            {/* Central Search Bar with Smart Autocomplete & Popular Searches */}
            <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-xl relative items-center">
              <form
                onSubmit={handleSearchSubmit}
                className="w-full relative flex items-center"
              >
                <Search className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    setShowSearchDropdown(true)
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Search hampers, personalized gifts, corporate kits..."
                  className="w-full pl-11 pr-28 py-2.5 bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white text-xs sm:text-sm text-zinc-900 rounded-full border border-zinc-200 focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-zinc-400"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-20 text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Smart Search Panel */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-50 animate-in fade-in duration-150">
                  {!searchInput.trim() ? (
                    <div className="p-4 space-y-3.5">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                          <span>Trending Searches</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_SEARCHES.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => handleQuickSearch(term)}
                              className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-amber-100/70 hover:text-amber-950 text-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>

                      {navCategories.length > 0 && (
                        <div className="border-t border-zinc-100 pt-3">
                          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                            Popular Collections
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {navCategories.slice(0, 6).map((cat: any) => (
                              <Link
                                key={cat._id}
                                to={`/products?category=${cat.slug}`}
                                onClick={() => setShowSearchDropdown(false)}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 text-xs font-medium text-zinc-800 transition-colors"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                <span className="truncate">{cat.displayName}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {matchingCategories.length > 0 && (
                        <div className="p-2.5 bg-amber-50/70 border-b border-amber-100 flex items-center gap-2 text-xs flex-wrap">
                          <span className="font-bold text-amber-950 text-[11px]">Matching Collections:</span>
                          {matchingCategories.slice(0, 2).map((c: any) => (
                            <Link
                              key={c._id}
                              to={`/products?category=${c.slug}`}
                              onClick={() => {
                                setShowSearchDropdown(false)
                                setSearchInput("")
                              }}
                              className="px-2.5 py-0.5 bg-white border border-amber-300 text-amber-900 rounded-full font-bold text-[11px] hover:bg-amber-100 transition-colors"
                            >
                              {c.displayName} →
                            </Link>
                          ))}
                        </div>
                      )}

                      {liveSearchResults.length === 0 ? (
                        <div className="p-5 text-center text-xs text-zinc-500 space-y-1">
                          <p className="font-bold text-zinc-800">No gifts found matching "{searchInput}"</p>
                          <p className="text-[11px] text-zinc-400">Try searching for generic terms like 'hamper', 'pen', or 'lamp'.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-zinc-100">
                          <div className="px-4 py-2 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                            <span>Instant Matches</span>
                            <span>{liveSearchResults.length} Gifts</span>
                          </div>
                          {liveSearchResults.map((p: any) => (
                            <div
                              key={p._id}
                              onClick={() => {
                                setShowSearchDropdown(false)
                                setSearchInput("")
                                navigate(`/products/${p.slug}`)
                              }}
                              className="flex items-center gap-3 p-3 hover:bg-zinc-50 transition-colors cursor-pointer"
                            >
                              <img
                                src={getImageUrl(p.images?.[0])}
                                alt=""
                                className="w-11 h-11 rounded-lg object-cover border border-zinc-200 bg-zinc-50 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-zinc-900 truncate hover:text-amber-700">
                                  {p.name}
                                </p>
                                <p className="text-[10px] text-zinc-400">
                                  {p.category?.name || "Gift Set"} • {p.isPersonalizable ? "✨ Personalizable" : "In Stock"}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-bold text-xs text-zinc-950 block">
                                  {formatPrice(p.price)}
                                </span>
                                {p.comparePrice && p.comparePrice > p.price && (
                                  <span className="text-[10px] text-zinc-400 line-through">
                                    {formatPrice(p.comparePrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={handleSearchSubmit}
                            className="w-full py-2.5 bg-zinc-50 hover:bg-zinc-100 text-center text-xs font-bold text-amber-700 transition-colors block cursor-pointer"
                          >
                            Press Enter to see all results for "{searchInput}" →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Action Items */}
            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
              {/* Wishlist Button with Live Count Badge */}
              <button
                onClick={openWishlist}
                className="relative p-2 text-zinc-700 hover:text-rose-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
                aria-label="View Wishlist"
                title="Saved Wishlist"
              >
                <Heart className="w-5 h-5 text-zinc-800 hover:text-rose-600 transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </button>

              {/* User Account / Sign In */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-zinc-100 text-zinc-800 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="hidden xl:flex flex-col text-left">
                      <span className="text-[10px] text-zinc-400 leading-none">Account</span>
                      <span className="text-xs font-bold text-zinc-800 truncate max-w-[80px]">
                        {user?.name?.split(" ")[0]}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
                  </button>

                  {accountMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-50"
                      onMouseLeave={() => setAccountMenuOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-zinc-100">
                        <p className="text-xs font-bold text-zinc-900 truncate">{user?.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                      >
                        <User className="w-3.5 h-3.5" /> My Account
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                      >
                        <Gift className="w-3.5 h-3.5" /> My Orders
                      </Link>
                      <div className="border-t border-zinc-100 my-1" />
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false)
                          logout()
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-zinc-800 hover:text-amber-700 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-zinc-500" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Shopping Cart Pill */}
              <button
                onClick={openCart}
                className="flex items-center gap-2.5 px-3.5 py-2 bg-zinc-900 hover:bg-black text-white rounded-full transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                aria-label="View Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 text-white" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-amber-500 text-zinc-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-bold">
                  {totalAmount > 0 ? formatPrice(totalAmount) : "Cart"}
                </span>
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-zinc-700 hover:bg-zinc-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar with Smart Autocomplete */}
          <div ref={mobileSearchRef} className="md:hidden pb-3 relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  setShowSearchDropdown(true)
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Search gifts, hampers, combos..."
                className="w-full pl-3 pr-16 py-2 bg-zinc-100 text-xs text-zinc-900 rounded-full border border-zinc-200 focus:outline-none focus:border-amber-600"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-10 text-zinc-400 hover:text-zinc-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1 px-3 py-1.5 bg-amber-600 text-white rounded-full text-xs"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Mobile Smart Search Panel */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden z-50 animate-in fade-in duration-150 max-h-80 overflow-y-auto">
                {!searchInput.trim() ? (
                  <div className="p-3 space-y-3">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-600" />
                      <span>Trending Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {POPULAR_SEARCHES.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => handleQuickSearch(term)}
                          className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-medium"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    {matchingCategories.length > 0 && (
                      <div className="p-2 bg-amber-50 border-b border-amber-100 flex items-center gap-1.5 text-[11px] flex-wrap">
                        <span className="font-bold text-amber-950">Category:</span>
                        {matchingCategories.slice(0, 2).map((c: any) => (
                          <Link
                            key={c._id}
                            to={`/products?category=${c.slug}`}
                            onClick={() => {
                              setShowSearchDropdown(false)
                              setSearchInput("")
                            }}
                            className="px-2 py-0.5 bg-white border border-amber-300 text-amber-900 rounded-full font-bold text-[10px]"
                          >
                            {c.displayName} →
                          </Link>
                        ))}
                      </div>
                    )}

                    {liveSearchResults.length === 0 ? (
                      <div className="p-3 text-center text-xs text-zinc-400">
                        No gifts matching "{searchInput}"
                      </div>
                    ) : (
                      <div className="divide-y divide-zinc-100">
                        {liveSearchResults.map((p: any) => (
                          <div
                            key={p._id}
                            onClick={() => {
                              setShowSearchDropdown(false)
                              setSearchInput("")
                              navigate(`/products/${p.slug}`)
                            }}
                            className="flex items-center gap-2.5 p-2.5 hover:bg-zinc-50 transition-colors cursor-pointer"
                          >
                            <img
                              src={getImageUrl(p.images?.[0])}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover border border-zinc-200 bg-zinc-50 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-zinc-900 truncate">
                                {p.name}
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                {p.category?.name || "Gift"} • {formatPrice(p.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full py-2 bg-zinc-50 text-center text-xs font-bold text-amber-700 transition-colors block"
                        >
                          View all results →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tier 2: Sleek Modern Category Strip (Clean, Light, Luxury) */}
        <div className="hidden lg:block bg-white border-t border-zinc-100">
          <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-2 text-xs">
              <div className="flex items-center gap-1 xl:gap-2">
                <Link
                  to="/products"
                  className="px-3 py-1.5 rounded-full font-bold text-zinc-900 hover:bg-zinc-100 transition-colors whitespace-nowrap flex items-center gap-1.5 bg-zinc-100/80"
                >
                  <span className="text-amber-600">⚡</span>
                  <span>All Gifts</span>
                </Link>

                {navCategories.map((cat: any) => (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat.slug}`}
                    className="px-3 py-1.5 rounded-full font-medium text-zinc-700 hover:text-amber-700 hover:bg-amber-50/60 transition-colors whitespace-nowrap text-xs"
                  >
                    {cat.displayName}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/products?category=corporate-gifts"
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <span>💼</span>
                  <span>Corporate Catalog</span>
                </Link>
                <Link
                  to="/products?category=personalized-gifts"
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <span>✨</span>
                  <span>Custom Engraving</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-1 shadow-lg">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-slate-900 hover:bg-slate-50 rounded-lg"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              All Gifts Catalog
            </Link>
            {navCategories.map((cat: any) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {cat.displayName}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                openWishlist()
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 rounded-lg flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>My Wishlist</span>
              </span>
              {wishlistCount > 0 && (
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>
            <Link
              to="/account/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-bold text-zinc-900 hover:bg-zinc-50 rounded-lg flex items-center gap-2"
            >
              <Gift className="w-4 h-4 text-zinc-700" />
              <span>My Orders &amp; Tracking</span>
            </Link>
          </div>
        )}
      </header>

      {/* ═════════════════════════════════════════════════════════
          2. MAIN CONTENT OUTLET
         ═════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full pb-16 lg:pb-0">
        <Outlet />
      </main>

      {/* ═════════════════════════════════════════════════════════
          3. FOOTER (Amazon / Flipkart rich footer standard)
         ═════════════════════════════════════════════════════════ */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-14 pb-10 mt-12">
        <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold">
                  <Gift className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-serif font-bold text-lg tracking-tight">
                  PRINTED SOUL GIFT
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                India&apos;s trusted gifting brand for luxury festive hampers, corporate onboarding kits,
                and precision laser-engraved personalized keepsakes.
              </p>
              <div className="pt-1 text-xs text-slate-500 space-y-1">
                <p>📍 Mumbai, Maharashtra, India</p>
                <p>✉️ support@printedsoulgift.com</p>
                <p>🚚 Dispatch &amp; Logistics: Delhivery Express One</p>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-4">
                Curated Hampers
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link to="/products?category=diwali-gifts" className="hover:text-white transition-colors">
                    Diwali Gift Hampers
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=corporate-gifts" className="hover:text-white transition-colors">
                    Corporate Welcome Kits
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=personalized-gifts" className="hover:text-white transition-colors">
                    Personalized Gifts
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=birthday-gifts" className="hover:text-white transition-colors">
                    Birthday Specials
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-4">
                Customer Care
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link to="/account/orders" className="hover:text-white transition-colors">
                    Track Your Order
                  </Link>
                </li>
                <li>
                  <Link to="/account/orders" className="hover:text-white transition-colors">
                    Order History
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors">
                    Shipping &amp; Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About Printed Soul
                  </Link>
                </li>
              </ul>
            </div>

            {/* Payment & Security */}
            <div>
              <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-4">
                100% Secure Checkout
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Encrypted transactions via PayU Gateway. Supporting all major banks, UPI &amp; Cards.
              </p>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-300">
                <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">UPI</span>
                <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">Credit Cards</span>
                <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">Net Banking</span>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Printed Soul Gift. All rights reserved.</p>
            <p className="text-slate-500">
              Meticulously crafted for meaningful corporate &amp; personal gifting.
            </p>
          </div>
        </div>
      </footer>

      {/* ═════════════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION (Flipkart / Myntra Native Style)
         ═════════════════════════════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 py-1.5 px-3 flex items-center justify-around shadow-2xl">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
            location.pathname === "/" ? "text-amber-700 font-bold" : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>

        <Link
          to="/products"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
            location.pathname.startsWith("/products") ? "text-amber-700 font-bold" : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">All Gifts</span>
        </Link>

        <button
          onClick={openWishlist}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-zinc-600 hover:text-rose-600 relative cursor-pointer"
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Wishlist</span>
        </button>

        <button
          onClick={openCart}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-zinc-600 hover:text-zinc-950 relative cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-amber-500 text-zinc-950 text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px]">Cart</span>
        </button>

        <Link
          to="/account/orders"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
            location.pathname.startsWith("/account/orders") ? "text-amber-700 font-bold" : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px]">Orders</span>
        </Link>
      </nav>

      {/* Modals, Drawers & WhatsApp Widget */}
      <AuthModal />
      <CartDrawer />
      <WishlistDrawer />
      <FloatingWhatsApp />
    </div>
  )
}
