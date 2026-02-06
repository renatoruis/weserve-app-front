"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { getSermon } from "@/lib/api";
import { getChurchSlug } from "@/lib/church";
import ShareButton from "@/components/ShareButton";

interface Material {
  url: string;
  name: string;
  type: string;
}

interface SermonDetail {
  id: string;
  title: string;
  youtube_url: string | null;
  pdf_url: string | null;
  tags: string[];
  sermon_date: string;
  materials: Material[];
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function getFileIcon(type: string) {
  if (type === "PDF") {
    return (
      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
    );
  }
  if (type === "DOC" || type === "DOCX") {
    return (
      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </div>
    );
  }
  if (type === "PPT" || type === "PPTX") {
    return (
      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
    );
  }
  // Image
  return (
    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}

export default function SermonDetailPage() {
  const params = useParams();
  const t = useTranslations("sermons");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [sermon, setSermon] = useState<SermonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    getSermon(getChurchSlug(), id)
      .then((d) => setSermon(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="px-4 pt-6">
        <p className="text-center text-[var(--color-text-muted)] py-12">{tCommon("loading")}</p>
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="px-4 pt-6">
        <p className="text-center text-[var(--color-text-muted)] py-12">{t("notFound")}</p>
        <Link href="/sermoes" className="block text-center text-sm text-[var(--color-primary)] font-semibold mt-4">
          {tCommon("back")}
        </Link>
      </div>
    );
  }

  const videoId = sermon.youtube_url ? getYouTubeId(sermon.youtube_url) : null;
  const materials = Array.isArray(sermon.materials) ? sermon.materials : [];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="pb-24">
      {/* Back button */}
      <div className="px-4 pt-4">
        <Link
          href="/sermoes"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {tCommon("back")}
        </Link>
      </div>

      {/* Video */}
      {videoId && (
        <div className="mx-4 mt-3 rounded-2xl overflow-hidden shadow-lg">
          <div className="relative w-full aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={sermon.title}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 mt-5">
        {/* Date */}
        <p className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">
          {formatDate(sermon.sermon_date)}
        </p>

        {/* Title + Share */}
        <div className="flex items-start justify-between gap-3 mt-1">
          <h1 className="text-2xl font-bold text-[var(--color-heading)] leading-tight">
            {sermon.title}
          </h1>
          <ShareButton title={sermon.title} className="mt-1 shrink-0" />
        </div>

        {/* Tags */}
        {sermon.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {sermon.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-heading)] rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Watch on YouTube button */}
        {sermon.youtube_url && !videoId && (
          <a
            href={sermon.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6,3 20,12 6,21" />
            </svg>
            {t("watchVideo")}
          </a>
        )}

        {/* Materials */}
        {materials.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-bold text-[var(--color-heading)] uppercase tracking-wider mb-3">
              {t("materials")}
            </h2>
            <div className="flex flex-col gap-2">
              {materials.map((file, i) => (
                <a
                  key={i}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] active:scale-[0.98] transition-transform"
                >
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-heading)] truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">{file.type}</p>
                  </div>
                  <div className="text-xs font-semibold text-[var(--color-primary)] shrink-0">
                    {t("viewFile")}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Legacy PDF (backward compat) */}
        {sermon.pdf_url && materials.every((m) => m.url !== sermon.pdf_url) && (
          <a
            href={sermon.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-3 p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] active:scale-[0.98] transition-transform"
          >
            {getFileIcon("PDF")}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-heading)]">{t("downloadPdf")}</p>
              <p className="text-xs text-[var(--color-text-muted)]">PDF</p>
            </div>
            <div className="text-xs font-semibold text-[var(--color-primary)] shrink-0">
              {t("viewFile")}
            </div>
          </a>
        )}
      </div>
    </div>
  );
}
