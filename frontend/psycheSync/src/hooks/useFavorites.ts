import { useState, useEffect, useCallback } from "react"
import type { CodeResult } from "@/types/icd"

const STORAGE_KEY = "psychesync_favorites"

export function useFavorites() {
  const [favorites, setFavorites] = useState<CodeResult[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = useCallback((code: string, description: string) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.code === code)
      return exists
        ? prev.filter((f) => f.code !== code)
        : [...prev, { code, description }]
    })
  }, [])

  const isFavorited = useCallback(
    (code: string) => favorites.some((f) => f.code === code),
    [favorites]
  )

  return { favorites, toggleFavorite, isFavorited }
}
