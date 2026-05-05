import { fetchWidget, sendEvent } from "./api";
import { injectStyles } from "./styles";
import { renderState, renderWidget, resolveAccentColor, resolveConfig, resolveIsDark } from "./render";
import type { MountOptions, WidgetLayout, WidgetTheme } from "./types";

const DEFAULT_APP_BASE = "https://app.respaldaya.com";
const DEFAULT_LAYOUT: WidgetLayout = "wall";
const DEFAULT_THEME: WidgetTheme = "light";
const CONTAINER_SELECTOR = "[data-testimonial-space]";
const OBSERVED_ATTRIBUTES = [
  "data-testimonial-space",
  "data-layout",
  "data-theme",
  "data-min-stars",
  "data-max",
  "data-api-base",
] as const;

const mountedContainers = new WeakMap<HTMLElement, string>();
let observerStarted = false;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseInteger(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
}

function parseOptionalInteger(value: string | undefined, min: number, max: number): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return parseInteger(value, min, min, max);
}

function parseLayout(value: string | undefined): WidgetLayout | undefined {
  return value === "wall" || value === "carousel" || value === "list" ? value : undefined;
}

function parseTheme(value: string | undefined): WidgetTheme | undefined {
  return value === "light" || value === "dark" || value === "auto" ? value : undefined;
}

function normalizeBaseUrl(value: string | undefined): string {
  const base = value?.trim() || DEFAULT_APP_BASE;

  try {
    return new URL(base, window.location.href).toString().replace(/\/+$/, "");
  } catch {
    return DEFAULT_APP_BASE;
  }
}

function readOptions(el: HTMLElement): MountOptions {
  const dataset = el.dataset;

  return {
    slug: (dataset.testimonialSpace ?? "").trim(),
    layout: parseLayout(dataset.layout),
    theme: parseTheme(dataset.theme),
    minStars: parseOptionalInteger(dataset.minStars, 1, 5),
    max: parseOptionalInteger(dataset.max, 1, 50),
    appBase: normalizeBaseUrl(dataset.apiBase),
  };
}

function buildSignature(container: HTMLElement): string {
  return OBSERVED_ATTRIBUTES.map((attribute) => container.getAttribute(attribute) ?? "").join("|");
}

function replaceContainerContent(container: HTMLElement, node: HTMLElement): void {
  container.replaceChildren(node);
}

function applyContainerState(container: HTMLElement, isDark: boolean): void {
  container.classList.add("rsw-container");
  container.classList.toggle("rsw-dark", isDark);
}

function resolveEffectiveLayout(options: MountOptions, apiLayout?: WidgetLayout): WidgetLayout {
  return options.layout ?? apiLayout ?? DEFAULT_LAYOUT;
}

function resolveEffectiveTheme(options: MountOptions, apiTheme?: WidgetTheme): WidgetTheme {
  return options.theme ?? apiTheme ?? DEFAULT_THEME;
}

function resolveEffectiveMax(options: MountOptions, apiMax?: number): number {
  if (typeof options.max === "number" && options.max > 0) {
    return options.max;
  }

  return clamp(apiMax ?? 9, 1, 50);
}

async function mount(container: HTMLElement): Promise<void> {
  const signature = buildSignature(container);
  const options = readOptions(container);

  mountedContainers.set(container, signature);

  if (!options.slug) {
    applyContainerState(container, false);
    replaceContainerContent(container, renderState("error", "Falta el atributo data-testimonial-space."));
    return;
  }

  applyContainerState(container, false);
  replaceContainerContent(container, renderState("loading", "Cargando testimonios..."));

  const requestMinStars = clamp(options.minStars ?? 1, 1, 5);
  const requestMax = clamp(options.max ?? 9, 1, 50);
  const result = await fetchWidget(options.appBase, options.slug, requestMinStars, requestMax);

  if (mountedContainers.get(container) !== signature) {
    return;
  }

  if (!result.ok) {
    applyContainerState(container, false);
    replaceContainerContent(container, renderState("error", result.message));
    return;
  }

  const config = resolveConfig(result.data);
  const theme = resolveEffectiveTheme(options, config.theme);
  const isDark = resolveIsDark(theme);
  const layout = resolveEffectiveLayout(options, config.layout);
  const accentColor = resolveAccentColor(result.data);
  const showPoweredBy = config.showPoweredBy !== false;
  const spaceId = result.data.space.id;
  const effectiveMax = resolveEffectiveMax(options, config.maxItems);
  const effectiveMinStars = clamp(options.minStars ?? config.minStars ?? 1, 1, 5);

  const filteredData = {
    ...result.data,
    testimonials: result.data.testimonials
      .filter((testimonial) => testimonial.rating >= effectiveMinStars)
      .slice(0, effectiveMax),
  };

  applyContainerState(container, isDark);
  replaceContainerContent(container, renderWidget(filteredData, layout, isDark, showPoweredBy, accentColor));

  sendEvent(options.appBase, "widget.viewed", spaceId);

  container.querySelectorAll<HTMLElement>("[data-rsw-id]").forEach((card) => {
    card.addEventListener("click", () => {
      sendEvent(options.appBase, "widget.click", spaceId, card.dataset.rswId);
    });
  });
}

function mountElementIfNeeded(container: HTMLElement): void {
  const nextSignature = buildSignature(container);
  if (mountedContainers.get(container) === nextSignature) {
    return;
  }

  void mount(container);
}

function mountAll(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(CONTAINER_SELECTOR).forEach((container) => {
    mountElementIfNeeded(container);
  });
}

function handleMutations(mutations: MutationRecord[]): void {
  for (const mutation of mutations) {
    if (mutation.type === "attributes" && mutation.target instanceof HTMLElement) {
      mountElementIfNeeded(mutation.target);
      continue;
    }

    mutation.addedNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      if (node.matches(CONTAINER_SELECTOR)) {
        mountElementIfNeeded(node);
      }

      mountAll(node);
    });
  }
}

function observeContainers(): void {
  if (observerStarted || !document.body || typeof MutationObserver === "undefined") {
    return;
  }

  const observer = new MutationObserver(handleMutations);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [...OBSERVED_ATTRIBUTES],
  });

  observerStarted = true;
}

function init(): void {
  injectStyles();
  mountAll();
  observeContainers();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
