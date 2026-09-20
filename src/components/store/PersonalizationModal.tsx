import React, { useState, useEffect, useMemo, useRef } from "react"
import { X, Sparkles, Check, Upload, MessageCircle, AlertCircle } from "lucide-react"
import { getImageUrl, formatPrice } from "../../lib/utils"

export interface EngravingFont {
  id: string
  name: string
  cssClass: string
  sampleText: string
}

export const ENGRAVING_FONTS: EngravingFont[] = [
  { id: "elmessiri", name: "Elmessiri", cssClass: "font-elmessiri", sampleText: "Elmessiri" },
  { id: "signature", name: "Signature", cssClass: "font-signature", sampleText: "Butterlott" },
  { id: "lobster", name: "Lobster", cssClass: "font-lobster", sampleText: "Lobster" },
  { id: "pacifico", name: "Pacifico", cssClass: "font-pacifico", sampleText: "Pacifico" },
  { id: "cursive", name: "Cursive", cssClass: "font-cursive", sampleText: "Cursive" },
]

interface PersonalizationModalProps {
  isOpen: boolean
  onClose: () => void
  product: any
  currentQuantity: number
  unitPrice: number
  onAddToCartWithPersonalization: (data: {
    engravingText: string
    itemizedEngraving: Record<string, string>
    font: string
    quantity: number
    logoUrl?: string
  }) => Promise<void>
}

export const PersonalizationModal: React.FC<PersonalizationModalProps> = ({
  isOpen,
  onClose,
  product,
  currentQuantity,
  unitPrice,
  onAddToCartWithPersonalization,
}) => {
  // Determine items in combo
  const comboItems = useMemo(() => {
    if (product?.personalizationItems && product.personalizationItems.length > 0) {
      return product.personalizationItems
    }
    const nameLower = (product?.name || "").toLowerCase()
    if (nameLower.includes("diary") && nameLower.includes("pen")) {
      return ["Diary", "Pen"]
    }
    if (nameLower.includes("flask") && (nameLower.includes("cup") || nameLower.includes("mug"))) {
      return ["Flask", "Cup"]
    }
    if (nameLower.includes("wallet") && nameLower.includes("pen")) {
      return ["Wallet", "Pen"]
    }
    if (nameLower.includes("tumbler")) {
      return ["Tumbler"]
    }
    if (nameLower.includes("flask")) {
      return ["Flask"]
    }
    return [product?.personalizationPrompt || "Product"]
  }, [product])

  // State for each item's engraving text
  const [itemTexts, setItemTexts] = useState<Record<string, string>>({})
  const [selectedFontId, setSelectedFontId] = useState<string>("lobster")
  const [qty, setQty] = useState<number>(currentQuantity || 1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Zoom state on preview
  const [isHovered, setIsHovered] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const previewRef = useRef<HTMLDivElement>(null)

  const maxCharsPerItem = 16

  // Initialize item texts when modal opens or comboItems change
  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {}
      comboItems.forEach((item: string) => {
        initial[item] = ""
      })
      setItemTexts(initial)
      setQty(currentQuantity || 1)
      setErrorMessage("")
    }
  }, [isOpen, comboItems, currentQuantity])

  if (!isOpen || !product) return null

  const selectedFont = ENGRAVING_FONTS.find((f) => f.id === selectedFontId) || ENGRAVING_FONTS[0]

  const handleItemTextChange = (item: string, value: string) => {
    if (value.length > maxCharsPerItem) return
    setItemTexts((prev) => ({ ...prev, [item]: value }))
    if (errorMessage) setErrorMessage("")
  }

  // Handle preview zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that at least one item has custom text
    const filledItems = Object.entries(itemTexts).filter(([_, txt]) => txt.trim().length > 0)
    if (filledItems.length === 0) {
      setErrorMessage("Please enter a name or text for personalization.")
      return
    }

    // Consolidated text representation: "Diary: Kartik, Pen: Kartik (Font: Lobster)"
    const consolidated = filledItems
      .map(([item, txt]) => `${item}: ${txt.trim()}`)
      .join(" • ")

    try {
      setIsSubmitting(true)
      await onAddToCartWithPersonalization({
        engravingText: `${consolidated} [Font: ${selectedFont.name}]`,
        itemizedEngraving: itemTexts,
        font: selectedFont.name,
        quantity: qty,
      })
      onClose()
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to add personalized item")
    } finally {
      setIsSubmitting(false)
    }
  }

  const images = product.images && product.images.length > 0 ? product.images : [""]
  const previewImage = getImageUrl(images[0])

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-serif font-black text-sm sm:text-base text-zinc-950">
                Personalize Your Gift
              </h3>
              <p className="text-[11px] text-zinc-500 truncate max-w-sm">
                {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* ═════════════════════════════════════════════════════════
                LEFT COLUMN: LIVE VISUAL MOCKUP WITH HOVER ZOOM
               ═════════════════════════════════════════════════════════ */}
            <div className="md:col-span-6 space-y-3">
              <div
                ref={previewRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={handleMouseMove}
                className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm cursor-crosshair select-none"
              >
                {/* Scalable Mockup View */}
                <div
                  className="w-full h-full transition-transform duration-150 ease-out will-change-transform relative"
                  style={{
                    transformOrigin: `${origin.x}% ${origin.y}%`,
                    transform: isHovered ? "scale(2.2)" : "scale(1)",
                  }}
                >
                  <img
                    src={previewImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />

                  {/* ═════════════════════════════════════════════════
                      LIVE LASER ENGRAVING OVERLAYS
                     ═════════════════════════════════════════════════ */}
                  {comboItems.map((item: string, idx: number) => {
                    const textValue = itemTexts[item] || "Your Name"
                    const isCustomized = Boolean(itemTexts[item]?.trim())

                    // Responsive positioning based on combo or single item
                    const isDiary = item.toLowerCase().includes("diary") || item.toLowerCase().includes("notebook")
                    const isPen = item.toLowerCase().includes("pen")

                    let positionClasses = "bottom-8 left-1/2 -translate-x-1/2"
                    if (isDiary) positionClasses = "top-[48%] left-1/2 -translate-x-1/2"
                    else if (isPen) positionClasses = "bottom-[22%] left-1/2 -translate-x-1/2"
                    else if (idx === 0) positionClasses = "top-[52%] left-1/2 -translate-x-1/2"
                    else if (idx === 1) positionClasses = "bottom-[25%] left-1/2 -translate-x-1/2"

                    return (
                      <div
                        key={item}
                        className={`absolute ${positionClasses} z-10 transition-all text-center pointer-events-none`}
                      >
                        <div
                          className={`px-3 py-1 rounded-md shadow-xs inline-block transition-colors ${
                            isCustomized
                              ? "bg-black/30 backdrop-blur-2xs border border-white/20"
                              : "bg-black/20 border border-white/10"
                          }`}
                        >
                          <span className="text-[9px] uppercase tracking-wider text-amber-200 font-bold block mb-0.5 opacity-80">
                            {item}
                          </span>
                          <span
                            className={`text-sm sm:text-base tracking-wide font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${selectedFont.cssClass}`}
                          >
                            {textValue}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Hover zoom hint */}
                {!isHovered && (
                  <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-1 rounded-md pointer-events-none flex items-center gap-1 opacity-80">
                    <span>🔍</span>
                    <span>Hover to zoom preview</span>
                  </div>
                )}
              </div>

              {/* Preview Status Pill */}
              <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
                <span>Engraving Preview ({selectedFont.name} Font)</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> High Precision Laser
                </span>
              </div>
            </div>

            {/* ═════════════════════════════════════════════════════════
                RIGHT COLUMN: COMBO INPUTS, FONT PICKER & ACTIONS
               ═════════════════════════════════════════════════════════ */}
            <div className="md:col-span-6 space-y-4">
              
              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Dynamic Inputs Per Combo Item */}
              <div className="p-4 rounded-2xl border border-amber-300/80 bg-amber-50/20 space-y-3.5">
                {comboItems.map((item: string) => {
                  const currentLen = (itemTexts[item] || "").length
                  const remaining = maxCharsPerItem - currentLen

                  return (
                    <div key={item} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                        <span>{item} :</span>
                        <span className="text-[11px] font-normal text-zinc-500">
                          {remaining} characters left
                        </span>
                      </div>
                      <input
                        type="text"
                        value={itemTexts[item] || ""}
                        maxLength={maxCharsPerItem}
                        onChange={(e) => handleItemTextChange(item, e.target.value)}
                        placeholder="Your Name"
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all"
                      />
                    </div>
                  )
                })}

                {/* ═════════════════════════════════════════════════
                    SELECT A FONT BUTTONS (Giftana Style)
                   ═════════════════════════════════════════════════ */}
                <div className="space-y-2 pt-2 border-t border-amber-200/60">
                  <label className="block text-xs font-bold text-zinc-800">
                    Select A Font :
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {ENGRAVING_FONTS.map((font) => {
                      const isSelected = selectedFontId === font.id
                      return (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => setSelectedFontId(font.id)}
                          className={`px-2 py-2 rounded-xl border text-xs text-center transition-all cursor-pointer flex items-center justify-center min-h-[38px] ${
                            isSelected
                              ? "border-amber-600 bg-amber-100/70 text-zinc-950 font-bold shadow-xs ring-1 ring-amber-500"
                              : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                          }`}
                        >
                          <span className={`truncate text-xs ${font.cssClass}`}>
                            {font.sampleText}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Corporate Logo Contact Notice */}
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600 space-y-1">
                  <p className="font-semibold text-zinc-800">
                    For company logo on products kindly WhatsApp or mail us:
                  </p>
                  <div className="flex items-center gap-3 pt-0.5 font-medium text-amber-800">
                    <a
                      href="https://wa.me/919136988133?text=Hi%20Printed%20Soul%20Gift%20Team%2C%20I%20want%20company%20logo%20engraving%20for%20order"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1 font-bold text-emerald-700"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>+91 91369 88133</span>
                    </a>
                    <span>•</span>
                    <a
                      href="mailto:support@printedsoulgift.in"
                      className="hover:underline text-zinc-700"
                    >
                      support@printedsoulgift.in
                    </a>
                  </div>
                </div>
              </div>

              {/* Quantity & Add to Cart Footer */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-700">Qty:</span>
                    <div className="flex items-center border border-zinc-300 rounded-lg bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="px-2 py-1 text-zinc-600 hover:text-zinc-950 font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 font-black text-xs text-zinc-900 min-w-[20px] text-center">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(qty + 1)}
                        className="px-2 py-1 text-zinc-600 hover:text-zinc-950 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 font-medium block">Total</span>
                    <span className="text-base font-black text-zinc-950 font-sans">
                      {formatPrice(unitPrice * qty)}
                    </span>
                  </div>
                </div>

                {/* Big Giftana Golden Add To Cart Button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-zinc-950 font-extrabold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  <span>{isSubmitting ? "Adding..." : "Add To Cart"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
