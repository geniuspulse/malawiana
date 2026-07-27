"use client";
interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
}
export default function YouTubeEmbed({ videoId, title = "YouTube video", className = "" }: YouTubeEmbedProps) {
  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden ${className}`}
      style={{ paddingBottom: "56.25%", height: 0 }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
        style={{ border: "none" }}
      />
    </div>
  );
}
