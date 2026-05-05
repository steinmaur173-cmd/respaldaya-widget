export const STYLE_ID = "rsw-styles";

export const CSS = /* css */ `
.rsw-container {
  --rsw-accent: #2563eb;
  --rsw-card-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
  color: #111827;
  line-height: 1.4;
  text-size-adjust: 100%;
}
.rsw-container * {
  box-sizing: border-box;
}

.rsw-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.rsw-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rsw-carousel {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 8px;
}
.rsw-carousel::-webkit-scrollbar { height: 4px; }
.rsw-carousel::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 2px; }
.rsw-carousel::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.rsw-carousel .rsw-card {
  min-width: 280px;
  max-width: 320px;
  scroll-snap-align: start;
  flex-shrink: 0;
}

.rsw-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: var(--rsw-card-radius);
  padding: 20px;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
  position: relative;
  overflow: hidden;
}
.rsw-card:hover,
.rsw-card:focus-visible {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
  outline: none;
}
.rsw-card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--rsw-accent);
}
.rsw-card.rsw-dark {
  background: #1f2937;
  border-color: #374151;
}

.rsw-stars {
  display: flex;
  gap: 2px;
  margin-bottom: 10px;
}
.rsw-star {
  font-size: 15px;
  line-height: 1;
}
.rsw-star-filled { color: #f59e0b; }
.rsw-star-empty  { color: #d1d5db; }

.rsw-content {
  font-size: 14px;
  line-height: 1.65;
  color: #374151;
  margin: 0 0 16px;
}
.rsw-dark .rsw-content { color: #d1d5db; }

.rsw-author {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rsw-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  overflow: hidden;
  flex-shrink: 0;
}
.rsw-dark .rsw-avatar { background: #374151; color: #9ca3af; }
.rsw-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.rsw-author-info {
  flex: 1;
  min-width: 0;
}
.rsw-author-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rsw-dark .rsw-author-name { color: #f9fafb; }
.rsw-author-meta {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}
.rsw-dark .rsw-author-meta { color: #9ca3af; }

.rsw-powered {
  text-align: center;
  margin-top: 20px;
}
.rsw-powered a {
  font-size: 11px;
  color: #9ca3af;
  text-decoration: none;
  letter-spacing: 0.01em;
}
.rsw-powered a:hover { color: #6b7280; }

.rsw-state {
  text-align: center;
  padding: 28px 18px;
  font-size: 14px;
  border: 1px dashed #d1d5db;
  border-radius: var(--rsw-card-radius);
  background: #f8fafc;
  color: #6b7280;
}
.rsw-state-error {
  color: #991b1b;
  background: #fef2f2;
  border-color: #fecaca;
}
.rsw-state-empty,
.rsw-state-loading {
  color: #64748b;
}
`;

export function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}
