import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, ArrowRight, Sparkles, Flame } from "lucide-react"
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
    "Ferrari Gift Hamper",
    "BMW Motorsport Collection",
    "Messi World Champion Keepsake",
    "Executive Corporate Kit",
    "Laser Engraved Thermal Flask",
    "Luxury Leather Wallet",
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
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#111114] rounded-3xl shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3">
          <Search className="w-6 h-6 text-amber-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search luxury hampers, motorsport editions, bespoke gifts..."
            className="w-full text-base sm:text-lg font-medium text-white placeholder:text-zinc-500 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold px-3 py-1.5 bg-white/10 hover:bg-white/20 text-zinc-300 rounded-xl transition-colors shrink-0"
          >
            ESC
          </button>
        </form>

        {/* Popular Tags */}
        {!debouncedQuery && (
          <div className="p-6">
            <h4 className="text-xs font-bold text-amber-400/90 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Trending VIP Searches
            </h4>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    navigate(`/products?search=${encodeURIComponent(term)}`)
                    onClose()
                  }}
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 rounded-xl text-xs font-medium text-zinc-300 hover:text-amber-300 transition-all cursor-pointer"
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
              <div className="p-8 text-center text-xs text-zinc-400">Searching luxury collections...</div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No luxury gifts found matching "{debouncedQuery}". Try another keyword.
              </div>
            ) : (
              results.map((product: any) => (
                <div
                  key={product._id}
                  onClick={() => {
                    navigate(`/products/${product.slug}`)
                    onClose()
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all group"
                >
                  <img
                    src={getImageUrl(product.images?.[0])}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0 bg-black"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-xs sm:text-sm text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                      {product.name}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-xs text-white">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-[11px] text-zinc-500 line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all mr-2 shrink-0" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
