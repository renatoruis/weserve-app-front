"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { getChurchSlug } from "@/lib/church";
import { getApiUrl } from "@/lib/api";

const API_URL = getApiUrl();

interface Event {
  id: string;
  title: string;
  event_date: string;
  location: string | null;
  image_url: string | null;
}

export default function NextEventCard() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/church/${getChurchSlug()}/home/next-event`)
      .then((r) => r.json())
      .then((d) => setEvent(d))
      .catch(() => {});
  }, []);

  if (!event) return null;

  const date = new Date(event.event_date);
  const day = date.getDate();
  const month = date.toLocaleDateString(locale, { month: "short" }).toUpperCase();

  return (
    <Link href={`/agenda/${event.id}`} className="block group">
      <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-sm active:scale-[0.97] transition-all duration-200 flex">
        {/* Imagem lateral */}
        {event.image_url ? (
          <div className="relative w-28 shrink-0 overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
          </div>
        ) : (
          <div className="w-28 shrink-0 bg-gradient-to-br from-[var(--color-card-dark)] to-[#3a3a3a] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        )}
        {/* Conteúdo */}
        <div className="p-3 flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex flex-col items-center bg-[var(--color-primary)]/10 rounded-lg px-2 py-0.5 min-w-[36px]">
              <span className="text-sm font-bold text-[var(--color-heading)] leading-tight">{day}</span>
              <span className="text-[9px] font-semibold text-[var(--color-text-secondary)] leading-tight">{month}</span>
            </div>
            <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">
              {t("nextEvent")}
            </p>
          </div>
          <h3 className="text-sm font-semibold text-[var(--color-heading)] line-clamp-2 leading-snug">
            {event.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
