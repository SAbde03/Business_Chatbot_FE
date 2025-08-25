import type { Metadata } from 'next'
import { Inter, Poppins, Open_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '700'] })
const openSans = Open_Sans({ subsets: ['latin'], weight: ['400', '700'] })
export const metadata: Metadata = {
  title: 'Business Expert Chatbot',
  description: 'Marketing Expert Chatbot',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-gray-50`}>{children}</body>
    </html>
  )
}