import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, ArrowRight, Sparkles } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { catalogApi } from "../../lib/api"
import { formatPrice, getImageUrl } from "../../lib/utils"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => catalogApi.getProducts({ search: debouncedQuery, limit: 6 }),
    enabled: debouncedQuery.trim().length > 1,
  })

  const results = data?.data?.data || []

  const popularSearches = [
    "Diwali Hampers",
    "Corporate Gifts",
    "Personalized Bottle",
    "Acrylic Lamp",
    "Welcome Kits",
    "Jewelry Box",
  ]

  if (!isOpen) return null

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 border-b border-zinc-100 flex items-center gap-3">
          <Search className="w-6 h-6 text-zinc-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gifts, personalized hampers, lamps, kits..."
            className="w-full text-base sm:text-lg font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-zinc-400 hover:text-zinc-600 p-1 rounded-full hover:bg-zinc-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors shrink-0"
          >
            ESC
          </button>
        </form>

        {/* Popular Tags */}
        {!debouncedQuery && (
          <div className="p-6">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              Popular Gift Searches
            </h4>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    navigate(`/products?search=${encodeURIComponent(term)}`)
                    onClose()
                  }}
                  className="px-3 py-1.5 bg-zinc-50 hover:bg-rose-50 border border-zinc-200/80 hover:border-rose-200 rounded-xl text-xs font-semibold text-zinc-700 hover:text-rose-700 transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Search Results */}
        {debouncedQuery && (
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-zinc-400">Searching gifts...</div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                No gifts found for "{debouncedQuery}". Try another keyword or browse our categories!
              </div>
            ) : (
              results.map((product: any) => (
                <div
                  key={product._id}
                  onClick={() => {
                    navigate(`/products/${product.slug}`)
                    onClose()
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-zinc-50 cursor-pointer transition-colors group"
                >
                  <img
                    src={getImageUrl(product.images?.[0])}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-zinc-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                      {product.name}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-display font-bold text-xs text-zinc-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-[11px] text-zinc-400 line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all mr-2 shrink-0" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
