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
    <div className="rounded-2xl border border-market-beige/60 bg-white p-5 text-market-dark">
      {/* Order number */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs">ออเดอร์</p>
          <p className="font-bold text-lg tracking-wide">#{orderNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs">ร้าน</p>
          <p className="font-semibold text-sm">{shopName}</p>
        </div>
      </div>

      {/* Pickup Code */}
      <div className="my-5 border-y border-dashed border-market-beige py-7 text-center">
        <p className="text-muted-foreground text-xs mb-3">รหัสรับอาหาร</p>
        <p className="font-bold text-5xl tracking-[0.15em] text-market-brown break-all">
          {code}
        </p>
      </div>

      {/* Details */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-market-brown" />
          <span>จุดรับ: {zone}</span>
        </div>
        {estimatedTime && (
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-market-brown" />
            <span>{estimatedTime}</span>
          </div>
        )}
      </div>
    </div>
  )
}
