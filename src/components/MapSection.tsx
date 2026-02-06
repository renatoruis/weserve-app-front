"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getChurch } from "@/lib/api";
import { getChurchSlug } from "@/lib/church";

interface ChurchData {
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
}

interface MapSectionProps {
  hideHeader?: boolean;
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
}

export default function MapSection({ hideHeader, lat: propLat, lng: propLng, address: propAddress }: MapSectionProps) {
  const t = useTranslations("address");
  const [church, setChurch] = useState<ChurchData | null>(
    propLat && propLng ? { name: "", address: propAddress ?? null, lat: propLat, lng: propLng } : null
  );

  useEffect(() => {
    // Skip fetch if data was provided via props
    if (propLat && propLng) return;
    getChurch(getChurchSlug())
      .then((d) => setChurch(d as ChurchData))
      .catch(() => {});
  }, [propLat, propLng]);

  // Update from props if they change
  useEffect(() => {
    if (propLat && propLng) {
      setChurch({ name: "", address: propAddress ?? null, lat: propLat, lng: propLng });
    }
  }, [propLat, propLng, propAddress]);

  if (!church?.lat || !church?.lng) return null;

  const lat = Number(church.lat);
  const lng = Number(church.lng);

  if (isNaN(lat) || isNaN(lng)) return null;

  const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div>
      {!hideHeader && (
        <>
          <h2 className="text-lg font-bold text-[var(--color-heading)] mb-3">{t("title")}</h2>
          {church.address && (
            <p className="text-sm text-[var(--color-text-muted)] mb-3">{church.address}</p>
          )}
        </>
      )}

      {/* Google Maps embed */}
      <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden border border-[var(--color-border)]">
        <iframe
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          title="Church location"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-3">
        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 bg-[#33ccff] text-white text-sm font-semibold rounded-xl text-center transition-opacity hover:opacity-90 active:scale-[0.97]"
        >
          {t("openWaze")}
        </a>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 bg-[#4285f4] text-white text-sm font-semibold rounded-xl text-center transition-opacity hover:opacity-90 active:scale-[0.97]"
        >
          {t("openMaps")}
        </a>
      </div>
    </div>
  );
}
