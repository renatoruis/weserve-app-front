"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getChurch, getGroups } from "@/lib/api";
import { getChurchSlug } from "@/lib/church";
import NoticeList from "@/components/NoticeList";
import MapSection from "@/components/MapSection";
import PushOptIn from "@/components/PushOptIn";

interface ChurchData {
  name: string;
  about_text: string | null;
  service_times: { day: string; time: string; label?: string }[];
  social_links: { platform: string; url: string }[];
  donation_url: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
}

interface Group {
  id: string;
  name: string;
  leader: string | null;
  day: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
}

const socialIcons: Record<string, React.ReactNode> = {
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  facebook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  ),
  youtube: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  ),
  twitter: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
  ),
  website: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  tiktok: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" />
    </svg>
  ),
};

export default function MorePage() {
  const t = useTranslations("more");
  const tGroups = useTranslations("groups");
  const [church, setChurch] = useState<ChurchData | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const slug = getChurchSlug();
    getChurch(slug)
      .then((d) => setChurch(d as ChurchData))
      .catch(() => {});
    getGroups(slug)
      .then((d) => setGroups(d || []))
      .catch(() => {});
  }, []);

  const serviceTimes = Array.isArray(church?.service_times) ? church!.service_times : [];
  const socialLinks = Array.isArray(church?.social_links) ? church!.social_links : [];

  const handleShareAddress = async () => {
    if (!church?.address) return;

    const mapsUrl = church.lat && church.lng
      ? `https://www.google.com/maps/search/?api=1&query=${church.lat},${church.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(church.address)}`;

    const shareData = {
      title: church.name || "Church Location",
      text: church.address,
      url: mapsUrl,
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(mapsUrl);
      } catch {}
    }
  };

  return (
    <div className="px-4 pt-6 pb-8 flex flex-col gap-5">
      {/* Header */}
      <h1 className="text-2xl font-bold text-[var(--color-heading)]">{t("title")}</h1>

      {/* Quick Links - Sermões e Oração (removidos do nav) */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/sermoes" className="block">
          <div className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.97] transition-transform">
            <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[var(--color-heading)]">{t("sermons")}</p>
          </div>
        </Link>
        <Link href="/oracoes" className="block">
          <div className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.97] transition-transform">
            <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[var(--color-heading)]">{t("prayers")}</p>
          </div>
        </Link>
      </div>

      {/* Push Notifications Opt-in */}
      <PushOptIn />

      {/* About */}
      {church?.about_text && (
        <div className="bg-[var(--color-surface)] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[var(--color-heading)] uppercase tracking-wider mb-2">
            {t("about")}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
            {church.about_text}
          </p>
        </div>
      )}

      {/* Service Times */}
      {serviceTimes.length > 0 && (
        <div className="bg-[var(--color-surface)] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[var(--color-heading)] uppercase tracking-wider mb-3">
            {t("serviceTimes")}
          </h2>
          <div className="flex flex-col gap-2">
            {serviceTimes.map((st, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[var(--color-heading)]">{st.label || st.day}</p>
                  {st.label && st.day && (
                    <p className="text-xs text-[var(--color-text-muted)]">{st.day}</p>
                  )}
                </div>
                <p className="text-sm font-semibold text-[var(--color-primary)]">{st.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location with Share GPS */}
      {(church?.address || church?.lat) && (
        <div className="bg-[var(--color-surface)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[var(--color-heading)] uppercase tracking-wider">
              {t("location")}
            </h2>
            {church?.address && (
              <button
                onClick={handleShareAddress}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] active:scale-95 transition-transform"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {t("shareAddress")}
              </button>
            )}
          </div>
          {church?.address && (
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">{church.address}</p>
          )}
          <MapSection hideHeader lat={church?.lat} lng={church?.lng} address={church?.address} />
        </div>
      )}

      {/* Donation */}
      {church?.donation_url && (
        <a
          href={church.donation_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-[var(--color-primary)] rounded-2xl p-5 shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-[var(--color-card-dark)]">{t("donate")}</p>
            <p className="text-sm text-[var(--color-card-dark)]/70">{t("donateDesc")}</p>
          </div>
        </a>
      )}

      {/* Groups */}
      {groups.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[var(--color-heading)] uppercase tracking-wider mb-3">
            {tGroups("title")}
          </h2>
          <div className="flex flex-col gap-2">
            {groups.map((group) => (
              <div key={group.id} className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-sm">
                <h3 className="text-base font-semibold text-[var(--color-heading)]">{group.name}</h3>
                {group.description && (
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">{group.description}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-[var(--color-text-secondary)]">
                  {group.leader && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      {group.leader}
                    </span>
                  )}
                  {group.day && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      {group.day}
                    </span>
                  )}
                  {group.time && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {group.time}
                    </span>
                  )}
                  {group.location && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      {group.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[var(--color-heading)] uppercase tracking-wider mb-3">
            {t("socialMedia")}
          </h2>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-heading)] active:scale-95 transition-transform"
              >
                {socialIcons[link.platform.toLowerCase()] || socialIcons.website}
                <span className="capitalize">{link.platform}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Notices */}
      <NoticeList />
    </div>
  );
}
