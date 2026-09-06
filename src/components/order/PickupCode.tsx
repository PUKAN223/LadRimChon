import { MapPin, Clock } from 'lucide-react'

interface PickupCodeProps {
  code: string
  orderNumber: string
  shopName: string
  zone: string
  estimatedTime?: string
}

export function PickupCode({ code, orderNumber, shopName, zone, estimatedTime }: PickupCodeProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-market-brown to-[#8A6540] p-5 text-white shadow-warm-lg">
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

      {/* Order number */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-white/60 text-xs">ออเดอร์</p>
          <p className="font-bold text-lg tracking-wide">#{orderNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-xs">ร้าน</p>
          <p className="font-semibold text-sm">{shopName}</p>
        </div>
      </div>

      {/* Pickup Code */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-3 text-center border border-white/20">
        <p className="text-white/60 text-xs mb-1">รหัสรับอาหาร</p>
        <p className="font-black text-5xl tracking-[0.2em] text-white">
          {code}
        </p>
      </div>

      {/* Details */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-market-beige" />
          <span className="text-white/80">จุดรับ: {zone}</span>
        </div>
        {estimatedTime && (
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-market-beige" />
            <span className="text-white/80">{estimatedTime}</span>
          </div>
        )}
      </div>
    </div>
  )
}
