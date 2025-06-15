"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Mail, Gift } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [accepted, setAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !accepted) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos y acepta el tratamiento de datos.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "¡Suscripción exitosa!",
      description:
        "Te has suscrito correctamente a nuestro newsletter. Recibirás un 10% de descuento en tu primer pedido.",
    })

    setEmail("")
    setAccepted(false)
    setIsLoading(false)
  }

  return (
    <section className="py-16 px-4 bg-primary text-primary-foreground">
      <div className="container mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-foreground/10 p-4 rounded-full">
              <Mail className="h-8 w-8" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">Suscríbete a Nuestro Newsletter</h2>
          <p className="text-lg mb-8 opacity-90">
            Recibe las últimas novedades, ofertas exclusivas y un 10% de descuento en tu primera compra
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground text-primary"
                required
              />
              <Button type="submit" variant="secondary" disabled={isLoading} className="whitespace-nowrap">
                {isLoading ? "Suscribiendo..." : "Suscribirse"}
                <Gift className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-start space-x-2 max-w-md mx-auto text-left">
              <Checkbox
                id="newsletter-consent"
                checked={accepted}
                onCheckedChange={setAccepted}
                className="mt-1 border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
              />
              <label htmlFor="newsletter-consent" className="text-sm opacity-90 leading-relaxed">
                Autorizo el tratamiento de mis datos personales de acuerdo con la{" "}
                <a href="/privacidad" className="underline hover:no-underline">
                  Política de Privacidad
                </a>{" "}
                para recibir información comercial y promocional.
              </label>
            </div>
          </form>

          <p className="text-xs opacity-75 mt-6">
            Puedes cancelar tu suscripción en cualquier momento. No compartimos tu información con terceros.
          </p>
        </div>
      </div>
    </section>
  )
}
