import React, { useEffect } from "react"

interface SEOProps {
  title?: string
  description?: string
}

export function SEO({
  title = "Printed Soul Gift — Personalized Gifts, Hampers & Corporate Kits",
  description = "Shop unique personalized gifts, custom festive hampers, employee welcome kits, and luxury keepsakes across India.",
}: SEOProps) {
  useEffect(() => {
    document.title = title
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute("content", description)
    }
  }, [title, description])

  return null
}
