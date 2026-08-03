"use client";
interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
}

function extractId(input: string): string {
  if (!input) return ""
  const trimmed = input.trim()
  // Bare ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
  // URLs
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = trimmed.match(p)
    if (m) return m[1]
  }
  return trimmed
}

export default function YouTubeEmbed({ videoId, title = "YouTube video", className = "" }: YouTubeEmbedProps) {
  const id = extractId(videoId)
  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden ${className}`}
      style={{ paddingBottom: "56.25%", height: 0 }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
        style={{ border: "none" }}
      />
    </div>
  );
}
