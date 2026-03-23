// ═══════════════════════════════════════════════════════
// SIDEBAR — Navigation Layout Component
// ═══════════════════════════════════════════════════════

const NAV = {
  patient: [
    { id: "dashboard",    icon: "⊞",  label: "Dashboard"       },
    { id: "vault",        icon: "⊟",  label: "Medical Vault"   },
    { id: "timeline",     icon: "≡",  label: "Health Timeline" },
    { id: "share",        icon: "⊗",  label: "Share Records"   },
    { id: "vitals",       icon: "♡",  label: "Vitals Tracker"  },
    { id: "medications",  icon: "⊕",  label: "Medications"     },
    { id: "appointments", icon: "◻",  label: "Appointments"    },
  ],
  doctor: [
    { id: "dashboard",    icon: "⊞",  label: "Dashboard"       },
    { id: "patients",     icon: "⊙",  label: "My Patients"     },
    { id: "vault",        icon: "⊟",  label: "Shared Records"  },
    { id: "prescriptions",icon: "⊕",  label: "E-Prescriptions" },
  ],
  admin: [
    { id: "dashboard",    icon: "⊞",  label: "Dashboard"       },
    { id: "users",        icon: "⊙",  label: "Users"           },
    { id: "analytics",    icon: "∼",  label: "Analytics"       },
    { id: "plans",        icon: "◈",  label: "Plans"           },
    { id: "logs",         icon: "≡",  label: "Audit Logs"      },
  ],
};

// SVG icons for cleaner look
const ICONS = {
  dashboard:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  vault:        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  timeline:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="12" x2="3" y2="12"/><polyline points="11 18 17 12 11 6"/><line x1="21" y1="19" x2="21" y2="5"/></svg>,
  share:        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  vitals:       <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  medications:  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 11.5 3c-2.29 0-4.04 1.51-5.5 3L2 10l2 2 2-2 7 7-2 2 2 2 4-4c1.49-1.46 3-3.21 3-5.5z"/><line x1="11.5" y1="5.5" x2="15" y2="9"/></svg>,
  appointments: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  patients:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  prescriptions:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  users:        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  analytics:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  plans:        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  logs:         <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  profile:      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>,
  logout:       <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const ROLE_COLOR = { patient: "var(--cyan)", doctor: "var(--green)", admin: "var(--violet)" };
const ROLE_LABEL = { patient: "Patient", doctor: "Doctor", admin: "Admin" };

export default function Sidebar({ user, page, setPage, onLogout, open, onClose }) {
  const items = NAV[user.role] || [];
  const roleColor = ROLE_COLOR[user.role] || "var(--cyan)";

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="hh-sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}

      <nav
        className={`hh-sidebar ${open ? "open" : ""}`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "var(--grad-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0,212,255,0.3)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, color: "var(--text)", lineHeight: 1.3 }}>Health Hub</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>History Platform</div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: "10px 10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
          <div className="hh-nav-section-label">Menu</div>

          {items.map((item) => (
            <button
              key={item.id}
              className={`hh-nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => { setPage(item.id); onClose?.(); }}
              aria-current={page === item.id ? "page" : undefined}
              style={{ background: "none", border: page === item.id ? "1px solid rgba(0,212,255,0.2)" : "1px solid transparent" }}
            >
              <span className="hh-nav-icon" style={{ color: page === item.id ? "var(--cyan)" : "var(--text-muted)" }}>
                {ICONS[item.id]}
              </span>
              <span>{item.label}</span>
            </button>
          ))}

          <div className="hh-nav-section-label" style={{ marginTop: 8 }}>Account</div>

          <button
            className={`hh-nav-item ${page === "profile" ? "active" : ""}`}
            onClick={() => { setPage("profile"); onClose?.(); }}
            aria-current={page === "profile" ? "page" : undefined}
            style={{ background: "none", border: page === "profile" ? "1px solid rgba(0,212,255,0.2)" : "1px solid transparent" }}
          >
            <span className="hh-nav-icon">{ICONS.profile}</span>
            <span>Profile</span>
          </button>
        </div>

        {/* User card + logout */}
        <div style={{ padding: "10px", borderTop: "1px solid var(--border)" }}>
          <div className="hh-user-card">
            <div className="hh-user-avatar" style={{ background: roleColor + "18", borderColor: roleColor + "50" }}>
              {user.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "capitalize" }}>
                <span style={{ color: roleColor }}>{ROLE_LABEL[user.role]}</span> · {user.plan || "Free"}
              </div>
            </div>
            <button
              onClick={onLogout}
              aria-label="Sign out"
              style={{ background: "none", border: "none", color: "var(--rose)", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--rose-dim)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              {ICONS.logout}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
