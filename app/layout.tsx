import type { Metadata } from 'next'
import Footer from "../components/footer"
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
      <body>{children} <Footer/> </body>
    </html>
  )
}
