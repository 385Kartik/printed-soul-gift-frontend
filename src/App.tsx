import React, { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { WishlistProvider } from "./context/WishlistContext"
import { StoreLayout } from "./components/layouts/StoreLayout"

// Pages
import { HomePage } from "./pages/store/HomePage"
import { ProductsPage } from "./pages/store/ProductsPage"
import { ProductDetailPage } from "./pages/store/ProductDetailPage"
import { CartPage } from "./pages/store/CartPage"
import { CheckoutPage } from "./pages/store/CheckoutPage"
import { OrderSuccessPage } from "./pages/store/OrderSuccessPage"
import { AccountDashboardPage } from "./pages/account/AccountDashboardPage"
import { OrdersPage } from "./pages/account/OrdersPage"
import { AddressesPage } from "./pages/account/AddressesPage"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } },
})

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, openAuthModal } = useAuth()
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600" />
      </div>
    )
  }
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold">Sign In Required</h2>
        <p className="text-xs text-zinc-500">Please sign in to access your saved account details.</p>
        <button
          onClick={openAuthModal}
          className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
        >
          Sign In Now
        </button>
      </div>
    )
  }
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<StoreLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/:slug" element={<ProductDetailPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="order-success/:id" element={<OrderSuccessPage />} />
                  <Route path="track" element={<Navigate to="/account/orders" replace />} />

                {/* Protected Account Routes */}
                <Route
                  path="account"
                  element={
                    <ProtectedRoute>
                      <AccountDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="account/orders"
                  element={<OrdersPage />}
                />
                <Route
                  path="account/addresses"
                  element={
                    <ProtectedRoute>
                      <AddressesPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
