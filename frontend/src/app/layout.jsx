import './globals.css'

export const metadata = {
  title: 'Inmobiliaria Bardales — Lotes en Trujillo',
  description: 'Terrenos urbanos en los mejores sectores de Trujillo, La Libertad. Títulos saneados, precios negociables.',
  keywords: 'lotes, terrenos, Trujillo, La Libertad, inmobiliaria, venta, Luz del Sol',
  openGraph: {
    title: 'Inmobiliaria Bardales',
    description: 'Terrenos urbanos en Trujillo. Títulos saneados.',
    type: 'website',
  }
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
