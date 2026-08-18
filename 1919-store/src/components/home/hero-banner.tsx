"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { OtzMark } from "@/components/shared/otz-mark";
import { catalogApi } from "@/lib/api-client";

interface HeroImage {
  id: string;
  image: string;
  sort_order: number;
}

const SLIDE_INTERVAL = 6000; // 6 seconds per image
const FADE_DURATION = 1500; // 1.5s crossfade

const TARGET_TEXT = "1990";
const TYPE_SPEED = 220; // ms per char when typing
const DELETE_SPEED = 140; // ms per char when deleting
const PAUSE_TYPED = 3000; // ms pause when full text typed
const PAUSE_DELETED = 800; // ms pause when text deleted

export function HeroBanner() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter animation state
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch active hero background images from backend
  useEffect(() => {
    catalogApi
      .homepageCarousel()
      .then((data) => {
        const sorted = data
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(({ id, image, sort_order }) => ({ id, image, sort_order }));
        setImages(sorted);
      })
      .catch(() => {
        // Silently fail — hero works without background images
      });
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [images.length]);

  // Typewriter effect loop (typing & deleting 1990)
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isDeleting && displayText !== TARGET_TEXT) {
      timer = setTimeout(() => {
        setDisplayText(TARGET_TEXT.slice(0, displayText.length + 1));
      }, TYPE_SPEED);
    } else if (!isDeleting && displayText === TARGET_TEXT) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, PAUSE_TYPED);
    } else if (isDeleting && displayText !== "") {
      timer = setTimeout(() => {
        setDisplayText(TARGET_TEXT.slice(0, displayText.length - 1));
      }, DELETE_SPEED);
    } else if (isDeleting && displayText === "") {
      timer = setTimeout(() => {
        setIsDeleting(false);
      }, PAUSE_DELETED);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting]);

  return (
    <section className="grain relative flex min-h-[100svh] flex-col justify-center px-6 pt-28 md:px-12 overflow-hidden">
      {/* ── Background Slideshow ── */}
      {images.length > 0 && (
        <div className="absolute inset-0 z-0">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="absolute inset-0"
              style={{
                opacity: i === currentIndex ? 1 : 0,
                transition: `opacity ${FADE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              }}
            >
              <Image
                src={img.image}
                alt="1990 Store"
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
                quality={85}
              />
            </div>
          ))}

          {/* Dark / Burgundy overlay for text readability */}
          <div className="absolute inset-0 bg-[#2a0a10]/65" />
        </div>
      )}

      {/* Fallback solid background when no images */}
      {images.length === 0 && (
        <div className="absolute inset-0 z-0 bg-background" />
      )}

      {/* ── Hero Content (foreground) ── */}
      <div className="relative z-10 mx-auto w-full max-w-[1500px]">
        <p className="rise label text-wine/70" style={{ animationDelay: "80ms" }}>
          1990 — LUXURY WEAR
        </p>

        {/* Typing & Deleting 1990 Animation */}
        <h1
          className="rise display mt-6 text-[clamp(5rem,23vw,20rem)] text-primary leading-none min-h-[1em] select-none flex items-center"
          style={{ animationDelay: "220ms" }}
        >
          <span>{displayText || "\u00A0"}</span>
          <span className="inline-block animate-pulse text-wine/70 text-[0.7em] ml-1 font-mono">
            |
          </span>
        </h1>

        <div
          className="rise mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-border pt-6"
          style={{ animationDelay: "620ms" }}
        >
          <span className="label text-primary">Made for Originals</span>
          <OtzMark />
          <span className="label ml-auto text-wine/70">Est. 2026</span>
        </div>

        <div className="rise mt-16 md:mt-20" style={{ animationDelay: "880ms" }}>
          <Link
            href="/shop"
            className="label group inline-flex items-center gap-4 border border-primary px-8 py-4 text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground"
          >
            Shop the Collection
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      {/* ── Slide indicators ── */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2.5">
          {images.map((img, i) => (
            <span
              key={img.id}
              className="block h-[2px] rounded-full transition-all duration-700"
              style={{
                width: i === currentIndex ? 32 : 16,
                backgroundColor:
                  i === currentIndex
                    ? "rgba(245, 245, 220, 0.8)"
                    : "rgba(245, 245, 220, 0.25)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
