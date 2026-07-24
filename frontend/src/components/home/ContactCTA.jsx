'use client'
import LeadForm from '@/components/ui/LeadForm'
import { WHATSAPP } from '@/lib/site'

/* CTA final de contacto: formulario de leads + enlace directo a WhatsApp */
export default function ContactCTA() {
  return (
    <section id="contacto" className="py-20 px-4" style={{ background: '#1C1308', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <div className="section-eyebrow">Contacto</div>
          <h2 className="font-display text-4xl sm:text-5xl tracking-wide mb-3">¿Te interesa alguna propiedad?</h2>
          <p className="text-sm" style={{ color: 'rgba(154,130,104,0.7)' }}>Déjanos tus datos y te contactamos a la brevedad</p>
        </div>

        {/* Form container */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            background: 'rgba(15,10,4,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <LeadForm />
        </div>

        {/* WhatsApp alternative */}
        <div className="text-center">
          <p className="text-xs mb-4" style={{ color: 'rgba(154,130,104,0.45)' }}>O escríbenos directamente</p>
          <a
            href={`https://wa.me/${WHATSAPP}?text=Hola,%20quiero%20información%20sobre%20sus%20propiedades`}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-wa inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: 'rgba(201,164,78,0.82)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            Chatear por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
