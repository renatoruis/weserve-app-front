"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createPrayer } from "@/lib/api";
import { getChurchSlug } from "@/lib/church";

interface PrayerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PrayerFormModal({ open, onClose, onSuccess }: PrayerFormModalProps) {
  const t = useTranslations("prayers");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [honeypot, setHoneypot] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSuccess(false);
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setLoading(true);
    setError("");

    try {
      await createPrayer(getChurchSlug(), {
        name: name.trim(),
        message: message.trim(),
        is_public: isPublic,
        phone: phone.trim() || undefined,
        honeypot: honeypot || undefined,
      });
      setSuccess(true);
      setName("");
      setPhone("");
      setMessage("");
      setHoneypot("");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      if (err.message?.includes("429")) {
        setError(t("tooMany"));
      } else {
        setError(err.message || "Error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-t-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />

        <h2 className="text-lg font-bold text-[var(--color-heading)] mb-4">
          {t("newPrayer")}
        </h2>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-green-600">{t("success")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder={t("name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[var(--color-bg)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />

            <div>
              <input
                type="tel"
                placeholder={t("phone")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-bg)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              />
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1 px-1">
                {t("phoneHint")}
              </p>
            </div>

            <textarea
              placeholder={t("message")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 bg-[var(--color-bg)] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />

            {/* Visibility toggle */}
            <div className="flex items-center gap-1 bg-[var(--color-bg)] rounded-xl p-1">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isPublic
                    ? "bg-[var(--color-surface)] text-[var(--color-heading)] shadow-sm"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {t("public")}
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  !isPublic
                    ? "bg-[var(--color-surface)] text-[var(--color-heading)] shadow-sm"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {t("private")}
              </button>
            </div>

            {/* Honeypot (hidden from users, visible to bots) */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
            />

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[var(--color-primary)] text-[var(--color-card-dark)] text-sm font-bold rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50 mt-1"
            >
              {loading ? "..." : t("submit")}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
