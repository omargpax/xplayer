import type { Metadata } from 'next'
import { Analytics } from "@vercel/analytics/next"
import './globals.css'
import Footer from "../components/footer"

export const metadata = {
  metadataBase: new URL('https://xplay.omargpax.dev'),
  manifest: '/manifest.json',
  title: " Xplayer - Music Player",
  description: "Xplay is a music player built with React,Tailwind CSS and Vite. It features a sleek and modern design, with a focus on simplicity and ease of use. With Xplay, you can easily manage your music library, create playlists, and enjoy your favorite tunes in style.",
  author: "Omar A. Guerrero",
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Xplay - Music Player",
    description: "Xplay a minimalist music player built with React and Tailwind CSS. It features a sleek and modern design, with a focus on simplicity and ease of use.",
    url: "https://xplay.omargpax.dev",
    siteName: "Xplay",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Xplay - Music Player Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xplay - Music Player",
    description: "Check out Xplay, a minimalist music player built with React and Tailwind CSS.",
    creator: "@omargpax",
    images: ["/preview.png"],
  },
  keywords: [
    "Xplay",
    "Music Player",
    "React",
    "Tailwind CSS",
    "Vite",
    "Minimalist Design",
    "Playlist Management",
    "Audio Player",
    "Web Music Player"
  ].join(', '),
};

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
        <Analytics />
      </body>
    </html>
  )
}
