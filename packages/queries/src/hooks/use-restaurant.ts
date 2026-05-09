import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@repo/server'
import type { UpdateRestaurantInput } from '@repo/schemas'

export function useUpdateRestaurant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateRestaurantInput) => orpcClient.restaurant.update(input),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data)
    },
  })
}
