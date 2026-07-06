'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IntelFeedCard } from './components/IntelFeedCard'

const GlobeComponent = dynamic(
  () => import('./components/Globe').then((mod) => mod.GlobeComponent),
  {
    ssr: false,
    loading: () => <div className="h-[420px] rounded-2xl bg-zinc-900 border border-zinc-800" />,
  }
)

type DashboardOverview = {
  kpis?: {
    total_posts_analyzed?: number
    active_topics?: number
    regions_monitored?: number
    signals_generated?: number
    total_topics_monitored?: number
  }
  citizen_signals?: Array<{
    topic?: string
    excerpt?: string
    sentiment_label?: string
    sentiment_score?: number
    sample_size?: number
    trend?: string
    last_updated?: string
  }>
  grok_ai_summary?: string
  generated_at?: string
}

export default function Dashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError('Missing Supabase environment variables')
        setLoading(false)
        return
      }

      const { data, error: queryError } = await supabase
        .from('dashboard_overviews')
        .select('kpis, citizen_signals, grok_ai_summary, generated_at')
        .order('generated_at', { ascending: false })
        .limit(1)
        .single()

      if (queryError) {
        setError(queryError.message)
      } else if (data) {
        setOverview(data)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-400 p-8 text-center">
        Failed to load dashboard: {error}
      </div>
    )
  }

  const kpis = overview?.kpis
  const signals = overview?.citizen_signals ?? []

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-5xl font-bold mb-2">Elenchos</h1>
      {overview?.grok_ai_summary && (
        <p className="text-zinc-400 mb-8 max-w-4xl">{overview.grok_ai_summary}</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <div className="text-sm text-zinc-400">Posts Analyzed</div>
          <div className="text-4xl font-bold">{kpis?.total_posts_analyzed ?? 0}</div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <div className="text-sm text-zinc-400">Active Topics</div>
          <div className="text-4xl font-bold">{kpis?.active_topics ?? 0}</div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <div className="text-sm text-zinc-400">Regions Monitored</div>
          <div className="text-4xl font-bold">{kpis?.regions_monitored ?? 0}</div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <div className="text-sm text-zinc-400">Signals Generated</div>
          <div className="text-4xl font-bold">{kpis?.signals_generated ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <GlobeComponent data={[]} />
        </div>
        <div className="space-y-4">
          {signals.map((signal, i) => (
            <IntelFeedCard key={`${signal.topic}-${i}`} signal={signal} />
          ))}
        </div>
      </div>
    </div>
  )
}