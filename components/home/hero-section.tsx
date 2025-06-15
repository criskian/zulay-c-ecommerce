"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    id: 1,
    title: "Nueva Colección Primavera",
    subtitle: "Descubre los últimos estilos en calzado femenino",
    image: "/placeholder.svg?height=600&width=800",
    cta: "Ver Colección",
    href: "/productos/zapatos",
  },
  {
    id: 2,
    title: "Comodidad y Estilo",
    subtitle: "Zapatos perfectos para cada ocasión",
    image: "/placeholder.svg?height=600&width=800",
    cta: "Explorar",
    href: "/productos",
  },
  {
    id: 3,
    title: "Ofertas Especiales",
    subtitle: "Hasta 30% de descuento en productos seleccionados",
    image: "/placeholder.svg?height=600&width=800",
    cta: "Ver Ofertas",
    href: "/ofertas",
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
            index === currentSlide ? "translate-x-0" : index < currentSlide ? "-translate-x-full" : "translate-x-full"
          }`}
        >
          <div className="relative h-full w-full">
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white space-y-6 px-4 max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold animate-in slide-in-from-bottom-4 duration-1000">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl animate-in slide-in-from-bottom-4 duration-1000 delay-200">
                  {slide.subtitle}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="animate-in slide-in-from-bottom-4 duration-1000 delay-400 bg-white text-black hover:bg-white/90"
                >
                  <Link href={slide.href}>{slide.cta}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  )
}
