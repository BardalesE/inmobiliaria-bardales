/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Dominios permitidos para next/image: Cloudinary (producción) y los
    // orígenes usados por los datos de ejemplo del seed
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // img-src restringido: Cloudinary (medios), dominios del seed,
            // y tiles/íconos de los mapas del panel admin (Leaflet/ArcGIS/OSM)
            key: 'Content-Security-Policy',
            value: [
              "img-src 'self' data: blob:",
              'https://res.cloudinary.com',
              'https://images.unsplash.com',
              'https://i.pravatar.cc',
              'https://ui-avatars.com',
              'https://unpkg.com',
              'https://*.tile.openstreetmap.org',
              'https://server.arcgisonline.com',
            ].join(' ') + ';'
          }
        ]
      }
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
    // Fallback centralizado en src/lib/site.js — mantener el mismo número
    NEXT_PUBLIC_WHATSAPP: process.env.NEXT_PUBLIC_WHATSAPP || '51982946582',
  }
}

module.exports = nextConfig