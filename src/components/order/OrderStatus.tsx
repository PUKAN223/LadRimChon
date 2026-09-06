import { OrderStatus, ORDER_STATUS_LABEL } from '@/domain/order/order.model'
import { Receipt, Flame, ShoppingBag, CheckCircle2, Clock, X } from 'lucide-react'

interface OrderStatusBadgeProps {
  status: OrderStatus
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: <Clock size={13} className="text-amber-600 animate-spin-slow" />,
  },
  accepted: {
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    icon: <Receipt size={13} className="text-orange-600" />,
  },
  preparing: {
    bg: 'bg-orange-100',
    text: 'text-orange-900',
    border: 'border-orange-300',
    icon: <Flame size={13} className="text-orange-600 animate-pulse" />,
  },
  ready: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: <ShoppingBag size={13} className="text-emerald-600" />,
  },
  completed: {
    bg: 'bg-[#7DA27D]/15',
    text: 'text-[#416241]',
    border: 'border-[#7DA27D]/30',
    icon: <CheckCircle2 size={13} className="text-[#416241]" />,
  },
  cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: <X size={12} className="text-red-600" />,
  },
}

export function OrderStatusBadge({ status, showLabel = true, size = 'md' }: OrderStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const sizeClass =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5'
      : size === 'lg'
      ? 'text-sm px-3.5 py-1.5'
      : 'text-xs px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold ${sizeClass} ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.icon}
      {showLabel && <span>{ORDER_STATUS_LABEL[status]}</span>}
    </span>
  )
}

interface OrderStatusTrackerProps {
  status: OrderStatus
}

const STEPS = [
  {
    key: 'pending',
    label: 'รับออเดอร์',
    desc: 'ส่งไปร้านแล้ว',
    icon: Receipt,
  },
  {
    key: 'preparing',
    label: 'กำลังปรุง',
    desc: 'ร้านกำลังทำ',
    icon: Flame,
  },
  {
    key: 'ready',
    label: 'พร้อมรับ',
    desc: 'ไปรับที่หน้าร้าน',
    icon: ShoppingBag,
  },
  {
    key: 'completed',
    label: 'รับแล้ว',
    desc: 'ทานให้อร่อย!',
    icon: CheckCircle2,
  },
]

const STATUS_STEP_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  accepted: 0,
  preparing: 1,
  ready: 2,
  completed: 3,
  cancelled: -1,
}

export function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
  const currentStep = STATUS_STEP_INDEX[status]

  return (
    <div className="py-4 px-2">
      <div className="relative flex items-center justify-between">
        {/* Progress connecting track */}
        <div className="absolute left-6 right-6 top-5 -translate-y-1/2 h-[3px] bg-[#E9D7B5]/60 z-0">
          <div
            className="h-full bg-gradient-to-r from-market-orange to-market-brown transition-all duration-700 rounded-full"
            style={{
              width:
                currentStep <= 0
                  ? '0%'
                  : currentStep === 1
                  ? '33%'
                  : currentStep === 2
                  ? '66%'
                  : '100%',
            }}
          />
        </div>

        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isDone = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              {/* Step circle icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                  isCurrent
                    ? 'bg-market-orange text-white ring-4 ring-market-orange/20 scale-110 shadow-orange-glow'
                    : isDone
                    ? 'bg-[#7DA27D] text-white'
                    : 'bg-white text-[#B3A497] border border-[#E9D7B5]'
                }`}
              >
                <Icon size={18} strokeWidth={isCurrent ? 2.5 : 2} />
              </div>

              {/* Step text */}
              <span
                className={`text-[12px] font-bold mt-2 text-center leading-tight ${
                  isCurrent
                    ? 'text-market-orange'
                    : isDone
                    ? 'text-[#2E2318]'
                    : 'text-[#9E8E81]'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-[#8A7B6D] text-center hidden sm:block mt-0.5">
                {step.desc}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
