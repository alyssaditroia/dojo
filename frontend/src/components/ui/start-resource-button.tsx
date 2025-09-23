'use client'

import React, { startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, BookOpen, Video, Loader2 } from 'lucide-react'
import { useUIStore, useDojoStore } from '@/stores'
import { cn } from '@/lib/utils'

interface StartResourceButtonProps {
  dojoId: string
  moduleId: string
  resourceId: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  children?: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
}

export function StartResourceButton({
  dojoId,
  moduleId,
  resourceId,
  variant = 'default',
  size = 'default',
  className,
  children,
  onClick
}: StartResourceButtonProps) {
  const router = useRouter()
  const setActiveResource = useUIStore(state => state.setActiveResource)
  const dojos = useDojoStore(state => state.dojos)
  const modulesMap = useDojoStore(state => state.modules)

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation()

    // Call custom onClick if provided
    if (onClick) {
      onClick(e)
    }

    // Get data for optimistic update
    const dojo = dojos.find(d => d.id === dojoId)
    const modules = modulesMap[dojoId] || []
    const module = modules.find(m => m.id === moduleId)
    const resource = module?.resources?.find(r => r.id === resourceId)

    // 1. Set active resource state immediately (optimistic update with proper names)
    if (setActiveResource) {
      setActiveResource({
        dojoId,
        moduleId,
        resourceId,
        resourceName: resource?.name || resourceId,
        dojoName: dojo?.name || dojoId,
        moduleName: module?.name || moduleId,
        resourceType: resource?.type || 'markdown'
      })
    }

    // 2. Navigate immediately using startTransition for instant feel
    startTransition(() => {
      router.push(`/dojo/${dojoId}/module/${moduleId}/workspace/resource/${resourceId}`)
    })
  }

  // Determine icon based on resource type
  const getIcon = () => {
    const modules = modulesMap[dojoId] || []
    const module = modules.find(m => m.id === moduleId)
    const resource = module?.resources?.find(r => r.id === resourceId)

    if (resource?.type === 'lecture') {
      return <Video className="h-3 w-3 mr-1" />
    }
    return <BookOpen className="h-3 w-3 mr-1" />
  }

  const isLoading = false // No loading state - navigate immediately

  return (
    <Button
      onClick={handleStart}
      size={size}
      variant={variant}
      disabled={isLoading}
      className={cn(className)}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
      ) : (
        getIcon()
      )}
      {children || 'Start Learning'}
    </Button>
  )
}