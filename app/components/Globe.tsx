'use client'

import Globe from 'react-globe.gl'

export function GlobeComponent({ data }: { data: any[] }) {
  return (
    <div className="h-[420px] w-full rounded-2xl overflow-hidden border border-zinc-800">
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="#18181b"
        pointsData={data}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => '#22c55e'}
        pointAltitude={0.02}
        pointRadius={0.7}
        width={620}
        height={420}
      />
    </div>
  )
}