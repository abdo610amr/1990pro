import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { announcementService } from "@/services/announcement";
import type { AnnouncementConfig } from "@/types/announcement";

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function AnnouncementBar() {
  const [config, setConfig] = useState<AnnouncementConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    void announcementService
      .get()
      .then((data) => {
        if (active) setConfig(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading || error || !config?.enabled || !config.text) return null;

  const content = (
    <span className="text-sm font-medium">{config.text}</span>
  );

  const style = {
    backgroundColor: config.backgroundColor,
    color: config.textColor,
  };

  if (config.link) {
    if (isExternalUrl(config.link)) {
      return (
        <div className="relative z-40 w-full px-4 py-2.5 text-center" style={style}>
          <a
            href={config.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition hover:opacity-90"
          >
            {content}
          </a>
        </div>
      );
    }

    return (
      <div className="relative z-40 w-full px-4 py-2.5 text-center" style={style}>
        <Link to={config.link} className="inline-block transition hover:opacity-90">
          {content}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-40 w-full px-4 py-2.5 text-center" style={style}>
      {content}
    </div>
  );
}
