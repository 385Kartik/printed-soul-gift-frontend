import React, { useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { CheckCircle2, ArrowRight, Package, Truck, Download } from "lucide-react"
import { SEO } from "../../components/ui/SEO"
import { useCart } from "../../context/CartContext"

export function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>()
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart().catch(() => {})
  }, [])

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <SEO title="Order Confirmed! — Printed Soul Gift" />

      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 animate-in zoom-in-75 duration-300">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Payment Successful via PayU
        </span>
        <h1 className="text-3xl font-display font-black text-zinc-900 tracking-tight">
          Thank You for Your Order!
        </h1>
        <p className="text-sm text-zinc-600 max-w-md mx-auto">
          We have received your payment and our master artisans have begun personalizing your gifts.
        </p>
      </div>

      <div className="bg-zinc-50 border border-zinc-200/80 rounded-3xl p-6 text-left space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-500 font-medium">Order Reference:</span>
          <span className="font-mono font-bold text-zinc-900 text-sm">{id}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-500 font-medium">Logistics Partner:</span>
          <span className="font-bold text-zinc-900">Delhivery Express</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-500 font-medium">Invoice &amp; Updates:</span>
          <span className="font-bold text-emerald-600">Sent to your registered email</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link
          to={`/account/orders?query=${id}`}
          className="w-full sm:w-auto px-7 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          <span>Track Order Progress</span>
        </Link>
        <Link
          to="/"
          className="w-full sm:w-auto px-7 py-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 rounded-2xl font-bold text-xs transition-all"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  )
}
