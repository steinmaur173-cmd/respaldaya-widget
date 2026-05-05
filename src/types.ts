export type WidgetLayout = "wall" | "carousel" | "list";
export type WidgetTheme = "light" | "dark" | "auto";

export interface RawTestimonial {
  id?: string;
  customerName?: string;
  name?: string;
  content?: string;
  body?: string;
  rating?: number | string;
  stars?: number | string;
  role?: string;
  company?: string;
  customerAvatar?: string;
  customer_avatar?: string;
  customerAvatarUrl?: string;
  customer_avatar_url?: string;
  photo?: string;
  mediaUrl?: string;
  media_url?: string;
  format?: string;
  publishedAt?: string;
  published_at?: string;
  createdAt?: string;
  created_at?: string;
}

export interface CanonicalTestimonial {
  id: string;
  customerName: string;
  content: string;
  rating: number;
  role?: string;
  company?: string;
  customerAvatar?: string;
  customerAvatarUrl?: string;
  mediaUrl?: string;
  format?: string;
  publishedAt?: string;
  createdAt?: string;
}

export interface RawWidgetConfig {
  layout?: string;
  theme?: string;
  min_stars?: number;
  max_items?: number;
  maxItems?: number;
  show_powered_by?: boolean;
  showRatings?: boolean;
  show_ratings?: boolean;
  showAvatars?: boolean;
  show_avatars?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  autoplay_interval?: number;
  primaryColor?: string;
  primary_color?: string;
  accent_color?: string;
  borderRadius?: number;
  border_radius?: number;
}

export interface CanonicalWidgetConfig {
  layout?: WidgetLayout;
  theme?: WidgetTheme;
  minStars?: number;
  maxItems?: number;
  showPoweredBy?: boolean;
  showRatings?: boolean;
  showAvatars?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  primaryColor?: string;
  borderRadius?: number;
}

export interface RawWidgetSpace {
  id?: string;
  name?: string;
  slug?: string;
  logo?: string;
  colorPrimary?: string;
  primary_color?: string;
}

export interface CanonicalWidgetSpace {
  id?: string;
  name?: string;
  slug?: string;
  logo?: string;
  colorPrimary?: string;
}

export interface WidgetApiResponse {
  ok?: boolean;
  data?: RawWidgetPayload;
  error?: {
    code?: string;
    message?: string;
  };
}

export interface RawWidgetPayload {
  space?: RawWidgetSpace;
  config?: RawWidgetConfig;
  widget?: RawWidgetConfig;
  testimonials?: RawTestimonial[];
  pbUrl?: string;
  pb_url?: string;
}

export interface CanonicalWidgetPayload {
  space: CanonicalWidgetSpace;
  config: CanonicalWidgetConfig;
  testimonials: CanonicalTestimonial[];
  pbUrl?: string;
}

export interface MountOptions {
  slug: string;
  layout?: WidgetLayout;
  theme?: WidgetTheme;
  minStars?: number;
  max?: number;
  appBase: string;
}

export type WidgetFetchResult =
  | { ok: true; data: CanonicalWidgetPayload }
  | { ok: false; kind: "network" | "invalid" | "http" | "timeout"; message: string; status?: number };
