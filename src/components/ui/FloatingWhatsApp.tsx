import React from "react"
import { MessageCircle } from "lucide-react"

export function FloatingWhatsApp() {
  const phoneNumber = "918591721436" // Official WhatsApp Support
  const message = encodeURIComponent("Hi Printed Soul Gift! I would like assistance with a luxury gift hamper order.")
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-40 flex items-center gap-2 group">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with VIP Concierge on WhatsApp"
        className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white py-3 px-4 rounded-full shadow-xl shadow-black/60 border border-emerald-400/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <MessageCircle className="w-5 h-5 fill-current text-white" />
        <span className="text-xs font-extrabold tracking-wider uppercase hidden sm:inline">
          VIP Concierge
        </span>
      </a>
    </div>
  )
}
