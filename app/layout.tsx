import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Zulay C - Calzado y Moda Colombiana",
  description:
    "Descubre la mejor colección de zapatos, correas y moda en Colombia. Calidad, estilo y comodidad en cada paso.",
  keywords: "zapatos colombia, calzado, moda, correas, camisetas, zulay c"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
