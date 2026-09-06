import { LucideIcon } from 'lucide-react'

interface CategoryCardProps {
  emoji: string
  label: string
  isActive?: boolean
  onClick?: () => void
}

export function CategoryCard({ emoji, label, isActive = false, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 transition-all duration-200 min-w-[64px] flex-shrink-0 group ${
        isActive ? 'scale-105' : 'hover:scale-105 active:scale-95'
      }`}
    >
      <div
        className={`flex items-center justify-center w-[54px] h-[54px] rounded-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors ${
          isActive
            ? 'bg-market-orange text-white border-market-orange'
            : 'bg-white border border-gray-100 group-hover:border-gray-200'
        }`}
      >
        <span className="text-2xl leading-none">{emoji}</span>
      </div>
      <span className={`text-[11px] font-medium leading-none ${isActive ? 'text-market-orange font-bold' : 'text-gray-600'}`}>
        {label}
      </span>
    </button>
  )
}
