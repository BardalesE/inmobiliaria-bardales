import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

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

export default api
