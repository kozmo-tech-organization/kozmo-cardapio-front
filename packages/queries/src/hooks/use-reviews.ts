import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@repo/server'
import type { CreateReviewInput } from '@repo/schemas'

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => orpcClient.reviews.listByProduct({ productId }),
    enabled: !!productId,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReviewInput) => orpcClient.reviews.create(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['menu'] })
    },
  })
}
