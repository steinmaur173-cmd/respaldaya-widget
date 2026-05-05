import type {
  CanonicalTestimonial,
  CanonicalWidgetConfig,
  CanonicalWidgetPayload,
  CanonicalWidgetSpace,
  RawTestimonial,
  RawWidgetConfig,
  RawWidgetPayload,
  RawWidgetSpace,
  WidgetFetchResult,
  WidgetLayout,
  WidgetTheme,
} from "./types";

const API_PATH = "/api/widget/";
const EVENTS_PATH = "/api/events";
const FETCH_TIMEOUT_MS = 15000;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function toFiniteNumber(value: unknown): number | undefined {
  const parsed =
    typeof value === "number" ? value : typeof value === "string" ? Number(value.trim()) : Number.NaN;

  return Number.isFinite(parsed) ? parsed : undefined;
}

function toBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function toLayout(value: unknown): WidgetLayout | undefined {
  return value === "wall" || value === "carousel" || value === "list" ? value : undefined;
}

function toTheme(value: unknown): WidgetTheme | undefined {
  return value === "light" || value === "dark" || value === "auto" ? value : undefined;
}

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}${path}`;
}

function normalizeSpace(space?: RawWidgetSpace): CanonicalWidgetSpace {
  if (!space || typeof space !== "object") {
    return {};
  }

  return {
    id: toNonEmptyString(space.id),
    name: toNonEmptyString(space.name),
    slug: toNonEmptyString(space.slug),
    logo: toNonEmptyString(space.logo),
    colorPrimary: toNonEmptyString(space.colorPrimary ?? space.primary_color),
  };
}

function normalizeConfig(payload?: RawWidgetPayload): CanonicalWidgetConfig {
  const source = payload?.config ?? payload?.widget;

  if (!source || typeof source !== "object") {
    return {};
  }

  const config = source as RawWidgetConfig;

  return {
    layout: toLayout(config.layout),
    theme: toTheme(config.theme),
    minStars: clamp(toFiniteNumber(config.min_stars) ?? 1, 1, 5),
    maxItems: clamp(toFiniteNumber(config.maxItems ?? config.max_items) ?? 10, 1, 50),
    showPoweredBy: toBoolean(config.show_powered_by),
    showRatings: toBoolean(config.showRatings ?? config.show_ratings),
    showAvatars: toBoolean(config.showAvatars ?? config.show_avatars),
    autoplay: toBoolean(config.autoplay),
    autoplayInterval: clamp(toFiniteNumber(config.autoplayInterval ?? config.autoplay_interval) ?? 5000, 1000, 60000),
    primaryColor: toNonEmptyString(
      config.primaryColor ?? config.primary_color ?? config.accent_color
    ),
    borderRadius: clamp(toFiniteNumber(config.borderRadius ?? config.border_radius) ?? 12, 0, 48),
  };
}

function normalizeTestimonial(raw: RawTestimonial): CanonicalTestimonial | null {
  const id = toNonEmptyString(raw.id);
  const customerName = toNonEmptyString(raw.customerName ?? raw.name);
  const content = toNonEmptyString(raw.content ?? raw.body);
  const rating = toFiniteNumber(raw.rating ?? raw.stars);

  if (!id || !customerName || !content || rating === undefined || rating < 1) {
    return null;
  }

  return {
    id,
    customerName,
    content,
    rating: clamp(Math.round(rating), 1, 5),
    role: toNonEmptyString(raw.role),
    company: toNonEmptyString(raw.company),
    customerAvatar: toNonEmptyString(raw.customerAvatar ?? raw.customer_avatar ?? raw.photo),
    customerAvatarUrl: toNonEmptyString(raw.customerAvatarUrl ?? raw.customer_avatar_url),
    mediaUrl: toNonEmptyString(raw.mediaUrl ?? raw.media_url),
    format: toNonEmptyString(raw.format),
    publishedAt: toNonEmptyString(raw.publishedAt ?? raw.published_at),
    createdAt: toNonEmptyString(raw.createdAt ?? raw.created_at),
  };
}

function normalizePayload(data: RawWidgetPayload): CanonicalWidgetPayload | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  return {
    space: normalizeSpace(data.space),
    config: normalizeConfig(data),
    testimonials: Array.isArray(data.testimonials)
      ? data.testimonials
          .map((item) => normalizeTestimonial(item))
          .filter((item): item is CanonicalTestimonial => Boolean(item))
      : [],
    pbUrl: toNonEmptyString(data.pbUrl ?? data.pb_url),
  };
}

function getErrorMessage(status: number, fallback?: string): string {
  if (status === 404) {
    return fallback ?? "No encontramos ese widget.";
  }

  if (status >= 500) {
    return fallback ?? "No se pudieron cargar los testimonios en este momento.";
  }

  return fallback ?? `La API respondio ${status}.`;
}

export async function fetchWidget(
  appBase: string,
  slug: string,
  minStars: number,
  max: number
): Promise<WidgetFetchResult> {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : undefined;
  const timeoutId =
    controller && typeof window !== "undefined"
      ? window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
      : undefined;

  try {
    const url = new URL(`${joinUrl(appBase, API_PATH)}${encodeURIComponent(slug)}`);
    url.searchParams.set("min_stars", String(minStars));
    url.searchParams.set("max", String(max));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "omit",
      signal: controller?.signal,
    });

    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    const response = json as
      | {
          ok?: boolean;
          data?: RawWidgetPayload;
          error?: { code?: string; message?: string };
        }
      | null;

    if (!res.ok) {
      return {
        ok: false,
        kind: "http",
        status: res.status,
        message: getErrorMessage(res.status, response?.error?.message),
      };
    }

    const rawPayload =
      response && typeof response === "object" && "data" in response ? response.data : (response as RawWidgetPayload);
    const data = normalizePayload(rawPayload as RawWidgetPayload);

    if (!data) {
      return { ok: false, kind: "invalid", message: "La API devolvio un payload invalido." };
    }

    return { ok: true, data };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false,
        kind: "timeout",
        message: "La carga del widget excedio el tiempo esperado.",
      };
    }

    return {
      ok: false,
      kind: "network",
      message: "No se pudieron cargar los testimonios.",
    };
  } finally {
    if (timeoutId !== undefined && typeof window !== "undefined") {
      window.clearTimeout(timeoutId);
    }
  }
}

export function sendEvent(
  appBase: string,
  event: string,
  spaceId?: string,
  testimonialId?: string
): void {
  try {
    if (!navigator.sendBeacon) {
      return;
    }

    const payload = JSON.stringify({
      event,
      payload: {
        spaceId: spaceId ?? null,
        testimonialId: testimonialId ?? null,
      },
    });

    navigator.sendBeacon(joinUrl(appBase, EVENTS_PATH), new Blob([payload], { type: "application/json" }));
  } catch {
    // Never break the host page because analytics failed.
  }
}
