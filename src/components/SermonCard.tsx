"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

interface Sermon {
  id: string;
  title: string;
  youtube_url: string | null;
  pdf_url: string | null;
  tags: string[];
  sermon_date: string;
  materials?: { url: string; name: string; type: string }[];
}

function getYouTubeThumb(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
}

export default function SermonCard({ sermon }: { sermon: Sermon }) {
  const t = useTranslations("sermons");
  const thumb = sermon.youtube_url ? getYouTubeThumb(sermon.youtube_url) : null;
  const materialsCount = Array.isArray(sermon.materials) ? sermon.materials.length : 0;
  const hasPdf = !!sermon.pdf_url;

  return (
    <Link href={`/sermoes/${sermon.id}`} className="block group">
      <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-all duration-200">
        {/* Thumbnail */}
        {thumb && (
          <div className="relative w-full aspect-video overflow-hidden">
            <img
              src={thumb}
              alt={sermon.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            {/* Play icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-card-dark)">
                  <polygon points="6,3 20,12 6,21" />
                </svg>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            {new Date(sermon.sermon_date).toLocaleDateString()}
          </p>
          <h3 className="text-base font-semibold text-[var(--color-heading)] mt-1 leading-snug">
            {sermon.title}
          </h3>

          {/* Tags */}
          {sermon.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {sermon.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 bg-[var(--color-primary)]/10 text-[var(--color-heading)] rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Bottom info row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              {(materialsCount > 0 || hasPdf) && (
                <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {materialsCount || 1} {materialsCount === 1 || (!materialsCount && hasPdf) ? "file" : "files"}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-[var(--color-primary)]">
              {t("seeMore")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
