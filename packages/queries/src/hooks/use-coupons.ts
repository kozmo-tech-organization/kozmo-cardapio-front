import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@repo/server'
import type { CreateCouponInput, UpdateCouponInput, ValidateCouponInput } from '@repo/schemas'

const COUPONS_KEY = ['coupons']

export function useCoupons() {
  return useQuery({
    queryKey: COUPONS_KEY,
    queryFn: () => orpcClient.coupons.list(),
    staleTime: 60_000,
  })
}

export function useCreateCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCouponInput) => orpcClient.coupons.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COUPONS_KEY }),
  })
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: string } & UpdateCouponInput) => orpcClient.coupons.update(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COUPONS_KEY }),
  })
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orpcClient.coupons.delete({ id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COUPONS_KEY }),
  })
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (input: ValidateCouponInput) => orpcClient.coupons.validate(input),
  })
}
