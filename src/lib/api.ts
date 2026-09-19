import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api"

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

// Attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("psg_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global 401 handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("psg_token")
      localStorage.removeItem("psg_user")
    }
    return Promise.reject(error)
  }
)

export default api

// ── Auth ──
export const authApi = {
  loginWithPassword: (data: { email: string; password: string }) =>
    api.post("/auth/login/password", data),
  sendLoginOtp: (data: { email: string }) => api.post("/auth/login/send-otp", data),
  verifyLoginOtp: (data: { email: string; otp: string }) =>
    api.post("/auth/login/verify-otp", data),
  sendSignupOtp: (data: { name: string; email: string; phone: string; password: string }) =>
    api.post("/auth/signup/send-otp", data),
  verifySignupOtp: (data: { email: string; otp: string }) =>
    api.post("/auth/signup/verify-otp", data),
  forgotPassword: (data: { email: string }) => api.post("/auth/forgot-password", data),
  getMe: () => api.get("/auth/me"),
  updateMe: (data: { name?: string; phone?: string }) => api.put("/auth/me", data),
}

// ── Catalog ──
export const catalogApi = {
  getNavbarCategories: () => api.get("/catalog/categories/navbar"),
  getHomeCategories: () => api.get("/catalog/categories/home"),
  getCategories: () => api.get("/catalog/categories"),
  getCategoryBySlug: (slug: string) => api.get(`/catalog/categories/${slug}`),
  getProducts: (params?: any) => api.get("/catalog/products", { params }),
  getProductBySlug: (slug: string) => api.get(`/catalog/products/${slug}`),
  getFeatured: () => api.get("/catalog/products/featured"),
  getBestSellers: () => api.get("/catalog/products/bestsellers"),
  getSimilar: (categoryId: string, currentProductId: string) =>
    api.get("/catalog/products/similar", { params: { categoryId, currentProductId } }),
  getAddonsForProduct: (productId: string) =>
    api.get(`/catalog/addons/product/${productId}`),
}

// ── Cart ──
export const cartApi = {
  get: () => api.get("/cart"),
  add: (data: {
    productId: string
    quantity?: number
    customText?: string
    customImage?: string
    selectedTier?: {
      tierTitle: string
      unitPrice: number
      discountPercent: number
    }
    selectedAddons?: Array<{
      addonId: string
      title: string
      variantName: string
      price: number
      message?: string
    }>
  }) => api.post("/cart/add", data),
  update: (data: { productId: string; quantity: number }) => api.put("/cart/update", data),
  remove: (productId: string) => api.delete(`/cart/remove/${productId}`),
  clear: () => api.delete("/cart/clear"),
}

// ── Orders ──
export const orderApi = {
  create: (data: any) => api.post("/orders", data),
  trackOrder: (query: string) => api.get(`/orders/track/${query}`),
  getMyOrders: (params?: any) => api.get("/orders/my", { params }),
  getMyOrderById: (id: string) => api.get(`/orders/my/${id}`),
  cancelOrder: (id: string, reason?: string) => api.put(`/orders/my/${id}/cancel`, { reason }),
  getInvoiceUrl: (id: string) => `${import.meta.env.VITE_API_URL || ""}/api/orders/${id}/invoice`,
}

// ── Addresses ──
export const addressApi = {
  getAll: () => api.get("/user/addresses"),
  create: (data: any) => api.post("/user/addresses", data),
  update: (id: string, data: any) => api.put(`/user/addresses/${id}`, data),
  delete: (id: string) => api.delete(`/user/addresses/${id}`),
}

// ── Reviews ──
export const reviewApi = {
  getForProduct: (productId: string) => api.get(`/user/reviews/${productId}`),
  create: (data: { productId: string; rating: number; title?: string; comment: string }) =>
    api.post("/user/reviews", data),
}

// ── Banners ──
export const bannerApi = {
  getAll: () => api.get("/banners"),
}

// ── Upload ──
export const uploadApi = {
  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append("image", file)
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
}
