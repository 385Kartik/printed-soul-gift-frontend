import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { addressApi, orderApi } from "../../lib/api"
import { formatPrice, getImageUrl } from "../../lib/utils"
import { ShieldCheck, Lock, MapPin, Truck, Loader2, ArrowRight, Home, Building2, Briefcase } from "lucide-react"
import { SEO } from "../../components/ui/SEO"

export function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart()
  const { user, isAuthenticated, openAuthModal } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form inputs
  const [fullName, setFullName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("Maharashtra")
  const [pincode, setPincode] = useState("")
  const [notes, setNotes] = useState("")

  // Saved addresses
  const { data: addressesData } = useQuery({
    queryKey: ["checkout-addresses"],
    queryFn: () => addressApi.getAll(),
    enabled: !!isAuthenticated,
  })
  const savedAddresses = addressesData?.data?.data || []
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")

  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name || "")
      if (!email) setEmail(user.email || "")
      if (!phone && user.phone) setPhone(user.phone)
    }
  }, [user])

  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddressId) {
      const def = savedAddresses.find((a: any) => a.isDefault) || savedAddresses[0]
      if (def) {
        selectAddress(def)
      }
    }
  }, [savedAddresses])

  const selectAddress = (addr: any) => {
    setSelectedAddressId(addr._id)
    setFullName(addr.fullName)
    setPhone(addr.phone)
    setStreet(addr.street)
    setCity(addr.city)
    setState(addr.state)
    setPincode(addr.pincode)
  }

  const shippingCharge = 0
  const finalTotal = totalAmount

  // Handle PayU Submit
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!fullName || !email || !phone || !street || !city || !state || !pincode) {
      setError("Please complete all shipping address fields.")
      return
    }

    if (items.length === 0) {
      setError("Your cart is empty.")
      return
    }

    setLoading(true)

    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.product._id,
          quantity: i.quantity,
          customText: i.customText,
          customImage: i.customImage,
        })),
        shippingAddress: {
          fullName,
          phone,
          street,
          city,
          state,
          pincode,
          country: "India",
        },
        guestEmail: email,
        guestName: fullName,
        guestPhone: phone,
        notes,
      }

      const res = await orderApi.create(payload)
      const { payu } = res.data.data

      if (!payu || !payu.actionUrl) {
        throw new Error("Failed to initialize payment gateway")
      }

      // Auto-submit hidden form to PayU
      const form = document.createElement("form")
      form.method = "POST"
      form.action = payu.actionUrl

      const fields: Record<string, any> = {
        key: payu.key,
        txnid: payu.txnid,
        amount: payu.amount,
        productinfo: payu.productinfo,
        firstname: payu.firstname,
        email: payu.email,
        phone: payu.phone,
        surl: payu.surl,
        furl: payu.furl,
        hash: payu.hash,
      }

      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = key
        input.value = String(value)
        form.appendChild(input)
      }

      document.body.appendChild(form)
      form.submit()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to proceed to payment")
      setLoading(false)
    }
  }

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
  ]

  return (
    <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-10">
      <SEO title="Secure Checkout — Printed Soul Gift" />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between pb-6 border-b border-zinc-100 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-zinc-900 tracking-tight">
              Delivery &amp; Payment
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Complete your shipping address to proceed to secure PayU payment.
            </p>
          </div>

          {!isAuthenticated && (
            <button
              onClick={openAuthModal}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-2 rounded-xl"
            >
              Sign In for Saved Addresses
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-2xl">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Address Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Addresses Selector (if logged in) */}
            {savedAddresses.length > 0 && (
              <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                  Select Saved Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr: any) => (
                    <div
                      key={addr._id}
                      onClick={() => selectAddress(addr)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedAddressId === addr._id
                          ? "border-rose-600 bg-rose-50/40 shadow-sm"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 mb-1">
                        {addr.label === "Office" ? (
                          <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                        ) : addr.label === "Work" ? (
                          <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                        ) : (
                          <Home className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                        <span>{addr.label}</span>
                      </div>
                      <p className="text-xs font-bold text-zinc-800">{addr.fullName}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{addr.street}</p>
                      <p className="text-[11px] text-zinc-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Address Form Card */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-zinc-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" /> Shipping &amp; Recipient Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient's Full Name"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Phone Number (for Courier updates) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Email Address (for Invoice &amp; Tracking) *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Street Address, Flat, Building *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Flat 302, Green Meadows, Sector 15"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai / Pune / Delhi"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">State *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-900 bg-white"
                  >
                    {indianStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    placeholder="400001"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Special Delivery Note (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Ring doorbell, leave at reception"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Checkout Overview & PayU Action */}
          <div className="space-y-4 self-start">
            <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-zinc-900 border-b border-zinc-100 pb-3">
                Items In Bag ({items.length})
              </h3>

              <div className="max-h-48 overflow-y-auto space-y-3">
                {items.map((i, idx) => (
                  <div key={idx} className="flex gap-2.5 text-xs">
                    <img
                      src={getImageUrl(i.product?.images?.[0])}
                      alt={i.product?.name}
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-zinc-900 truncate">{i.product?.name}</p>
                      {i.selectedTier && (
                        <p className="text-[10px] text-amber-700 font-semibold truncate">
                          🏷️ {i.selectedTier.tierTitle} ({i.selectedTier.discountPercent}% off)
                        </p>
                      )}
                      {i.customText && (
                        <p className="text-[10px] text-rose-600 truncate">✨ "{i.customText}"</p>
                      )}
                      {i.selectedAddons && i.selectedAddons.length > 0 && (
                        <div className="mt-0.5 space-y-0.5">
                          {i.selectedAddons.map((addon, aIdx) => (
                            <div key={aIdx} className="text-[10px] text-zinc-600">
                              <span>+ {addon.title} ({addon.variantName}): {formatPrice(addon.price)}</span>
                              {addon.message && (
                                <p className="italic text-amber-800 text-[9px] truncate">✉️ "{addon.message}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-zinc-500 text-[11px] mt-0.5">
                        Qty: {i.quantity} × {formatPrice(i.selectedTier?.unitPrice ?? i.product?.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-zinc-900">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delhivery Express Shipping</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                    FREE
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-sm font-black text-zinc-900 pt-2 border-t border-zinc-100">
                  <div>
                    <span>Total Payable</span>
                    <span className="block text-[10px] font-normal text-emerald-700">
                      Inclusive of 18% GST &amp; all taxes
                    </span>
                  </div>
                  <span className="text-rose-600 font-display text-lg">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-rose-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay {formatPrice(finalTotal)} via PayU</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-zinc-400 text-center space-y-1 pt-1">
                <p>🔒 256-bit SSL encrypted secure checkout</p>
                <p>Supports UPI (GPay, PhonePe, Paytm), NetBanking &amp; Cards</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
