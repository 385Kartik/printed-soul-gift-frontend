import React, { useState, useEffect } from "react"
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
  Heart,
  Home,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { useWishlist } from "../../context/WishlistContext"
import { catalogApi } from "../../lib/api"
import { AuthModal } from "../ui/AuthModal"
import { CartDrawer } from "../ui/CartDrawer"
import { WishlistDrawer } from "../ui/WishlistDrawer"
import { FloatingWhatsApp } from "../ui/FloatingWhatsApp"
import { SearchModal } from "../ui/SearchModal"

export function StoreLayout() {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth()
  const { totalItems, openCart } = useCart()
  const { wishlistCount, openWishlist } = useWishlist()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Fetch dynamic navbar categories configured by admin
  const { data: navbarCategoriesData } = useQuery({
    queryKey: ["navbar-categories"],
    queryFn: () => catalogApi.getNavbarCategories(),
    staleTime: 5 * 60 * 1000,
  })

  const navCategories = navbarCategoriesData?.data?.data || []

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setAccountMenuOpen(false)
    setCollectionsDropdownOpen(false)
    setIsSearchOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0204] text-zinc-100 font-sans overflow-x-hidden w-full selection:bg-red-600 selection:text-white">
      {/* ═════════════════════════════════════════════════════════
          0. TOP ANNOUNCEMENT TICKER (Subtle, VIP Luxury)
         ═════════════════════════════════════════════════════════ */}
      

      {/* ═════════════════════════════════════════════════════════
          1. MAIN LUXURY HEADER (Matching Ferrari VIP Aesthetic)
         ═════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-[#0B0204]/95 backdrop-blur-md border-b border-white/[0.04] w-full">
        <div className="w-full px-3 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-3 sm:gap-4">
            
            {/* Left: Brand Identity Emblem & Monogram */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group py-1">
              <img
                src="/logo-emblem.png"
                alt="Printed Soul"
                className="h-9 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col justify-center">
                <span className="font-logo font-black text-base sm:text-xl tracking-[0.08em] text-white leading-none whitespace-nowrap">
                  PRINTED SOUL
                </span>
                <span className="text-[7px] sm:text-[8px] tracking-[0.25em] font-extrabold text-amber-400 uppercase leading-tight mt-1 whitespace-nowrap">
                  HAUTE LUXURY &amp; GIFTING
                </span>
              </div>
            </Link>

            {/* Center: Clean Luxury Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs sm:text-sm font-semibold tracking-wide">
              {/* Home */}
              <Link
                to="/"
                className={`relative py-1.5 transition-colors hover:text-white ${
                  location.pathname === "/" ? "text-white font-bold" : "text-zinc-300"
                }`}
              >
                <span>Home</span>
                {location.pathname === "/" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E5B54F] rounded-full" />
                )}
              </Link>

              {/* Collections with Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setCollectionsDropdownOpen(true)}
                onMouseLeave={() => setCollectionsDropdownOpen(false)}
              >
                <Link
                  to="/products"
                  className={`flex items-center gap-1.5 py-1.5 transition-colors hover:text-white ${
                    location.pathname.startsWith("/products") && !location.search
                      ? "text-white font-bold"
                      : "text-zinc-300"
                  }`}
                >
                  <span>Collections</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform group-hover:rotate-180" />
                </Link>

                {/* Collections Dropdown Panel */}
                {collectionsDropdownOpen && (
                  <div className="absolute top-full left-0 pt-2 w-64 z-50 animate-in fade-in duration-150">
                    <div className="bg-[#28050E] rounded-xl border border-white/10 shadow-2xl p-2 space-y-1">
                      <Link
                        to="/products"
                        className="block px-3 py-1.5 rounded-lg text-xs font-bold text-amber-400 hover:bg-white/5 transition-colors"
                      >
                        All Collections →
                      </Link>
                      <div className="border-t border-white/5 my-1" />
                      <Link
                        to="/products?category=gift-hampers"
                        className="block px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        🏎️ Motorsport &amp; F1 Specials
                      </Link>
                      <Link
                        to="/products?category=corporate-gifts"
                        className="block px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        💼 Executive VIP Kits
                      </Link>
                      <Link
                        to="/products?category=personalized-gifts"
                        className="block px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        ✨ Bespoke Laser Studio
                      </Link>
                      {navCategories.map((cat: any) => (
                        <Link
                          key={cat._id}
                          to={`/products?category=${cat.slug}`}
                          className="block px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {cat.displayName || cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Gift Hampers */}
              <Link
                to="/products?category=gift-hampers"
                className={`py-1.5 transition-colors hover:text-white ${
                  location.search.includes("gift-hampers") ? "text-white font-bold" : "text-zinc-300"
                }`}
              >
                Gift Hampers
              </Link>

              {/* Corporate Gifting */}
              <Link
                to="/products?category=corporate-gifts"
                className={`py-1.5 transition-colors hover:text-white ${
                  location.search.includes("corporate-gifts") ? "text-white font-bold" : "text-zinc-300"
                }`}
              >
                Corporate Gifting
              </Link>

              {/* Personalised Gifts */}
              <Link
                to="/products?category=personalized-gifts"
                className={`py-1.5 transition-colors hover:text-white ${
                  location.search.includes("personalized-gifts") ? "text-white font-bold" : "text-zinc-300"
                }`}
              >
                Personalised Gifts
              </Link>
            </nav>

            {/* Right: Search, Wishlist, User Profile, VIP Cart Bag */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-zinc-300 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                title="Search luxury gifts"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Heart */}
              <button
                onClick={openWishlist}
                className="relative p-2 text-zinc-300 hover:text-rose-400 hover:bg-white/5 rounded-full transition-colors cursor-pointer hidden sm:block"
                title="View VIP Wishlist"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </button>

              {/* User Profile */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 text-black flex items-center justify-center font-bold text-xs uppercase shadow-md">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden xl:inline text-xs font-semibold text-zinc-200">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
                  </button>

                  {accountMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-[#28050E] rounded-xl shadow-2xl border border-white/10 py-1.5 z-50 animate-in fade-in duration-150"
                      onMouseLeave={() => setAccountMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-white/5">
                        <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-amber-400" /> My Account
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Gift className="w-3.5 h-3.5 text-amber-400" /> My Orders
                      </Link>
                      <div className="border-t border-white/5 my-1" />
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false)
                          logout()
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-white/5 text-left cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="p-2 text-zinc-300 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                  title="VIP Sign In"
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </button>
              )}

              {/* Cart Bag Icon with Red Notification Badge (Matching Ferrari Reference) */}
              <button
                onClick={openCart}
                className="relative p-2 text-zinc-200 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                title="View Gift Bag"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute top-0.5 right-0.5 bg-[#E51B24] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md shadow-red-950/60 ring-1 ring-black">
                  {totalItems}
                </span>
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-zinc-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-Over Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/5 bg-[#1B0309] p-4 space-y-2.5 animate-in slide-in-from-top-4 duration-200">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              All Collections
            </Link>
            <Link
              to="/products?category=gift-hampers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Gift Hampers
            </Link>
            <Link
              to="/products?category=corporate-gifts"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Corporate Gifting
            </Link>
            <Link
              to="/products?category=personalized-gifts"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Personalised Gifts
            </Link>

            <div className="border-t border-white/5 pt-2.5 flex items-center justify-between">
              <a
                href="https://wa.me/918591721436"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-amber-400 flex items-center gap-1.5"
              >
                <span>WhatsApp VIP Concierge</span>
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  openWishlist()
                }}
                className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Wishlist ({wishlistCount})</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ═════════════════════════════════════════════════════════
          MAIN CONTENT AREA (0 Horizontal Margins / Full Bleed)
         ═════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* ═════════════════════════════════════════════════════════
          LUXURY BOUTIQUE FOOTER (Edge-to-Edge)
         ═════════════════════════════════════════════════════════ */}
      <footer className="bg-[#070102] border-t border-white/[0.04] text-zinc-400 pt-10 pb-20 lg:pb-10 mt-6 w-full">
        <div className="w-full px-3 sm:px-6">
          
          {/* Top VIP Concierge Newsletter */}
          <div className="pb-8 border-b border-white/[0.04] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-400 block mb-0.5">
                PRIVATE ACCESS
              </span>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                Printed Soul VIP Gifting Circle
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 max-w-lg">
                Exclusive previews of limited edition drops, executive hampers &amp; bespoke creations.
              </p>
            </div>

            <div className="flex w-full md:w-auto max-w-md gap-2">
              <input
                type="email"
                placeholder="VIP email address..."
                className="w-full sm:w-64 px-3.5 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs rounded-lg shadow-md shrink-0 transition-all cursor-pointer"
              >
                Join Circle
              </button>
            </div>
          </div>

          {/* Links Grid */}
          <div className="py-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-white/[0.04]">
            <div>
              <span className="font-logo font-bold text-base text-white block mb-1.5">
                PRINTED SOUL
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                Curating timeless luxury gift hampers, motorsport collectibles, and bespoke keepsakes.
              </p>
              <p className="text-xs text-amber-400 font-semibold">
                Direct: +91 85917 21436
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Haute Curations
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/products?category=gift-hampers" className="hover:text-white transition-colors">
                    Motorsport &amp; F1 Hampers
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=corporate-gifts" className="hover:text-white transition-colors">
                    Executive Corporate Kits
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=personalized-gifts" className="hover:text-white transition-colors">
                    Laser Engraved Keepsakes
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="hover:text-white transition-colors">
                    Limited Edition Drops
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Client Concierge
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/account/orders" className="hover:text-white transition-colors">
                    Track Express Shipment
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="hover:text-white transition-colors">
                    VIP Account Services
                  </Link>
                </li>
                <li>
                  <a href="https://wa.me/918591721436" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    WhatsApp Concierge
                  </a>
                </li>
                <li>
                  <span className="text-zinc-500">Logistics: Delhivery Express</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                100% Encrypted Checkout
              </h4>
              <p className="text-xs text-zinc-400 mb-2.5 leading-relaxed">
                256-bit encrypted PayU Gateway. UPI, Net Banking, and Cards.
              </p>
              <div className="flex flex-wrap gap-1 text-[9px] font-bold text-zinc-300">
                <span className="bg-white/5 px-2 py-0.5 rounded">UPI</span>
                <span className="bg-white/5 px-2 py-0.5 rounded">Cards</span>
                <span className="bg-white/5 px-2 py-0.5 rounded">Net Banking</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2">
            <p>© {new Date().getFullYear()} Printed Soul Gift. All rights reserved.</p>
            <p className="text-zinc-400 font-serif italic">
              Crafted for those who live the spirit of excellence.
            </p>
          </div>
        </div>
      </footer>

      {/* ═════════════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION (Edge-to-Edge)
         ═════════════════════════════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0204]/95 backdrop-blur-lg border-t border-white/[0.04] py-1.5 px-3 flex items-center justify-around shadow-2xl">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
            location.pathname === "/" ? "text-amber-400 font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>

        <Link
          to="/products"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
            location.pathname.startsWith("/products") ? "text-amber-400 font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Collections</span>
        </Link>

        <button
          onClick={openWishlist}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-zinc-400 hover:text-rose-400 relative cursor-pointer"
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Wishlist</span>
        </button>

        <button
          onClick={openCart}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-zinc-400 hover:text-white relative cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-red-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px]">Bag</span>
        </button>

        <Link
          to="/account/orders"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
            location.pathname.startsWith("/account/orders") ? "text-amber-400 font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px]">Orders</span>
        </Link>
      </nav>

      {/* Modals & Concierge Widget */}
      <AuthModal />
      <CartDrawer />
      <WishlistDrawer />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <FloatingWhatsApp />
    </div>
  )
}
