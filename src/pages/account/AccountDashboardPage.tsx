import React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Gift, MapPin, Package, User, LogOut, ArrowRight } from "lucide-react"
import { SEO } from "../../components/ui/SEO"

export function AccountDashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <SEO title="My Account — Printed Soul Gift" />

      {/* Profile Welcome Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-display font-black text-2xl">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="font-display font-black text-xl text-zinc-900">{user?.name}</h1>
            <p className="text-xs text-zinc-400">{user?.email}</p>
            <p className="text-xs text-zinc-400">{user?.phone || "No phone added"}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/account/orders"
          className="p-6 bg-white rounded-3xl border border-zinc-100 hover:border-zinc-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 group-hover:text-rose-600 transition-colors">
                My Orders
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Track and view previous gift orders</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/account/addresses"
          className="p-6 bg-white rounded-3xl border border-zinc-100 hover:border-zinc-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 group-hover:text-blue-600 transition-colors">
                Saved Addresses
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Manage Home and Office delivery addresses</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  )
}
