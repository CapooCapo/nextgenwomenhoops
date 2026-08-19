import React from "react";
import styles from "./MediaSlot.module.scss";

interface MediaSlotProps {
  src: string;
  alt: string;
  type?: "image" | "video";
  className?: string;
  poster?: string;
}

export function MediaSlot({ src, alt, type = "image", className = "", poster }: MediaSlotProps) {
  return (
    <div className={[styles.mediaSlot, className].filter(Boolean).join(" ")}>
      {type === "video" ? (
        <video 
          src={src} 
          title={alt} 
          poster={poster} 
          className={styles.media}
          autoPlay 
          muted 
          loop 
          playsInline 
        />
      ) : (
        <img src={src} alt={alt} className={styles.media} loading="lazy" />
      )}
    </div>
  );
}
