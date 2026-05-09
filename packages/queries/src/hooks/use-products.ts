import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@repo/server'
import type { CreateProductInput, UpdateProductInput, ProductFilters } from '@repo/schemas'

const PRODUCTS_KEY = ['products']

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, filters],
    queryFn: () => orpcClient.products.list(filters),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProductInput) => orpcClient.products.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateProductInput) =>
      orpcClient.products.update({ id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => orpcClient.products.delete({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
    },
  })
}
