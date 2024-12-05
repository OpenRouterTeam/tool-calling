import useSWR from 'swr'
import { openRouterAPIBaseUrl } from '../utils'

interface Model {
  id: string
  name: string
}

interface ModelsResponse {
  data: Model[]
}

const fetcher = async (url: string): Promise<ModelsResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch models')
  }
  return response.json()
}

export function useModels() {
  const { data, error, isLoading } = useSWR<ModelsResponse>(
    `${openRouterAPIBaseUrl}/api/v1/models?supported_parameters=tools`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000 // 1 hour
    }
  )

  return {
    models:
      data?.data
        .slice()
        .sort(
          (a, b) => a.id.localeCompare(b.id) || a.name.length - b.name.length
        )
        .filter(
          (item, index, array) => index === 0 || item.id !== array[index - 1].id
        ) ?? [],
    isLoading,
    error
  }
}
