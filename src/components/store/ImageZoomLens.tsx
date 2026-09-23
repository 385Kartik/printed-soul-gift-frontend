import React, { useState, useRef } from "react"

interface ImageZoomLensProps {
  src: string
  alt?: string
  className?: string
  zoomLevel?: number
  children?: React.ReactNode
}

export const ImageZoomLens: React.FC<ImageZoomLensProps> = ({
  src,
  alt = "Product image",
  className = "",
  zoomLevel = 2.2,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    })
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden cursor-crosshair select-none ${className}`}
    >
      <div
        className="w-full h-full relative transition-transform duration-200 ease-out will-change-transform"
        style={{
          transformOrigin: `${origin.x}% ${origin.y}%`,
          transform: isHovered ? `scale(${zoomLevel})` : "scale(1)",
        }}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        {children}
      </div>

      {/* Subtle Magnifier Hint */}
      {!isHovered && (
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-1 rounded-md opacity-70 pointer-events-none flex items-center gap-1">
          <span>🔍</span>
          <span>Hover to zoom</span>
        </div>
      )}
    </div>
  )
}
