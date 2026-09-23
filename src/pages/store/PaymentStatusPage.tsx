import React, { useEffect } from "react"
import { useParams, useSearchParams, Link, useLocation } from "react-router-dom"
import {
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Home,
} from "lucide-react"
import { SEO } from "../../components/ui/SEO"
import { useCart } from "../../context/CartContext"
import { formatPrice } from "../../lib/utils"

export function PaymentStatusPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { clearCart } = useCart()

  const rawStatus = searchParams.get("status")?.toLowerCase() || ""
  const isOrderSuccessPath = location.pathname.includes("order-success")
  const isSuccess = isOrderSuccessPath || rawStatus === "success"

  const orderNumber = searchParams.get("order") || id || ""
  const amount = searchParams.get("amount")
  const failReason = searchParams.get("reason") || ""

  // Clear customer cart on successful payment
  useEffect(() => {
    if (isSuccess) {
      clearCart().catch(() => {})
    }
  }, [isSuccess])

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <SEO
        title={
          isSuccess
            ? "Payment Successful! — Printed Soul Gift"
            : "Payment Incomplete — Printed Soul Gift"
        }
      />

      <div className="w-full max-w-lg bg-white rounded-3xl border border-zinc-200/90 shadow-xl p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Status Icon Header */}
        {isSuccess ? (
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>
          </div>
        ) : (
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-25" />
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
              <XCircle className="w-12 h-12 stroke-[2.5]" />
            </div>
          </div>
        )}

        {/* Status Headings */}
        <div className="space-y-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${
              isSuccess
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {isSuccess ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Payment Confirmed via PayU</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Payment Failed or Cancelled</span>
              </>
            )}
          </span>

          <h1 className="text-2xl sm:text-3xl font-display font-black text-zinc-900 tracking-tight">
            {isSuccess ? "Thank You for Your Order!" : "Payment Was Not Completed"}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-md mx-auto">
            {isSuccess
              ? "We have verified your payment and our master artisans have begun personalizing your gift items."
              : "Your payment attempt was cancelled or could not be processed. If any money was debited from your bank or UPI, it will be automatically refunded within 3-5 business days as per standard banking rules."}
          </p>

          {!isSuccess && failReason && (
            <p className="text-[11px] text-rose-600 bg-rose-50/80 px-3 py-1.5 rounded-lg border border-rose-200 font-mono inline-block">
              {decodeURIComponent(failReason)}
            </p>
          )}
        </div>

        {/* Order Details Receipt Box */}
        {orderNumber && (
          <div className="bg-zinc-50/80 border border-zinc-200/80 rounded-2xl p-4 sm:p-5 text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60">
              <span className="text-zinc-500 font-medium">Order Number</span>
              <span className="font-mono font-black text-zinc-900 text-sm">
                #{orderNumber}
              </span>
            </div>

            {amount && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Total Amount</span>
                <span className="font-bold text-zinc-900 text-sm">
                  {formatPrice(amount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-medium">Payment Status</span>
              <span
                className={`font-bold ${
                  isSuccess ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {isSuccess ? "Paid and Confirmed" : "Failed / Cancelled"}
              </span>
            </div>

            {isSuccess && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Courier Partner</span>
                <span className="font-bold text-zinc-900 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Delhivery Express</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* User Action Buttons based on Payment Result */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isSuccess ? (
            <>
              {/* If Success: Primary button is Go to My Orders */}
              <Link
                to={`/account/orders?query=${orderNumber}`}
                className="w-full sm:w-auto px-7 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Go to My Orders</span>
              </Link>

              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
            </>
          ) : (
            <>
              {/* If Failed: Primary button is Home Page */}
              <Link
                to="/"
                className="w-full sm:w-auto px-7 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Go to Home Page</span>
              </Link>

              <Link
                to="/cart"
                className="w-full sm:w-auto px-6 py-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry from Cart</span>
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
