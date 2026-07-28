"use client";
import { useEffect, useState, useRef } from "react";
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

/** Safely injects an Adsterra (or any) script tag into the DOM and executes it */
function ScriptAd({ content, adId }: { content: string; adId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    // Clear existing children
    container.innerHTML = "";

    // Parse the HTML string to extract script(s) and non-script HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    // Re-inject non-script HTML (e.g. <div id="container-..."> for banner ads)
    const bodyChildren = Array.from(doc.body.childNodes);
    bodyChildren.forEach((node) => {
      if ((node as Element).tagName !== "SCRIPT") {
        container.appendChild(document.importNode(node, true));
      }
    });

    // Re-create each script tag so the browser executes it
    const scripts = Array.from(doc.querySelectorAll("script"));
    scripts.forEach((origScript) => {
      const script = document.createElement("script");
      // Copy all attributes
      Array.from(origScript.attributes).forEach((attr) => {
        script.setAttribute(attr.name, attr.value);
      });
      if (origScript.textContent) script.textContent = origScript.textContent;
      container.appendChild(script);
    });

    return () => {
      container.innerHTML = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adId, content]);

  return <div ref={containerRef} className="ad-script-container w-full" />;
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
          return <ScriptAd key={ad.id} content={ad.content} adId={ad.id} />;
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
              className="block text-sm text-amber-600 hover:underline py-2"
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
