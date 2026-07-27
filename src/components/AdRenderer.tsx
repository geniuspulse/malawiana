"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Ad {
  id: string;
  name: string;
  placement: string;
  type: string;
  content: string;
  destination_url?: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}

interface AdRendererProps {
  placement: "header" | "sidebar" | "in-article" | "footer" | "popup";
  className?: string;
}

export default function AdRenderer({ placement, className = "" }: AdRendererProps) {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("malawiana_ads")
        .select("*")
        .eq("placement", placement)
        .eq("is_active", true);
      // Filter by date client-side for compatibility
      const filtered = (data || []).filter((ad: Ad) => {
        if (ad.start_date && ad.start_date > today) return false;
        if (ad.end_date && ad.end_date < today) return false;
        return true;
      });
      setAds(filtered);
    };
    load();
  }, [placement]);

  if (ads.length === 0) return null;

  return (
    <div className={`ad-slot ad-${placement} ${className}`}>
      {ads.map((ad) => {
        if (ad.type === "script" || ad.type === "html") {
          return (
            <div
              key={ad.id}
              dangerouslySetInnerHTML={{ __html: ad.content }}
              className="w-full"
            />
          );
        }

        if (ad.type === "image") {
          return (
            <a
              key={ad.id}
              href={ad.destination_url || "#"}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="block w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ad.content} alt={ad.name} className="w-full h-auto rounded-xl" />
            </a>
          );
        }

        if (ad.type === "link") {
          return (
            <a
              key={ad.id}
              href={ad.content}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="block text-sm text-blue-600 hover:underline py-2"
            >
              {ad.name}
            </a>
          );
        }

        return null;
      })}
    </div>
  );
}
