import { useEffect, useState, useCallback } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase/client'

interface UseSupabaseQueryOptions {
  queryKey: string
  queryFn: () => Promise<any>
  enabled?: boolean
  staleTime?: number
}

const CACHE_PREFIX = 'sq_'
const CACHE_VERSION = '1'

export function useSupabaseQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 1000 * 60 * 5,
}: UseSupabaseQueryOptions) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const cacheKey = `${CACHE_PREFIX}${CACHE_VERSION}_${queryKey}`

  const getCachedData = useCallback(() => {
    if (typeof window === 'undefined') return null
    try {
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null
      const { data, timestamp } = JSON.parse(cached)
      return Date.now() - timestamp < staleTime ? data : null
    } catch {
      return null
    }
  }, [cacheKey, staleTime])

  const setCachedData = useCallback((data: T) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch {}
  }, [cacheKey])

  useEffect(() => {
    if (!enabled) return

    let mounted = true

    const fetchData = async () => {
      try {
        const cachedData = getCachedData()
        if (cachedData && mounted) {
          setData(cachedData)
          setIsLoading(false)
          return
        }

        const result = await queryFn()
        if (mounted) {
          setData(result)
          setIsLoading(false)
          setCachedData(result)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('An error occurred'))
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [queryKey, queryFn, enabled, staleTime, getCachedData, setCachedData])

  return { data, error, isLoading }
}