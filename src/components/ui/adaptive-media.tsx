import { useState } from "react";
import { isVideoMedia } from "@/lib/site-content";

interface AdaptiveMediaProps extends React.HTMLAttributes<HTMLElement> {
  src: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
  draggable?: boolean;
  autoPlay?: boolean;
}

/**
 * Universally renders an image or an auto-playing muted looped video
 * based on the file type, Cloudinary resource type, or URL pattern.
 * If an image fails to load, it automatically attempts video playback.
 */
export function AdaptiveMedia({
  src,
  alt = "",
  className = "size-full object-cover",
  loading = "lazy",
  draggable = false,
  autoPlay = true,
  ...props
}: AdaptiveMediaProps) {
  const [triedVideo, setTriedVideo] = useState(false);
  const isVideo = isVideoMedia(src) || triedVideo;

  if (isVideo) {
    return (
      <video
        src={src}
        autoPlay={autoPlay}
        muted
        loop
        playsInline
        preload="auto"
        draggable={draggable}
        className={className}
        {...(props as React.VideoHTMLAttributes<HTMLVideoElement>)}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      draggable={draggable}
      className={className}
      onError={() => setTriedVideo(true)}
      {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
    />
  );
}
