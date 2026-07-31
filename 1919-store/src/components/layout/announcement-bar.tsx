"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";

interface AnnouncementConfig {
  enabled: boolean;
  text: string;
  link: string;
  backgroundColor: string;
  textColor: string;
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function AnnouncementBar() {
  const [config, setConfig] = useState<AnnouncementConfig | null>(null);

  useEffect(() => {
    let active = true;
    void apiRequest<AnnouncementConfig>("/announcement")
      .then((data) => {
        if (active) setConfig(data);
      })
      .catch(() => {
        if (active) setConfig(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!config?.enabled || !config.text) return null;

  const content = <span className="text-sm font-medium tracking-wide">{config.text}</span>;
  const style = {
    backgroundColor: config.backgroundColor || "#5E0F1D",
    color: config.textColor || "#F7F3EC",
  };

  if (config.link) {
    if (isExternalUrl(config.link)) {
      return (
        <div className="relative z-50 w-full px-4 py-2.5 text-center" style={style}>
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
      <div className="relative z-50 w-full px-4 py-2.5 text-center" style={style}>
        <Link href={config.link} className="inline-block transition hover:opacity-90">
          {content}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-50 w-full px-4 py-2.5 text-center" style={style}>
      {content}
    </div>
  );
}
