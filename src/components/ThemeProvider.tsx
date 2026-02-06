"use client";

import { useEffect } from "react";
import { getChurch } from "@/lib/api";
import { getChurchSlug } from "@/lib/church";

interface ChurchTheme {
  primary_color?: string;
  heading_color?: string;
}

/**
 * Fetches church theme colors from the API and applies them as CSS variables.
 * Only two colors are configurable via backoffice:
 *   - primary_color  (accent / highlight)
 *   - heading_color  (titles / dark backgrounds / nav)
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    getChurch(getChurchSlug())
      .then((data: any) => {
        const theme = data as ChurchTheme;
        const root = document.documentElement;

        if (theme.primary_color) {
          root.style.setProperty("--color-primary", theme.primary_color);
          root.style.setProperty("--color-primary-dark", darken(theme.primary_color, 15));
          root.style.setProperty("--color-nav-active", theme.primary_color);
        }

        if (theme.heading_color) {
          root.style.setProperty("--color-heading", theme.heading_color);
          root.style.setProperty("--color-text", theme.heading_color);
          root.style.setProperty("--color-card-dark", theme.heading_color);
          root.style.setProperty("--color-nav-bg", theme.heading_color);
        }
      })
      .catch(() => {});
  }, []);

  return <>{children}</>;
}

function darken(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(2.55 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
