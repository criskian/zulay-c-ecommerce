"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { fadeInUp, staggerContainer, staggerItem, buttonHover } from "@/lib/animations"

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

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
}

const slideTransition = {
  x: { type: "spring" as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.4 },
}

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000) // Aumenté a 6 segundos para que se vean mejor las animaciones
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
  }

  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
          className="absolute inset-0"
        >
          <div className="relative h-full w-full">
            <Image
              src={slides[currentSlide].image || "/placeholder.svg"}
              alt={slides[currentSlide].title}
              fill
              className="object-cover"
              priority
            />
            {/* Overlay con gradiente más suave */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/30" 
            />
            
            {/* Contenido con animaciones stagger */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="text-center text-white space-y-6 px-4 max-w-2xl"
              >
                <motion.h1 
                  variants={staggerItem}
                  className="text-4xl md:text-6xl font-bold"
                >
                  {slides[currentSlide].title}
                </motion.h1>
                
                <motion.p 
                  variants={staggerItem}
                  className="text-lg md:text-xl opacity-90"
                >
                  {slides[currentSlide].subtitle}
                </motion.p>
                
                <motion.div variants={staggerItem}>
                  <motion.div
                    variants={buttonHover}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-3 text-base shadow-lg"
                    >
                      <Link href={slides[currentSlide].href}>
                        {slides[currentSlide].cta}
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows con hover effects */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute left-4 top-1/2 -translate-y-1/2"
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full h-12 w-12"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute right-4 top-1/2 -translate-y-1/2"
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full h-12 w-12"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Dots Indicator con animaciones */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "w-8 bg-white" : "w-3 bg-white/50 hover:bg-white/70"
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {index === currentSlide && (
              <motion.div
                layoutId="activeDot"
                className="absolute inset-0 bg-white rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <motion.div
          key={currentSlide}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 6, ease: "linear" }}
          className="h-full bg-white"
        />
      </div>
    </section>
  )
}
