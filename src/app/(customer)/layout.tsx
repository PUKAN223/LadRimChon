import { MarketNavigation } from '@/components/market/MarketNavigation'
import { FloatingCart } from '@/components/cart/FloatingCart'
import { PageTransition } from '@/components/market/PageTransition'
import { AuthGuard } from '@/components/providers/auth-guard'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <main className="page-content">
        <PageTransition>{children}</PageTransition>
      </main>
      <FloatingCart />
      <MarketNavigation />
    </AuthGuard>
  )
}
