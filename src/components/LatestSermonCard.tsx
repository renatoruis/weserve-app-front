"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getChurchSlug } from "@/lib/church";
import { getApiUrl } from "@/lib/api";

const API_URL = getApiUrl();

interface Sermon {
  id: string;
  title: string;
  youtube_url: string | null;
  sermon_date: string;
  tags: string[];
}

function getYouTubeThumb(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
}

export default function LatestSermonCard() {
  const t = useTranslations("home");
  const [sermon, setSermon] = useState<Sermon | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/church/${getChurchSlug()}/home/latest-sermon`)
      .then((r) => r.json())
      .then((d) => setSermon(d))
      .catch(() => {});
  }, []);

  if (!sermon) return null;

  const thumb = sermon.youtube_url ? getYouTubeThumb(sermon.youtube_url) : null;

  return (
    <Link href="/sermoes" className="block group">
      <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-sm active:scale-[0.97] transition-all duration-200 h-full">
        {thumb ? (
          <div className="relative h-24 overflow-hidden">
            <img
              src={thumb}
              alt={sermon.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {/* Play icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-card-dark)">
                  <polygon points="6,3 20,12 6,21" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-24 bg-gradient-to-br from-[var(--color-card-dark)] to-[#3a3a3a] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          </div>
        )}
        <div className="p-3">
          <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider mb-1.5">
            {t("latestSermon")}
          </p>
          <h3 className="text-sm font-semibold text-[var(--color-heading)] line-clamp-2 leading-snug">
            {sermon.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
