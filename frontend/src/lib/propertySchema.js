import { z } from 'zod'

// Safe numeric parsers: handle NaN (from valueAsNumber on empty inputs), null, undefined, ''
const optFloat = z.preprocess(
  v => (v === '' || v == null || (typeof v === 'number' && isNaN(v))) ? null : parseFloat(String(v)),
  z.number().nullable().optional()
)
const optInt = z.preprocess(
  v => (v === '' || v == null || (typeof v === 'number' && isNaN(v))) ? null : parseInt(String(v), 10),
  z.number().int().nullable().optional()
)

export const propertySchema = z.object({
  ref:         z.string().min(1, 'Referencia obligatoria'),
  title:       z.string().min(3, 'Mínimo 3 caracteres').max(120, 'Máximo 120 caracteres'),
  description: z.string().optional().default(''),
  type:        z.enum(['URBAN_LOT','RURAL_LOT','HOUSE','APARTMENT','COMMERCIAL']),
  operation:   z.enum(['SALE','RENT']).default('SALE'),
  status:      z.enum(['AVAILABLE','RESERVED','SOLD','HIDDEN','DRAFT']).default('AVAILABLE'),

  address:    z.string().min(3, 'Dirección obligatoria'),
  district:   z.string().min(2, 'Distrito obligatorio'),
  province:   z.string().min(2, 'Provincia obligatoria'),
  department: z.string().min(2, 'Departamento obligatorio'),
  sector:     z.string().optional().default(''),
  block:      z.string().optional().default(''),
  lot:        z.string().optional().default(''),
  latitude:   optFloat,
  longitude:  optFloat,

  price:     z.number({ invalid_type_error: 'Ingresa un precio válido', required_error: 'Precio obligatorio' }).positive('Debe ser mayor a 0'),
  area:      z.number({ invalid_type_error: 'Ingresa un área válida',   required_error: 'Área obligatoria'   }).positive('Debe ser mayor a 0'),
  frontage:  optFloat,
  depth:     optFloat,
  rooms:     optInt,
  bathrooms: optInt,
  floors:    optInt,
  yearBuilt: optInt,
  parking:   z.boolean().default(false),
  features:  z.array(z.string()).default([]),

  images:      z.array(z.object({ url: z.string(), alt: z.string().optional().default('') })).default([]),
  videos:      z.array(z.object({ url: z.string(), thumbnail: z.string().optional().default(''), name: z.string().optional().default('') })).default([]),
  documents:   z.array(z.object({ url: z.string(), name: z.string().optional().default('') })).default([]),
  // Legado — se mantienen por compatibilidad con propiedades creadas antes de multi-video/multi-documento
  videoUrl:    z.string().optional().default(''),
  documentUrl: z.string().optional().default(''),

  featured: z.boolean().default(false),
  notes:    z.string().optional().default(''),
})

// Fields validated per step when clicking "Siguiente"
export const STEP_FIELDS = {
  0: ['ref','title','type','operation','status'],
  1: ['address','district','province','department'],
  2: ['price','area'],
  3: [],
  4: [],
}

// Maps every form field to its step index — used by onInvalid to navigate to the error step
export const FIELD_TO_STEP = {
  ref: 0, title: 0, type: 0, operation: 0, status: 0, description: 0,
  address: 1, district: 1, province: 1, department: 1,
  sector: 1, block: 1, lot: 1, latitude: 1, longitude: 1,
  price: 2, area: 2, frontage: 2, depth: 2,
  rooms: 2, bathrooms: 2, floors: 2, yearBuilt: 2, parking: 2, features: 2,
  images: 3, videos: 3, documents: 3, videoUrl: 3, documentUrl: 3,
  featured: 4, notes: 4,
}

export const TIPOS = [
  { value: 'URBAN_LOT',  label: 'Lote Urbano',    icon: '◫' },
  { value: 'RURAL_LOT',  label: 'Lote Rural',      icon: '⛰' },
  { value: 'HOUSE',      label: 'Casa',             icon: '⌂' },
  { value: 'APARTMENT',  label: 'Departamento',     icon: '▣' },
  { value: 'COMMERCIAL', label: 'Local Comercial',  icon: '◈' },
]

export const ESTADOS = [
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'RESERVED',  label: 'Separado'   },
  { value: 'SOLD',      label: 'Vendido'    },
  { value: 'HIDDEN',    label: 'Oculto'     },
  { value: 'DRAFT',     label: 'Borrador'   },
]

export const FEATURES_LIST = [
  'Título saneado','Habilitación urbana','Agua y desagüe','Luz eléctrica',
  'Vía asfaltada','Esquinero','Cerca al mercado','Zona residencial',
  'Garaje','Patio amplio','Cerca a colegio','Riego disponible',
  'Seguridad 24h','Vista panorámica','Cerca a hospital','Piscina',
]
