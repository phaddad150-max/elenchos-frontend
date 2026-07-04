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

export default function Dashboard() {
  const [overview, setOverview] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }

      const currentMonth = new Date().toISOString().slice(0, 7)
      const { data } = await supabase
        .from('dashboard_overviews')
        .select('*')
        .eq('month', currentMonth)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single()

      if (data) setOverview(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-5xl font-bold mb-8">Elenchos</h1>
      
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <div>Posts Analyzed</div>
          <div className="text-4xl font-bold">{overview?.total_posts_analyzed || 0}</div>
        </div>
        {/* Add other KPIs similarly */}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <GlobeComponent data={overview?.intel_feed || []} />
        </div>
        <div className="space-y-4">
          {overview?.intel_feed?.map((signal: any, i: number) => (
            <IntelFeedCard key={i} signal={signal} />
          ))}
        </div>
      </div>
    </div>
  )
}