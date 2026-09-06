import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ReduxProvider } from '@/components/providers/redux-provider'
import { AppBootScreen } from '@/components/providers/app-boot-screen'
import { PwaProvider } from '@/components/providers/pwa-provider'

const lineSeedTH = localFont({
  src: [
    { path: '../../public/fonts/LINESeedSansTH_W_Th.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/LINESeedSansTH_W_Bd.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/LINESeedSansTH_W_Rg.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/LINESeedSansTH_W_He.woff2', weight: '800', style: 'normal' },
    { path: '../../public/fonts/LINESeedSansTH_W_XBd.woff2', weight: '900', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-line-seed-th',
  preload: true,
})

export const metadata: Metadata = {
  title: 'หลาดริมชล — แอปสั่งอาหารตลาดมหาวิทยาลัย',
  description:
    'หลาดริมชล แอปสั่งอาหารล่วงหน้าสำหรับตลาดภายในมหาวิทยาลัย เดินตลาดด้วยมือถือ สั่งง่าย รับไว ไม่ต้องรอคิว',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'หลาดริมชล',
  },
  icons: {
    icon: '/images/app-icon-cream.png',
    apple: '/images/app-icon-cream.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#A67C52',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={lineSeedTH.variable}>
      <body className={`${lineSeedTH.className} min-h-screen bg-market-cream antialiased`}>
        <ReduxProvider>
          <PwaProvider>
            <AppBootScreen>
              <div className="app-container">{children}</div>
            </AppBootScreen>
          </PwaProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
