import { notFound } from 'next/navigation'
import PropertyDetailClient from './PropertyDetailClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const TYPE_LABELS = {
  URBAN_LOT: 'Lote urbano', HOUSE: 'Casa', APARTMENT: 'Departamento',
  COMMERCIAL: 'Local comercial', LAND: 'Terreno', OTHER: 'Otro',
}

async function fetchProperty(id) {
  try {
    const res = await fetch(`${API_URL}/properties/${id}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

// Open Graph por propiedad: al compartir el enlace en WhatsApp/Facebook
// se muestra la foto principal, el título y el precio del lote.
export async function generateMetadata({ params }) {
  const property = await fetchProperty(params.id)

  if (!property) {
    return {
      title: 'Propiedad',
      description: 'Lotes, terrenos y casas en venta en Chepén, La Libertad.',
    }
  }

  const typeLabel = TYPE_LABELS[property.type] || 'Propiedad'
  const title = `${property.title} — S/ ${property.price.toLocaleString('es-PE')}`
  const description = [
    `${typeLabel} de ${property.area} m² en ${property.district}, ${property.province}.`,
    `Precio: S/ ${property.price.toLocaleString('es-PE')} (negociable).`,
    'Consulta por WhatsApp con Inmobiliaria Bardales.',
  ].join(' ')
  const image = property.images?.[0]?.url

  return {
    title,
    description,
    alternates: { canonical: `/properties/${property.id}` },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'es_PE',
      siteName: 'Inmobiliaria Bardales',
      ...(image && {
        images: [{ url: image, width: 1200, height: 630, alt: property.title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
  }
}

// Datos estructurados schema.org para que Google muestre la propiedad
// como listado inmobiliario (precio, ubicación, fotos)
function buildJsonLd(property) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || undefined,
    url: `${SITE_URL}/properties/${property.id}`,
    datePosted: property.createdAt,
    image: (property.images || []).map((i) => i.url),
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'PEN',
      availability:
        property.status === 'AVAILABLE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.district,
      addressRegion: property.department,
      addressCountry: 'PE',
    },
    ...(property.latitude && property.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: property.latitude,
        longitude: property.longitude,
      },
    }),
  }
}

// La propiedad se carga en servidor (Next dedupe: comparte el fetch con
// generateMetadata) y se pasa hidratada al componente cliente.
export default async function PropertyDetailPage({ params }) {
  const property = await fetchProperty(params.id)
  if (!property) notFound()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(property)) }}
      />
      <PropertyDetailClient property={property} />
    </>
  )
}
