import React, { createContext, useContext, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { catalogApi } from "../lib/api"

export interface ThemeColors {
  primary: string
  background: string
  surface: string
  textPrimary: string
  textMuted: string
  borderColor: string
  goldAccent: string
}

export interface ThemeBanners {
  showHeadings: boolean
  fontFamily: string
  headingSize: "small" | "medium" | "large" | "xlarge"
  alignment: "left" | "center" | "right"
  position: "center" | "bottom-left" | "bottom-center" | "bottom-right"
  textColor: string
  showSubtitle: boolean
  showButton: boolean
}

export interface ThemeProducts {
  aspectRatio: "4:5" | "1:1" | "3:4" | "16:9"
  gridColumns: 2 | 3 | 4
  photoMode: "single" | "multi"
  hoverBehavior: "video" | "second_image" | "zoom" | "none"
  cardRadius: string
  showPrice: boolean
  showRating: boolean
}

export interface ThemeSettings {
  colors: ThemeColors
  banners: ThemeBanners
  products: ThemeProducts
}

const DEFAULT_THEME: ThemeSettings = {
  colors: {
    primary: "#DC2626",
    background: "#0A0204",
    surface: "#140507",
    textPrimary: "#FFFFFF",
    textMuted: "#A1A1AA",
    borderColor: "rgba(255, 255, 255, 0.08)",
    goldAccent: "#F59E0B",
  },
  banners: {
    showHeadings: false,
    fontFamily: "Playfair Display",
    headingSize: "large",
    alignment: "center",
    position: "center",
    textColor: "#FFFFFF",
    showSubtitle: true,
    showButton: true,
  },
  products: {
    aspectRatio: "4:5",
    gridColumns: 4,
    photoMode: "multi",
    hoverBehavior: "video",
    cardRadius: "rounded-xl",
    showPrice: true,
    showRating: true,
  },
}

interface ThemeContextType {
  theme: ThemeSettings
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  isLoading: false,
})

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["site-theme-settings"],
    queryFn: () => catalogApi.getTheme(),
    staleTime: 30 * 1000,
  })

  const theme: ThemeSettings = useMemo(() => {
    const raw = data?.data?.data
    if (!raw) return DEFAULT_THEME
    return {
      colors: { ...DEFAULT_THEME.colors, ...(raw.colors || {}) },
      banners: { ...DEFAULT_THEME.banners, ...(raw.banners || {}) },
      products: { ...DEFAULT_THEME.products, ...(raw.products || {}) },
    }
  }, [data])

  useEffect(() => {
    const root = document.documentElement
    const colors = theme.colors
    root.style.setProperty("--ps-bg", colors.background)
    root.style.setProperty("--ps-primary", colors.primary)
    root.style.setProperty("--ps-surface", colors.surface)
    root.style.setProperty("--ps-text-primary", colors.textPrimary)
    root.style.setProperty("--ps-text-muted", colors.textMuted)
    root.style.setProperty("--ps-border", colors.borderColor)
    root.style.setProperty("--ps-gold", colors.goldAccent)

    document.body.style.backgroundColor = colors.background
    document.body.style.color = colors.textPrimary
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
