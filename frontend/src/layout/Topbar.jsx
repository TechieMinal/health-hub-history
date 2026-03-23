// ═══════════════════════════════════════════════════════
// TOPBAR — Header Layout Component
// ═══════════════════════════════════════════════════════

import { useState } from "react";
import { Badge } from "../components/index.jsx";

const PAGE_TITLES = {
  dashboard: "Dashboard", vault: "Medical Vault", timeline: "Health Timeline",
  share: "Share Records", vitals: "Vitals Tracker", medications: "Medications",
  appointments: "Appointments", patients: "My Patients", prescriptions: "E-Prescriptions",
  users: "User Management", analytics: "Analytics", plans: "Plan Management",
  logs: "Audit Logs", profile: "Profile Settings",
};

const NOTIFS_BY_ROLE = {
  patient: [
    { id: "n1", type: "warning", icon: "💊", title: "Low Medication Stock", msg: "Metformin — only 12 tablets left.", time: "2 min ago", read: false, action: "medications" },
    { id: "n2", type: "info",    icon: "📨", title: "Record Shared",        msg: "Dr. Kavya accessed your Blood CBC.", time: "1 hr ago", read: false, action: "share" },
    { id: "n3", type: "success", icon: "📅", title: "Appointment Tomorrow", msg: "Dr. Mehta at 10:30 AM tomorrow.", time: "3 hrs ago", read: false, action: "appointments" },
  ],
  doctor: [
    { id: "n1", type: "success", icon: "📋", title: "New Records Shared",    msg: "Rahul Sharma shared 3 new records.", time: "5 min ago", read: false, action: "vault" },
    { id: "n2", type: "warning", icon: "📝", title: "Prescription Expiring", msg: "Amit Kumar's Rx expires in 3 days.",  time: "4 hrs ago", read: false, action: "prescriptions" },
  ],
  admin: [
    { id: "n1", type: "warning", icon: "🩺", title: "Doctors Pending",     msg: "Doctor accounts awaiting verification.", time: "Just now",  read: false, action: "users" },
    { id: "n2", type: "error",   icon: "🚨", title: "Security Alert",      msg: "Failed login attempts detected.",       time: "10 min ago", read: false, action: "analytics" },
    { id: "n3", type: "info",    icon: "💳", title: "Upgrade Requests",    msg: "Users requested plan upgrades.",        time: "3 hrs ago",  read: false, action: "plans" },
  ],
};

const TYPE_COLOR = { info: "var(--cyan)", success: "var(--green)", warning: "var(--amber)", error: "var(--rose)" };
const TYPE_BG    = { info: "var(--cyan-dim)", success: "var(--green-dim)", warning: "var(--amber-dim)", error: "var(--rose-dim)" };

export default function Topbar({ user, page, setPage, onMenuClick }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [notifs, setNotifs] = useState(NOTIFS_BY_ROLE[user.role] || []);

  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, read: true })));
  const markRead = (id) => setNotifs((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));

  return (
    <header className="hh-topbar" role="banner">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-muted)", cursor: "pointer", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}
        className="hh-desktop-only"
        onMouseEnter={e => { e.currentTarget.style.background = "var(--surface2)"; e.currentTarget.style.color = "var(--text)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-muted)"; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Mobile menu btn - always visible on mobile */}
      <button
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-muted)", cursor: "pointer", width: 36, height: 36, alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s", display: "none" }}
        id="hh-menu-mobile"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Page title */}
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 700, color: "var(--text)", flex: 1, margin: 0 }}>
        {PAGE_TITLES[page] || "Dashboard"}
      </h1>

      {/* Search */}
      {showSearch ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface2)", border: "1px solid var(--cyan)", borderRadius: 10, padding: "7px 12px", boxShadow: "0 0 0 3px var(--cyan-dim)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records…"
            aria-label="Search"
            onKeyDown={(e) => {
              if (e.key === "Escape") { setShowSearch(false); setSearch(""); }
              if (e.key === "Enter") { setPage("vault"); setShowSearch(false); }
            }}
            style={{ background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 13, width: 160, fontFamily: "var(--font-sans)" }}
          />
          <button onClick={() => { setShowSearch(false); setSearch(""); }} aria-label="Close search" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13 }}>✕</button>
        </div>
      ) : (
        <button
          onClick={() => setShowSearch(true)}
          aria-label="Open search"
          className="hh-btn hh-btn-ghost"
          style={{ padding: "8px 10px" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      )}

      {/* Notifications */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setNotifOpen((o) => !o)}
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
          aria-expanded={notifOpen}
          className="hh-btn hh-btn-ghost"
          style={{ padding: "8px 10px", position: "relative", borderColor: notifOpen ? "var(--cyan)" : undefined, color: notifOpen ? "var(--cyan)" : undefined }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unread > 0 && (
            <span style={{ position: "absolute", top: 5, right: 5, width: 16, height: 16, borderRadius: "50%", background: "var(--rose)", fontSize: 9, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--surface)" }}>
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {notifOpen && (
          <>
            <div onClick={() => setNotifOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 98 }} aria-hidden="true" />
            <div
              role="menu"
              aria-label="Notifications panel"
              style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 340, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-lg)", zIndex: 99, overflow: "hidden", animation: "hh-slide-up 0.18s ease" }}
            >
              <div style={{ padding: "14px 16px 11px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Notifications</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{unread} unread</div>
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead} className="hh-btn hh-btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }}>Mark all read</button>
                )}
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {notifs.map((n) => (
                  <div
                    key={n.id}
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => { markRead(n.id); setNotifOpen(false); setPage(n.action); }}
                    onKeyDown={(e) => e.key === "Enter" && (markRead(n.id), setNotifOpen(false), setPage(n.action))}
                    style={{ display: "flex", gap: 11, padding: "12px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: n.read ? "transparent" : TYPE_BG[n.type] + "33", transition: "background 0.15s", position: "relative" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : TYPE_BG[n.type] + "33"}
                  >
                    {!n.read && <div style={{ position: "absolute", left: 5, top: "50%", transform: "translateY(-50%)", width: 5, height: 5, borderRadius: "50%", background: TYPE_COLOR[n.type] }} aria-hidden="true" />}
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: TYPE_BG[n.type], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{n.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{n.msg}</div>
                      <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 4 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Role badge */}
      <Badge type={user.role === "doctor" ? "green" : user.role === "admin" ? "violet" : "blue"} style={{ display: "none" }}>
        {user.role}
      </Badge>
    </header>
  );
}
