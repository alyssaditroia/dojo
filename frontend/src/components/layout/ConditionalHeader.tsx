'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from './Header'

export function ConditionalHeader() {
  const pathname = usePathname()

  // Check if we're in a workspace page or auth page
  const isWorkspacePage = pathname.includes('/workspace/')
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password')

  return (
    <AnimatePresence mode="wait">
      {!isWorkspacePage && !isAuthPage && (
        <motion.div
          key="header"
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94] // Apple-grade easing
          }}
          className="relative z-50"
        >
          <Header />
        </motion.div>
      )}
    </AnimatePresence>
  )
}