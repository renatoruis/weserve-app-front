"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getPrayers, prayForRequest } from "@/lib/api";
import { getChurchSlug } from "@/lib/church";
import PrayerFormModal from "@/components/PrayerFormModal";

interface Prayer {
  id: string;
  name: string;
  message: string;
  pray_count: number;
  created_at: string;
}

const PRAYED_KEY = "prayed_prayers";

function getPrayedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const data = localStorage.getItem(PRAYED_KEY);
    return new Set(data ? JSON.parse(data) : []);
  } catch {
    return new Set();
  }
}

function savePrayed(id: string) {
  const set = getPrayedSet();
  set.add(id);
  localStorage.setItem(PRAYED_KEY, JSON.stringify([...set]));
}

export default function PrayersPage() {
  const t = useTranslations("prayers");
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [limit, setLimit] = useState(5);
  const [hasMore, setHasMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const load = useCallback(() => {
    getPrayers(getChurchSlug(), limit)
      .then((d) => {
        setPrayers(d);
        setHasMore(d.length >= limit);
      })
      .catch(() => {});
  }, [limit]);

  useEffect(() => {
    load();
    setPrayedIds(getPrayedSet());
  }, [load]);

  const handlePray = async (id: string) => {
    if (prayedIds.has(id)) return;

    setAnimatingId(id);
    try {
      const result = await prayForRequest(getChurchSlug(), id);
      setPrayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, pray_count: result.pray_count } : p))
      );
      savePrayed(id);
      setPrayedIds((prev) => new Set([...prev, id]));
    } catch {
      // silently fail (409 = already prayed from this IP)
    } finally {
      setTimeout(() => setAnimatingId(null), 600);
    }
  };

  const handleLoadMore = () => {
    setLimit((prev) => prev + 10);
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    // Reload after a short delay for cache
    setTimeout(() => load(), 500);
  };

  const formatDate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(iso).toLocaleDateString();
  };

  return (
    <div className="px-4 pt-6 pb-24 relative">
      {/* Header */}
      <h1 className="text-2xl font-bold text-[var(--color-heading)]">{t("title")}</h1>
      <p className="text-sm text-[var(--color-text-muted)] mt-1">{t("communityPrayers")}</p>

      {/* Prayer list */}
      <div className="mt-5 flex flex-col gap-3">
        {prayers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">{t("noPrayers")}</p>
          </div>
        ) : (
          prayers.map((prayer) => {
            const hasPrayed = prayedIds.has(prayer.id);
            const isAnimating = animatingId === prayer.id;

            return (
              <div
                key={prayer.id}
                className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-card-dark)] flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {prayer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                      {prayer.name}
                    </p>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    {formatDate(prayer.created_at)}
                  </p>
                </div>

                {/* Message */}
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {prayer.message}
                </p>

                {/* Pray button */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => handlePray(prayer.id)}
                    disabled={hasPrayed}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 active:scale-95 ${
                      hasPrayed
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                    } ${isAnimating ? "scale-110" : ""}`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={hasPrayed ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-300 ${isAnimating ? "scale-125" : ""}`}
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                    {hasPrayed ? t("iPrayed") : t("iPrayed")}
                  </button>

                  {prayer.pray_count > 0 && (
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      {t("prayedCount", { count: prayer.pray_count })}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          onClick={handleLoadMore}
          className="w-full mt-4 py-3 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          {t("seeAll")}
        </button>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px)+1rem)] right-4 z-40 w-14 h-14 rounded-full bg-[var(--color-primary)] shadow-lg flex items-center justify-center active:scale-90 transition-transform"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-card-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Modal */}
      <PrayerFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
