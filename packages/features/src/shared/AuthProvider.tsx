import React, { createContext, useContext, useEffect, useState } from 'react'
import { setAuthToken } from '@repo/server'
import type { Restaurant } from '@repo/schemas'

interface AuthContextValue {
  restaurant: Restaurant | null
  isLoading: boolean
  isAuthenticated: boolean
  setRestaurant: (restaurant: Restaurant | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [restaurant, setRestaurantState] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setAuthToken(token)
    }
    setIsLoading(false)
  }, [])

  function setRestaurant(r: Restaurant | null) {
    setRestaurantState(r)
    if (!r) {
      localStorage.removeItem('access_token')
      setAuthToken(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        restaurant,
        isLoading,
        isAuthenticated: !!restaurant,
        setRestaurant,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
