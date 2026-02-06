"use client";

import { useEffect, useState } from "react";
import { getHome } from "@/lib/api";
import { getChurchSlug } from "@/lib/church";

interface HomeContent {
  banner_url: string | null;
}

export default function Banner() {
  const [data, setData] = useState<HomeContent | null>(null);

  useEffect(() => {
    getHome(getChurchSlug())
      .then((d) => setData(d as HomeContent))
      .catch(() => {});
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[45vh] z-0 overflow-hidden">
      {data?.banner_url ? (
        <img
          src={data.banner_url}
          alt="Banner"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[var(--color-heading)] via-[#333] to-[var(--color-heading)]" />
      )}
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/20" />
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
    </div>
  );
}
