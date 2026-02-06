"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getVerseOfTheDay } from "@/lib/api";
import { getChurchSlug } from "@/lib/church";
import ShareButton from "@/components/ShareButton";

interface VerseData {
  content: string;
  reference: string;
  passage_id?: string;
  source: string;
}

export default function VerseCard() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [data, setData] = useState<VerseData | null>(null);

  useEffect(() => {
    getVerseOfTheDay(getChurchSlug(), locale)
      .then((d) => setData(d))
      .catch(() => {});
  }, [locale]);

  if (!data) {
    return (
      <div className="bg-[var(--color-card-dark)] rounded-2xl p-6 shadow-lg">
        <div className="skeleton h-3 w-24 mb-4" />
        <div className="skeleton h-4 w-full mb-2" />
        <div className="skeleton h-4 w-3/4 mb-3" />
        <div className="skeleton h-3 w-32 ml-auto" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-card-dark)] rounded-2xl p-6 shadow-lg relative overflow-hidden">
      {/* Decorative accent line */}
      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-primary)]" />

      <p className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-[0.15em] mb-3 pl-3">
        {t("verse")}
      </p>

      <p className="text-base leading-relaxed text-white/90 font-light pl-3">
        &ldquo;{data.content}&rdquo;
      </p>

      {data.reference && (
        <p className="text-sm text-white/50 mt-3 text-right font-medium">
          {data.reference}
        </p>
      )}

      <div className="flex items-center justify-between mt-2">
        {data.source === "youversion" && (
          <p className="text-[9px] text-white/30 tracking-wide uppercase">
            YouVersion
          </p>
        )}
        <ShareButton
          title={`${data.content} — ${data.reference}`}
          text={`"${data.content}" — ${data.reference}`}
          className="!text-white/40 hover:!text-white/70 ml-auto text-xs"
        />
      </div>
    </div>
  );
}
