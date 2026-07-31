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
        className="fixed inset-0 z-[60] bg-foreground/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-popup-title"
      >
        <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close popup"
          >
            <X className="h-5 w-5" />
          </button>

          {imageSrc && (
            <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-xl">
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
            <h2 id="store-popup-title" className="font-heading text-2xl">
              {config.title}
            </h2>
          )}

          {config.description && (
            <p className="mt-2 text-sm text-muted-foreground">{config.description}</p>
          )}

          {config.buttonText && config.buttonUrl ? (
            isExternalUrl(config.buttonUrl) ? (
              <a
                href={config.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                {config.buttonText}
              </a>
            ) : (
              <Link
                href={config.buttonUrl}
                onClick={handleClose}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
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
