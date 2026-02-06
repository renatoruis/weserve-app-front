"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSermons } from "@/lib/api";
import { getChurchSlug } from "@/lib/church";
import SermonCard from "./SermonCard";
import { ListSkeleton } from "@/components/Skeleton";

interface Sermon {
  id: string;
  title: string;
  youtube_url: string | null;
  pdf_url: string | null;
  tags: string[];
  sermon_date: string;
  materials?: { url: string; name: string; type: string }[];
}

export default function SermonList() {
  const t = useTranslations("sermons");
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params: { search?: string } = {};
    if (search.length >= 2) params.search = search;

    const timer = setTimeout(() => {
      getSermons(getChurchSlug(), params)
        .then((d) => setSermons(d as Sermon[]))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="flex flex-col gap-3">
      {/* Pesquisa */}
      <input
        type="text"
        placeholder={t("search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20"
      />

      {/* Lista */}
      {loading && sermons.length === 0 ? (
        <ListSkeleton count={3} type="sermon" />
      ) : sermons.length === 0 ? (
        <p className="text-center text-[var(--color-text-muted)] py-8">{t("noSermons")}</p>
      ) : (
        sermons.map((sermon) => <SermonCard key={sermon.id} sermon={sermon} />)
      )}
    </div>
  );
}
