import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// When sending FormData, remove Content-Type so the browser sets it with the
// correct multipart boundary automatically. Without this, uploads break.
api.interceptors.request.use(config => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// ── Auth ──
export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export const logout = async () => {
  const { data } = await api.post('/auth/logout')
  return data
}

export const getMe = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

// ── Properties ──
export const getProperties = async (params = {}) => {
  const { data } = await api.get('/properties', { params })
  return data
}

export const getPropertyById = async (id) => {
  const { data } = await api.get(`/properties/${id}`)
  return data
}

export const getPropertyByRef = async (ref) => {
  const { data } = await api.get(`/properties/ref/${ref}`)
  return data
}

export const getStats = async () => {
  const { data } = await api.get('/properties/stats')
  return data
}

// ── Leads ──
export const createLead = async (leadData) => {
  const { data } = await api.post('/leads', leadData)
  return data
}

export const updateLeadStatus = async (id, status) => {
  const { data } = await api.patch(`/leads/${id}/status`, { status })
  return data
}

// ── Hero Videos ──
export const getHeroVideos = async () => {
  const { data } = await api.get('/hero-videos')
  return data
}

export default api
