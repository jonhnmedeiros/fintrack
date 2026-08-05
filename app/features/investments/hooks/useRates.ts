import { useQuery } from '@tanstack/react-query'

export function useRates() {
  return useQuery({
    queryKey: ['rates'],
    queryFn: () => fetch('/api/rates').then((r) => r.json()),
    staleTime: 60 * 60 * 1000, // 1h — a taxa muda pouco, e o servidor já cacheia por 6h
  })
}
