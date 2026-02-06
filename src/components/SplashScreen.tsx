"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--color-heading)] flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <Image
          src="/LogoSplash.svg"
          alt="Logo"
          width={220}
          height={150}
          className="mx-auto mb-6 invert"
          priority
        />
        <div className="mt-4">
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-[var(--color-primary)] rounded-full animate-loading-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}
