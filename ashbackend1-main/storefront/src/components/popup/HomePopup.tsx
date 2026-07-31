import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { popupService } from "@/services/popup";
import type { PopupConfig } from "@/types/popup";

const POPUP_DISMISSED_KEY = "store_popup_dismissed";
const POPUP_SESSION_KEY = "store_popup_session_dismissed";

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

export function HomePopup() {
  const [config, setConfig] = useState<PopupConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void popupService
      .get()
      .then((data) => {
        if (!active) return;
        setConfig(data);
        if (shouldShowPopup(data)) {
          setVisible(true);
        }
      })
      .catch(() => {
        if (active) setConfig(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleClose = () => {
    if (config) dismissPopup(config);
    setVisible(false);
  };

  if (loading || !visible || !config) return null;

  const hasContent =
    config.title || config.description || config.image || config.buttonText;

  if (!hasContent) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-popup-title"
      >
        <div className="relative w-full max-w-md animate-fade-in rounded-2xl border border-border bg-background p-6 shadow-2xl">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close popup"
          >
            <X className="h-5 w-5" />
          </button>

          {config.image && (
            <img
              src={config.image}
              alt=""
              className="mb-4 aspect-video w-full rounded-xl object-cover"
            />
          )}

          {config.title && (
            <h2 id="home-popup-title" className="font-display text-2xl font-bold">
              {config.title}
            </h2>
          )}

          {config.description && (
            <p className="mt-2 text-sm text-muted-foreground">{config.description}</p>
          )}

          {config.buttonText && config.buttonUrl && (
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
                to={config.buttonUrl}
                onClick={handleClose}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                {config.buttonText}
              </Link>
            )
          )}
        </div>
      </div>
    </>
  );
}
