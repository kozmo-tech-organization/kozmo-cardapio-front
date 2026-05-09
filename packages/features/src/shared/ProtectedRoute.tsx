import React from 'react'
import { Navigate } from 'react-router'
import { useCurrentRestaurant } from '@repo/queries'
import { Spinner } from '@repo/ui'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: restaurant, isLoading, isError } = useCurrentRestaurant()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !restaurant) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
