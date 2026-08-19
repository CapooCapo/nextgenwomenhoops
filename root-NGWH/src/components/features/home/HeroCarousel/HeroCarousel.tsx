"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import buttonStyles from "@/components/ui/Button/Button.module.scss";
import { Container } from "@/components/ui/Container/Container";
import type { HeroVideoSlide } from "@/config/heroSlides";
import styles from "./HeroCarousel.module.scss";

// ~7s per slide, mid-range of the requested 6-8s window. Kept in sync by
// comment with HeroCarousel.module.scss's $indicator-fill-duration.
const SLIDE_DURATION_MS = 7000;

// useSyncExternalStore (not an effect + setState) — the React-recommended
// way to read/subscribe to a browser-only external source like
// matchMedia without an effect-triggered re-render or a hydration
// mismatch: getServerSnapshot's `false` matches what SSR always renders,
// and React reconciles a real client value itself post-hydration.
function subscribeToReducedMotionChange(onChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotionChange,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

interface HeroCarouselProps {
  slides: HeroVideoSlide[];
  posterSrc: StaticImageData;
  posterAlt: string;
  eyebrow: string;
  tagline: string;
  description: string;
  ctaLabel: string;
  previousLabel: string;
  nextLabel: string;
  goToSlideLabels: string[];
}

/**
 * REQ-HOME-001 (video slice, confirmed against OQ-003 — see
 * src/config/heroSlides.ts) + REQ-HOME-002 (tagline). Client Component:
 * owns carousel state (active slide, auto-advance timer, per-slide video
 * error fallback) — everything translatable is computed server-side in
 * HeroSection and passed in as plain string props, since Server
 * Components can't pass functions/closures across the boundary.
 *
 * Headline/eyebrow/description/CTA are identical across every slide by
 * design — only the background video differs — so no per-slide marketing
 * copy was invented to make the "data-driven slides" structure real
 * (RULES.md R006).
 */
export function HeroCarousel({
  slides,
  posterSrc,
  posterAlt,
  eyebrow,
  tagline,
  description,
  ctaLabel,
  previousLabel,
  nextLabel,
  goToSlideLabels,
}: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [erroredSlides, setErroredSlides] = useState<Record<number, boolean>>({});
  const prefersReducedMotion = usePrefersReducedMotion();
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  function goToSlide(index: number) {
    const nextIndex = ((index % slides.length) + slides.length) % slides.length;
    setActiveIndex(nextIndex);
  }

  // Auto-advance — fully disabled under prefers-reduced-motion, per the
  // requirement to provide a stable visual state; manual controls below
  // remain functional either way.
  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, slides.length]);

  // Play only the active slide's video; pause the rest so inactive slides
  // never fetch/decode more than the browser already buffered.
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) {
        return;
      }
      if (index === activeIndex) {
        video.currentTime = 0;
        video.play().catch(() => {
          // Autoplay can be rejected under rare browser-policy edge cases
          // even when muted; the <video> element's own `poster` stays
          // visible, so the Hero never goes blank either way.
        });
      } else {
        video.pause();
      }
    });
  }, [activeIndex]);

  function handleVideoError(index: number) {
    setErroredSlides((previous) => ({ ...previous, [index]: true }));
  }

  return (
    <section className={styles.heroFrame} aria-labelledby="hero-heading">
      <div className={styles.frame}>
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          const hasError = erroredSlides[index];

          return (
            <div
              key={slide.id}
              className={`${styles.slide} ${isActive ? styles.slideActive : ""}`}
              aria-hidden={!isActive}
            >
              {hasError ? (
                // No local video file exists at this slide's path yet
                // (see src/config/heroSlides.ts) — this is the real,
                // currently-active code path, not a simulated one.
                <Image
                  src={posterSrc}
                  alt={isActive ? posterAlt : ""}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className={styles.media}
                />
              ) : (
                <video
                  ref={(element) => {
                    videoRefs.current[index] = element;
                  }}
                  className={styles.media}
                  src={slide.videoSrc}
                  poster={posterSrc.src}
                  muted
                  loop
                  playsInline
                  autoPlay={index === 0}
                  preload={index === 0 ? "auto" : "none"}
                  onError={() => handleVideoError(index)}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.overlay}>
        <Container>
          <div className={styles.content}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1 id="hero-heading" className={styles.tagline}>
              {tagline}
            </h1>
            <p className={styles.description}>{description}</p>
            <Link
              href="/tournaments"
              className={`${buttonStyles.button} ${buttonStyles.accent} ${styles.cta}`}
            >
              {ctaLabel}
            </Link>
          </div>

          <div className={styles.controls}>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => goToSlide(activeIndex - 1)}
              aria-label={previousLabel}
            >
              <span aria-hidden="true">‹</span>
            </button>

            <div className={styles.indicators} role="tablist" aria-label={tagline}>
              {slides.map((slide, index) => {
                const state =
                  index < activeIndex ? "past" : index > activeIndex ? "upcoming" : "active";

                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={state === "active"}
                    aria-label={goToSlideLabels[index] ?? slide.id}
                    className={styles.indicator}
                    onClick={() => goToSlide(index)}
                  >
                    <span className={styles.indicatorTrack}>
                      <span
                        className={[
                          styles.indicatorFill,
                          state === "past" && styles.indicatorFillFull,
                          state === "active" &&
                            (prefersReducedMotion
                              ? styles.indicatorFillFull
                              : styles.indicatorFillAnimated),
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={styles.navButton}
              onClick={() => goToSlide(activeIndex + 1)}
              aria-label={nextLabel}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <p className={styles.counter} aria-hidden="true">
            {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </p>
        </Container>
      </div>
    </section>
  );
}
