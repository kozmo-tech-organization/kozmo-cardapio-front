import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient, setAuthToken } from '@repo/server'
import type { LoginInput, RegisterInput } from '@repo/schemas'

const AUTH_KEY = ['auth', 'me']

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: LoginInput) => orpcClient.auth.login(input),
    onSuccess: (data) => {
      setAuthToken(data.accessToken)
      localStorage.setItem('access_token', data.accessToken)
      queryClient.setQueryData(AUTH_KEY, data.restaurant)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RegisterInput) => orpcClient.auth.register(input),
    onSuccess: (data) => {
      setAuthToken(data.accessToken)
      localStorage.setItem('access_token', data.accessToken)
      queryClient.setQueryData(AUTH_KEY, data.restaurant)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return () => {
    setAuthToken(null)
    localStorage.removeItem('access_token')
    queryClient.clear()
  }
}

export function useCurrentRestaurant() {
  return useQuery({
    queryKey: AUTH_KEY,
    queryFn: () => orpcClient.restaurant.me(),
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: !!localStorage.getItem('access_token'),
  })
}
