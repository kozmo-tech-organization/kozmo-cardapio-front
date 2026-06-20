import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@repo/server'
import type { CreateTableInput } from '@repo/schemas'

const TABLES_KEY = ['tables']

export function useTables() {
  return useQuery({
    queryKey: TABLES_KEY,
    queryFn: () => orpcClient.tables.list(),
    staleTime: 30_000,
  })
}

export function useTableById(id: string | null) {
  return useQuery({
    queryKey: ['table', id],
    queryFn: () => orpcClient.tables.getById({ id: id! }),
    enabled: !!id,
    staleTime: 60_000,
  })
}

export function useCreateTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTableInput) => orpcClient.tables.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TABLES_KEY }),
  })
}

export function useDeleteTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orpcClient.tables.delete({ id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TABLES_KEY }),
  })
}
