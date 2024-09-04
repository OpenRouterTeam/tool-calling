'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import { SidebarProvider } from '@/lib/hooks/use-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { OpenRouterAuthProvider } from '@/app/openrouter-auth-provider'
import ErrorBoundary from '@/components/error-boundary'
import Fallback from '@/components/fallback'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <SidebarProvider>
        <TooltipProvider>
          <OpenRouterAuthProvider>
            <ErrorBoundary fallback={<Fallback />}>{children}</ErrorBoundary>
          </OpenRouterAuthProvider>
        </TooltipProvider>
      </SidebarProvider>
    </NextThemesProvider>
  )
}
