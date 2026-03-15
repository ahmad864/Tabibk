import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'طبيبك - Tabibak Syria Connect',
  description: 'أول منصة لحجز المواعيد الطبية في سوريا',
}

export const viewport: Viewport = { themeColor: '#0055A0' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
