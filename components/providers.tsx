"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/contexts/cart-context"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
        <CartProvider>{children}</CartProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
