"use client"

import React, { createContext, useContext, useEffect, useReducer } from "react"

// Tipos
export interface FavoriteProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  category: string
  addedAt: string
}

interface FavoritesState {
  items: FavoriteProduct[]
  itemCount: number
}

type FavoritesAction =
  | { type: "ADD_FAVORITE"; payload: FavoriteProduct }
  | { type: "REMOVE_FAVORITE"; payload: string }
  | { type: "CLEAR_FAVORITES" }
  | { type: "LOAD_FAVORITES"; payload: FavoriteProduct[] }

// Estado inicial
const initialState: FavoritesState = {
  items: [],
  itemCount: 0,
}

// Reducer
function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case "ADD_FAVORITE": {
      // Verificar si ya existe
      const existingItem = state.items.find(item => item.id === action.payload.id)
      if (existingItem) {
        return state // Ya existe, no hacer nada
      }

      const newItems = [...state.items, action.payload]
      return {
        items: newItems,
        itemCount: newItems.length,
      }
    }

    case "REMOVE_FAVORITE": {
      const newItems = state.items.filter(item => item.id !== action.payload)
      return {
        items: newItems,
        itemCount: newItems.length,
      }
    }

    case "CLEAR_FAVORITES": {
      return {
        items: [],
        itemCount: 0,
      }
    }

    case "LOAD_FAVORITES": {
      return {
        items: action.payload,
        itemCount: action.payload.length,
      }
    }

    default:
      return state
  }
}

// Contexto
interface FavoritesContextType {
  state: FavoritesState
  dispatch: React.Dispatch<FavoritesAction>
  addFavorite: (product: Omit<FavoriteProduct, "addedAt">) => void
  removeFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  clearFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

// Provider
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState)

  // Cargar favoritos del localStorage al inicializar
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedFavorites = localStorage.getItem("zulay-c-favorites")
        if (savedFavorites) {
          const favorites = JSON.parse(savedFavorites) as FavoriteProduct[]
          dispatch({ type: "LOAD_FAVORITES", payload: favorites })
        }
      } catch (error) {
        console.error("Error loading favorites from localStorage:", error)
      }
    }
  }, [])

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("zulay-c-favorites", JSON.stringify(state.items))
      } catch (error) {
        console.error("Error saving favorites to localStorage:", error)
      }
    }
  }, [state.items])

  // Funciones de utilidad
  const addFavorite = (product: Omit<FavoriteProduct, "addedAt">) => {
    dispatch({
      type: "ADD_FAVORITE",
      payload: {
        ...product,
        addedAt: new Date().toISOString(),
      },
    })
  }

  const removeFavorite = (productId: string) => {
    dispatch({ type: "REMOVE_FAVORITE", payload: productId })
  }

  const isFavorite = (productId: string) => {
    return state.items.some(item => item.id === productId)
  }

  const clearFavorites = () => {
    dispatch({ type: "CLEAR_FAVORITES" })
  }

  const value: FavoritesContextType = {
    state,
    dispatch,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
  }

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

// Hook personalizado
export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
} 