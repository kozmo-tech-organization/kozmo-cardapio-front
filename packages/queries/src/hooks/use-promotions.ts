import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@repo/server'
import type { CreatePromotionInput, UpdatePromotionInput } from '@repo/schemas'

const PROMOTIONS_KEY = ['promotions']

export function usePromotions() {
  return useQuery({
    queryKey: PROMOTIONS_KEY,
    queryFn: () => orpcClient.promotions.list(),
  })
}

export function useCreatePromotion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePromotionInput) => orpcClient.promotions.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_KEY })
    },
  })
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdatePromotionInput) =>
      orpcClient.promotions.update({ id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_KEY })
    },
  })
}

export function useDeletePromotion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => orpcClient.promotions.delete({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_KEY })
    },
  })
}

export function useSetPromotionProducts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { promotionId: string; productIds: string[] }) =>
      orpcClient.promotions.setProducts(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_KEY })
    },
  })
}
