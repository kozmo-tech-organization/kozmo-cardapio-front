import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@repo/server'
import type { CreateOrderInput, UpdateOrderStatusInput } from '@repo/schemas'

const ORDERS_KEY = ['orders']

export function useOrders() {
  return useQuery({
    queryKey: ORDERS_KEY,
    queryFn: () => orpcClient.orders.list(),
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  })
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (input: CreateOrderInput) => orpcClient.orders.create(input),
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateOrderStatusInput) => orpcClient.orders.updateStatus(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY })
    },
  })
}
