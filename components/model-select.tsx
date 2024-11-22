'use client'

import { useCallback, useMemo } from 'react'
import { useQueryState } from 'nuqs'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useModels } from '@/lib/hooks/use-models'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { TooltipPortal } from '@radix-ui/react-tooltip'
import { useUIState } from 'ai/rsc'
import { AI } from '@/lib/chat/actions'

// const featuredToolCallingModels = [
//   'anthropic/claude-3-haiku',
//   'anthropic/claude-3-sonnet',
//   'anthropic/claude-3-opus',
//   'anthropic/claude-3.5-sonnet',
//   'mistralai/mistral-nemo',
//   'openai/gpt-3.5-turbo',
//   'openai/gpt-4-turbo',
//   'openai/gpt-4',
//   'openai/gpt-4-0314',
//   'openai/gpt-4-0613',
//   'openai/gpt-4-32k',
//   'openai/gpt-4-32k-0314',
//   // These are highly rate-limited
//   // 'google/gemini-flash-1.5-exp',
//   // 'google/gemini-pro-1.5-exp'
//   // 'meta-llama/llama-3.1-405b-instruct',
//   'cohere/command-r-plus-08-2024',

//   'google/gemini-pro-1.5',
//   'google/gemini-flash-1.5',
//   'mistralai/mistral-large'
// ]

export function ModelSelectContent() {
  const { models, isLoading, error } = useModels()
  const [modelSlug, setModelSlug] = useQueryState('modelSlug', {
    defaultValue: 'anthropic/claude-3.5-sonnet'
  })
  const [__, setMessages] = useUIState<typeof AI>()

  const onValueChange = useCallback(
    (value: string) => {
      setModelSlug(value)
      setMessages([])
    },
    [setModelSlug, setMessages]
  )

  const modelOptions = useMemo(() => {
    if (isLoading) {
      return [
        <SelectItem key="loading" value="loading" disabled>
          Loading...
        </SelectItem>
      ]
    }
    if (error) {
      return [
        <SelectItem key="error" value="error" disabled>
          Error loading models
        </SelectItem>
      ]
    }
    return models
      .filter(model => !model.id.includes(':'))
      .map(model => (
        <SelectItem key={model.id} value={model.id}>
          {model.name}
        </SelectItem>
      ))
  }, [models, isLoading, error])

  return (
    <Select onValueChange={onValueChange} value={modelSlug ?? ''}>
      <SelectTrigger className="w-full bg-background rounded-lg">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent className="w-full">
        <SelectGroup>
          <SelectLabel className="flex items-center gap-1">
            Featured OpenRouter Tool Calling Models [A-Z]
            <Tooltip delayDuration={0}>
              <TooltipPortal>
                <TooltipContent className="z-50">
                  Different models and providers can offer varying quality and
                  feature parity for tool calling. <br />
                  Learn more:{' '}
                  <a
                    href="https://openrouter.ai/docs/requests"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    OpenRouter Docs
                  </a>
                </TooltipContent>
              </TooltipPortal>
              <TooltipTrigger asChild>
                <InfoCircledIcon className="size-4" />
              </TooltipTrigger>
            </Tooltip>
          </SelectLabel>
          {modelOptions}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
