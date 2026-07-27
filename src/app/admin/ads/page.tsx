'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Megaphone, Plus, Search, Trash2, Edit2, X, Loader2, 
  Eye, MousePointer, Calendar, Info, CheckCircle, AlertTriangle 
} from 'lucide-react'

interface Ad {
  id: string
  name: string
  placement: 'header' | 'sidebar' | 'in-article' | 'footer' | 'popup'
  type: 'image' | 'script' | 'html' | 'link'
  content: string
  destination_url?: string | null
  is_active: boolean
  start_date?: string | null
  end_date?: string | null
  impressions: number
  clicks: number
  notes?: string | null
  created_at?: string
  updated_at?: string
}

const PLACEMENT_OPTIONS = [
  { value: 'header', label: 'Header' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'in-article', label: 'In-Article' },
  { value: 'footer', label: 'Footer' },
  { value: 'popup', label: 'Popup' }
]

const TYPE_OPTIONS = [
  { value: 'image', label: 'Image Ad (Banner)' },
  { value: 'script', label: 'Script Code (e.g. AdSense)' },
  { value: 'html', label: 'Custom HTML' },
  { value: 'link', label: 'Simple Text Link' }
]

export default function AdsManagerPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [placementFilter, setPlacementFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  
  // Fields
  const [formName, setFormName] = useState('')
  const [formPlacement, setFormPlacement] = useState<'header' | 'sidebar' | 'in-article' | 'footer' | 'popup'>('sidebar')
  const [formType, setFormType] = useState<'image' | 'script' | 'html' | 'link'>('image')
  const [formContent, setFormContent] = useState('')
  const [formDestinationUrl, setFormDestinationUrl] = useState('')
  const [formStartDate, setFormStartDate] = useState('')
  const [formEndDate, setFormEndDate] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchAds = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchErr } = await supabase
        .from('malawiana_ads')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchErr) throw fetchErr
      setAds(data || [])
    } catch (err: any) {
      console.error('Error fetching ads:', err)
      setError(err.message || 'Failed to fetch ads.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  const handleOpenNewAdForm = () => {
    setEditingAd(null)
    setFormName('')
    setFormPlacement('sidebar')
    setFormType('image')
    setFormContent('')
    setFormDestinationUrl('')
    setFormStartDate('')
    setFormEndDate('')
    setFormNotes('')
    setFormIsActive(true)
    setIsFormOpen(true)
    setError(null)
  }

  const handleOpenEditAdForm = (ad: Ad) => {
    setEditingAd(ad)
    setFormName(ad.name)
    setFormPlacement(ad.placement)
    setFormType(ad.type)
    setFormContent(ad.content)
    setFormDestinationUrl(ad.destination_url || '')
    setFormStartDate(ad.start_date || '')
    setFormEndDate(ad.end_date || '')
    setFormNotes(ad.notes || '')
    setFormIsActive(ad.is_active)
    setIsFormOpen(true)
    setError(null)
  }

  const handleToggleActive = async (ad: Ad) => {
    const nextActive = !ad.is_active
    // Optimistic UI updates
    setAds(prev => prev.map(item => item.id === ad.id ? { ...item, is_active: nextActive } : item))

    try {
      const { error: patchErr } = await supabase
        .from('malawiana_ads')
        .update({ is_active: nextActive, updated_at: new Date().toISOString() })
        .eq('id', ad.id)

      if (patchErr) throw patchErr
      setSuccess(`Ad status updated successfully.`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error toggling ad status:', err)
      // Revert Optimistic Update
      setAds(prev => prev.map(item => item.id === ad.id ? { ...item, is_active: ad.is_active } : item))
      alert(`Error updating ad status: ${err.message}`)
    }
  }

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this ad? This action cannot be reverted.')) return

    try {
      const { error: deleteErr } = await supabase
        .from('malawiana_ads')
        .delete()
        .eq('id', id)

      if (deleteErr) throw deleteErr
      setAds(prev => prev.filter(item => item.id !== id))
      setSuccess('Ad deleted successfully.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error deleting ad:', err)
      alert(`Failed to delete ad: ${err.message}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      setError('Name is a required field.')
      return
    }
    if (!formContent.trim()) {
      setError('Ad content is a required field (URL or script/HTML is required).')
      return
    }

    setSubmitting(true)
    setError(null)

    const payload: Partial<Ad> = {
      name: formName,
      placement: formPlacement,
      type: formType,
      content: formContent,
      destination_url: formDestinationUrl.trim() || null,
      is_active: formIsActive,
      start_date: formStartDate || null,
      end_date: formEndDate || null,
      notes: formNotes.trim() || null,
      updated_at: new Date().toISOString()
    }

    try {
      if (editingAd) {
        // Update existing
        const { data, error: updateErr } = await supabase
          .from('malawiana_ads')
          .update(payload)
          .eq('id', editingAd.id)
          .select()

        if (updateErr) throw updateErr
        
        setAds(prev => prev.map(item => item.id === editingAd.id ? { ...item, ...payload } : item))
        setSuccess('Ad campaign updated successfully!')
      } else {
        // Create new
        const { data, error: createErr } = await supabase
          .from('malawiana_ads')
          .insert([{ ...payload, impressions: 0, clicks: 0 }])
          .select()

        if (createErr) throw createErr
        
        if (data && data[0]) {
          setAds(prev => [data[0], ...prev])
        } else {
          // If insert didn't return data directly, fetch list again
          await fetchAds()
        }
        setSuccess('New ad campaign created successfully!')
      }

      setIsFormOpen(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error saving ad:', err)
      setError(err.message || 'Failed to save the ad. Please double-check fields.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.name.toLowerCase().includes(search.toLowerCase()) || 
      (ad.notes || '').toLowerCase().includes(search.toLowerCase())

    const matchesPlacement = placementFilter === 'all' || ad.placement === placementFilter
    
    const matchesActive = activeFilter === 'all' || 
      (activeFilter === 'active' && ad.is_active) || 
      (activeFilter === 'inactive' && !ad.is_active)

    return matchesSearch && matchesPlacement && matchesActive
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Marketing</span>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-1">Ads Manager</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure, deploy, and track advertising banners or scripts on the Malawiana blog.
          </p>
        </div>
        <button
          onClick={handleOpenNewAdForm}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          <Plus size={16} /> New Ad Campaign
        </button>
      </div>

      {/* Success and Error notifications */}
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-850 dark:text-emerald-450 rounded-xl flex items-center gap-3">
          <CheckCircle size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      {error && !isFormOpen && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 rounded-xl flex items-center gap-3">
          <AlertTriangle size={18} className="shrink-0 text-red-600 dark:text-red-400" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Filters bar */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search ads by name or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value)}
            className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none dark:text-gray-200 cursor-pointer"
          >
            <option value="all">All Placements</option>
            {PLACEMENT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none dark:text-gray-200 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Main campaigns display */}
      {loading ? (
        <div className="min-h-[400px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Fetching ad database...</p>
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="min-h-[400px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col items-center justify-center text-center p-8">
          <Megaphone className="text-gray-300 dark:text-gray-700 mb-4" size={56} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No ad campaigns found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1 mb-6">
            {search || placementFilter !== 'all' || activeFilter !== 'all' 
              ? "We couldn't find any ads matching your selected filter or search criteria."
              : "You haven't configured any advertisement campaigns yet. Setup native ads to display banners or AdSense codes on the blog."}
          </p>
          {(search || placementFilter !== 'all' || activeFilter !== 'all') ? (
            <button
              onClick={() => { setSearch(''); setPlacementFilter('all'); setActiveFilter('all'); }}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-sm font-semibold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={handleOpenNewAdForm}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Create New Ad
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          {/* Table display */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Ad Campaign</th>
                  <th className="px-6 py-4">Placement</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Performance (Imp / Clicks)</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-slate-800">
                {filteredAds.map(ad => (
                  <tr key={ad.id} className="text-sm hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-all">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">{ad.name}</div>
                      {ad.notes && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[200px] truncate" title={ad.notes}>
                          {ad.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        ad.placement === 'header' ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400' :
                        ad.placement === 'sidebar' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                        ad.placement === 'in-article' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400' :
                        ad.placement === 'footer' ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400' :
                        'bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400'
                      }`}>
                        {ad.placement}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                        {ad.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(ad)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          ad.is_active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
                        }`}
                        aria-label="Toggle Ad Status"
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            ad.is_active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400" title="Impressions">
                          <Eye size={14} className="text-gray-400" />
                          <span>{ad.impressions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400" title="Clicks">
                          <MousePointer size={14} className="text-gray-400" />
                          <span>{ad.clicks.toLocaleString()}</span>
                        </div>
                        <div className="text-gray-400 dark:text-gray-500 font-medium">
                          CTR: {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00'}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {ad.start_date || ad.end_date ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} className="text-gray-400" />
                            <span>Start: {ad.start_date || 'None'}</span>
                          </div>
                          {ad.end_date && (
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-red-400" />
                              <span>End: {ad.end_date}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="italic font-medium">Always running</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditAdForm(ad)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
                          title="Edit Campaign"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete Campaign"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over panel / modal for form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Dark overlay background */}
            <div 
              className="absolute inset-0 bg-black/40 transition-opacity" 
              onClick={() => setIsFormOpen(false)} 
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-lg transform transition-transform duration-300">
                <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-2xl overflow-y-auto">
                  
                  {/* Panel Header */}
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {editingAd ? 'Edit Ad Campaign' : 'Create New Ad Campaign'}
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Fill in specifications for Malawiana Native Ad Network.
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsFormOpen(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Form Container */}
                  <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6">
                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-start gap-2 text-xs">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <span className="font-semibold">{error}</span>
                      </div>
                    )}

                    {/* Campaign Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Campaign Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TNM Malawi Summer Banner"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Placement and Type Row */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Placement */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Placement *
                        </label>
                        <select
                          value={formPlacement}
                          onChange={(e) => setFormPlacement(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {PLACEMENT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Type */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type *
                        </label>
                        <select
                          value={formType}
                          onChange={(e) => setFormType(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {TYPE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Ad Content (URL or Script Code) */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                          Ad Content *
                        </label>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {formType === 'image' && 'Image URL (HTTPS)'}
                          {formType === 'link' && 'Text Link Anchor Text'}
                          {formType === 'script' && 'HTML Script tag'}
                          {formType === 'html' && 'Raw HTML template'}
                        </span>
                      </div>
                      <textarea
                        required
                        rows={4}
                        placeholder={
                          formType === 'image' ? 'https://example.com/assets/banner-728x90.png' :
                          formType === 'link' ? 'Read our sponsor report' :
                          '<!-- Embed script / html code here -->'
                        }
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm dark:text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Destination URL */}
                    {(formType === 'image' || formType === 'link') && (
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Destination URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://tnm.co.mw/campaign"
                          value={formDestinationUrl}
                          onChange={(e) => setFormDestinationUrl(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}

                    {/* Schedule Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Start Date */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={formStartDate}
                          onChange={(e) => setFormStartDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        />
                      </div>

                      {/* End Date */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={formEndDate}
                          onChange={(e) => setFormEndDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Internal Notes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Internal campaign details, contact person, billing info..."
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Active Campaign Status Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-lg">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-gray-700 dark:text-gray-200">Set Campaign Active</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">Enable or disable immediate banner distribution.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormIsActive(!formIsActive)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          formIsActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formIsActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Actions button */}
                    <div className="pt-4 flex gap-3 border-t border-gray-100 dark:border-slate-800">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-lg transition-colors shadow"
                      >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {editingAd ? 'Save Campaign' : 'Create Campaign'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 text-sm font-semibold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
