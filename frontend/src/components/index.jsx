// ═══════════════════════════════════════════════════════
// REUSABLE UI COMPONENTS
// ═══════════════════════════════════════════════════════

import { useEffect, useRef } from "react";

// ── SPINNER ──────────────────────────────────────────
export function Spinner({ size = 20, color = "var(--cyan)" }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        width: size, height: size,
        border: `2px solid ${color}33`,
        borderTop: `2px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

// ── BADGE ─────────────────────────────────────────────
const BADGE_CLASS = {
  blue:   "hh-badge hh-badge-blue",
  green:  "hh-badge hh-badge-green",
  purple: "hh-badge hh-badge-violet",
  violet: "hh-badge hh-badge-violet",
  gold:   "hh-badge hh-badge-amber",
  amber:  "hh-badge hh-badge-amber",
  red:    "hh-badge hh-badge-rose",
  rose:   "hh-badge hh-badge-rose",
  gray:   "hh-badge hh-badge-gray",
};

export function Badge({ type = "gray", children, style = {} }) {
  return (
    <span className={BADGE_CLASS[type] || BADGE_CLASS.gray} style={style}>
      {children}
    </span>
  );
}

// ── BUTTON ─────────────────────────────────────────────
export function Button({ variant = "ghost", children, onClick, disabled, style = {}, type = "button", size = "md", ...props }) {
  const cls = {
    primary: "hh-btn hh-btn-primary",
    ghost:   "hh-btn hh-btn-ghost",
    danger:  "hh-btn hh-btn-danger",
    success: "hh-btn hh-btn-success",
  }[variant] || "hh-btn hh-btn-ghost";

  const sz = {
    sm: { padding: "6px 12px", fontSize: "12px" },
    md: {},
    lg: { padding: "12px 24px", fontSize: "15px" },
  }[size] || {};

  return (
    <button className={cls} onClick={onClick} disabled={disabled} type={type} style={{ ...sz, ...style }} {...props}>
      {children}
    </button>
  );
}

// ── CARD ─────────────────────────────────────────────
export function Card({ children, style = {}, className = "", hover = false }) {
  return (
    <div
      className={`hh-card ${hover ? "hh-card-hover" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color = "var(--cyan)" }) {
  return (
    <div className="hh-stat-card">
      <div className="hh-stat-icon" style={{ background: color + "20" }}>
        {icon}
      </div>
      <div className="hh-stat-value" style={{ color }}>{value}</div>
      <div className="hh-stat-label">{label}</div>
      {sub && <div className="hh-stat-sub">{sub}</div>}
    </div>
  );
}

// ── FORM INPUT ────────────────────────────────────────
export function FormInput({ label, id, error, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="hh-field" style={{ gap: 0 }}>
      {label && (
        <label className="hh-label" htmlFor={inputId}>{label}</label>
      )}
      <input id={inputId} className="hh-input" aria-invalid={!!error} {...props} />
      {error && (
        <span style={{ fontSize: 11, color: "var(--rose)", marginTop: 4 }}>{error}</span>
      )}
    </div>
  );
}

// ── SELECT INPUT ──────────────────────────────────────
export function SelectInput({ label, id, children, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="hh-field" style={{ gap: 0 }}>
      {label && (
        <label className="hh-label" htmlFor={inputId}>{label}</label>
      )}
      <select id={inputId} className="hh-input" style={{ cursor: "pointer" }} {...props}>
        {children}
      </select>
    </div>
  );
}

// ── MODAL ─────────────────────────────────────────────
export function Modal({ title, onClose, children, footer, maxWidth = 560 }) {
  // Trap focus & close on Escape
  const overlayRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Focus first focusable element
    const first = overlayRef.current?.querySelector("input, button, select, textarea, [tabindex]:not([tabindex='-1'])");
    first?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="hh-overlay"
      onClick={onClose}
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="hh-modal"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hh-modal-header">
          <div className="hh-modal-title">{title}</div>
          <button className="hh-modal-close" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>
        <div className="hh-modal-body">{children}</div>
        {footer && <div className="hh-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── SKELETON ──────────────────────────────────────────
export function Skeleton({ height = 14, width = "100%", style = {} }) {
  return (
    <div
      className="hh-skeleton"
      style={{ height, width, ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="hh-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Skeleton height={42} width={42} style={{ borderRadius: 10 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton height={14} width="60%" />
          <Skeleton height={11} width="40%" />
        </div>
      </div>
      <Skeleton height={11} />
      <Skeleton height={11} width="80%" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="hh-stat-card">
      <Skeleton height={42} width={42} style={{ borderRadius: 10 }} />
      <Skeleton height={28} width="50%" />
      <Skeleton height={11} width="70%" />
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────
export function EmptyState({ icon, title, text, action }) {
  return (
    <div className="hh-empty">
      <div className="hh-empty-icon" aria-hidden="true">{icon}</div>
      <div className="hh-empty-title">{title}</div>
      {text && <p className="hh-empty-text">{text}</p>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}

// ── TABLE ─────────────────────────────────────────────
export function Table({ headers, children, loading, empty }) {
  return (
    <div className="hh-table-wrap">
      <table className="hh-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length} style={{ padding: "32px 0", textAlign: "center" }}>
                <Spinner size={28} />
              </td>
            </tr>
          ) : children}
        </tbody>
      </table>
      {!loading && empty}
    </div>
  );
}

// ── PROGRESS BAR ──────────────────────────────────────
export function ProgressBar({ value = 0, max = 100, color = "var(--cyan)" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="hh-progress-track">
      <div
        className="hh-progress-fill"
        style={{ width: pct + "%", background: color }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
}

// ── SEARCH BAR ────────────────────────────────────────
export function SearchBar({ value, onChange, onClear, placeholder = "Search..." }) {
  return (
    <div className="hh-search" style={{ flex: 1, minWidth: 180 }}>
      <span style={{ color: "var(--text-muted)", fontSize: 15 }} aria-hidden="true">⌕</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={onClear}
          aria-label="Clear search"
          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, padding: 2 }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ── ALERT BANNER ──────────────────────────────────────
export function AlertBanner({ type = "amber", icon, title, text, action }) {
  const cls = { amber: "hh-alert hh-alert-amber", rose: "hh-alert hh-alert-rose", green: "hh-alert hh-alert-green" }[type] || "hh-alert hh-alert-amber";
  return (
    <div className={cls} role="alert">
      <span style={{ fontSize: 22 }} aria-hidden="true">{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: { amber: "var(--amber)", rose: "var(--rose)", green: "var(--green)" }[type], fontSize: 13 }}>{title}</div>
        {text && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{text}</div>}
      </div>
      {action}
    </div>
  );
}

// ── SECTION CARD HEADER ───────────────────────────────
export function CardHeader({ title, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{title}</div>
      {action}
    </div>
  );
}
