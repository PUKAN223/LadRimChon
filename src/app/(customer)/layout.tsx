import { MarketNavigation } from '@/components/market/MarketNavigation'
import { FloatingCart } from '@/components/cart/FloatingCart'
import { PageTransition } from '@/components/market/PageTransition'
import { AuthGuard } from '@/components/providers/auth-guard'
import { OrderReadyBanner } from '@/components/order/OrderReadyBanner'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <OrderReadyBanner />
      <main className="page-content">
        <PageTransition>{children}</PageTransition>
      </main>
      <FloatingCart />
      <MarketNavigation />
    </AuthGuard>
  )
}
