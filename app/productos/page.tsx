"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/products/product-grid"
import { ProductFilters } from "@/components/products/product-filters"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Filter, Grid, List } from "lucide-react"

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 500000],
    sizes: [],
    colors: [],
    brands: [],
    sortBy: "newest",
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Todos los Productos</h1>
              <p className="text-muted-foreground">Descubre nuestra colección completa de calzado y moda</p>
            </div>

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
    </div>
  )
}
