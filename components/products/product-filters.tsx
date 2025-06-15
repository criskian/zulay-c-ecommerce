"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface ProductFiltersProps {
  filters: {
    category: string
    priceRange: number[]
    sizes: string[]
    colors: string[]
    brands: string[]
    sortBy: string
  }
  onFiltersChange: (filters: any) => void
}

const categories = [
  { id: "zapatos", name: "Zapatos" },
  { id: "correas", name: "Correas" },
  { id: "camisetas", name: "Camisetas" },
  { id: "accesorios", name: "Accesorios" },
]

const sizes = ["35", "36", "37", "38", "39", "40", "41", "42", "S", "M", "L", "XL"]
const colors = ["Negro", "Blanco", "Café", "Gris", "Azul", "Rojo", "Verde"]
const brands = ["Zulay C", "Premium", "Classic", "Sport"]

export function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const handleArrayFilterChange = (key: string, value: string, checked: boolean) => {
    const currentArray = filters[key as keyof typeof filters] as string[]
    const newArray = checked ? [...currentArray, value] : currentArray.filter((item) => item !== value)

    handleFilterChange(key, newArray)
  }

  const clearFilters = () => {
    onFiltersChange({
      category: "",
      priceRange: [0, 500000],
      sizes: [],
      colors: [],
      brands: [],
      sortBy: "newest",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Limpiar
        </Button>
      </div>

      {/* Sort By */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Ordenar por</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
              <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
              <SelectItem value="popular">Más populares</SelectItem>
              <SelectItem value="rating">Mejor calificados</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Categorías</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={filters.category === category.id}
                onCheckedChange={(checked) => handleFilterChange("category", checked ? category.id : "")}
              />
              <Label htmlFor={category.id} className="text-sm">
                {category.name}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Rango de Precio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => handleFilterChange("priceRange", value)}
            max={500000}
            min={0}
            step={10000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(filters.priceRange[0])}</span>
            <span>{formatPrice(filters.priceRange[1])}</span>
          </div>
        </CardContent>
      </Card>

      {/* Sizes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tallas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size}`}
                  checked={filters.sizes.includes(size)}
                  onCheckedChange={(checked) => handleArrayFilterChange("sizes", size, checked as boolean)}
                />
                <Label htmlFor={`size-${size}`} className="text-sm">
                  {size}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Colores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {colors.map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox
                id={`color-${color}`}
                checked={filters.colors.includes(color)}
                onCheckedChange={(checked) => handleArrayFilterChange("colors", color, checked as boolean)}
              />
              <Label htmlFor={`color-${color}`} className="text-sm">
                {color}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Brands */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Marcas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={filters.brands.includes(brand)}
                onCheckedChange={(checked) => handleArrayFilterChange("brands", brand, checked as boolean)}
              />
              <Label htmlFor={`brand-${brand}`} className="text-sm">
                {brand}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
