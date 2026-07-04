import PropertiesCatalogClient from './PropertiesCatalogClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export const metadata = {
  title: 'Propiedades en venta',
  description: 'Catálogo de lotes, terrenos y casas en venta en Chepén, La Libertad. Títulos saneados y precios negociables.',
  alternates: { canonical: '/properties' },
}

// El listado inicial se renderiza en servidor (ISR cada 60s): los buscadores y
// WhatsApp ven el contenido en el HTML; los filtros re-consultan en cliente.
async function fetchInitialProperties() {
  try {
    const res = await fetch(`${API_URL}/properties?limit=12`, { next: { revalidate: 60 } })
    if (!res.ok) return { data: [], pagination: {} }
    return await res.json()
  } catch {
    return { data: [], pagination: {} }
  }
}

export default async function PropertiesPage() {
  const initial = await fetchInitialProperties()
  return (
    <PropertiesCatalogClient
      initialProperties={initial.data || []}
      initialPagination={initial.pagination || {}}
    />
  )
}
