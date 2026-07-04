import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Inmobiliaria Bardales — Lotes y casas en Chepén',
    template: '%s | Inmobiliaria Bardales',
  },
  description: 'Lotes, terrenos y casas en venta en Chepén, La Libertad. Títulos saneados, precios negociables y atención directa por WhatsApp.',
  keywords: 'lotes, terrenos, casas, Chepén, La Libertad, inmobiliaria, venta, Inmobiliaria Bardales',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Inmobiliaria Bardales',
    description: 'Lotes, terrenos y casas en venta en Chepén, La Libertad. Títulos saneados.',
    type: 'website',
    locale: 'es_PE',
    siteName: 'Inmobiliaria Bardales',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-bark-900 text-sand min-h-screen">
        {children}
      </body>
    </html>
  )
}
