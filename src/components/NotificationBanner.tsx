"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getChurchSlug } from "@/lib/church";
import { getApiUrl } from "@/lib/api";

const API_URL = getApiUrl();
const DISMISS_KEY = "push-banner-dismissed";
const DISMISS_DAYS = 7; // Volta a mostrar após 7 dias

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Banner flutuante que aparece quando as notificações push não estão ativas.
 * - Aparece após 3 segundos para não sobrecarregar o usuário
 * - Pode ser dispensado (volta a aparecer após 7 dias)
 * - Não aparece se já está inscrito ou se o browser não suporta
 * - Mostra aviso se as notificações estão bloqueadas
 */
export default function NotificationBanner() {
  const t = useTranslations("push");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    // Verificar se o browser suporta
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    // Não mostrar junto com o banner de instalação do PWA
    // Só aparece se: o app já está instalado OU o banner de instalação já foi dispensado
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone;
    const installDismissed = !!localStorage.getItem("pwa-install-dismissed");
    if (!isInstalled && !installDismissed) return;

    // Verificar se dispensou este banner recentemente
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const diff = Date.now() - parseInt(dismissedAt, 10);
      if (diff < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    // Verificar se as notificações estão bloqueadas
    if ("Notification" in window && Notification.permission === "denied") {
      const timer = setTimeout(() => {
        setDenied(true);
        setShow(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Verificar se já está inscrito
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (sub) return; // Já inscrito, não mostrar

        // Mostrar banner após delay
        const timer = setTimeout(() => setShow(true), 3000);
        return () => clearTimeout(timer);
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const slug = getChurchSlug();
      const res = await fetch(`${API_URL}/api/church/${slug}/push/vapid-key`);
      const { key } = await res.json();
      if (!key) throw new Error("No VAPID key");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });

      const sub = subscription.toJSON();

      await fetch(`${API_URL}/api/church/${slug}/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys?.p256dh, auth: sub.keys?.auth },
        }),
      });

      setShow(false);
    } catch (err) {
      console.error("Push subscription failed:", err);
      // Verificar se o usuário negou a permissão
      if ("Notification" in window && Notification.permission === "denied") {
        setDenied(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto animate-fade-in">
      <div className="bg-[var(--color-card-dark)] rounded-2xl p-4 shadow-xl border border-white/10">
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/20 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white">{t("bannerTitle")}</h3>
            <p className="text-xs text-white/60 mt-0.5">
              {denied ? t("denied") : t("bannerDesc")}
            </p>
          </div>

          {/* Botão fechar */}
          <button
            onClick={handleDismiss}
            className="text-white/40 hover:text-white/70 transition-colors shrink-0"
            aria-label="Fechar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {!denied && (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="mt-3 w-full py-2.5 bg-[var(--color-primary)] text-[var(--color-card-dark)] rounded-xl text-sm font-bold active:scale-[0.97] transition-transform disabled:opacity-70"
          >
            {loading ? t("subscribing") : t("bannerButton")}
          </button>
        )}
      </div>
    </div>
  );
}
