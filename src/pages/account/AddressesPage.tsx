import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { addressApi } from "../../lib/api"
import { MapPin, Plus, Trash2, Home, Building2, Briefcase, CheckCircle2 } from "lucide-react"
import { SEO } from "../../components/ui/SEO"

export function AddressesPage() {
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)

  const [label, setLabel] = useState<"Home" | "Office" | "Work" | "Other">("Home")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("Maharashtra")
  const [pincode, setPincode] = useState("")
  const [isDefault, setIsDefault] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.getAll(),
  })
  const addresses = data?.data?.data || []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await addressApi.create({
      label,
      fullName,
      phone,
      street,
      city,
      state,
      pincode,
      isDefault,
    })
    setShowAddForm(false)
    setFullName("")
    setPhone("")
    setStreet("")
    setCity("")
    setPincode("")
    queryClient.invalidateQueries({ queryKey: ["addresses"] })
  }

  const handleDelete = async (id: string) => {
    if (confirm("Delete this saved address?")) {
      await addressApi.delete(id)
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <SEO title="Saved Addresses — Printed Soul Gift" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-black text-zinc-900">Saved Addresses</h1>
          <p className="text-xs text-zinc-500 mt-1">Manage delivery locations for instant checkout.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Address</span>
        </button>
      </div>

      {/* Add Address Form Modal / Box */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-md space-y-4">
          <h3 className="font-bold text-sm text-zinc-900">New Delivery Address</h3>

          <div className="flex gap-2">
            {(["Home", "Office", "Work", "Other"] as const).map((l) => (
              <button
                type="button"
                key={l}
                onClick={() => setLabel(l)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  label === l ? "border-rose-600 bg-rose-50 text-rose-600" : "border-zinc-200 text-zinc-600"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="px-3.5 py-2 text-xs rounded-xl border border-zinc-200"
            />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit Phone"
              className="px-3.5 py-2 text-xs rounded-xl border border-zinc-200"
            />
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Flat, Building, Street"
              className="sm:col-span-2 px-3.5 py-2 text-xs rounded-xl border border-zinc-200"
            />
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="px-3.5 py-2 text-xs rounded-xl border border-zinc-200"
            />
            <input
              type="text"
              required
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
              placeholder="Pincode"
              className="px-3.5 py-2 text-xs rounded-xl border border-zinc-200"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      {/* Address Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr: any) => (
          <div
            key={addr._id}
            className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                  {addr.label === "Office" ? (
                    <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                  ) : addr.label === "Work" ? (
                    <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                  ) : (
                    <Home className="w-3.5 h-3.5 text-zinc-500" />
                  )}
                  {addr.label}
                </span>
                {addr.isDefault && (
                  <span className="text-[10px] bg-zinc-100 font-bold px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="font-bold text-xs text-zinc-900">{addr.fullName}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{addr.phone}</p>
              <p className="text-xs text-zinc-600 mt-1">{addr.street}</p>
              <p className="text-xs text-zinc-600">
                {addr.city}, {addr.state} - {addr.pincode}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-100 mt-4 flex justify-end">
              <button
                onClick={() => handleDelete(addr._id)}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
