"use client"

import type React from "react"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Error de autenticación",
          description: "Credenciales incorrectas. Por favor verifica tu email y contraseña.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        })

        // Check if user is admin
        const session = await getSession()
        if (session?.user?.role === "ADMIN") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Por favor intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="/images/zulay c logo.png"
              alt="Zulay C"
              width={120}
              height={40}
              className="h-10 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
            <p className="text-muted-foreground">Accede a tu cuenta para una experiencia personalizada</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bienvenido de vuelta</CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/auth/register" className="text-primary hover:underline">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Volver a la tienda
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
