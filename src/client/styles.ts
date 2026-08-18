/**
 * Injected styles for dsh-remote-access (card + lock overlay).
 * All classes are prefixed `dra-` to avoid collisions with the shell.
 */

const CSS = `
.dra-card {
  font-size: 13px; line-height: 1.55;
}
.dra-section {
  border: 1px solid var(--dsw-alias-border, rgba(128,128,140,.18));
  border-radius: 10px; padding: 12px 14px;
  display: flex; flex-direction: column; gap: 10px;
}
.dra-section h4 { margin: 0; font-size: 13.5px; font-weight: 600; }
.dra-banner-danger {
  border: 1px solid rgba(255,82,82,.45); border-radius: 8px;
  background: rgba(255,82,82,.10); color: var(--dsw-alias-text-1, #f87171);
  padding: 8px 10px; font-size: 12.5px;
}
.dra-banner-info {
  border: 1px solid rgba(90,150,255,.4); border-radius: 8px;
  background: rgba(90,150,255,.08); color: var(--dsw-alias-text-1, #8ab4ff);
  padding: 8px 10px; font-size: 12.5px;
}
.dra-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.dra-input {
  flex: 1; min-width: 160px; padding: 6px 9px; border-radius: 7px;
  border: 1px solid var(--dsw-alias-border, rgba(128,128,140,.3));
  background: var(--dsw-input-bg, rgba(128,128,140,.08));
  color: inherit; font: inherit; font-size: 12.5px;
}
.dra-input:focus { outline: none; border-color: var(--dsw-alias-text-accent, #4c9aff); }
.dra-textarea {
  width: 100%; min-height: 96px; resize: vertical; padding: 8px 10px;
  border-radius: 7px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px; line-height: 1.5;
  border: 1px solid var(--dsw-alias-border, rgba(128,128,140,.3));
  background: var(--dsw-input-bg, rgba(128,128,140,.08));
  color: inherit; box-sizing: border-box; white-space: pre;
}
.dra-btn {
  padding: 6px 12px; border-radius: 7px; border: 1px solid rgba(128,128,140,.3);
  background: var(--dsw-btn-bg, rgba(128,128,140,.12)); color: inherit;
  font: inherit; font-size: 12.5px; cursor: pointer; white-space: nowrap;
}
.dra-btn:hover { border-color: var(--dsw-alias-text-accent, #4c9aff); }
.dra-btn:disabled { opacity: .5; cursor: default; }
.dra-btn-primary {
  background: var(--dsw-alias-text-accent, #4c9aff); border-color: transparent; color: #fff;
}
.dra-status { font-size: 12px; opacity: .85; }
.dra-ok { color: #4ade80; }
.dra-warn { color: #fbbf24; }
.dra-danger { color: #f87171; }
.dra-muted { opacity: .6; font-size: 12px; }
.dra-copied { color: #4ade80; font-size: 12px; }

/* --- outer card shell (web-search style collapsible card) --------------- */
.dra-card {
  list-style: none;
  border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,140,.25));
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-3, transparent);
  transition: border-color .16s, background .16s;
}
.dra-card:hover { border-color: var(--dsw-alias-label-dimmed, rgba(128,128,140,.45)); }
.dra-card.dra-open {
  background: var(--dsw-alias-bg-layer-2, transparent);
  border-color: var(--dsw-alias-label-dimmed, rgba(128,128,140,.45));
}
.dra-card-header {
  width: 100%;
  appearance: none;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
}
.dra-card-header:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #4c9aff); outline-offset: -2px; }
.dra-card-head-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.dra-card-name { font-size: 15px; font-weight: 600; line-height: 1.4; color: var(--dsw-alias-label-primary, #eee); }
.dra-card-description { font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-tertiary, rgba(255,255,255,.6)); }
.dra-card-chevron {
  flex: none;
  color: var(--dsw-alias-label-tertiary, rgba(255,255,255,.6));
  transition: transform .16s;
}
.dra-card-chevron.dra-open { transform: rotate(180deg); }
.dra-card-body {
  border-top: 1px solid var(--dsw-alias-border-l2, rgba(128,128,140,.2));
  margin: 0 14px;
  padding: 12px 0 14px;
}

/* --- layered accordion ------------------------------------------------- */
.dra-accordion {
  display: flex; flex-direction: column; gap: 6px;
}
.dra-accordion-inner {
  margin-top: 2px;
}
.dra-acc-item {
  border: 1px solid var(--dsw-alias-border, rgba(128,128,140,.2));
  border-radius: 10px;
  overflow: hidden;
  background: var(--dsw-card-bg, transparent);
}
.dra-acc-header {
  width: 100%; box-sizing: border-box;
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px;
  border: none; border-radius: 0;
  background: transparent; color: inherit;
  font: inherit; font-size: 13px; cursor: pointer;
  text-align: left;
}
.dra-acc-header:hover { background: var(--dsw-input-bg, rgba(128,128,140,.08)); }
.dra-acc-caret {
  flex: none; width: 14px; text-align: center;
  color: var(--dsw-alias-text-2, rgba(255,255,255,.55));
  transition: transform .15s ease;
}
.dra-acc-title { flex: 1; font-weight: 500; }
.dra-acc-badge {
  flex: none; font-size: 11px; font-weight: 600;
  padding: 2px 8px; border-radius: 999px;
  background: var(--dsw-input-bg, rgba(128,128,140,.14));
}
.dra-acc-badge.dra-ok { color: #4ade80; }
.dra-acc-badge.dra-warn { color: #fbbf24; }
.dra-acc-badge.dra-danger { color: #f87171; }
.dra-acc-badge.dra-muted { opacity: .65; }

.dra-acc-body {
  display: flex; flex-direction: column; gap: 10px;
  padding: 10px 12px 14px;
  border-top: 1px solid var(--dsw-alias-border, rgba(128,128,140,.14));
}

/* inner Caddy steps */
.dra-step-item .dra-acc-header { padding-left: 20px; }
.dra-step-num { flex: none; width: 18px; text-align: center; font-weight: 600; }
.dra-step-divider {
  height: 1px; margin: 2px 0;
  background: var(--dsw-alias-border, rgba(128,128,140,.16));
}

/* --- lock overlay ------------------------------------------------------- */
.dra-lock-backdrop {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  pointer-events: auto;
}
.dra-lock-card {
  width: min(400px, 90vw); padding: 26px 28px; border-radius: 14px;
  background: var(--dsw-hovercard-bg, #2c2c2e);
  box-shadow: var(--dsw-shadow-lv3, 0 12px 40px rgba(0,0,0,.5));
  display: flex; flex-direction: column; gap: 12px;
  color: var(--dsw-alias-text-1, #eee); font-size: 13.5px;
}
.dra-lock-card h2 { margin: 0; font-size: 17px; }
.dra-lock-error { color: #f87171; font-size: 12.5px; min-height: 16px; }
.dra-lock-hint { opacity: .62; font-size: 11.5px; line-height: 1.5; }

/* --- help / usage guide ------------------------------------------------ */
.dra-help { gap: 12px; }
.dra-help-intro { font-size: 12.5px; line-height: 1.6; opacity: .9; }
.dra-help-goal {
  border: 1px solid var(--dsw-alias-border, rgba(128,128,140,.22));
  border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;
}
.dra-help-goal-title { font-weight: 600; font-size: 12.5px; margin-bottom: 2px; }
.dra-help-goal-line { font-size: 12.5px; line-height: 1.55; }
.dra-help-goal-result { font-weight: 600; }
.dra-help-phase { display: flex; flex-direction: column; gap: 6px; }
.dra-help-phase-title { font-weight: 600; font-size: 13px; }
.dra-help-sub { font-size: 12.5px; opacity: .9; }
.dra-help-list { margin: 0; padding-left: 18px; font-size: 12.5px; line-height: 1.65; }
.dra-help-list li { margin: 2px 0; }
.dra-help-code {
  white-space: pre-wrap; word-break: break-all;
  margin: 0; padding: 8px 10px; border-radius: 7px;
  background: var(--dsw-input-bg, rgba(128,128,140,.09));
  border: 1px solid var(--dsw-alias-border, rgba(128,128,140,.2));
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px; line-height: 1.55; overflow-x: auto;
}
.dra-help-tunnel { color: #4c9aff; }
.dra-help-plain { font-size: 12.5px; line-height: 1.6; }
.dra-help-expected {
  border-left: 3px solid #4ade80; padding: 6px 10px; margin-top: 2px;
  background: rgba(74, 222, 128, .07); border-radius: 0 6px 6px 0;
  font-size: 12.5px; line-height: 1.55;
}
.dra-help-stepsdone { font-size: 12px; opacity: .8; }
`

let injected = false

/** Inject the stylesheet once into the document head. */
export function injectStyles(): () => void {
  if (injected || typeof document === 'undefined') return () => {}
  const style = document.createElement('style')
  style.id = 'dsh-remote-access-styles'
  style.textContent = CSS
  document.head.appendChild(style)
  injected = true
  return () => {
    style.remove()
    injected = false
  }
}
