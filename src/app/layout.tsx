import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Analytics } from '@vercel/analytics/next'
import CrispChat from '@/components/crisp'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MedQ',
  description: 'A platform for medical education and question management',
  icons: {
    icon: 'https://r5p6ptp1nn.ufs.sh/f/6mc1qMI9JcraFSYUmbide7MKPVFpROQi36XnZbchzSA1G4ax',
    shortcut: 'https://r5p6ptp1nn.ufs.sh/f/6mc1qMI9JcraFSYUmbide7MKPVFpROQi36XnZbchzSA1G4ax',
    apple: 'https://r5p6ptp1nn.ufs.sh/f/6mc1qMI9JcraFSYUmbide7MKPVFpROQi36XnZbchzSA1G4ax',
  },
}

// Ensure proper mobile responsiveness
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-x-hidden`}>
        <Providers>
          {/* Crisp live chat widget (needs AuthProvider) */}
          <CrispChat />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}