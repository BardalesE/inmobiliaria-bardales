const nodemailer = require('nodemailer')

// Escapa contenido controlado por el visitante antes de inyectarlo en el HTML
// del correo (evita inyección de HTML/enlaces falsos en la bandeja del dueño)
const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

// ── Crear transporter de email ──
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NOTIFY_EMAIL_FROM,
      pass: process.env.NOTIFY_EMAIL_PASS, // App Password de Gmail
    },
  })
}

// ── Notificación cuando llega un lead (consulta de comprador) ──
const notifyNewLead = async ({ name, phone, email, message, propertyRef, propertyTitle }) => {
  const subject = `🏠 Nueva consulta: ${name} → ${propertyRef || 'General'}`
  const html = `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;background:#1C1308;color:#FDF6E9;padding:24px;border-radius:12px;">
      <div style="background:#C4622D;padding:12px 20px;border-radius:8px;margin-bottom:20px;">
        <h2 style="margin:0;font-size:18px;color:white;">📥 Nuevo lead — EE-Stars</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#9A8268;font-size:13px;">Nombre</td><td style="padding:8px 0;font-weight:bold;">${esc(name)}</td></tr>
        <tr><td style="padding:8px 0;color:#9A8268;font-size:13px;">Teléfono</td><td style="padding:8px 0;"><a href="tel:${esc(phone)}" style="color:#E07840;">${esc(phone)}</a></td></tr>
        ${email ? `<tr><td style="padding:8px 0;color:#9A8268;font-size:13px;">Email</td><td style="padding:8px 0;">${esc(email)}</td></tr>` : ''}
        ${propertyRef ? `<tr><td style="padding:8px 0;color:#9A8268;font-size:13px;">Propiedad</td><td style="padding:8px 0;color:#E07840;">${esc(propertyRef)} — ${esc(propertyTitle || '')}</td></tr>` : ''}
        ${message ? `<tr><td style="padding:8px 0;color:#9A8268;font-size:13px;">Mensaje</td><td style="padding:8px 0;">${esc(message)}</td></tr>` : ''}
      </table>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #352615;">
        <a href="https://wa.me/${(phone || '').replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(name)}%2C%20soy%20de%20EE-Stars.%20Vi%20tu%20consulta%20sobre%20${encodeURIComponent(propertyTitle || 'nuestros%20lotes')}%20y%20quiero%20darte%20m%C3%A1s%20info."
           style="display:inline-block;background:#25D366;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
          💬 Responder por WhatsApp
        </a>
      </div>
    </div>
  `
  await sendEmail(subject, html)
}

// ── Notificación cuando alguien quiere publicar su propiedad ──
const notifyNewSeller = async ({ name, phone, email, city, propertyType, description }) => {
  const subject = `🚀 Nuevo vendedor quiere publicar: ${name} — ${city}`
  const html = `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;background:#1C1308;color:#FDF6E9;padding:24px;border-radius:12px;">
      <div style="background:#C4622D;padding:12px 20px;border-radius:8px;margin-bottom:20px;">
        <h2 style="margin:0;font-size:18px;color:white;">🏡 Nuevo vendedor — EE-Stars</h2>
      </div>
      <p style="color:#9A8268;font-size:13px;margin:0 0 16px;">Alguien quiere publicar su propiedad. Contáctalo para cerrar el trato.</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#9A8268;font-size:13px;">Nombre</td><td style="padding:8px 0;font-weight:bold;">${esc(name)}</td></tr>
        <tr><td style="padding:8px 0;color:#9A8268;font-size:13px;">Teléfono</td><td style="padding:8px 0;"><a href="tel:${esc(phone)}" style="color:#E07840;">${esc(phone)}</a></td></tr>
        ${email ? `<tr><td style="padding:8px 0;color:#9A8268;font-size:13px;">Email</td><td style="padding:8px 0;">${esc(email)}</td></tr>` : ''}
        <tr><td style="padding:8px 0;color:#9A8268;font-size:13px;">Ciudad</td><td style="padding:8px 0;">${esc(city)}</td></tr>
        <tr><td style="padding:8px 0;color:#9A8268;font-size:13px;">Tipo de propiedad</td><td style="padding:8px 0;">${esc(propertyType)}</td></tr>
        ${description ? `<tr><td style="padding:8px 0;color:#9A8268;font-size:13px;">Descripción</td><td style="padding:8px 0;">${esc(description)}</td></tr>` : ''}
      </table>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #352615;display:flex;gap:12px;flex-wrap:wrap;">
        <a href="https://wa.me/${(phone || '').replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(name)}%2C%20soy%20Elian%20de%20EE-Stars.%20Vi%20que%20quieres%20publicar%20tu%20propiedad.%20%C2%BFCu%C3%A1ndo%20podemos%20hablar%3F"
           style="display:inline-block;background:#25D366;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
          💬 WhatsApp
        </a>
        ${email ? `<a href="mailto:${esc(email)}" style="display:inline-block;background:#C4622D;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">✉️ Email</a>` : ''}
      </div>
    </div>
  `
  await sendEmail(subject, html)
}

// ── Función base de envío ──
const sendEmail = async (subject, html) => {
  const to = process.env.NOTIFY_EMAIL_TO
  const from = process.env.NOTIFY_EMAIL_FROM

  if (!to || !from) {
    console.log('⚠️  Variables de email no configuradas (NOTIFY_EMAIL_TO / NOTIFY_EMAIL_FROM)')
    return
  }

  try {
    const transporter = createTransporter()
    await transporter.sendMail({ from, to, subject, html })
    console.log(`✅ Email enviado: ${subject}`)
  } catch (err) {
    // No rompemos el flujo si el email falla
    console.error('❌ Error enviando email:', err.message)
  }
}

module.exports = { notifyNewLead, notifyNewSeller }
