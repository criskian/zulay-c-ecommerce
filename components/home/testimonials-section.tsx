"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "María González",
    location: "Bogotá",
    rating: 5,
    comment: "Excelente calidad en los zapatos. Muy cómodos y elegantes. El servicio al cliente es excepcional.",
    product: "Zapatos Elegantes Negros",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    location: "Medellín",
    rating: 5,
    comment: "Las correas son de muy buena calidad. Llegaron rápido y en perfecto estado. Totalmente recomendado.",
    product: "Correa de Cuero Premium",
  },
  {
    id: 3,
    name: "Ana Martínez",
    location: "Cali",
    rating: 4,
    comment: "Me encanta la variedad de productos. Los precios son justos y la atención es muy buena.",
    product: "Camiseta Casual",
  },
]

export function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Lo Que Dicen Nuestros Clientes</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            La satisfacción de nuestros clientes es nuestra mayor recompensa
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative h-64 overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <Card
                key={testimonial.id}
                className={`absolute inset-0 transition-all duration-500 ${
                  index === currentTestimonial
                    ? "opacity-100 translate-x-0"
                    : index < currentTestimonial
                      ? "opacity-0 -translate-x-full"
                      : "opacity-0 translate-x-full"
                }`}
              >
                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                  <Quote className="h-8 w-8 text-primary mx-auto mb-4" />
                  <p className="text-lg mb-6 italic">"{testimonial.comment}"</p>

                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    <p className="text-xs text-muted-foreground mt-1">Compró: {testimonial.product}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial ? "bg-primary" : "bg-muted"
                }`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
