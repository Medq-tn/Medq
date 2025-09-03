'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // If user is logged in, redirect based on their role
    if (!isLoading && user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/coming-soon');
      }
    }
  }, [user, isLoading, router])

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If user is logged in, don't show 404 page (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            404
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            {t('common.pageNotFound')}
          </p>
        </div>
        <div className="space-x-4">
          <Button
            onClick={() => router.push('/auth')}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Login
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.goBack')}
          </Button>
        </div>
      </div>
    </div>
  )
} 