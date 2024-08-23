import useSWR from 'swr'

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
    'https://openrouter.ai/api/v1/models?supported_parameters=tools,tool_choice',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000 // 1 hour
    }
  )

  return {
    models: data?.data ?? [],
    isLoading,
    error
  }
}