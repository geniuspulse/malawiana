'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Ad {
  id: string
  name: string
  placement: string
  type: string
  content: string
  destination_url?: string
  is_active: boolean
  start_date?: string
  end_date?: string
}

interface AdRendererProps {
  placement: 'header' | 'sidebar' | 'in-article' | 'footer' | 'popup'
  className?: string
}

export default function AdRenderer({ placement, className = '' }: AdRendererProps) {
  const [ads, setAds] = useState<Ad[]>([])

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('malawiana_ads')
        .select('*')
        .eq('placement', placement)
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${today}`)
        .or(`end_date.is.null,end_date.gte.${today}`)
      setAds(data || [])
    }
    load()
  }, [placement])

  if (ads.length === 0) return null

  const recordImpression = async (id: string) => {
    await supabase.rpc('increment_ad_impression', { ad_id: id }).catch(() => {})
  }

  const recordClick = async (id: string) => {
    await supabase.rpc('increment_ad_click', { ad_id: id }).catch(() => {})
  }

  return (
    <div className={`ad-slot ad-${placement} ${className}`}>
      {ads.map(ad => {
        // Track impression on mount
        setTimeout(() => recordImpression(ad.id), 100)

        if (ad.type === 'script' || ad.type === 'html') {
          return (
            <div
              key={ad.id}
              dangerouslySetInnerHTML={{ __html: ad.content }}
              className="w-full"
            />
          )
        }

        if (ad.type === 'image') {
          return (
            <a
              key={ad.id}
              href={ad.destination_url || '#'}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => recordClick(ad.id)}
              className="block w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ad.content} alt={ad.name} className="w-full h-auto rounded" />
            </a>
          )
        }

        if (ad.type === 'link') {
          return (
            <a
              key={ad.id}
              href={ad.content}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => recordClick(ad.id)}
              className="block w-full text-sm text-blue-600 hover:underline py-2"
            >
              {ad.name}
            </a>
          )
        }

        return null
      })}
    </div>
  )
}
