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
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a24',
              color: '#e8e8f0',
              border: '1px solid #2a2a3a',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#c9a96e', secondary: '#0a0a0f' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#0a0a0f' } },
          }}
        />
      </body>
    </html>
  )
}
