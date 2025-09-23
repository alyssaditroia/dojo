'use client'

import { use, memo, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useDojoStore, useUIStore } from '@/stores'
import { DojoWorkspaceLayout } from '@/components/layout/DojoWorkspaceLayout'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

interface WorkspacePageProps {
  params: Promise<{
    dojoId: string
    moduleId: string
    params?: string[]
  }>
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const { dojoId, moduleId, params: urlParams } = use(params)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()


  // Let DojoWorkspaceLayout handle routing internally via URL params
  // This prevents Next.js from remounting on navigation

  // Basic state access without complex selectors
  const dojos = useDojoStore(state => state.dojos)
  const modulesMap = useDojoStore(state => state.modules)
  const solvesMap = useDojoStore(state => state.solves)
  const isLoading = useDojoStore(state => state.loadingDojos || state.loadingModules[dojoId || ''] || state.loadingSolves[`${dojoId}-all`])
  const error = useDojoStore(state => state.dojoError || state.moduleError[dojoId || ''] || state.solveError[`${dojoId}-all`])

  // Set active challenge in UI store - MUST be before any conditional returns
  const setActiveChallenge = useUIStore(state => state.setActiveChallenge)

  // Simple data lookup
  const dojo = dojos.find(d => d.id === dojoId)
  const modules = modulesMap[dojoId || ''] || []
  const solves = solvesMap[`${dojoId}-all`] || []

  // Get solved challenge IDs
  const solvedChallengeIds = new Set(
    solves
      ?.filter(solve => solve.module_id === moduleId)
      .map(solve => solve.challenge_id) || []
  )

  // Enrich module with solved status - memoized for stability
  const enrichedModule = useMemo(() => {
    const module = modules.find(m => m.id === moduleId)
    return module ? {
      ...module,
      challenges: module.challenges.map(challenge => ({
        ...challenge,
        solved: solvedChallengeIds.has(challenge.id)
      }))
    } : undefined
  }, [modules, moduleId, solvedChallengeIds])

  // Memoize event handlers to prevent unnecessary re-renders
  const handleChallengeStart = useMemo(() =>
    (dojoId: string, moduleId: string, challengeId: string) => {
      router.push(`/dojo/${dojoId}/module/${moduleId}/workspace/challenge/${challengeId}`)
    }, [router]
  )

  const handleResourceSelect = useMemo(() =>
    (resourceId?: string) => {
      if (resourceId) {
        router.push(`/dojo/${dojoId}/module/${moduleId}/workspace/resource/${resourceId}`)
      } else {
        router.push(`/dojo/${dojoId}/module/${moduleId}`)
      }
    }, [router, dojoId, moduleId]
  )

  const handleChallengeClose = useMemo(() =>
    () => {
      // Navigate immediately since we removed animations
      router.push(`/dojo/${dojoId}/module/${moduleId}`)
    }, [router, dojoId, moduleId]
  )


  useEffect(() => {
    if (dojoId) {
      useDojoStore.getState().fetchModules(dojoId)
      useDojoStore.getState().fetchSolves(dojoId)
    }
  }, [dojoId])


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading workspace...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Failed to load workspace</h1>
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dojos
          </Button>
        </div>
      </div>
    )
  }

  // Always show workspace if we have the module data
  if (!enrichedModule) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Module not found</h1>
          <Button variant="outline" onClick={() => router.push(`/dojo/${dojoId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dojo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full z-40">
      <DojoWorkspaceLayout
        dojo={dojo!}
        modules={[enrichedModule]}
        onChallengeStart={handleChallengeStart}
        onResourceSelect={handleResourceSelect}
        onChallengeClose={handleChallengeClose}
      />
    </div>
  )
}

// Memoized DojoWorkspaceLayout to prevent re-renders on navigation
const MemoizedDojoWorkspaceLayout = memo(DojoWorkspaceLayout)