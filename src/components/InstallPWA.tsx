"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Banner de instalação do PWA.
 * - Android/Desktop: usa a API nativa beforeinstallprompt
 * - iOS: mostra instruções para "Adicionar à Tela Inicial"
 * - Já instalado: não mostra nada
 */
export default function InstallPWA() {
  const t = useTranslations("install");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Já está instalado como PWA?
    if (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Já dispensou o banner?
    if (localStorage.getItem("pwa-install-dismissed")) {
      setDismissed(true);
      return;
    }

    // Detectar iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isiOS);

    if (isiOS) {
      // No iOS não há beforeinstallprompt, mostramos instruções
      setShowBanner(true);
      return;
    }

    // Android / Desktop — escutar o evento nativo
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  if (isInstalled || dismissed || !showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto animate-fade-in">
      <div className="bg-[var(--color-card-dark)] rounded-2xl p-4 shadow-xl border border-white/10">
        <div className="flex items-start gap-3">
          {/* Ícone do app */}
          <div className="w-12 h-12 rounded-xl bg-[var(--color-bg)] flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/favicon.svg" alt="App" className="w-8 h-8" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white">{t("title")}</h3>
            <p className="text-xs text-white/60 mt-0.5">{t("description")}</p>
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

        {isIOS ? (
          /* Instruções para iOS */
          <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-xl p-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            <p className="text-xs text-white/80 leading-relaxed">
              {t("iosInstructions")}
            </p>
          </div>
        ) : (
          /* Botão de instalação nativo (Android/Desktop) */
          <button
            onClick={handleInstall}
            className="mt-3 w-full py-2.5 bg-[var(--color-primary)] text-[var(--color-card-dark)] rounded-xl text-sm font-bold active:scale-[0.97] transition-transform"
          >
            {t("installButton")}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Botão compacto de instalação para usar na página "Mais" ou em qualquer lugar.
 * Mostra apenas se o app NÃO estiver instalado.
 */
export function InstallButton() {
  const t = useTranslations("install");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isiOS);

    if (isiOS) {
      setCanInstall(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSHint(!showIOSHint);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  if (isInstalled || !canInstall) return null;

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleInstall}
        className="w-full flex items-center gap-3 p-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] active:scale-[0.98] transition-transform"
      >
        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/15 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-semibold text-[var(--color-heading)]">
            {t("installButton")}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">{t("buttonHint")}</p>
        </div>
      </button>

      {showIOSHint && (
        <div className="bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-border)] animate-fade-in">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {t("iosInstructions")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
