const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Sitemap dinámico: páginas fijas + todas las propiedades publicadas.
// Se regenera como máximo cada hora (revalidate del fetch).
export default async function sitemap() {
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/properties`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/publicar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  let propertyPages = []
  try {
    const res = await fetch(`${API_URL}/properties?limit=100`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const json = await res.json()
      propertyPages = (json.data || []).map((p) => ({
        url: `${SITE_URL}/properties/${p.id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
    }
  } catch {
    // Si la API no responde, el sitemap sale solo con las páginas fijas
  }

  return [...staticPages, ...propertyPages]
}
