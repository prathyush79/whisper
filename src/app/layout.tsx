import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WHISPER — Say what you never could.',
  description: 'A safe, anonymous space for college confessions. No accounts. No public identities. Just honest words.',
  openGraph: {
    title: 'WHISPER',
    description: 'Say what you never could.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
