import React, { useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Filter, X, ChevronDown, SlidersHorizontal, Package } from "lucide-react"
import { catalogApi } from "../../lib/api"
import { ProductCard } from "../../components/ui/ProductCard"
import { SEO } from "../../components/ui/SEO"

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const activeCategory = searchParams.get("category") || ""
  const activeSubCategory = searchParams.get("subCategory") || ""
  const searchQuery = searchParams.get("search") || ""
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""
  const sort = searchParams.get("sort") || "newest"
  const page = parseInt(searchParams.get("page") || "1")

  // Fetch all categories for sidebar
  const { data: categoriesData } = useQuery({
    queryKey: ["all-categories-filter"],
    queryFn: () => catalogApi.getCategories(),
  })
  const categories = categoriesData?.data?.data || []

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products-list", activeCategory, activeSubCategory, searchQuery, minPrice, maxPrice, sort, page],
    queryFn: () =>
      catalogApi.getProducts({
        category: activeCategory || undefined,
        subCategory: activeSubCategory || undefined,
        search: searchQuery || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort: sort || undefined,
        page,
        limit: 20,
      }),
  })

  const products = productsData?.data?.data || []
  const meta = productsData?.data?.meta || { total: 0, totalPages: 1 }

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    next.set("page", "1")
    setSearchParams(next)
  }

  const setCategoryFilter = (catSlug: string, subSlug?: string) => {
    const next = new URLSearchParams(searchParams)
    if (catSlug) next.set("category", catSlug)
    else next.delete("category")

    if (subSlug) next.set("subCategory", subSlug)
    else next.delete("subCategory")

    next.set("page", "1")
    setSearchParams(next)
  }

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const budgetRanges = [
    { label: "All Budgets", min: "", max: "" },
    { label: "Under ₹999", min: "", max: "999" },
    { label: "₹1,000 - ₹2,499", min: "1000", max: "2499" },
    { label: "₹2,500 - ₹4,999", min: "2500", max: "4999" },
    { label: "Above ₹5,000 (VIP)", min: "5000", max: "" },
  ]

  return (
    <div className="w-full px-3 sm:px-6 py-6">
      <SEO
        title="Curated Collections &amp; Hampers — Printed Soul"
        description="Browse our complete collection of Ferrari, BMW, and Legends inspired hampers, corporate onboarding sets, and bespoke laser keepsakes."
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08] mb-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-400 block mb-1">
            HAUTE CURATIONS
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : activeCategory
              ? categories.find((c: any) => c.slug === activeCategory)?.name || "Gifts Collection"
              : "All Gifting Collections"}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Showing {products.length} of {meta.total} bespoke items
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 bg-white/10 rounded-xl text-xs font-semibold text-zinc-200 flex items-center gap-2 hover:bg-white/15 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={(e) => setFilter("sort", e.target.value)}
            className="px-3.5 py-2 bg-[#120306] border border-white/[0.08] rounded-xl text-xs font-semibold text-zinc-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="newest">Sort: Newest Drops</option>
            <option value="bestseller">Sort: VIP Bestsellers</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Connoisseur Rating</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout (Direct on Background) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
        {/* Desktop Sidebar Filters (Direct on Background, No Outer Box) */}
        <div className="hidden lg:block lg:col-span-3 xl:col-span-2 space-y-6 bg-transparent p-0 self-start border-r border-white/[0.06] pr-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-amber-400" /> Filter Catalog
            </span>
            {(activeCategory || activeSubCategory || minPrice || maxPrice || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Category</h4>
            <div className="space-y-1">
              <button
                onClick={() => setCategoryFilter("", "")}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  !activeCategory && !activeSubCategory
                    ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                All Categories
              </button>
              {categories
                .filter((c: any) => !c.parentCategory)
                .map((c: any) => {
                  const subCats = categories.filter((sub: any) => {
                    const pId = typeof sub.parentCategory === "object" ? sub.parentCategory?._id : sub.parentCategory
                    return pId === c._id
                  })
                  const isMainActive = activeCategory === c.slug && !activeSubCategory
                  const hasActiveSub = subCats.some((s: any) => s.slug === activeSubCategory)

                  return (
                    <div key={c._id} className="space-y-0.5">
                      <button
                        onClick={() => setCategoryFilter(c.slug, "")}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                          isMainActive
                            ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30"
                            : hasActiveSub
                            ? "text-amber-300 font-bold"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>{c.name}</span>
                        {subCats.length > 0 && (
                          <span className="text-[10px] text-zinc-500 font-normal">
                            {subCats.length}
                          </span>
                        )}
                      </button>

                      {subCats.length > 0 && (activeCategory === c.slug || hasActiveSub) && (
                        <div className="pl-4 space-y-0.5 border-l border-amber-500/30 ml-3 py-0.5">
                          {subCats.map((sub: any) => {
                            const isSubActive = activeSubCategory === sub.slug
                            return (
                              <button
                                key={sub._id}
                                onClick={() => setCategoryFilter(c.slug, sub.slug)}
                                className={`w-full text-left px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                                  isSubActive
                                    ? "bg-amber-500/20 text-amber-300 font-bold"
                                    : "text-zinc-400 hover:text-amber-300 hover:bg-white/5"
                                }`}
                              >
                                └ {sub.name}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Budget Range Filter */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Filter by Budget
            </h4>
            <div className="space-y-1">
              {budgetRanges.map((range, idx) => {
                const isSelected = minPrice === range.min && maxPrice === range.max
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams)
                      if (range.min) next.set("minPrice", range.min)
                      else next.delete("minPrice")
                      if (range.max) next.set("maxPrice", range.max)
                      else next.delete("maxPrice")
                      next.set("page", "1")
                      setSearchParams(next)
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors ${
                      isSelected
                        ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white font-medium"
                    }`}
                  >
                    {range.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-9 xl:col-span-10">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-2xl bg-[#141418] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center bg-[#121216] rounded-2xl border border-white/10 space-y-3">
              <Package className="w-10 h-10 text-zinc-500 mx-auto" />
              <p className="font-serif font-bold text-lg text-white">No luxury gifts found</p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                We couldn&apos;t find any items matching your current filters. Try adjusting your search keywords or budget range.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-full text-xs font-bold shadow-lg transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-4.5">
              {products.map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-10">
              {[...Array(meta.totalPages)].map((_, idx) => {
                const pageNum = idx + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setFilter("page", pageNum.toString())}
                    className={`w-9 h-9 rounded-xl text-xs font-semibold transition-colors ${
                      page === pageNum
                        ? "bg-red-600 text-white shadow-md shadow-red-900/40"
                        : "bg-[#141418] border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-xs bg-[#111114] border-l border-white/10 h-full p-5 space-y-5 overflow-y-auto text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-bold text-sm text-white font-serif">Filter Gifts</span>
              <button onClick={() => setMobileFilterOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Category</h4>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setFilter("category", "")
                    setMobileFilterOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${
                    !activeCategory ? "bg-amber-500/20 text-amber-300 font-bold" : "text-zinc-400"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c: any) => (
                  <button
                    key={c._id}
                    onClick={() => {
                      setFilter("category", c.slug)
                      setMobileFilterOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${
                      activeCategory === c.slug
                        ? "bg-amber-500/20 text-amber-300 font-bold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Budget</h4>
              <div className="space-y-1">
                {budgetRanges.map((range, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams)
                      if (range.min) next.set("minPrice", range.min)
                      else next.delete("minPrice")
                      if (range.max) next.set("maxPrice", range.max)
                      else next.delete("maxPrice")
                      next.set("page", "1")
                      setSearchParams(next)
                      setMobileFilterOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
