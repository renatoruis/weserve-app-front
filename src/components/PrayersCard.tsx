"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function PrayersCard() {
  const t = useTranslations("home");

  return (
    <Link href="/oracoes" className="block group">
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-all duration-200">
        <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-heading)]">{t("viewPrayers")}</p>
          <p className="text-xs text-[var(--color-text-muted)] truncate">{t("viewPrayersDesc")}</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" className="shrink-0 group-hover:translate-x-0.5 transition-transform">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </Link>
  );
}
