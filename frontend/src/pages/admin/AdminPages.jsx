// ═══════════════════════════════════════════════════════
// ADMIN PAGES
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import API from "../../api/client.js";
import {
  StatCard, Card, Badge, Button, Modal, Spinner,
  EmptyState, FormInput, CardHeader, SearchBar, SkeletonStatCard,
} from "../../components/index.jsx";

// ─────────────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────────────
export function AdminDashboard({ notify, setPage }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.getAnalytics().then((r) => { if (r.ok) setStats(r); setLoading(false); });
  }, []);

  return (
    <div className="hh-page hh-page-enter">
      <div className="hh-page-header">
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Admin Control Center ⚙️</h1>
        <p>Platform health &amp; operations overview</p>
      </div>

      <div className="hh-grid-4" style={{ marginBottom: 24 }}>
        {loading ? (
          <><SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /></>
        ) : (
          <>
            <StatCard icon="👥" label="Total Users" value={stats?.totalUsers?.toLocaleString()} sub={`${stats?.activeUsers} active`} color="var(--cyan)" />
            <StatCard icon="🩺" label="Verified Doctors" value={stats?.verifiedDoctors} sub={`${stats?.pendingDoctors} pending`} color="var(--green)" />
            <StatCard icon="📂" label="Total Records" value={stats?.totalRecords} sub="Across all users" color="var(--violet)" />
            <StatCard icon="💰" label="MRR" value={`₹${(stats?.mrr || 0).toLocaleString()}`} sub="Monthly revenue" color="var(--amber)" />
          </>
        )}
      </div>

      {!loading && stats && (
        <div className="hh-grid-2">
          <Card>
            <CardHeader title="Plan Distribution" />
            {Object.entries(stats?.planDist || {}).map(([plan, count]) => (
              <div key={plan} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{plan}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--cyan)", fontFamily: "var(--font-mono)" }}>{count} users</span>
                </div>
                <div style={{ height: 6, background: "var(--surface2)", borderRadius: 99 }}>
                  <div style={{ height: "100%", borderRadius: 99, background: "var(--grad-primary)", width: Math.max(5, (count / (stats?.totalUsers || 1)) * 100) + "%", transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <CardHeader title="Pending Actions" />
            {[
              ["🩺", `${stats?.pendingDoctors} Doctors Awaiting Verification`, "var(--amber)", "users"],
              ["💰", `₹${(stats?.mrr || 0).toLocaleString()} Monthly Revenue`, "var(--green)", "analytics"],
              ["📂", `${stats?.totalRecords} Total Records Stored`, "var(--cyan)", "analytics"],
              ["⚙️", "Manage Subscription Plans", "var(--violet)", "plans"],
            ].map(([ic, msg, col, pg]) => (
              <div key={msg} style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 14px", background: col + "12", border: `1px solid ${col}30`, borderRadius: 11, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{ic}</span>
                <span style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>{msg}</span>
                <button onClick={() => setPage(pg)} style={{ background: col + "20", color: col, border: `1px solid ${col}40`, borderRadius: 7, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 700, transition: "all 0.15s" }}>View →</button>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────────────
export function UserManagement({ notify }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewUser, setViewUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => { const r = await API.getUsers(); if (r.ok) setUsers(r.users); setLoading(false); };
  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    const s = search.toLowerCase();
    return (u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)) &&
      (roleFilter === "All" || u.role === roleFilter) &&
      (statusFilter === "All" || u.status === statusFilter);
  });

  const doVerify = async (id) => { await API.updateUser(id, { status: "verified" }); notify("✅ Verified", "Doctor account approved", "success"); load(); };
  const doSuspend = async (id) => { await API.updateUser(id, { status: "suspended" }); notify("⚠ Suspended", "Account suspended", "warning"); load(); };
  const doActivate = async (id) => { await API.updateUser(id, { status: "active" }); notify("✅ Activated", "Account reactivated", "success"); load(); };
  const doDelete = async (id) => { if (!window.confirm("Permanently delete this user?")) return; await API.deleteUser(id); notify("🗑 Deleted", "User removed", "info"); setViewUser(null); load(); };
  const doExport = () => {
    const csv = ["Name,Role,Email,Status,Joined,Plan", ...users.map((u) => `"${u.name}","${u.role}","${u.email}","${u.status}","${u.joined}","${u.plan}"`)].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "users_export.csv"; a.click();
    notify("📥 Exported", "users_export.csv downloaded", "success");
  };

  const roleBadge = (r) => r === "doctor" ? "blue" : r === "patient" ? "green" : "violet";
  const statusBadge = (s) => s === "active" || s === "verified" ? "green" : s === "pending_verification" ? "amber" : s === "suspended" ? "rose" : "gray";

  return (
    <div className="hh-page hh-page-enter">
      <div className="hh-header-row">
        <div className="hh-page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontFamily: "var(--font-heading)" }}>User Management</h1>
          <p>{users.length} total · {users.filter((u) => u.status === "pending_verification").length} pending verification</p>
        </div>
        <Button variant="ghost" onClick={doExport}>📥 Export CSV</Button>
      </div>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {[["👥", "Total", users.length, "var(--cyan)"], ["✅", "Active", users.filter((u) => ["active","verified"].includes(u.status)).length, "var(--green)"], ["⏳", "Pending", users.filter((u) => u.status === "pending_verification").length, "var(--amber)"], ["🚫", "Suspended", users.filter((u) => u.status === "suspended").length, "var(--rose)"]].map(([ic, lb, val, col]) => (
          <div key={lb} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: col + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{ic}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: col, fontFamily: "var(--font-heading)" }}>{val}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{lb}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} placeholder="Search by name or email…" />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["All", "patient", "doctor", "admin"].map((r) => (
            <button key={r} className={`hh-chip ${roleFilter === r ? "active" : ""}`} onClick={() => setRoleFilter(r)} style={{ textTransform: "capitalize" }}>{r}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["All", "active", "verified", "pending_verification", "suspended"].map((s) => (
            <button key={s} className={`hh-chip ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>{s.replace(/_/g, " ")}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="hh-table-wrap">
        <table className="hh-table">
          <thead>
            <tr>{["User", "Role", "Status", "Plan", "Joined", "Actions"].map((h) => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: "center" }}><Spinner size={28} /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No users match the current filter</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} style={{ cursor: "pointer" }} onClick={() => setViewUser(u)}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--cyan-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{u.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><Badge type={roleBadge(u.role)}>{u.role}</Badge></td>
                <td><Badge type={statusBadge(u.status)}>{u.status.replace(/_/g, " ")}</Badge></td>
                <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{u.plan}</td>
                <td style={{ color: "var(--text-faint)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{u.joined}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {u.status === "pending_verification" && <Button variant="success" size="sm" onClick={() => doVerify(u.id)}>✓ Verify</Button>}
                    {u.status === "suspended" ? <Button variant="success" size="sm" onClick={() => doActivate(u.id)}>Activate</Button> : u.status !== "pending_verification" && <Button variant="danger" size="sm" onClick={() => doSuspend(u.id)}>Suspend</Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewUser && (
        <Modal title={`User: ${viewUser.name}`} onClose={() => setViewUser(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[["Email", viewUser.email], ["Role", viewUser.role], ["Status", viewUser.status.replace(/_/g, " ")], ["Plan", viewUser.plan], ["Phone", viewUser.phone || "N/A"], ["Joined", viewUser.joined]].map(([l, v]) => (
              <div key={l} style={{ background: "var(--surface2)", borderRadius: 10, padding: "11px 13px" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", textTransform: "capitalize" }}>{v}</div>
              </div>
            ))}
          </div>
          {viewUser.role === "doctor" && (
            <div style={{ background: "var(--cyan-dim)", borderRadius: 10, padding: 13, marginBottom: 16, border: "1px solid rgba(0,212,255,0.2)" }}>
              <div style={{ fontWeight: 700, color: "var(--cyan)", marginBottom: 5, fontSize: 13 }}>Doctor Details</div>
              <div style={{ color: "var(--text)", fontSize: 13 }}>Specialty: {viewUser.specialty} · Hospital: {viewUser.hospital}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>License: {viewUser.license} · ID: {viewUser.doctor_id}</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {viewUser.status === "pending_verification" && <Button variant="success" style={{ flex: 1, justifyContent: "center" }} onClick={() => { doVerify(viewUser.id); setViewUser(null); }}>✓ Verify Doctor</Button>}
            {viewUser.status === "suspended" ? <Button variant="success" style={{ flex: 1, justifyContent: "center" }} onClick={() => { doActivate(viewUser.id); setViewUser(null); }}>✓ Activate</Button> : <Button variant="danger" style={{ flex: 1, justifyContent: "center" }} onClick={() => { doSuspend(viewUser.id); setViewUser(null); }}>Suspend</Button>}
            <Button variant="danger" style={{ flex: 1, justifyContent: "center" }} onClick={() => doDelete(viewUser.id)}>🗑 Delete</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────
export function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { API.getAnalytics().then((r) => { if (r.ok) setStats(r); setLoading(false); }); }, []);

  if (loading) return <div className="hh-page" style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}><Spinner size={40} /></div>;

  return (
    <div className="hh-page hh-page-enter">
      <div className="hh-page-header">
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Platform Analytics</h1>
        <p>Usage metrics and revenue overview</p>
      </div>

      <div className="hh-grid-4" style={{ marginBottom: 24 }}>
        <StatCard icon="👥" label="Total Users" value={stats?.totalUsers} sub={`${stats?.activeUsers} active`} color="var(--cyan)" />
        <StatCard icon="💰" label="MRR" value={`₹${(stats?.mrr || 0).toLocaleString()}`} sub="Monthly recurring" color="var(--green)" />
        <StatCard icon="📂" label="Records" value={stats?.totalRecords} sub="Total uploaded" color="var(--violet)" />
        <StatCard icon="☁️" label="Storage" value={`${stats?.storageUsed || 0} GB`} sub="Used across platform" color="var(--amber)" />
      </div>

      <div className="hh-grid-2" style={{ marginBottom: 24 }}>
        <Card>
          <CardHeader title="User Growth (Relative)" />
          {[["Mar", 62], ["Apr", 75], ["May", 84], ["Jun", 91], ["Jul", 97], ["Aug", 100]].map(([m, v]) => (
            <div key={m} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{m}</div>
              <div style={{ flex: 1, height: 24, background: "var(--surface2)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "var(--grad-primary)", width: v + "%", borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 8, transition: "width 0.6s" }}>
                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{v}%</span>
                </div>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <CardHeader title="Record Categories" />
          {(stats?.catDist || []).map(([l, v]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: "var(--text)" }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--cyan)", fontFamily: "var(--font-mono)" }}>{v}</span>
              </div>
              <div style={{ height: 6, background: "var(--surface2)", borderRadius: 99 }}>
                <div style={{ height: "100%", borderRadius: 99, background: "var(--green)", width: Math.max(5, v * 20) + "%" }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Payments" />
        <div className="hh-table-wrap">
          <table className="hh-table">
            <thead><tr>{["Invoice", "User", "Plan", "Amount", "Date", "Status"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {(stats?.recentPayments || []).map((p) => (
                <tr key={p.id}>
                  <td style={{ color: "var(--cyan)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{p.invoice}</td>
                  <td>User {p.user_id}</td>
                  <td><Badge type="blue">{p.plan}</Badge></td>
                  <td style={{ fontWeight: 700, color: "var(--green)" }}>₹{p.amount}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{p.date}</td>
                  <td><Badge type="green">{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// PLAN MANAGEMENT
// ─────────────────────────────────────────────────────
export function PlanManagement({ notify }) {
  const [plans, setPlans] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState(null);
  const [editForm, setEditForm] = useState({});

  const load = async () => {
    const [p, u] = await Promise.all([API.getPlans(), API.getUpgrades()]);
    if (p.ok) setPlans(p.plans);
    if (u.ok) setUpgrades(u.upgrades);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (plan) => { setEditPlan(plan); setEditForm({ ...plan }); };
  const saveEdit = async () => { await API.updatePlan(editPlan.id, editForm); notify("Saved!", "Plan updated", "success"); setEditPlan(null); load(); };
  const processUpgrade = async (id, action) => { await API.processUpgrade(id, action); notify(action === "approve" ? "Approved!" : "Rejected", "Upgrade request processed", "success"); load(); };

  const planColors = { Free: "var(--text-muted)", Basic: "var(--cyan)", Premium: "var(--violet)", Hospital: "var(--amber)" };

  return (
    <div className="hh-page hh-page-enter">
      <div className="hh-page-header">
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Plan Management</h1>
        <p>Configure subscription plans and process upgrade requests</p>
      </div>

      {loading ? <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={32} /></div> : (
        <>
          <div className="hh-grid-4" style={{ marginBottom: 28 }}>
            {plans.map((plan) => (
              <Card key={plan.id} style={{ border: `1px solid ${planColors[plan.name] || "var(--border)"}30` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 800, color: planColors[plan.name] || "var(--cyan)" }}>{plan.name}</div>
                  <Badge type={plan.active ? "green" : "rose"}>{plan.active ? "Active" : "Off"}</Badge>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>{plan.price}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>{plan.description}</div>
                {plan.features.slice(0, 3).map((f, i) => (
                  <div key={i} style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4, display: "flex", gap: 6 }}>
                    <span style={{ color: "var(--green)" }}>✓</span>{f}
                  </div>
                ))}
                <Button variant="ghost" style={{ width: "100%", justifyContent: "center", marginTop: 14, fontSize: 12 }} onClick={() => openEdit(plan)}>
                  ✏️ Edit Plan
                </Button>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader title={`Upgrade Requests (${upgrades.filter((u) => u.status === "Pending").length} pending)`} />
            <div className="hh-table-wrap">
              <table className="hh-table">
                <thead><tr>{["User", "Request", "Date", "Status", "Actions"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {upgrades.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{u.user}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <Badge type="gray">{u.from}</Badge>
                          <span style={{ color: "var(--text-muted)" }}>→</span>
                          <Badge type="blue">{u.to}</Badge>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{u.date}</td>
                      <td><Badge type={u.status === "Approved" ? "green" : u.status === "Rejected" ? "rose" : "amber"}>{u.status}</Badge></td>
                      <td>
                        {u.status === "Pending" ? (
                          <div style={{ display: "flex", gap: 7 }}>
                            <Button variant="success" size="sm" onClick={() => processUpgrade(u.id, "approve")}>✓ Approve</Button>
                            <Button variant="danger" size="sm" onClick={() => processUpgrade(u.id, "reject")}>✕ Reject</Button>
                          </div>
                        ) : <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Processed</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {editPlan && (
        <Modal title={`Edit Plan — ${editPlan.name}`} onClose={() => setEditPlan(null)}
          footer={<><Button variant="ghost" onClick={() => setEditPlan(null)}>Cancel</Button><Button variant="primary" onClick={saveEdit}>💾 Save</Button></>}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormInput label="Plan Name" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <FormInput label="Price" value={editForm.price || ""} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
            <FormInput label="Storage (GB)" type="number" value={editForm.storage || ""} onChange={(e) => setEditForm({ ...editForm, storage: Number(e.target.value) })} />
            <FormInput label="Trial Days" type="number" value={editForm.trialDays || 0} onChange={(e) => setEditForm({ ...editForm, trialDays: Number(e.target.value) })} />
            <div style={{ gridColumn: "1/-1" }}>
              <FormInput label="Description" value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
            {[["active", "Plan Active"], ["apiAccess", "API Access"], ["customBranding", "Custom Branding"]].map(([k, l]) => (
              <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={!!editForm[k]} onChange={(e) => setEditForm({ ...editForm, [k]: e.target.checked })} style={{ accentColor: "var(--cyan)", width: 16, height: 16 }} />
                <span style={{ fontSize: 13, color: "var(--text)" }}>{l}</span>
              </label>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────
export function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { API.getAuditLogs().then((r) => { if (r.ok) setLogs(r.logs); setLoading(false); }); }, []);

  const ACTION_COLOR = { login: "var(--cyan)", register: "var(--green)", record_upload: "var(--violet)", record_delete: "var(--rose)", prescription_created: "var(--amber)", record_share: "var(--green)", share_revoke: "var(--rose)", user_verified: "var(--green)", payment: "var(--amber)", password_change: "var(--amber)" };

  return (
    <div className="hh-page hh-page-enter">
      <div className="hh-page-header">
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Audit Logs</h1>
        <p>All platform actions logged for compliance &amp; security</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={32} /></div>
      ) : (
        <div className="hh-table-wrap">
          <table className="hh-table">
            <thead><tr>{["Timestamp", "User ID", "Action", "Detail", "IP"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {logs.map((l) => {
                const col = ACTION_COLOR[l.action] || "var(--text-muted)";
                return (
                  <tr key={l.id}>
                    <td style={{ color: "var(--text-faint)", fontSize: 12, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{new Date(l.ts).toLocaleString()}</td>
                    {/* <td style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{l.user_id}</td> */}
                    <td>
  <div style={{ fontWeight: 600 }}>
    {l.user_id?.name || "System"}
  </div>
  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
    {l.user_id?.email}
  </div>
</td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 700, color: col, background: col + "18", padding: "3px 9px", borderRadius: 6 }}>{l.action}</span>
                    </td>
                    <td style={{ fontSize: 13 }}>{l.detail}</td>
                    <td style={{ fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{l.ip}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
