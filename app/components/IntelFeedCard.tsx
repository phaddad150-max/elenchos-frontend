export function IntelFeedCard({ signal }: { signal: any }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium">{signal.topic}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{signal.region}</div>
        </div>
        <div className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-400">
          {signal.sentiment}
        </div>
      </div>
      <p className="text-sm text-zinc-300 mt-3 line-clamp-2">{signal.excerpt}</p>
      <div className="flex gap-5 text-xs text-zinc-500 mt-4">
        <span>Posts: {signal.posts}</span>
        <span>Divergence: {signal.divergence}</span>
      </div>
    </div>
  )
}