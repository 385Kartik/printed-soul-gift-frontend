import React, { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { orderApi } from "../../lib/api"
import { formatPrice, formatDate, getImageUrl } from "../../lib/utils"
import { useAuth } from "../../context/AuthContext"
import {
  Search,
  Gift,
  Truck,
  Download,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react"
import { SEO } from "../../components/ui/SEO"

const STEPS = [
  { id: "pending", label: "Order Placed", desc: "We received your order and payment" },
  { id: "processing", label: "Crafting & Personalizing", desc: "Engraving names & custom details" },
  { id: "packed", label: "Packed in Luxury Box", desc: "Quality inspected with satin ribbon" },
  { id: "shipped", label: "Dispatched via Delhivery", desc: "Handed over to courier partner" },
  { id: "delivered", label: "Delivered Safely", desc: "Gift package delivered to recipient" },
]

function getStepStatus(stepId: string, currentStatus: string) {
  const orderSequence = ["pending", "processing", "packed", "shipped", "delivered"]
  const currentIndex = orderSequence.indexOf(currentStatus)
  const stepIndex = orderSequence.indexOf(stepId)

  if (currentStatus === "cancelled") return "cancelled"
  if (currentStatus === "refunded") return "refunded"
  if (stepIndex < currentIndex) return "completed"
  if (stepIndex === currentIndex) return "current"
  return "upcoming"
}

export function OrdersPage() {
  const { isAuthenticated, openAuthModal } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get("query") || searchParams.get("order") || ""
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [activeQuery, setActiveQuery] = useState(initialQuery)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (initialQuery) {
      setSearchInput(initialQuery)
      setActiveQuery(initialQuery)
    }
  }, [initialQuery])

  // 1. Live Delhivery tracker query (for searched order/AWB)
  const {
    data: trackData,
    isLoading: isTrackingLoading,
    isError: isTrackingError,
  } = useQuery({
    queryKey: ["track-order-search", activeQuery],
    queryFn: () => orderApi.trackOrder(activeQuery),
    enabled: !!activeQuery.trim(),
    retry: false,
  })

  const trackedOrder = trackData?.data?.data?.order

  // 2. User's order history query (if logged in)
  const { data: myOrdersData, isLoading: isMyOrdersLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => orderApi.getMyOrders(),
    enabled: isAuthenticated,
  })

  const orders = myOrdersData?.data?.data || []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setActiveQuery(searchInput.trim())
      setSearchParams({ query: searchInput.trim() })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <SEO title="My Orders & Tracking — Printed Soul Gift" />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-zinc-950 tracking-tight">
          My Orders &amp; Live Tracking
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Check real-time Delhivery shipment status, view past orders, and download tax invoices.
        </p>
      </div>

      {/* ═════════════════════════════════════════════════════════
          1. DIRECT ORDER / DELHIVERY AWB TRACKER TOOL
         ═════════════════════════════════════════════════════════ */}
      <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-zinc-900">
          <Truck className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold">Track Any Order or Delhivery AWB</h2>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Order ID (e.g. PSG-10001) or Delhivery AWB..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 bg-white text-xs sm:text-sm font-medium focus:outline-none focus:border-zinc-900 shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-zinc-950 hover:bg-black text-white rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Track Status
          </button>
        </form>

        {/* Tracker Results Box */}
        {isTrackingLoading && (
          <div className="p-6 bg-white rounded-xl border border-zinc-200 text-center text-xs text-zinc-500">
            Fetching live shipment tracking details from Delhivery...
          </div>
        )}

        {isTrackingError && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs font-medium">
            No order found matching "{activeQuery}". Please verify the Order Number (e.g. PSG-10001) or Delhivery AWB.
          </div>
        )}

        {trackedOrder && (
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200 space-y-5 animate-in fade-in duration-300">
            {/* Header with status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm sm:text-base text-zinc-950">
                    {trackedOrder.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      trackedOrder.status === "delivered"
                        ? "bg-emerald-100 text-emerald-800"
                        : trackedOrder.status === "cancelled" || trackedOrder.status === "refunded"
                        ? "bg-red-100 text-red-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {trackedOrder.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Placed on {formatDate(trackedOrder.createdAt)} • {formatPrice(trackedOrder.totalAmount)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={orderApi.getInvoiceUrl(trackedOrder._id)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Invoice PDF</span>
                </a>
                {trackedOrder.trackingUrl && (
                  <a
                    href={trackedOrder.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Delhivery Portal</span>
                  </a>
                )}
              </div>
            </div>

            {/* AWB info banner */}
            {trackedOrder.trackingNumber && (
              <div className="bg-blue-50/70 border border-blue-100 p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-blue-600 font-semibold block text-[11px]">Delhivery AWB Number:</span>
                    <span className="font-mono font-bold text-blue-950">{trackedOrder.trackingNumber}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-200/60 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                  Express Surface
                </span>
              </div>
            )}

            {/* 5-Step Timeline */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                Shipment Progress
              </h3>
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
                {STEPS.map((step) => {
                  const status = getStepStatus(step.id, trackedOrder.status)
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
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
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

            {/* Items summary */}
            <div className="pt-4 border-t border-zinc-100">
              <h4 className="text-xs font-bold text-zinc-700 mb-3">Items in this Package:</h4>
              <div className="space-y-2">
                {trackedOrder.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                    <img
                      src={getImageUrl(item.image)}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover border border-zinc-200"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-zinc-900 truncate">{item.name}</p>
                      {item.customText && (
                        <p className="text-[11px] text-rose-600 font-medium">✨ "{item.customText}"</p>
                      )}
                      <p className="text-[11px] text-zinc-400">Qty: {item.quantity} • {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════
          2. USER'S ORDER HISTORY LIST
         ═════════════════════════════════════════════════════════ */}
      <div className="pt-4">
        <h2 className="text-lg font-bold text-zinc-950 mb-3">Your Order History</h2>

        {!isAuthenticated ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-zinc-200 shadow-2xs space-y-3">
            <ShieldCheck className="w-10 h-10 text-zinc-400 mx-auto" />
            <h3 className="font-bold text-sm text-zinc-800">Sign in to View Your Full History</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Sign in with your phone or email to view all your previous orders, live tracking timelines, and invoices.
            </p>
            <button
              onClick={openAuthModal}
              className="mt-2 px-6 py-2 bg-zinc-950 hover:bg-black text-white rounded-full text-xs font-bold cursor-pointer"
            >
              Sign In to Account
            </button>
          </div>
        ) : isMyOrdersLoading ? (
          <div className="p-8 text-center text-xs text-zinc-400">Loading your past orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-zinc-200 shadow-2xs space-y-3">
            <Gift className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="font-bold text-sm text-zinc-800">No Orders Yet</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              You haven't placed any gift orders yet. Start surprising your loved ones today!
            </p>
            <Link
              to="/products"
              className="inline-block mt-2 px-6 py-2.5 bg-zinc-950 hover:bg-black text-white rounded-full text-xs font-bold transition-colors"
            >
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const isExpanded = expandedOrderId === order._id

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs hover:border-zinc-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                    <div>
                      <span className="font-mono font-bold text-xs sm:text-sm text-zinc-950">
                        {order.orderNumber}
                      </span>
                      <p className="text-[11px] text-zinc-400">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
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
                      <span className="font-display font-bold text-sm text-zinc-950">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Items Thumbnails */}
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 shrink-0">
                        <img
                          src={getImageUrl(item.image)}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-zinc-100"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-zinc-800 truncate max-w-[140px]">{item.name}</p>
                          <p className="text-[10px] text-zinc-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Bar with inline timeline toggle */}
                  <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{isExpanded ? "Hide Tracking" : "Live Delhivery Tracking"}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <a
                      href={orderApi.getInvoiceUrl(order._id)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </a>
                  </div>

                  {/* Inline Expanded Shipment Timeline */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-zinc-100 bg-zinc-50/70 p-4 rounded-xl space-y-4 animate-in fade-in duration-200">
                      {order.trackingNumber && (
                        <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-zinc-200">
                          <div className="flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                            <span className="font-mono font-bold text-zinc-800">
                              AWB: {order.trackingNumber}
                            </span>
                          </div>
                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline font-bold text-[11px] flex items-center gap-1"
                            >
                              <span>Track on Delhivery</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}

                      <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
                        {STEPS.map((step) => {
                          const status = getStepStatus(step.id, order.status)
                          const isCompleted = status === "completed"
                          const isCurrent = status === "current"

                          return (
                            <div key={step.id} className="relative">
                              <div
                                className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white ${
                                  isCompleted
                                    ? "bg-emerald-600"
                                    : isCurrent
                                    ? "bg-rose-600 ring-2 ring-rose-100"
                                    : "bg-zinc-200 text-zinc-400"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <Clock className="w-2.5 h-2.5" />
                                )}
                              </div>
                              <div>
                                <h4
                                  className={`text-xs font-bold ${
                                    isCurrent
                                      ? "text-rose-600"
                                      : isCompleted
                                      ? "text-zinc-900"
                                      : "text-zinc-400"
                                  }`}
                                >
                                  {step.label}
                                </h4>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{step.desc}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
