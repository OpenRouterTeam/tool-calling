'use client'

import { useMemo } from 'react'
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

export function ModelSelectContent() {
  const { models, isLoading, error } = useModels()
  const [modelSlug, setModelSlug] = useQueryState('modelSlug', {
    defaultValue: 'anthropic/claude-3.5-sonnet:beta'
  })

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
    return models.map(model => (
      <SelectItem key={model.id} value={model.id}>
        {model.name}
      </SelectItem>
    ))
  }, [models, isLoading, error])

  return (
    <Select onValueChange={setModelSlug} value={modelSlug ?? ''}>
      <SelectTrigger className="w-full bg-background rounded-lg">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent className="w-full">
        <SelectGroup>
          <SelectLabel className="flex items-center gap-1">
            OpenRouter Tool Calling Models
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
