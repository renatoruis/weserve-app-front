"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getHome } from "@/lib/api";
import { getChurchSlug } from "@/lib/church";

interface HomeData {
  live_url: string | null;
  live_active: boolean;
}

function getYouTubeEmbedUrl(url: string): string | null {
  // youtube.com/watch?v=ID, youtu.be/ID, youtube.com/live/ID
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|live\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : null;
}

export default function LiveBanner() {
  const t = useTranslations("live");
  const [data, setData] = useState<HomeData | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    getHome(getChurchSlug())
      .then((d) => setData(d as HomeData))
      .catch(() => {});
  }, []);

  if (!data?.live_active || !data?.live_url) return null;

  const embedUrl = getYouTubeEmbedUrl(data.live_url);

  return (
    <>
      {/* Banner */}
      <button
        onClick={() => setShowPopup(true)}
        className="block w-[calc(100%-2rem)] mx-4 mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-red-500 p-4 shadow-lg active:scale-[0.98] transition-transform text-left"
      >
        <div className="flex items-center gap-3">
          {/* Pulsing dot */}
          <div className="relative">
            <div className="w-3 h-3 bg-white rounded-full" />
            <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-75" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white bg-white/20 px-2 py-0.5 rounded-md tracking-wider">
                {t("badge")}
              </span>
            </div>
            <p className="text-sm font-semibold text-white/90 mt-1">
              {t("watchNow")}
            </p>
          </div>

          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="opacity-80">
            <polygon points="6,3 20,12 6,21" />
          </svg>
        </div>
      </button>

      {/* Video Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          />

          {/* Player container */}
          <div className="relative w-full max-w-2xl z-10">
            {/* Close button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute -top-10 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Live badge */}
            <div className="absolute -top-10 left-0 flex items-center gap-2">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-xs font-bold text-white tracking-wider">{t("badge")}</span>
            </div>

            {/* Video */}
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title="Live Stream"
                />
              ) : (
                // Fallback: if URL is not a recognized YouTube link, show link
                <div className="w-full h-full flex items-center justify-center">
                  <a
                    href={data.live_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-sm font-semibold underline"
                  >
                    {t("watchNow")}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
