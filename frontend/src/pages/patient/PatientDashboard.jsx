// ═══════════════════════════════════════════════════════
// PATIENT DASHBOARD
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import API from "../../api/client.js";
import {
  StatCard, Card, Badge, Button, EmptyState,
  SkeletonStatCard, AlertBanner, CardHeader,
} from "../../components/index.jsx";

const CAT_ICON = {
  Prescription: "💊", "Lab Report": "🧪", Radiology: "🩻",
  Discharge: "🏥", Vaccination: "💉", Bill: "🧾", Insurance: "📋", Other: "📄",
};

export default function PatientDashboard({ user, notify, setPage }) {
  const [records, setRecords] = useState([]);
  const [appts, setAppts] = useState([]);
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.getRecords(), API.getAppts(), API.getMeds()]).then(
      ([r, a, m]) => {
        if (r.ok) setRecords(r.records);
        if (a.ok) setAppts(a.appts);
        if (m.ok) setMeds(m.meds);
        setLoading(false);
      }
    );
  }, []);

  const upcoming = appts
    .filter((a) => a.status === "Scheduled")
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  const sharedCount = records.filter((r) => r.shared).length;
  const lowStock = meds.filter((m) => m.stock < 15);
  const thisMonth = records.filter(
    (r) => r.created_at > new Date(Date.now() - 30 * 86400000).toISOString()
  ).length;

  return (
    <div className="hh-page hh-page-enter">
      {/* Header */}
      <div className="hh-page-header">
        <h1 style={{ fontFamily: "var(--font-heading)" }}>
          Welcome back, {user.name.split(" ")[0]} 👋
        </h1>
        <p>Here's your health overview for today</p>
      </div>

      {/* Low stock alert */}
      {!loading && lowStock.length > 0 && (
        <AlertBanner
          type="amber"
          icon="💊"
          title="Low Medication Stock"
          text={lowStock.map((m) => `${m.name} (${m.stock} left)`).join(", ")}
          action={
            <Button variant="ghost" size="sm" onClick={() => setPage("medications")}
              style={{ marginLeft: "auto", color: "var(--amber)", borderColor: "rgba(255,185,48,0.4)", whiteSpace: "nowrap" }}>
              Manage →
            </Button>
          }
        />
      )}

      {/* Stat Cards */}
      <div className="hh-grid-4" style={{ marginBottom: 24 }}>
        {loading ? (
          <>
            <SkeletonStatCard /><SkeletonStatCard />
            <SkeletonStatCard /><SkeletonStatCard />
          </>
        ) : (
          <>
            <StatCard icon="📂" label="Total Records" value={records.length}
              sub={`+${thisMonth} this month`} color="var(--cyan)" />
            <StatCard icon="🔗" label="Shared" value={sharedCount}
              sub={`${sharedCount} active shares`} color="var(--green)" />
            <StatCard icon="💊" label="Medications" value={meds.filter((m) => m.active).length}
              sub={lowStock.length > 0 ? `⚠️ ${lowStock.length} low stock` : "All stocked"} color="var(--violet)" />
            <StatCard icon="📅" label="Next Visit"
              value={upcoming ? new Date(upcoming.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "None"}
              sub={upcoming?.doctor || "No upcoming"} color="var(--amber)" />
          </>
        )}
      </div>

      {/* Two-column grid */}
      <div className="hh-grid-2">
        {/* Recent Records */}
        <Card>
          <CardHeader
            title="Recent Records"
            action={
              <Button variant="ghost" size="sm" onClick={() => setPage("vault")}>
                View All →
              </Button>
            }
          />
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
              <div style={{ width: 24, height: 24, border: "2px solid var(--cyan-dim)", borderTop: "2px solid var(--cyan)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : records.length === 0 ? (
            <EmptyState icon="📂" title="No records yet" text="Upload your first medical record to get started." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {records.slice(0, 5).map((r, i) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--cyan-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {CAT_ICON[r.category] || "📄"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.hospital} · {r.date}</div>
                  </div>
                  {r.shared && <Badge type="green">Shared</Badge>}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader
            title="Upcoming Appointments"
            action={
              <Button variant="ghost" size="sm" onClick={() => setPage("appointments")}>
                View All →
              </Button>
            }
          />
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
              <div style={{ width: 24, height: 24, border: "2px solid var(--cyan-dim)", borderTop: "2px solid var(--cyan)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : appts.filter((a) => a.status === "Scheduled").length === 0 ? (
            <EmptyState icon="📅" title="No upcoming appointments" text="Book an appointment to see it here." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {appts.filter((a) => a.status === "Scheduled").slice(0, 3).map((a) => (
                <div key={a.id} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{a.doctor}</div>
                    <Badge type="blue">{a.type}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.specialty} · {a.hospital}</div>
                  <div style={{ fontSize: 12, color: "var(--amber)", marginTop: 7, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                    <span>📅</span> {a.date} at {a.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          Quick Actions
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { icon: "📤", label: "Upload Record", page: "vault" },
            { icon: "📊", label: "Log Vitals", page: "vitals" },
            { icon: "💊", label: "Add Medication", page: "medications" },
            { icon: "📅", label: "Book Appointment", page: "appointments" },
            { icon: "🔗", label: "Share with Doctor", page: "share" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => setPage(a.page)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 16px", borderRadius: 10,
                background: "var(--card)", border: "1px solid var(--border)",
                color: "var(--text-muted)", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--card-hover)"; e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <span>{a.icon}</span> {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
