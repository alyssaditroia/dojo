'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useEffect, useState } from 'react'
import { initializeStores } from '@/stores'
import { WorkspaceProvider } from '@/components/providers/WorkspaceProvider'
import { ConditionalHeader } from '@/components/layout/ConditionalHeader'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    initializeStores()
  }, [])

  return (
    <ThemeProvider defaultTheme="system" storageKey="dojo-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WorkspaceProvider>
            <div className="min-h-screen bg-background">
              <ConditionalHeader />
              <main className="flex-1">{children}</main>
            </div>
          </WorkspaceProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}