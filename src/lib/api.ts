const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Retorna a URL base da API.
 * Centralizado para evitar duplicação e inconsistência entre componentes.
 */
export function getApiUrl(): string {
  return API_URL;
}

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

// Church
export const getChurch = (slug: string) =>
  fetchAPI(`/api/church/${slug}`);

export const getHome = (slug: string) =>
  fetchAPI(`/api/church/${slug}/home`);

export const getVerseOfTheDay = (slug: string, locale: string) =>
  fetchAPI<{ content: string; reference: string; passage_id?: string; source: string }>(
    `/api/church/${slug}/home/verse-of-the-day?locale=${locale}`
  );

// Events
export const getEvent = (slug: string, id: string) =>
  fetchAPI<any>(`/api/church/${slug}/events/${id}`);

export const getEvents = (slug: string, params?: { from?: string; to?: string }) => {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  const qs = query.toString();
  return fetchAPI(`/api/church/${slug}/events${qs ? `?${qs}` : ""}`);
};

// Sermons
export const getSermon = (slug: string, id: string) =>
  fetchAPI<any>(`/api/church/${slug}/sermons/${id}`);

export const getSermons = (
  slug: string,
  params?: { from?: string; to?: string; tag?: string; search?: string }
) => {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.tag) query.set("tag", params.tag);
  if (params?.search) query.set("search", params.search);
  const qs = query.toString();
  return fetchAPI(`/api/church/${slug}/sermons${qs ? `?${qs}` : ""}`);
};

// Prayers
export const getPrayers = (slug: string, limit = 5) =>
  fetchAPI<any[]>(`/api/church/${slug}/prayers?limit=${limit}`);

export const createPrayer = (
  slug: string,
  data: { name: string; message: string; is_public: boolean; phone?: string; honeypot?: string }
) =>
  fetchAPI(`/api/church/${slug}/prayers`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const prayForRequest = (slug: string, id: string) =>
  fetchAPI<{ pray_count: number }>(`/api/church/${slug}/prayers/${id}/pray`, {
    method: "POST",
    body: JSON.stringify({}),
  });

// RSVP
export const rsvpEvent = (slug: string, id: string) =>
  fetchAPI<{ rsvp_count: number }>(`/api/church/${slug}/events/${id}/rsvp`, {
    method: "POST",
    body: JSON.stringify({}),
  });

// Groups
export const getGroups = (slug: string) =>
  fetchAPI<any[]>(`/api/church/${slug}/groups`);

// Notices
export const getNotices = (slug: string) =>
  fetchAPI(`/api/church/${slug}/notices`);

// Push
export const subscribePush = (
  slug: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
) =>
  fetchAPI(`/api/church/${slug}/push/subscribe`, {
    method: "POST",
    body: JSON.stringify(subscription),
  });
