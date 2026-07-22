import Navbar from '@/components/layout/Navbar'

/* Skeleton mostrado por el App Router mientras el servidor carga la propiedad */
export default function Loading() {
  return (
    <div className="min-h-screen bg-bark-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="skeleton h-3 w-40 rounded-full mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-5">
            <div className="skeleton rounded-2xl" style={{ height: 480 }} />
            <div className="skeleton h-4 w-32 rounded-full" />
            <div className="skeleton h-10 w-3/4 rounded-xl" />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          </div>
          <div className="skeleton rounded-2xl" style={{ height: 420 }} />
        </div>
      </div>
    </div>
  )
}
