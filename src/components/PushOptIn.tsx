"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getChurchSlug } from "@/lib/church";
import { getApiUrl } from "@/lib/api";

const API_URL = getApiUrl();

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

export default function PushOptIn() {
  const t = useTranslations("push");
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setSupported(true);
      // Check existing subscription
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setSubscribed(true);
        });
      });
    }
  }, []);

  const subscribe = async () => {
    setLoading(true);
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Get VAPID key
      const slug = getChurchSlug();
      const res = await fetch(`${API_URL}/api/church/${slug}/push/vapid-key`);
      const { key } = await res.json();
      if (!key) throw new Error("No VAPID key");

      // Subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });

      const sub = subscription.toJSON();

      // Send to backend
      await fetch(`${API_URL}/api/church/${slug}/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys?.p256dh, auth: sub.keys?.auth },
        }),
      });

      setSubscribed(true);
    } catch (err) {
      console.error("Push subscription failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!supported || subscribed) return null;

  return (
    <button
      onClick={subscribe}
      disabled={loading}
      className="w-full flex items-center gap-3 p-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] active:scale-[0.98] transition-transform"
    >
      <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/15 flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      </div>
      <div className="text-left flex-1">
        <p className="text-sm font-semibold text-[var(--color-heading)]">
          {loading ? t("subscribing") : t("enable")}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">{t("hint")}</p>
      </div>
    </button>
  );
}
