import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '7Adventist',
  description: 'Created with v0+vercel',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
