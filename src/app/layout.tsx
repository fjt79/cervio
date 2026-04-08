import { ThemeProvider } from '@/components/features/ThemeProvider'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Cervio — Your AI Chief of Staff',
  description: 'Think sharper. Decide faster. Lead better.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Cervio — Your AI Chief of Staff',
    description: 'Think sharper. Decide faster. Lead better.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '0.5px solid var(--border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
              },
              success: { iconTheme: { primary: '#34C759', secondary: 'white' } },
              error: { iconTheme: { primary: '#FF3B30', secondary: 'white' } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}