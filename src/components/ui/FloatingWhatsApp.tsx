import React from "react"
import { MessageCircle } from "lucide-react"

export function FloatingWhatsApp() {
  const phoneNumber = "919876543210" // Default contact
  const message = encodeURIComponent("Hi Printed Soul Gift! I have a question regarding a gift order.")
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-40 flex items-center gap-2 group">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white p-3 sm:py-3 sm:px-4 rounded-full shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline">WhatsApp Help</span>
      </a>
    </div>
  )
}
