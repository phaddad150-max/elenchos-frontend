export function IntelFeedCard({
  signal,
}: {
  signal: {
    topic?: string
    excerpt?: string
    sentiment_label?: string
    sentiment_score?: number
    sample_size?: number
    trend?: string
  }
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="font-medium">{signal.topic}</div>
          {signal.trend && (
            <div className="text-xs text-zinc-500 mt-0.5 capitalize">Trend: {signal.trend}</div>
          )}
        </div>
        <div className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 whitespace-nowrap">
          {signal.sentiment_label ?? 'Unknown'}
        </div>
      </div>
      <p className="text-sm text-zinc-300 mt-3 line-clamp-3">{signal.excerpt}</p>
      <div className="flex gap-5 text-xs text-zinc-500 mt-4">
        <span>Posts: {signal.sample_size ?? 0}</span>
        {signal.sentiment_score != null && <span>Score: {signal.sentiment_score}</span>}
      </div>
    </div>
  )
}