import { useState, useEffect } from "react"

export function useCachedFetch<T>(key: string, fetcher: () => Promise<T>, ttl = 300000) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    let isMounted = true
    const cached = localStorage.getItem(key)
    const cachedTime = localStorage.getItem(key + "_time")
    const now = Date.now()

    if (cached && cachedTime && now - parseInt(cachedTime) < ttl) {
      setData(JSON.parse(cached))
      setLoading(false)
    } else {
      fetcher()
        .then((res) => {
          if (isMounted) {
            setData(res)
            setLoading(false)
            localStorage.setItem(key, JSON.stringify(res))
            localStorage.setItem(key + "_time", now.toString())
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err)
            setLoading(false)
          }
        })
    }
    return () => { isMounted = false }
  }, [key, fetcher, ttl])

  const refetch = () => {
    setLoading(true)
    fetcher()
      .then((res) => {
        setData(res)
        setLoading(false)
        localStorage.setItem(key, JSON.stringify(res))
        localStorage.setItem(key + "_time", Date.now().toString())
      })
      .catch((err) => {
        setError(err)
        setLoading(false)
      })
  }

  return { data, loading, error, refetch }
} 