import type {
  CanonicalTestimonial,
  CanonicalWidgetConfig,
  CanonicalWidgetPayload,
  WidgetLayout,
  WidgetTheme,
} from "./types";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
}

function appendTextElement(parent: HTMLElement, tagName: string, className: string, text: string): void {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  parent.appendChild(element);
}

function renderStars(rating: number): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "rsw-stars";
  wrapper.setAttribute("aria-label", `Calificacion ${rating} de 5`);

  for (let index = 1; index <= 5; index += 1) {
    const star = document.createElement("span");
    star.className = `rsw-star ${index <= rating ? "rsw-star-filled" : "rsw-star-empty"}`;
    star.setAttribute("aria-hidden", "true");
    star.textContent = "★";
    wrapper.appendChild(star);
  }

  return wrapper;
}

function resolveAvatarUrl(testimonial: CanonicalTestimonial, pbUrl?: string): string | undefined {
  if (testimonial.customerAvatarUrl) {
    return testimonial.customerAvatarUrl;
  }

  if (testimonial.customerAvatar && pbUrl) {
    return `${pbUrl.replace(/\/+$/, "")}/api/files/testimonials/${encodeURIComponent(testimonial.id)}/${encodeURIComponent(
      testimonial.customerAvatar
    )}`;
  }

  return undefined;
}

function renderAvatar(testimonial: CanonicalTestimonial, showAvatars: boolean, pbUrl?: string): HTMLElement | null {
  if (!showAvatars) {
    return null;
  }

  const avatar = document.createElement("div");
  avatar.className = "rsw-avatar";

  const src = resolveAvatarUrl(testimonial, pbUrl);
  if (src) {
    const image = document.createElement("img");
    image.src = src;
    image.alt = "";
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", () => {
      avatar.replaceChildren(document.createTextNode(initials(testimonial.customerName)));
    });
    avatar.appendChild(image);
    return avatar;
  }

  avatar.textContent = initials(testimonial.customerName);
  return avatar;
}

function renderCard(
  testimonial: CanonicalTestimonial,
  payload: CanonicalWidgetPayload,
  isDark: boolean,
  accentColor?: string
): HTMLElement {
  const config = payload.config;
  const card = document.createElement("article");
  card.className = `rsw-card${isDark ? " rsw-dark" : ""}`;
  card.tabIndex = 0;
  card.dataset.rswId = testimonial.id;

  if (accentColor) {
    card.style.setProperty("--rsw-accent", accentColor);
  }

  if (typeof config.borderRadius === "number") {
    card.style.setProperty("--rsw-card-radius", `${config.borderRadius}px`);
  }

  if (config.showRatings !== false) {
    card.appendChild(renderStars(testimonial.rating));
  }

  appendTextElement(card, "p", "rsw-content", testimonial.content);

  const author = document.createElement("div");
  author.className = "rsw-author";

  const avatar = renderAvatar(testimonial, config.showAvatars !== false, payload.pbUrl);
  if (avatar) {
    author.appendChild(avatar);
  }

  const authorInfo = document.createElement("div");
  authorInfo.className = "rsw-author-info";
  appendTextElement(authorInfo, "div", "rsw-author-name", testimonial.customerName);

  const meta = [testimonial.role, testimonial.company].filter(Boolean).join(" · ");
  if (meta) {
    appendTextElement(authorInfo, "div", "rsw-author-meta", meta);
  }

  author.appendChild(authorInfo);
  card.appendChild(author);

  return card;
}

export function resolveConfig(data: CanonicalWidgetPayload): CanonicalWidgetConfig {
  return data.config;
}

export function resolveAccentColor(data: CanonicalWidgetPayload): string | undefined {
  return data.config.primaryColor ?? data.space.colorPrimary;
}

export function resolveIsDark(theme: WidgetTheme): boolean {
  if (theme === "dark") {
    return true;
  }

  if (theme === "auto") {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  }

  return false;
}

export function renderState(kind: "loading" | "empty" | "error", message: string): HTMLElement {
  const element = document.createElement("div");
  element.className = `rsw-state rsw-state-${kind}`;
  element.textContent = message;
  return element;
}

export function renderWidget(
  data: CanonicalWidgetPayload,
  layout: WidgetLayout,
  isDark: boolean,
  showPoweredBy: boolean,
  accentColor?: string
): HTMLElement {
  if (data.testimonials.length === 0) {
    return renderState("empty", "No hay testimonios aprobados para mostrar.");
  }

  const root = document.createElement("div");
  const layoutContainer = document.createElement("div");
  layoutContainer.className =
    layout === "list" ? "rsw-list" : layout === "carousel" ? "rsw-carousel" : "rsw-wall";

  data.testimonials.forEach((testimonial) => {
    layoutContainer.appendChild(renderCard(testimonial, data, isDark, accentColor));
  });

  root.appendChild(layoutContainer);

  if (showPoweredBy) {
    const powered = document.createElement("div");
    powered.className = "rsw-powered";
    const link = document.createElement("a");
    link.href = "https://respaldaya.com?ref=widget";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Powered by Respaldaya";
    powered.appendChild(link);
    root.appendChild(powered);
  }

  return root;
}
