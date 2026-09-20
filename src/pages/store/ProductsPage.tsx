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
    queryKey: ["products-list", activeCategory, searchQuery, minPrice, maxPrice, sort, page],
    queryFn: () =>
      catalogApi.getProducts({
        category: activeCategory || undefined,
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

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const budgetRanges = [
    { label: "All Budgets", min: "", max: "" },
    { label: "Under ₹500", min: "", max: "500" },
    { label: "₹500 - ₹1,000", min: "500", max: "1000" },
    { label: "₹1,000 - ₹2,000", min: "1000", max: "2000" },
    { label: "Above ₹2,000", min: "2000", max: "" },
  ]

  return (
    <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
      <SEO
        title="Browse All Gifts &amp; Hampers — Printed Soul Gift"
        description="Browse our complete collection of personalized gifts, corporate hampers, and festive boxes."
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-950 tracking-tight">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : activeCategory
              ? categories.find((c: any) => c.slug === activeCategory)?.name || "Gifts Collection"
              : "All Gifting Collections"}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Showing {products.length} of {meta.total} gift products
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 flex items-center gap-2 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={(e) => setFilter("sort", e.target.value)}
            className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:outline-none focus:border-amber-600 shadow-xs cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="bestseller">Sort: Best Sellers</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Customer Rating</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-3 xl:col-span-2 space-y-6 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs self-start">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-amber-700" /> Filter Catalog
            </span>
            {(activeCategory || minPrice || maxPrice || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-semibold text-amber-700 hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">Category</h4>
            <div className="space-y-1">
              <button
                onClick={() => setFilter("category", "")}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !activeCategory
                    ? "bg-amber-50 text-amber-900 font-bold border border-amber-200"
                    : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                All Categories
              </button>
              {categories.map((c: any) => (
                <button
                  key={c._id}
                  onClick={() => setFilter("category", c.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    activeCategory === c.slug
                      ? "bg-amber-50 text-amber-900 font-bold border border-amber-200"
                      : "text-zinc-600 hover:bg-zinc-50 font-medium"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range Filter */}
          <div>
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">
              Shop by Budget
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
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? "bg-amber-50 text-amber-900 font-bold border border-amber-200"
                        : "text-zinc-600 hover:bg-zinc-50 font-medium"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-zinc-100 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-xl border border-zinc-200/80 space-y-3">
              <Package className="w-10 h-10 text-zinc-300 mx-auto" />
              <p className="font-serif font-bold text-lg text-zinc-900">No gifts found</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                We couldn&apos;t find any products matching your current filters. Try changing your search or budget.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-2 px-5 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5">
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
                    className={`w-9 h-9 rounded-lg text-xs font-semibold transition-colors ${
                      page === pageNum
                        ? "bg-zinc-950 text-white shadow-xs"
                        : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
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
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-5 space-y-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <span className="font-bold text-sm text-zinc-900">Filter Gifts</span>
              <button onClick={() => setMobileFilterOpen(false)} className="text-zinc-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">Category</h4>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setFilter("category", "")
                    setMobileFilterOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                    !activeCategory ? "bg-amber-50 text-amber-900 font-bold" : "text-zinc-600"
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
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                      activeCategory === c.slug
                        ? "bg-amber-50 text-amber-900 font-bold"
                        : "text-zinc-600"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">Budget</h4>
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
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-zinc-600"
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
