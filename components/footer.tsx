import React from 'react'

import { cn } from '@/lib/utils'
import { ExternalLink } from '@/components/external-link'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      Open source AI tool calling chatbot built with{' '}
      <ExternalLink href="https://nextjs.org">Next.js</ExternalLink>,{' '}
      <ExternalLink href="https://openrouter.ai">OpenRouter</ExternalLink>, and{' '}
      <ExternalLink href="https://github.com/vercel/ai">
        Vercel AI SDK
      </ExternalLink>
      .
    </p>
  )
}
