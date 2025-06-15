"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { state, dispatch } = useCart()
  const { toast } = useToast()
  const [promoCode, setPromoCode] = useState("")

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: id })
      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó de tu carrito",
      })
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity: newQuantity } })
    }
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
    toast({
      title: "Producto eliminado",
      description: "El producto se eliminó de tu carrito",
    })
  }

  const applyPromoCode = () => {
    // Mock promo code logic
    if (promoCode.toLowerCase() === "descuento10") {
      toast({
        title: "¡Código aplicado!",
        description: "Se aplicó un 10% de descuento a tu pedido",
      })
    } else {
      toast({
        title: "Código inválido",
        description: "El código promocional no es válido",
        variant: "destructive",
      })
    }
  }

  const shipping = state.total > 100000 ? 0 : 15000
  const subtotal = state.total
  const total = subtotal + shipping

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center space-y-6 max-w-md">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
              <p className="text-muted-foreground">Agrega algunos productos para comenzar tu compra</p>
            </div>
            <Button asChild size="lg">
              <Link href="/productos">Explorar Productos</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/productos">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Carrito de Compras</h1>
              <p className="text-muted-foreground">
                {state.itemCount} producto{state.itemCount !== 1 ? "s" : ""} en tu carrito
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {state.items.map((item) => (
                <Card key={`${item.id}-${item.size}-${item.color}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.color}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Talla {item.size}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                            <p className="text-sm text-muted-foreground">{formatPrice(item.price)} c/u</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Código Promocional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ingresa tu código"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button onClick={applyPromoCode} variant="outline">
                      Aplicar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>{shipping === 0 ? <Badge variant="secondary">Gratis</Badge> : formatPrice(shipping)}</span>
                  </div>

                  {shipping === 0 && (
                    <p className="text-xs text-green-600">
                      ¡Envío gratis por compras superiores a {formatPrice(100000)}!
                    </p>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>

                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout">Proceder al Pago</Link>
                  </Button>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/productos">Continuar Comprando</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium">Compra 100% Segura</p>
                    <p className="text-xs text-muted-foreground">Tus datos están protegidos con encriptación SSL</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
