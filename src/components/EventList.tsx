"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getChurchSlug } from "@/lib/church";
import { getApiUrl } from "@/lib/api";
import { ListSkeleton } from "@/components/Skeleton";

const API_URL = getApiUrl();

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  image_url: string | null;
}

export default function EventList() {
  const t = useTranslations("agenda");
  const tCommon = useTranslations("common");
  const [events, setEvents] = useState<Event[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadEvents = useCallback(async (offset: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/church/${getChurchSlug()}/events?limit=3&offset=${offset}`
      );
      const data = await res.json();
      if (offset === 0) {
        setEvents(data.events || []);
      } else {
        setEvents((prev) => [...prev, ...(data.events || [])]);
      }
      setHasMore(data.hasMore || false);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents(0);
  }, [loadEvents]);

  const handleLoadMore = () => {
    loadEvents(events.length);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {loading && events.length === 0 ? (
        <ListSkeleton count={3} type="card" />
      ) : events.length === 0 ? (
        <p className="text-center text-[var(--color-text-muted)] py-8">{t("noEvents")}</p>
      ) : (
        events.map((event) => (
          <Link key={event.id} href={`/agenda/${event.id}`} className="block">
            <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform">
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-36 object-cover"
                />
              )}
              <div className="p-4">
                <p className="text-xs font-medium text-[var(--color-accent)]">
                  {formatDate(event.event_date)}
                </p>
                <h3 className="text-base font-semibold mt-1">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-[var(--color-text-muted)] mt-1 line-clamp-2">{event.description}</p>
                )}
                {event.location && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-2 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {event.location}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))
      )}

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="w-full py-3 bg-[var(--color-surface)] rounded-2xl text-sm font-semibold text-[var(--color-primary)] shadow-sm hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {loading ? tCommon("loading") : tCommon("loadMore")}
        </button>
      )}
    </div>
  );
}
