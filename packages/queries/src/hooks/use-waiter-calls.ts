import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@repo/server'
import type { CreateWaiterCallInput, UpdateWaiterCallStatusInput, WaiterCall } from '@repo/schemas'

const WAITER_CALLS_KEY = ['waiterCalls']

export function useWaiterCalls() {
  return useQuery({
    queryKey: WAITER_CALLS_KEY,
    queryFn: () => orpcClient.waiterCalls.list(),
    staleTime: 30_000,
  })
}

export function useWaiterCallStatus(callId: string | null) {
  return useQuery({
    queryKey: ['waiterCallStatus', callId],
    queryFn: () => orpcClient.waiterCalls.getById({ id: callId! }),
    enabled: !!callId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useSetWaiterCallStatus() {
  const queryClient = useQueryClient()
  return (call: WaiterCall) => {
    queryClient.setQueryData(['waiterCallStatus', call.id], call)
  }
}

export function useCreateWaiterCall() {
  return useMutation({
    mutationFn: (input: CreateWaiterCallInput) => orpcClient.waiterCalls.create(input),
  })
}

export function useUpdateWaiterCallStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateWaiterCallStatusInput) => orpcClient.waiterCalls.updateStatus(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WAITER_CALLS_KEY }),
  })
}
