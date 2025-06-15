import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Image src="/images/zulay c logo.png" alt="Zulay C" width={160} height={50} className="h-10 w-auto" />
            <p className="text-sm text-muted-foreground">
              Calzado y moda de calidad para toda Colombia. Estilo, comodidad y elegancia en cada paso.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Enlaces Rápidos</h3>
            <div className="space-y-2">
              <Link
                href="/productos"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Todos los Productos
              </Link>
              <Link
                href="/ofertas"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Ofertas Especiales
              </Link>
              <Link
                href="/tallas"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Guía de Tallas
              </Link>
              <Link
                href="/cuidado"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cuidado del Calzado
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold">Atención al Cliente</h3>
            <div className="space-y-2">
              <Link
                href="/contacto"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contáctanos
              </Link>
              <Link
                href="/envios"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Información de Envíos
              </Link>
              <Link
                href="/devoluciones"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Devoluciones
              </Link>
              <Link
                href="/preguntas"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Preguntas Frecuentes
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+57 300 123 4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@zulayc.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Colombia</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Suscríbete a nuestro newsletter</h4>
              <div className="flex space-x-2">
                <Input placeholder="Tu email" className="text-sm" />
                <Button size="sm">Suscribir</Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-muted-foreground">
            <Link href="/privacidad" className="hover:text-foreground transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-foreground transition-colors">
              Términos y Condiciones
            </Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">
              Política de Cookies
            </Link>
            <Link href="/datos" className="hover:text-foreground transition-colors">
              Tratamiento de Datos
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2024 Zulay C. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
