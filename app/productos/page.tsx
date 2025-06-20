"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/page-transition"
import { ProductGrid } from "@/components/products/product-grid"
import { ProductFilters } from "@/components/products/product-filters"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Filter, Grid, List } from "lucide-react"

function ProductsContent() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 500000],
    sizes: [],
    colors: [],
    brands: [],
    sortBy: "newest",
  })

  // Establecer categoría desde query params
  useEffect(() => {
    const categoria = searchParams.get("categoria")
    if (categoria) {
      setFilters(prev => ({
        ...prev,
        category: categoria
      }))
    }
  }, [searchParams])

  return (
    <PageTransition className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <motion.div
              key={filters.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold mb-2">
                {filters.category 
                  ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}`
                  : "Todos los Productos"
                }
              </h1>
              <p className="text-muted-foreground">
                {filters.category === "zapatos" && "Descubre nuestra colección de zapatos elegantes y cómodos"}
                {filters.category === "correas" && "Encuentra la correa perfecta para completar tu look"}
                {filters.category === "camisetas" && "Camisetas de calidad premium para cualquier ocasión"}
                {filters.category === "ofertas" && "Las mejores ofertas y descuentos especiales"}
                {!filters.category && "Descubre nuestra colección completa de calzado y moda"}
              </p>
            </motion.div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Filter Toggle */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <ProductFilters filters={filters} onFiltersChange={setFilters} />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filters */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <ProductFilters filters={filters} onFiltersChange={setFilters} />
            </aside>

            {/* Products */}
            <div className="flex-1">
              <ProductGrid viewMode={viewMode} filters={filters} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <PageTransition className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </PageTransition>
    }>
      <ProductsContent />
    </Suspense>
  )
}
