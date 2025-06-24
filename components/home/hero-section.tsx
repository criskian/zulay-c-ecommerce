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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!isAutoPlaying || isPaused) return

    const timer = setInterval(() => {
      setDirection(1)
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    
    return () => clearInterval(timer)
  }, [isAutoPlaying, isPaused, currentSlide])

  const nextSlide = () => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    // Pausar brevemente el auto-play cuando el usuario interactúa
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 5000) // Reanudar después de 5 segundos
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    // Pausar brevemente el auto-play cuando el usuario interactúa
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 5000) // Reanudar después de 5 segundos
  }

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
    // Pausar brevemente el auto-play cuando el usuario interactúa
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 5000) // Reanudar después de 5 segundos
  }

  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  // Navegación por teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevSlide()
      } else if (event.key === 'ArrowRight') {
        nextSlide()
      } else if (event.key === ' ') { // Barra espaciadora para pausar/reanudar
        event.preventDefault()
        setIsAutoPlaying(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide])

  return (
    <section 
      className="relative h-[70vh] md:h-[80vh] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
              className="absolute inset-0 bg-gradient-to-r from-brand-dark/60 via-brand-dark/40 to-brand-dark/30" 
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
                      className="bg-white text-brand-dark hover:bg-white/90 font-semibold px-8 py-3 text-base shadow-lg"
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

      {/* Navigation Arrows con hover effects mejorados */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.1, x: -5 }}
        whileTap={{ scale: 0.9 }}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10"
      >
      <Button
        variant="ghost"
        size="icon"
          className="text-white hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-full h-12 w-12 md:h-14 md:w-14 transition-all duration-300 shadow-lg hover:shadow-xl"
        onClick={prevSlide}
      >
          <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
      </Button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.1, x: 5 }}
        whileTap={{ scale: 0.9 }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10"
      >
      <Button
        variant="ghost"
        size="icon"
          className="text-white hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-full h-12 w-12 md:h-14 md:w-14 transition-all duration-300 shadow-lg hover:shadow-xl"
        onClick={nextSlide}
      >
          <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
      </Button>
      </motion.div>

      {/* Dots Indicator con animaciones mejoradas */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 backdrop-blur-sm bg-brand-dark/20 px-4 py-2 rounded-full"
      >
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative rounded-full transition-all duration-500 ${
              index === currentSlide 
                ? "h-3 w-8 bg-white shadow-lg" 
                : "h-3 w-3 bg-white/50 hover:bg-white/80 hover:scale-110"
            }`}
            whileHover={{ 
              scale: index === currentSlide ? 1.05 : 1.2,
              backgroundColor: index === currentSlide ? "#ffffff" : "rgba(255,255,255,0.8)"
            }}
            whileTap={{ scale: 0.8 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: index * 0.1 + 0.8,
              type: "spring",
              stiffness: 300,
              damping: 30 
            }}
          >
            {index === currentSlide && (
              <motion.div
                layoutId="activeDotHighlight"
                className="absolute inset-0 bg-white rounded-full ring-2 ring-white/30"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            {/* Tooltip con el título del slide */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              whileHover={{ opacity: 1, y: -8, scale: 1 }}
                             className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-brand-dark/80 text-white text-xs rounded whitespace-nowrap pointer-events-none"
            >
              {slides[index].title}
                             <div className="absolute top-full left-1/2 -translate-x-1/2 border-2 border-transparent border-t-brand-dark/80" />
            </motion.div>
          </motion.button>
        ))}
      </motion.div>

      {/* Progress bar with auto-play indicator */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <motion.div
          key={`${currentSlide}-${isAutoPlaying}-${isPaused}`}
          initial={{ width: "0%" }}
          animate={{ 
            width: isAutoPlaying && !isPaused ? "100%" : "0%" 
          }}
          transition={{ 
            duration: isAutoPlaying && !isPaused ? 6 : 0,
            ease: "linear" 
          }}
          className="h-full bg-gradient-to-r from-white to-white/80 shadow-sm"
        />
      </div>


    </section>
  )
}
