import type { ReactNode } from "react";
import "./globals.css";

// Root layout mínimo - todo o conteúdo real está em [locale]/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
