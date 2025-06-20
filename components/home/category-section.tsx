import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  {
    name: "Zapatos",
    image: "/placeholder.svg?height=300&width=300",
    href: "/productos/zapatos",
    description: "Elegancia y comodidad",
  },
  {
    name: "Correas",
    image: "/placeholder.svg?height=300&width=300",
    href: "/productos/correas",
    description: "Complementos perfectos",
  },
  {
    name: "Camisetas",
    image: "/placeholder.svg?height=300&width=300",
    href: "/productos/camisetas",
    description: "Estilo casual",
  },
  {
    name: "Accesorios",
    image: "/placeholder.svg?height=300&width=300",
    href: "/productos/accesorios",
    description: "Detalles únicos",
  },
]

export function CategorySection() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestras Categorías</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explora nuestra amplia selección de productos de moda y calzado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link key={category.name} href={category.href}>
              <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-brand-dark/40 transition-colors" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                      <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
