'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import SocialSticky from '@/components/home/SocialSticky'
import Hero from '@/components/home/Hero'
import PropertiesSection from '@/components/home/PropertiesSection'
import Testimonials from '@/components/home/Testimonials'
import Companies from '@/components/home/Companies'
import About from '@/components/home/About'
import HowItWorks from '@/components/home/HowItWorks'
import DocsBanner from '@/components/home/DocsBanner'
import ContactCTA from '@/components/home/ContactCTA'
import Footer from '@/components/home/Footer'
import { getProperties, getStats, getHeroVideos } from '@/lib/api'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function HomePage() {
  const [properties, setProperties] = useState([])
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [testimonials, setTestimonials] = useState([])
  const [companies, setCompanies] = useState([])
  const [heroVideos, setHeroVideos] = useState([])

  const fetchProperties = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const res = await getProperties(params)
      setProperties(res.data)
      setPagination(res.pagination)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchProperties()
    getStats().then(r => setStats(r.data)).catch(() => {})
    getHeroVideos().then(r => setHeroVideos(r.data || [])).catch(() => {})
    fetch(`${API}/testimonials`).then(r => r.json()).then(d => setTestimonials(d.data || [])).catch(() => {})
    fetch(`${API}/companies`).then(r => r.json()).then(d => setCompanies(d.data || [])).catch(() => {})
  }, [fetchProperties])

  const handleFilter = (f) => { setFilters(f); fetchProperties(f) }

  return (
    <div className="min-h-screen bg-bark-900">
      <Navbar />
      <SocialSticky />
      <Hero heroVideos={heroVideos} stats={stats} onSearch={(search) => handleFilter({ search })} />
      <PropertiesSection
        properties={properties}
        loading={loading}
        pagination={pagination}
        onFilter={handleFilter}
        onPageChange={(page) => fetchProperties({ ...filters, page })}
      />
      <Testimonials testimonials={testimonials} />
      <Companies companies={companies} />
      <About />
      <HowItWorks />
      <DocsBanner />
      <ContactCTA />
      <Footer />
    </div>
  )
}
