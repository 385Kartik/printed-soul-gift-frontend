import React, { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { X, Mail, Lock, User as UserIcon, Phone, Loader2, ArrowRight, CheckCircle2 } from "lucide-react"

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithPassword,
    sendLoginOtp,
    verifyLoginOtp,
    sendSignupOtp,
    verifySignupOtp,
  } = useAuth()

  // Tabs: "login" | "signup"
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")

  // Login Mode: "password" | "otp-request" | "otp-verify"
  const [loginMode, setLoginMode] = useState<"password" | "otp-request" | "otp-verify">("password")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginOtp, setLoginOtp] = useState("")

  // Signup Mode: "form" | "otp-verify"
  const [signupStep, setSignupStep] = useState<"form" | "otp-verify">("form")
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPhone, setSignupPhone] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupOtp, setSignupOtp] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  if (!isAuthModalOpen) return null

  const resetAll = () => {
    setError("")
    setSuccess("")
    setLoading(false)
    setLoginMode("password")
    setSignupStep("form")
  }

  const handleTabChange = (tab: "login" | "signup") => {
    setActiveTab(tab)
    resetAll()
  }

  // ── Login Handlers ──
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await loginWithPassword(loginEmail.trim().toLowerCase(), loginPassword)
      resetAll()
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await sendLoginOtp(loginEmail.trim().toLowerCase())
      setSuccess(`Verification code sent to ${loginEmail}`)
      setLoginMode("otp-verify")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send code")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await verifyLoginOtp(loginEmail.trim().toLowerCase(), loginOtp)
      resetAll()
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid verification code")
    } finally {
      setLoading(false)
    }
  }

  // ── Signup Handlers ──
  const handleSendSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await sendSignupOtp({
        name: signupName,
        email: signupEmail.trim().toLowerCase(),
        phone: signupPhone,
        password: signupPassword,
      })
      setSuccess(`Verification code sent to ${signupEmail}`)
      setSignupStep("otp-verify")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await verifySignupOtp(signupEmail.trim().toLowerCase(), signupOtp)
      resetAll()
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid verification code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white p-6 relative">
          <button
            onClick={() => {
              resetAll()
              closeAuthModal()
            }}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎁</span>
            <span className="text-xs uppercase tracking-widest text-rose-400 font-bold">Printed Soul Gift</span>
          </div>
          <h2 className="text-xl font-display font-black text-white">
            {activeTab === "login" ? "Welcome Back!" : "Create Your Account"}
          </h2>
          <p className="text-xs text-zinc-300 mt-1">
            {activeTab === "login"
              ? "Access your saved addresses, track orders & faster checkout"
              : "Join our gifting club for exclusive discounts & gifts"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-100 bg-zinc-50/70 p-1">
          <button
            type="button"
            onClick={() => handleTabChange("login")}
            className={`flex-1 py-2.5 text-xs font-bold rounded-2xl transition-all ${
              activeTab === "login" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("signup")}
            className={`flex-1 py-2.5 text-xs font-bold rounded-2xl transition-all ${
              activeTab === "signup" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* ══════════ LOGIN FLOW ══════════ */}
          {activeTab === "login" && (
            <div>
              {/* Method Switcher */}
              <div className="flex items-center justify-center gap-4 mb-5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("password")
                    setError("")
                  }}
                  className={`pb-1 font-bold border-b-2 transition-colors ${
                    loginMode === "password"
                      ? "border-rose-600 text-rose-600"
                      : "border-transparent text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  Password Login
                </button>
                <span className="text-zinc-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("otp-request")
                    setError("")
                  }}
                  className={`pb-1 font-bold border-b-2 transition-colors ${
                    loginMode !== "password"
                      ? "border-rose-600 text-rose-600"
                      : "border-transparent text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  Email OTP Login
                </button>
              </div>

              {loginMode === "password" && (
                <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                  </button>
                </form>
              )}

              {loginMode === "otp-request" && (
                <form onSubmit={handleSendLoginOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send OTP Code <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}

              {loginMode === "otp-verify" && (
                <form onSubmit={handleVerifyLoginOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full py-3 px-4 text-center tracking-[8px] font-mono text-xl font-bold rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Sign In"}
                  </button>

                  <div className="text-center mt-2">
                    <button
                      type="button"
                      onClick={() => setLoginMode("otp-request")}
                      className="text-xs text-zinc-500 hover:text-zinc-800 underline"
                    >
                      Change email or resend code
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ══════════ SIGNUP FLOW ══════════ */}
          {activeTab === "signup" && (
            <div>
              {signupStep === "form" && (
                <form onSubmit={handleSendSignupOtp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="tel"
                        required
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">Set Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="password"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue with Email OTP <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}

              {signupStep === "otp-verify" && (
                <form onSubmit={handleVerifySignupOtp} className="space-y-3.5">
                  <p className="text-xs text-zinc-500">
                    We sent a 6-digit confirmation code to <strong>{signupEmail}</strong>.
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">Enter Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={signupOtp}
                      onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full py-3 px-4 text-center tracking-[8px] font-mono text-xl font-bold rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Registration"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
