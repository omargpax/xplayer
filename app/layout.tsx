import type { Metadata } from 'next'
import './globals.css'
import Footer from "../components/footer"

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
      <body className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        {children}
        <Footer/>
      </body>
    </html>
  )
}
