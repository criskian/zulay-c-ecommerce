"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, Move, ImageIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  maxSizeInMB?: number
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 6, 
  maxSizeInMB = 5 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    // Check if adding files would exceed max limit
    if (images.length + files.length > maxImages) {
      toast({
        title: "Límite de imágenes",
        description: `Solo puedes subir un máximo de ${maxImages} imágenes`,
        variant: "destructive"
      })
      return
    }

    setUploading(true)

    try {
      const newImages: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Tipo de archivo inválido",
            description: `${file.name} no es una imagen válida`,
            variant: "destructive"
          })
          continue
        }

        // Validate file size
        if (file.size > maxSizeInMB * 1024 * 1024) {
          toast({
            title: "Archivo muy grande",
            description: `${file.name} es muy grande. Máximo ${maxSizeInMB}MB`,
            variant: "destructive"
          })
          continue
        }

        // Create form data for upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'products')

        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          if (response.ok) {
            const data = await response.json()
            newImages.push(data.url)
          } else {
            const errorData = await response.json()
            toast({
              title: "Error al subir imagen",
              description: errorData.error || `No se pudo subir ${file.name}`,
              variant: "destructive"
            })
          }
        } catch (error) {
          console.error('Error uploading file:', error)
          toast({
            title: "Error de conexión",
            description: `No se pudo subir ${file.name}`,
            variant: "destructive"
          })
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages])
        toast({
          title: "Imágenes subidas",
          description: `${newImages.length} imagen(es) subida(s) correctamente`
        })
      }

    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
    
    toast({
      title: "Imagen eliminada",
      description: "La imagen se ha eliminado correctamente"
    })
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onImagesChange(newImages)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={triggerFileInput}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium">
              {uploading ? "Subiendo imágenes..." : "Haz clic para subir imágenes"}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF hasta {maxSizeInMB}MB (máximo {maxImages} imágenes)
            </p>
          </div>
          {uploading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={uploading || images.length >= maxImages}
      />

      {/* Images Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">
              Imágenes ({images.length}/{maxImages})
            </h4>
            <p className="text-xs text-gray-500">
              Arrastra para reordenar
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {images.map((imageUrl, index) => (
                <motion.div
                  key={`${imageUrl}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`relative group cursor-move ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={imageUrl}
                          alt={`Producto imagen ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        
                        {/* Main image indicator */}
                        {index === 0 && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                              Principal
                            </span>
                          </div>
                        )}

                        {/* Move indicator */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/50 text-white p-1 rounded">
                            <Move className="h-3 w-3" />
                          </div>
                        </div>

                        {/* Remove button */}
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(index)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add more button */}
            {images.length < maxImages && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={triggerFileInput}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
                      <div className="text-center">
                        <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Agregar</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No hay imágenes subidas</p>
          <p className="text-xs text-gray-400">
            Las imágenes aparecerán aquí una vez subidas
          </p>
        </div>
      )}
    </div>
  )
} 