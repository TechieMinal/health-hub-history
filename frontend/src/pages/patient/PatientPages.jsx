// ═══════════════════════════════════════════════════════
// SHARE RECORDS
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import API from "../../api/client.js";
import { Badge, Button, Modal, Spinner, EmptyState, CardHeader, Card, FormInput, SelectInput } from "../../components/index.jsx";

const CAT_ICON = { Prescription: "💊", "Lab Report": "🧪", Radiology: "🩻", Discharge: "🏥", Vaccination: "💉", Bill: "🧾", Insurance: "📋", Other: "📄" };

export function ShareRecords({ notify }) {
  const [step, setStep] = useState(1);
  const [docId, setDocId] = useState("");
  const [doctor, setDoctor] = useState(null);
  const [selected, setSelected] = useState([]);
  const [shares, setShares] = useState([]);
  const [records, setRecords] = useState([]);
  const [finding, setFinding] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.getShares().then((r) => { if (r.ok) setShares(r.shares); });
    API.getRecords().then((r) => { if (r.ok) setRecords(r.records); });
  }, []);

  const find = async () => {
    setFinding(true);
    const res = await API.findDoctor(docId.toUpperCase());
    setFinding(false);
    if (res.ok) { setDoctor(res.doctor); setStep(2); }
    else notify("Not Found", res.error || "Try DOC001, DOC002, DOC003", "error");
  };

  const share = async () => {
    if (!selected.length) { notify("Select Records", "Pick at least one record", "warning"); return; }
    setLoading(true);
    const res = await API.addShare({ doctor_id: doctor.doctor_id, doctor_name: doctor.name, specialty: doctor.specialty, records: selected });
    if (res.ok) {
      notify("Shared!", `${selected.length} record(s) sent to ${doctor.name}`, "success");
      const r = await API.getShares(); if (r.ok) setShares(r.shares);
      setStep(1); setDocId(""); setDoctor(null); setSelected([]);
    }
    setLoading(false);
  };

  const revoke = async (id) => {
    await API.revokeShare(id);
    notify("Revoked", "Access removed", "info");
    const r = await API.getShares(); if (r.ok) setShares(r.shares);
  };

  return (
    <div className="hh-page hh-page-enter">
      <div className="hh-page-header">
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Share Records</h1>
        <p>Send medical records to any verified doctor securely</p>
      </div>

      <div className="hh-grid-2">
        {/* Share Wizard */}
        <Card>
          {/* Step indicators */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
            {["Find Doctor", "Select Records", "Confirm"].map((l, i) => (
              <div key={l} style={{ display: "flex", alignItems: "center", flex: i < 2 ? "1" : undefined }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: step >= i + 1 ? "var(--grad-primary)" : "var(--surface2)", border: `1px solid ${step >= i + 1 ? "transparent" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: step >= i + 1 ? "#fff" : "var(--text-muted)", flexShrink: 0 }}>
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: step >= i + 1 ? "var(--text)" : "var(--text-muted)", whiteSpace: "nowrap" }}>{l}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? "var(--cyan)" : "var(--border)", margin: "0 8px" }} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <label className="hh-label" htmlFor="doc-id">Doctor's Unique ID</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input id="doc-id" className="hh-input" placeholder="e.g. DOC001" value={docId} onChange={(e) => setDocId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && find()} style={{ textTransform: "uppercase" }} />
                <Button variant="primary" onClick={find} disabled={finding || !docId.trim()}>
                  {finding ? <Spinner size={15} color="#fff" /> : "Find"}
                </Button>
              </div>
              <div style={{ background: "var(--cyan-dim)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 10, padding: "11px 14px", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--cyan)" }}>💡</span> Try DOC001, DOC002, or DOC003
              </div>
            </div>
          )}

          {step === 2 && doctor && (
            <div>
              <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: "var(--green-dim)", border: "1.5px solid rgba(0,229,141,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🩺</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>{doctor.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{doctor.specialty} · {doctor.hospital}</div>
                  {doctor.verified && <Badge type="green" style={{ marginTop: 6 }}>✓ Verified Doctor</Badge>}
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Select Records to Share</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 240, overflowY: "auto", marginBottom: 16 }}>
                {records.map((r) => (
                  <label key={r.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", background: selected.includes(r.name) ? "var(--cyan-dim)" : "var(--surface2)", border: `1px solid ${selected.includes(r.name) ? "rgba(0,212,255,0.3)" : "var(--border)"}`, borderRadius: 10, cursor: "pointer", transition: "all 0.15s" }}>
                    <input type="checkbox" checked={selected.includes(r.name)} onChange={(e) => setSelected((p) => e.target.checked ? [...p, r.name] : p.filter((x) => x !== r.name))} style={{ accentColor: "var(--cyan)", width: 15, height: 15 }} />
                    <span style={{ fontSize: 18 }}>{CAT_ICON[r.category] || "📄"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.date}</div>
                    </div>
                  </label>
                ))}
                {records.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 13 }}>No records to share</div>}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Button variant="ghost" style={{ flex: 1 }} onClick={() => { setStep(1); setDoctor(null); }}>← Back</Button>
                <Button variant="primary" style={{ flex: 2, justifyContent: "center" }} onClick={share} disabled={loading || !selected.length}>
                  {loading ? <Spinner size={15} color="#fff" /> : `Share ${selected.length} Record${selected.length !== 1 ? "s" : ""} →`}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Active Shares */}
        <Card>
          <CardHeader title={`Active Shares (${shares.filter(s => s.status === "Active").length})`} />
          {shares.length === 0 ? (
            <EmptyState icon="🔗" title="No shares yet" text="Share records with a doctor to see them here." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {shares.map((s) => (
                <div key={s.id} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{s.doctor_name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.specialty}</div>
                    </div>
                    <Badge type={s.status === "Active" ? "green" : s.status === "Revoked" ? "rose" : "gray"}>{s.status}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>📄 {s.records.join(", ")}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text-faint)" }}>Shared: {s.date} · Expires: {s.expires}</span>
                    {s.status === "Active" && (
                      <Button variant="danger" size="sm" onClick={() => revoke(s.id)}>Revoke</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// HEALTH TIMELINE
// ═══════════════════════════════════════════════════════

export function HealthTimeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.getTimeline().then((r) => { if (r.ok) setEvents(r.events); setLoading(false); });
  }, []);

  return (
    <div className="hh-page hh-page-enter">
      <div className="hh-page-header">
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Health Timeline</h1>
        <p>Your complete medical journey at a glance</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={32} /></div>
      ) : events.length === 0 ? (
        <EmptyState icon="📅" title="No timeline events" text="Upload medical records to build your health timeline." />
      ) : (
        <div style={{ maxWidth: 700 }}>
          {events.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 18, paddingBottom: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: e.color + "18", border: `2px solid ${e.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {e.icon}
                </div>
                {i < events.length - 1 && <div className="hh-timeline-line" style={{ marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginTop: 4, transition: "border-color 0.2s" }}
                onMouseEnter={e2 => e2.currentTarget.style.borderColor = "var(--border-light)"}
                onMouseLeave={e2 => e2.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "var(--text)", flex: 1, marginRight: 10 }}>{e.title}</div>
                  <Badge type="gray">{e.type}</Badge>
                </div>
                {e.diagnosis && <div style={{ fontSize: 13, color: "var(--cyan)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>📋 {e.diagnosis}</div>}
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)", flexWrap: "wrap" }}>
                  <span>🏥 {e.hospital}</span>
                  <span>👨‍⚕️ {e.doctor}</span>
                  <span>📅 {e.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// VITALS TRACKER
// ═══════════════════════════════════════════════════════

export function VitalsTracker({ notify }) {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ bp: "", sugar: "", hr: "", wt: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.getVitals().then((r) => { if (r.ok) setLogs(r.vitals); setLoading(false); });
  }, []);

  const logVital = async () => {
    if (!form.bp && !form.sugar && !form.hr && !form.wt) { notify("Empty", "Fill at least one vital", "warning"); return; }
    setSaving(true);
    const res = await API.addVital({ ...form, date: new Date().toISOString().split("T")[0] });
    if (res.ok) { notify("Logged!", "Vitals saved successfully", "success"); setLogs((p) => [res.vital, ...p]); setForm({ bp: "", sugar: "", hr: "", wt: "" }); }
    setSaving(false);
  };

  const latest = logs[0] || {};
  const vitals = [
    { key: "bp",    icon: "❤️",  label: "Blood Pressure", value: latest.bp    || "—", unit: "mmHg",  color: "var(--rose)",   fill: 72 },
    { key: "sugar", icon: "🩸",  label: "Blood Sugar",     value: latest.sugar || "—", unit: "mg/dL", color: "var(--amber)",  fill: 55 },
    { key: "hr",    icon: "💓",  label: "Heart Rate",      value: latest.hr    || "—", unit: "bpm",   color: "var(--cyan)",   fill: 65 },
    { key: "wt",    icon: "⚖️", label: "Weight",           value: latest.wt    || "—", unit: "kg",    color: "var(--green)",  fill: 60 },
  ];

  return (
    <div className="hh-page hh-page-enter">
      <div className="hh-page-header">
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Vitals Tracker</h1>
        <p>Monitor your health metrics over time</p>
      </div>

      {/* Vital summary cards */}
      <div className="hh-grid-4" style={{ marginBottom: 24 }}>
        {vitals.map((v) => (
          <div key={v.key} className="hh-vital-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{v.label}</span>
              <span style={{ fontSize: 20 }}>{v.icon}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: v.color, fontFamily: "var(--font-heading)", fontVariantNumeric: "tabular-nums" }}>
              {v.value} <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>{v.value !== "—" ? v.unit : ""}</span>
            </div>
            <div style={{ height: 5, background: "var(--surface2)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: v.fill + "%", background: v.color, borderRadius: 99, transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
      </div>

      <div className="hh-grid-2">
        {/* Log form */}
        <Card>
          <CardHeader title="Log Today's Vitals" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            {[["bp", "Blood Pressure", "120/80", "mmHg"], ["sugar", "Blood Sugar", "98", "mg/dL"], ["hr", "Heart Rate", "72", "bpm"], ["wt", "Weight", "72.5", "kg"]].map(([k, lb, ph]) => (
              <div key={k}>
                <label className="hh-label" htmlFor={`vital-${k}`}>{lb}</label>
                <input id={`vital-${k}`} className="hh-input" placeholder={ph} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
          </div>
          <Button variant="primary" onClick={logVital} disabled={saving}>
            {saving ? <><Spinner size={15} color="#fff" /> Saving…</> : "📊 Log Vitals"}
          </Button>
        </Card>

        {/* History table */}
        <Card>
          <CardHeader title="Vital History" />
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 30 }}><Spinner size={24} /></div>
          ) : logs.length === 0 ? (
            <EmptyState icon="📊" title="No readings yet" text="Log your first vitals to track trends." />
          ) : (
            <div className="hh-table-wrap">
              <table className="hh-table">
                <thead>
                  <tr>{["Date", "BP", "Sugar", "HR", "Wt."].map((h) => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {logs.slice(0, 10).map((l, i) => (
                    <tr key={i}>
                      <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{l.date}</td>
                      <td style={{ color: l.bp ? "var(--rose)" : "var(--text-faint)" }}>{l.bp || "—"}</td>
                      <td style={{ color: l.sugar ? "var(--amber)" : "var(--text-faint)" }}>{l.sugar || "—"}</td>
                      <td style={{ color: l.hr ? "var(--cyan)" : "var(--text-faint)" }}>{l.hr || "—"}</td>
                      <td style={{ color: l.wt ? "var(--green)" : "var(--text-faint)" }}>{l.wt || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MEDICATIONS
// ═══════════════════════════════════════════════════════

export function Medications({ notify }) {
  const [meds, setMeds] = useState([]);
  const [form, setForm] = useState({ name: "", dose: "", freq: "Once Daily", time: "Morning", for_condition: "", stock: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => { const r = await API.getMeds(); if (r.ok) setMeds(r.meds); setLoading(false); };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.name || !form.dose) { notify("Error", "Name and dose are required", "error"); return; }
    setSaving(true);
    const res = await API.addMed({ ...form, stock: Number(form.stock) || 30 });
    if (res.ok) { notify("Added!", `${form.name} added`, "success"); setForm({ name: "", dose: "", freq: "Once Daily", time: "Morning", for_condition: "", stock: "" }); setShowAdd(false); load(); }
    setSaving(false);
  };

  const updateStock = async (id, delta) => {
    const med = meds.find((m) => m.id === id); if (!med) return;
    const newStock = Math.max(0, med.stock + delta);
    await API.updateMed(id, { stock: newStock });
    setMeds((p) => p.map((m) => m.id === id ? { ...m, stock: newStock } : m));
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Remove ${name}?`)) return;
    await API.deleteMed(id); notify("Removed", name, "info"); load();
  };

  const stockColor = (s) => s < 15 ? "var(--rose)" : s < 30 ? "var(--amber)" : "var(--green)";

  return (
    <div className="hh-page hh-page-enter">
      <div className="hh-header-row">
        <div className="hh-page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontFamily: "var(--font-heading)" }}>Medications</h1>
          <p>Track your medications and refill schedule</p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)}>+ Add Medication</Button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={32} /></div>
      ) : meds.length === 0 ? (
        <EmptyState icon="💊" title="No medications tracked" text="Add your first medication to start tracking." action={<Button variant="primary" onClick={() => setShowAdd(true)}>+ Add Medication</Button>} />
      ) : (
        <div className="hh-grid-auto">
          {meds.map((m) => (
            <div key={m.id} className="hh-record-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--violet-dim)", border: "1px solid rgba(139,111,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💊</div>
                <Badge type={m.stock < 15 ? "rose" : m.stock < 30 ? "amber" : "green"}>{m.stock < 15 ? "⚠ Low" : "In Stock"}</Badge>
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: 13, color: "var(--cyan)", marginBottom: 5 }}>{m.dose} · {m.freq}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>⏰ {m.time} · {m.for_condition}</div>

              {/* Stock control */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface2)", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", flex: 1 }}>Stock</span>
                <button onClick={() => updateStock(m.id, -1)} aria-label="Decrease stock" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "none", color: "var(--text)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--card)"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >−</button>
                <span style={{ fontWeight: 800, fontSize: 18, color: stockColor(m.stock), minWidth: 30, textAlign: "center", fontFamily: "var(--font-mono)" }}>{m.stock}</span>
                <button onClick={() => updateStock(m.id, 1)} aria-label="Increase stock" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "none", color: "var(--text)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--card)"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >+</button>
              </div>
              <div style={{ height: 5, background: "var(--surface2)", borderRadius: 99, marginBottom: 14 }}>
                <div style={{ height: "100%", borderRadius: 99, background: stockColor(m.stock), width: Math.min(100, (m.stock / 60) * 100) + "%", transition: "width 0.4s" }} />
              </div>
              <Button variant="danger" style={{ width: "100%", justifyContent: "center", fontSize: 12, padding: "7px 0" }} onClick={() => remove(m.id, m.name)}>Remove</Button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Add Medication" onClose={() => setShowAdd(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button variant="primary" onClick={add} disabled={saving}>
                {saving ? <Spinner size={15} color="#fff" /> : "Add Medication"}
              </Button>
            </>
          }
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormInput label="Medication Name *" placeholder="e.g. Amlodipine" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FormInput label="Dose *" placeholder="e.g. 5mg" value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} />
            <div>
              <label className="hh-label" htmlFor="med-freq">Frequency</label>
              <select id="med-freq" className="hh-input" value={form.freq} onChange={(e) => setForm({ ...form, freq: e.target.value })}>
                {["Once Daily", "Twice Daily", "Three Times Daily", "Weekly", "As Needed"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="hh-label" htmlFor="med-time">Time</label>
              <select id="med-time" className="hh-input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
                {["Morning", "Afternoon", "Evening", "Night", "With Meals", "Empty Stomach"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <FormInput label="For Condition" placeholder="e.g. Hypertension" value={form.for_condition} onChange={(e) => setForm({ ...form, for_condition: e.target.value })} />
            <FormInput label="Initial Stock" type="number" placeholder="30" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// APPOINTMENTS
// ═══════════════════════════════════════════════════════

export function Appointments({ notify }) {
  const [appts, setAppts] = useState([]);
  const [form, setForm] = useState({ doctor: "", specialty: "", hospital: "", date: "", time: "", type: "Consultation", notes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => { const r = await API.getAppts(); if (r.ok) setAppts(r.appts); setLoading(false); };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.doctor || !form.date) { notify("Error", "Doctor and date are required", "error"); return; }
    setSaving(true);
    await API.addAppt(form);
    notify("Booked!", `Appointment with ${form.doctor} scheduled`, "success");
    setForm({ doctor: "", specialty: "", hospital: "", date: "", time: "", type: "Consultation", notes: "" });
    setShowAdd(false); load(); setSaving(false);
  };

  const cancel = async (id, doc) => {
    if (!window.confirm("Cancel this appointment?")) return;
    await API.cancelAppt(id);
    notify("Cancelled", `Appointment with ${doc}`, "info");
    load();
  };

  const statusType = { Scheduled: "blue", Completed: "green", Cancelled: "rose" };

  return (
    <div className="hh-page hh-page-enter">
      <div className="hh-header-row">
        <div className="hh-page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontFamily: "var(--font-heading)" }}>Appointments</h1>
          <p>Manage your medical appointments</p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)}>+ Book Appointment</Button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={32} /></div>
      ) : appts.length === 0 ? (
        <EmptyState icon="🗓️" title="No appointments" text="Book your first appointment with a doctor." action={<Button variant="primary" onClick={() => setShowAdd(true)}>+ Book Appointment</Button>} />
      ) : (
        <div className="hh-grid-auto">
          {appts.map((a) => (
            <div key={a.id} className="hh-record-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--violet-dim)", border: "1px solid rgba(139,111,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🩺</div>
                <Badge type={statusType[a.status] || "gray"}>{a.status}</Badge>
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>{a.doctor}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 5 }}>{a.specialty} · {a.hospital}</div>
              <div style={{ fontSize: 13, color: "var(--amber)", marginBottom: 10, fontWeight: 600 }}>📅 {a.date} at {a.time}</div>
              <Badge type="gray">{a.type}</Badge>
              {a.notes && (
                <div style={{ fontSize: 12, color: "var(--text-faint)", background: "var(--surface2)", borderRadius: 8, padding: "8px 10px", marginTop: 10 }}>{a.notes}</div>
              )}
              {a.status === "Scheduled" && (
                <Button variant="danger" style={{ width: "100%", justifyContent: "center", marginTop: 14, fontSize: 12 }} onClick={() => cancel(a.id, a.doctor)}>Cancel Appointment</Button>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Book Appointment" onClose={() => setShowAdd(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button variant="primary" onClick={add} disabled={saving}>
                {saving ? <Spinner size={15} color="#fff" /> : "Book Appointment"}
              </Button>
            </>
          }
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormInput label="Doctor Name *" placeholder="Dr. Name" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} />
            <FormInput label="Specialty" placeholder="e.g. Cardiologist" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
            <FormInput label="Hospital" placeholder="Hospital name" value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} />
            <div>
              <label className="hh-label" htmlFor="appt-type">Visit Type</label>
              <select id="appt-type" className="hh-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {["Consultation", "Follow-up", "Emergency", "Routine Check-up", "Lab Test"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <FormInput label="Date *" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <FormInput label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            <div style={{ gridColumn: "1/-1" }}>
              <label className="hh-label" htmlFor="appt-notes">Notes</label>
              <textarea id="appt-notes" className="hh-input" placeholder="Reason for visit…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ minHeight: 70, resize: "vertical" }} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
