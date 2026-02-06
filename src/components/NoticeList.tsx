"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getNotices } from "@/lib/api";
import { getChurchSlug } from "@/lib/church";
import { ListSkeleton } from "@/components/Skeleton";

interface Notice {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
}

export default function NoticeList() {
  const t = useTranslations("notices");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotices(getChurchSlug())
      .then((d) => setNotices(d as Notice[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">{t("title")}</h2>
      {loading ? (
        <ListSkeleton count={2} type="notice" />
      ) : notices.length === 0 ? (
        <p className="text-center text-[var(--color-text-muted)] py-4">
          {t("noNotices")}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-sm">
              <h3 className="text-base font-semibold">{notice.title}</h3>
              {notice.body && (
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  {notice.body}
                </p>
              )}
              <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
                {new Date(notice.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
