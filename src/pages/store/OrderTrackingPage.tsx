import React, { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { orderApi } from "../../lib/api"
import { formatPrice, formatDate, getImageUrl } from "../../lib/utils"
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, ExternalLink, Download, ArrowLeft } from "lucide-react"
import { SEO } from "../../components/ui/SEO"

const STEPS = [
  { id: "pending", label: "Order Placed", desc: "We received your order" },
  { id: "processing", label: "Crafting & Personalizing", desc: "Engraving your custom details" },
  { id: "packed", label: "Packed in Luxury Box", desc: "Quality checked & ready for courier" },
  { id: "shipped", label: "Dispatched via Delhivery", desc: "In transit with courier partner" },
  { id: "delivered", label: "Delivered", desc: "Gift package delivered safely" },
]

export function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get("query") || ""
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [activeQuery, setActiveQuery] = useState(initialQuery)

  useEffect(() => {
    if (initialQuery) {
      setSearchInput(initialQuery)
      setActiveQuery(initialQuery)
    }
  }, [initialQuery])

  const { data, isLoading, isError } = useQuery({
    queryKey: ["track-order", activeQuery],
    queryFn: () => orderApi.trackOrder(activeQuery),
    enabled: !!activeQuery.trim(),
    retry: false,
  })

  const order = data?.data?.data?.order
  const liveTracking = data?.data?.data?.liveTracking

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setActiveQuery(searchInput.trim())
      setSearchParams({ query: searchInput.trim() })
    }
  }

  const getStepStatus = (stepId: string, currentStatus: string) => {
    const orderSequence = ["pending", "processing", "packed", "shipped", "delivered"]
    const currentIndex = orderSequence.indexOf(currentStatus)
    const stepIndex = orderSequence.indexOf(stepId)

    if (currentStatus === "cancelled") return "cancelled"
    if (currentStatus === "refunded") return "refunded"
    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "current"
    return "upcoming"
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <SEO title="Live Order Tracking — Printed Soul Gift" />

      <div>
        <Link to="/" className="inline-flex items-center text-xs font-bold text-zinc-500 hover:text-zinc-900 mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Store
        </Link>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-zinc-900 tracking-tight">
          Track Your Gift Order
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Enter your Order ID (e.g. PSG-10001) or Delhivery AWB number to check real-time shipment status.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-zinc-100 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. PSG-10001 or 123456789012"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-zinc-900"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-zinc-900 hover:bg-black text-white rounded-2xl font-bold text-xs shadow-md transition-all shrink-0"
          >
            Track Status
          </button>
        </form>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-white p-12 rounded-3xl border border-zinc-100 text-center text-xs text-zinc-400">
          Fetching live courier status from Delhivery...
        </div>
      )}

      {/* Error / Not Found */}
      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium p-6 rounded-3xl text-center">
          No order found matching "{activeQuery}". Please double check your order number or AWB.
        </div>
      )}

      {/* Order Info Card */}
      {order && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Status Header */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-base text-zinc-900">{order.orderNumber}</span>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    order.status === "delivered"
                      ? "bg-emerald-100 text-emerald-800"
                      : order.status === "cancelled" || order.status === "refunded"
                      ? "bg-red-100 text-red-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {order.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-zinc-500">Ordered on {formatDate(order.createdAt)} • Prepaid via PayU</p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={orderApi.getInvoiceUrl(order._id)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Invoice PDF</span>
              </a>

              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Delhivery Live</span>
                </a>
              )}
            </div>
          </div>

          {/* Delhivery AWB Banner */}
          {order.trackingNumber && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-[11px] text-blue-600 font-semibold">Delhivery Waybill AWB:</p>
                  <p className="font-mono font-bold text-xs text-blue-950">{order.trackingNumber}</p>
                </div>
              </div>
              <span className="text-[10px] bg-blue-200/60 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                Express Surface
              </span>
            </div>
          )}

          {/* Step Timeline */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6">Shipment Timeline</h3>
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
              {STEPS.map((step) => {
                const status = getStepStatus(step.id, order.status)
                const isCompleted = status === "completed"
                const isCurrent = status === "current"

                return (
                  <div key={step.id} className="relative">
                    <div
                      className={`absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white ${
                        isCompleted
                          ? "bg-emerald-600"
                          : isCurrent
                          ? "bg-rose-600 ring-4 ring-rose-100"
                          : "bg-zinc-200 text-zinc-400"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3 h-3" />}
                    </div>
                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          isCurrent ? "text-rose-600" : isCompleted ? "text-zinc-900" : "text-zinc-400"
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ordered Gift Items */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Gift Items in this Order</h3>
            <div className="space-y-3">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-zinc-100 last:border-0 last:pb-0">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-zinc-900">{item.name}</h5>
                    {item.customText && (
                      <p className="text-[11px] text-rose-600 font-semibold">
                        ✨ Engraved: "{item.customText}"
                      </p>
                    )}
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="font-display font-bold text-xs text-zinc-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-100 flex justify-between items-center text-xs font-bold text-zinc-900">
              <span>Total Paid</span>
              <span className="text-rose-600 font-display text-base">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
