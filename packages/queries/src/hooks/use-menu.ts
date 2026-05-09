import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@repo/server'

export function useMenu(slug: string) {
  return useQuery({
    queryKey: ['menu', slug],
    queryFn: () => orpcClient.menu.getBySlug({ slug }),
    enabled: !!slug,
    staleTime: 1000 * 60 * 2,
  })
}
