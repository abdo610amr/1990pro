"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { apiRequest, API_BASE_URL } from "@/lib/api-client";
import { resolveAssetUrl } from "@/lib/catalog-adapter";

interface PopupConfig {
  enabled: boolean;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonUrl: string;
  showOnce: boolean;
  showEveryVisit: boolean;
}

const POPUP_DISMISSED_KEY = "1990_store_popup_dismissed";
const POPUP_SESSION_KEY = "1990_store_popup_session_dismissed";

function shouldShowPopup(config: PopupConfig): boolean {
  if (!config.enabled) return false;
  if (config.showOnce) {
    return localStorage.getItem(POPUP_DISMISSED_KEY) !== "true";
  }
  return sessionStorage.getItem(POPUP_SESSION_KEY) !== "true";
}

function dismissPopup(config: PopupConfig) {
  if (config.showOnce) {
    localStorage.setItem(POPUP_DISMISSED_KEY, "true");
  } else {
    sessionStorage.setItem(POPUP_SESSION_KEY, "true");
  }
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function StorePopup() {
  const [config, setConfig] = useState<PopupConfig | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    void apiRequest<PopupConfig>("/popup")
      .then((data) => {
        if (!active) return;
        setConfig(data);
        if (shouldShowPopup(data)) setVisible(true);
      })
      .catch(() => {
        if (active) setConfig(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!visible || !config) return null;

  const hasContent =
    config.title || config.description || config.image || config.buttonText;
  if (!hasContent) return null;

  const imageSrc = resolveAssetUrl(config.image);
  const handleClose = () => {
    dismissPopup(config);
    setVisible(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-md"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-popup-title"
      >
        <div className="relative w-full max-w-md border border-border bg-background p-8 shadow-2xl">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 text-primary transition hover:opacity-70"
            aria-label="Close popup"
          >
            <X className="h-5 w-5" />
          </button>

          {imageSrc && (
            <div className="relative mb-6 aspect-video w-full overflow-hidden border border-border">
              <Image
                src={imageSrc}
                alt=""
                fill
                className="object-cover"
                unoptimized={imageSrc.startsWith(new URL(API_BASE_URL).origin)}
              />
            </div>
          )}

          {config.title && (
            <h2 id="store-popup-title" className="display text-2xl uppercase text-primary">
              {config.title}
            </h2>
          )}

          {config.description && (
            <p className="mt-3 text-sm text-wine/80 leading-relaxed">{config.description}</p>
          )}

          {config.buttonText && config.buttonUrl ? (
            isExternalUrl(config.buttonUrl) ? (
              <a
                href={config.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="label mt-6 inline-flex w-full items-center justify-center border border-primary px-6 py-4 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {config.buttonText}
              </a>
            ) : (
              <Link
                href={config.buttonUrl}
                onClick={handleClose}
                className="label mt-6 inline-flex w-full items-center justify-center border border-primary px-6 py-4 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {config.buttonText}
              </Link>
            )
          ) : null}
        </div>
      </div>
    </>
  );
}
