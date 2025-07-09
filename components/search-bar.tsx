"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, Package, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  name: string
  slug: string
  description: string | null
  basePrice: number
  images: string[]
  category: {
    name: string
    slug: string
  }
  isNew: boolean
  isFeatured: boolean
}

interface SearchBarProps {
  className?: string
  placeholder?: string
  onResultClick?: () => void
}

export function SearchBar({ 
  className, 
  placeholder = "Buscar productos...",
  onResultClick 
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Search function
  const searchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
        setIsOpen(data.length > 0)
        setSelectedIndex(-1)
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      setResults([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input change with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchProducts(query)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          const selected = results[selectedIndex]
          window.location.href = `/productos/${selected.slug}`
          handleResultClick()
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleResultClick = () => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(-1)
    onResultClick?.()
  }

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className={cn("relative w-full", className)} ref={resultsRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin z-10" />
        )}
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 transition-all focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-96 overflow-y-auto"
          >
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <Link
                    key={result.id}
                    href={`/productos/${result.slug}`}
                    onClick={handleResultClick}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors",
                      selectedIndex === index && "bg-accent"
                    )}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-md overflow-hidden">
                      {result.images && result.images.length > 0 ? (
                        <Image
                          src={result.images[0]}
                          alt={result.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm truncate pr-2">
                          {result.name}
                        </h4>
                        <div className="flex-shrink-0 flex items-center gap-1">
                          {result.isNew && (
                            <Badge variant="secondary" className="text-xs">
                              Nuevo
                            </Badge>
                          )}
                          {result.isFeatured && (
                            <Badge variant="default" className="text-xs">
                              Destacado
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.category.name}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-sm text-primary">
                          {formatPrice(Number(result.basePrice))}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                ))}
                
                {query && (
                  <Link
                    href={`/productos?search=${encodeURIComponent(query)}`}
                    onClick={handleResultClick}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-primary hover:bg-accent transition-colors border-t"
                  >
                    <Search className="h-4 w-4" />
                    Ver todos los resultados para "{query}"
                  </Link>
                )}
              </div>
            ) : query && !isLoading ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No se encontraron productos</p>
                <p className="text-xs mt-1">Intenta con otros términos de búsqueda</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 