import Navbar from '@/components/layout/Navbar'

/* Skeleton del catálogo mientras el servidor carga el listado */
export default function Loading() {
  return (
    <div className="min-h-screen bg-bark-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="skeleton h-9 w-64 rounded-xl mb-2" />
        <div className="skeleton h-4 w-40 rounded-full mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-bark-800 rounded-2xl overflow-hidden border border-terra/10">
              <div className="skeleton h-52" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-3 w-24 rounded" />
                <div className="skeleton h-5 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
