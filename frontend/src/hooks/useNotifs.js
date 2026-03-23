// ═══════════════════════════════════════════════════════
// NOTIFICATIONS — Hook + Component
// ═══════════════════════════════════════════════════════

import { useState, useCallback } from "react";

let _nid = 0;

// ── HOOK ──────────────────────────────────────────────
export function useNotifs() {
  const [list, setList] = useState([]);

  const add = useCallback((title, msg, type = "info") => {
    const id = ++_nid;
    setList((p) => [...p, { id, title, msg, type }]);
    setTimeout(() => setList((p) => p.filter((n) => n.id !== id)), 4000);
  }, []);

  const rm = useCallback(
    (id) => setList((p) => p.filter((n) => n.id !== id)),
    []
  );

  return { list, add, rm };
}

// ── COMPONENT ─────────────────────────────────────────
const TYPE_META = {
  info:    { cls: "hh-badge-blue",   icon: "💬", bg: "var(--cyan-dim)",   bar: "var(--cyan)"   },
  success: { cls: "hh-badge-green",  icon: "✓",  bg: "var(--green-dim)",  bar: "var(--green)"  },
  error:   { cls: "hh-badge-rose",   icon: "✕",  bg: "var(--rose-dim)",   bar: "var(--rose)"   },
  warning: { cls: "hh-badge-amber",  icon: "⚠",  bg: "var(--amber-dim)",  bar: "var(--amber)"  },
};

export function Notifs({ list, rm }) {
  return (
    <div className="hh-notif-stack" role="region" aria-label="Notifications" aria-live="polite">
      {list.map((n) => {
        const meta = TYPE_META[n.type] || TYPE_META.info;
        return (
          <div key={n.id} className="hh-notif" role="alert">
            <div className="hh-notif-icon" style={{ background: meta.bg }}>
              <span style={{ fontSize: 15, color: { info: "var(--cyan)", success: "var(--green)", error: "var(--rose)", warning: "var(--amber)" }[n.type] }}>{meta.icon}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="hh-notif-title">{n.title}</div>
              {n.msg && <div className="hh-notif-msg">{n.msg}</div>}
            </div>
            <button
              className="hh-notif-close"
              onClick={() => rm(n.id)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
