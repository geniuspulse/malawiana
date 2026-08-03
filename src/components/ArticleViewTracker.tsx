"use client";

import { useEffect } from "react";

/**
 * Fires a view-count increment once per browser session per article.
 * Renders nothing — pure side-effect component.
 */
export default function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed_${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage unavailable (private mode etc.) — still track, just may double count
    }
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, [slug]);

  return null;
}
