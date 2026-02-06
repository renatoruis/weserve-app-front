import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  // "standalone" é necessário para Docker; na Vercel não deve ser usado.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),

  images: {
    // Permitir imagens de domínios externos (API, YouTube thumbs, etc.)
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default withPWA(withNextIntl(nextConfig));
