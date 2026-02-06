"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getEvent, rsvpEvent } from "@/lib/api";
import { getChurchSlug } from "@/lib/church";
import ShareButton from "@/components/ShareButton";

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  image_url: string | null;
  rsvp_count: number;
}

export default function EventDetailPage() {
  const params = useParams();
  const t = useTranslations("agenda");
  const tRsvp = useTranslations("rsvp");
  const tCommon = useTranslations("common");
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    getEvent(getChurchSlug(), id)
      .then((d) => {
        setEvent(d);
        setRsvpCount(d.rsvp_count || 0);
        const stored = localStorage.getItem(`rsvp:${id}`);
        if (stored) setRsvpDone(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleRsvp = async () => {
    if (rsvpDone || rsvpLoading || !event) return;
    setRsvpLoading(true);
    try {
      const res = await rsvpEvent(getChurchSlug(), event.id);
      setRsvpCount(res.rsvp_count);
      setRsvpDone(true);
      localStorage.setItem(`rsvp:${event.id}`, "1");
    } catch {}
    setRsvpLoading(false);
  };

  if (loading) {
    return (
      <div className="px-4 pt-6">
        <p className="text-center text-[var(--color-text-muted)] py-12">{tCommon("loading")}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="px-4 pt-6">
        <p className="text-center text-[var(--color-text-muted)] py-12">{t("notFound")}</p>
        <Link href="/agenda" className="block text-center text-sm text-[var(--color-primary)] font-semibold mt-4">
          {tCommon("back")}
        </Link>
      </div>
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  const openMaps = () => {
    if (!event.location) return;
    const q = encodeURIComponent(event.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  };

  return (
    <div className="pb-24">
      {/* Back button */}
      <div className="px-4 pt-4">
        <Link
          href="/agenda"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {tCommon("back")}
        </Link>
      </div>

      {/* Image */}
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-52 object-cover mt-3 rounded-2xl shadow-lg"
        />
      )}

      {/* Content */}
      <div className="px-4 mt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{event.title}</h1>
          <ShareButton title={event.title} className="mt-1 shrink-0" />
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-3 mt-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {formatDate(event.event_date)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {formatTime(event.event_date)}
            </p>
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <button
            onClick={openMaps}
            className="flex items-center gap-3 mt-4 w-full text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {event.location}
              </p>
              <p className="text-xs text-[var(--color-primary)]">
                {t("openMaps")}
              </p>
            </div>
          </button>
        )}

        {/* Description */}
        {event.description && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
              {t("details")}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        )}

        {/* RSVP — disabled for now, enable when ready
        <div className="mt-6">
          <button
            onClick={handleRsvp}
            disabled={rsvpDone || rsvpLoading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] ${
              rsvpDone
                ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                : "bg-[var(--color-primary)] text-[var(--color-card-dark)]"
            }`}
          >
            {rsvpDone ? tRsvp("confirmed") : rsvpLoading ? "..." : tRsvp("going")}
          </button>
          {rsvpCount > 0 && (
            <p className="text-xs text-[var(--color-text-muted)] text-center mt-2">
              {tRsvp("count", { count: rsvpCount })}
            </p>
          )}
        </div>
        */}
      </div>
    </div>
  );
}
