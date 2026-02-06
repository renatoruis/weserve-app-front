"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function NoticesCard() {
  const t = useTranslations("home");

  return (
    <Link href="/mais" className="block group">
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-all duration-200">
        <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-heading)]">{t("viewNotices")}</p>
          <p className="text-xs text-[var(--color-text-muted)] truncate">{t("viewNoticesDesc")}</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" className="shrink-0 group-hover:translate-x-0.5 transition-transform">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </Link>
  );
}
