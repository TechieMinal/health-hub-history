// ═══════════════════════════════════════════════════════
// DOCTOR PAGES
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import API from "../../api/client.js";
import {
  StatCard, Card, Badge, Button, Modal, Spinner,
  EmptyState, FormInput, CardHeader, AlertBanner, SkeletonStatCard,
} from "../../components/index.jsx";

const CAT_ICON = { Prescription: "💊", "Lab Report": "🧪", Radiology: "🩻", Discharge: "🏥", Vaccination: "💉", Bill: "🧾", Insurance: "📋", Other: "📄" };

// ─────────────────────────────────────────────────────
// DOCTOR DASHBOARD
// ─────────────────────────────────────────────────────
export function DoctorDashboard({ user, notify, setPage }) {
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.getDoctorPatients(), API.getPrescriptions()]).then(([p, rx]) => {
      if (p.ok) setPatients(p.patients);
      if (rx.ok) setPrescriptions(rx.prescriptions);
      setLoading(false);
    });
  }, []);

  return (
    <div className="hh-page hh-page-enter">
      <div className="hh-page-header">
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Welcome, {user.name} 🩺</h1>
        <p>{user.specialty} · {user.hospital} · ID: <span style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }}>{user.doctor_id}</span></p>
      </div>

      {user.status === "pending_verification" && (
        <AlertBanner type="amber" icon="⏳" title="Account Pending Verification" text="Your account is under admin review. You'll be notified once verified." />
      )}

      <div className="hh-grid-4" style={{ marginBottom: 24 }}>
        {loading ? (
          <><SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /></>
        ) : (
          <>
            <StatCard icon="👥" label="Patients" value={patients.length} sub="Active shares" color="var(--cyan)" />
            <StatCard icon="📋" label="Records Shared" value={patients.reduce((s, p) => s + (p.sharedCount || 0), 0)} sub="With you" color="var(--green)" />
            <StatCard icon="📝" label="Prescriptions" value={prescriptions.length} sub="Sent total" color="var(--violet)" />
            <StatCard icon="✅" label="Status" value={user.status === "verified" ? "Verified" : "Pending"} sub={user.license} color={user.status === "verified" ? "var(--green)" : "var(--amber)"} />
          </>
        )}
      </div>

      <div className="hh-grid-2">
        <Card>
          <CardHeader title="My Patients" action={<Button variant="ghost" size="sm" onClick={() => setPage("patients")}>View All →</Button>} />
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 24 }}><Spinner size={24} /></div>
          ) : patients.length === 0 ? (
            <EmptyState icon="👥" title="No patients yet" text="Share your Doctor ID with patients to get started." />
          ) : (
            <div>
              {patients.slice(0, 5).map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--cyan-dim)", border: "1.5px solid rgba(0,212,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.sharedCount} records · Blood: {p.blood || "N/A"}</div>
                  </div>
                  {p.allergies && p.allergies !== "None" && <Badge type="rose">Allergy</Badge>}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent Prescriptions" action={<Button variant="ghost" size="sm" onClick={() => setPage("prescriptions")}>New Rx →</Button>} />
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 24 }}><Spinner size={24} /></div>
          ) : prescriptions.length === 0 ? (
            <EmptyState icon="📝" title="No prescriptions yet" text="Write your first e-prescription." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {prescriptions.slice(0, 4).map((rx) => (
                <div key={rx.id} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{rx.patient_name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{rx.date}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{rx.diag} · {rx.meds.length} medication{rx.meds.length !== 1 ? "s" : ""}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// DOCTOR PATIENTS
// ─────────────────────────────────────────────────────
export function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [sharedData, setSharedData] = useState([]);

  useEffect(() => {
    API.getDoctorPatients().then((r) => { if (r.ok) setPatients(r.patients); setLoading(false); });
    API.getSharedRecords().then((r) => { if (r.ok) setSharedData(r.records); });
  }, []);

  return (
    <div className="hh-page hh-page-enter">
      <div className="hh-page-header">
        <h1 style={{ fontFamily: "var(--font-heading)" }}>My Patients</h1>
        <p>Patients who have shared records with you</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={32} /></div>
      ) : patients.length === 0 ? (
        <EmptyState icon="👥" title="No patients yet" text="Share your Doctor ID with patients to get started." />
      ) : (
        <div className="hh-grid-auto">
          {patients.map((p) => (
            <div key={p.id} className="hh-record-card" style={{ cursor: "pointer" }} onClick={() => setSelected(p)}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-light)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--cyan-dim)", border: "2px solid rgba(0,212,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>👤</div>
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Joined: {p.joined}</div>
                  {p.blood && <Badge type="blue" style={{ marginTop: 5 }}>Blood: {p.blood}</Badge>}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: "var(--surface2)", borderRadius: 9, padding: "10px 12px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--cyan)", fontFamily: "var(--font-heading)" }}>{p.sharedCount}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Records Shared</div>
                </div>
                <div style={{ background: "var(--surface2)", borderRadius: 9, padding: "10px 12px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--green)", fontFamily: "var(--font-heading)" }}>{p.recordCount || 0}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Total Records</div>
                </div>
              </div>
              {p.allergies && p.allergies !== "None" && (
                <div style={{ marginTop: 12, background: "var(--rose-dim)", borderRadius: 8, padding: "7px 10px", fontSize: 12, color: "var(--rose)", border: "1px solid rgba(255,77,107,0.2)" }}>
                  ⚠ Allergies: {p.allergies}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <Modal title={`Patient: ${selected.name}`} onClose={() => setSelected(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[["Phone", selected.phone || "N/A"], ["Blood Group", selected.blood || "N/A"], ["Allergies", selected.allergies || "None"], ["Plan", selected.plan || "Free"]].map(([l, v]) => (
              <div key={l} style={{ background: "var(--surface2)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Shared Records</div>
          {sharedData.filter((d) => d.share.user_id === selected.id).flatMap((d) => d.records).map((r) => (
            <div key={r.id} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "var(--surface2)", borderRadius: 10, marginBottom: 7 }}>
              <span style={{ fontSize: 18 }}>{CAT_ICON[r.category] || "📄"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.date} · {r.diagnosis}</div>
              </div>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// E-PRESCRIPTIONS
// ─────────────────────────────────────────────────────
export function EPrescriptions({ notify }) {
  const [rxs, setRxs] = useState([]);
  const [form, setForm] = useState({ patient_name: "", diag: "", meds: [{ name: "", dose: "", freq: "" }] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const user = API.getCachedUser();
  const load = async () => { const r = await API.getPrescriptions(); if (r.ok) setRxs(r.prescriptions); setLoading(false); };
  useEffect(() => { load(); }, []);

  const addMedRow = () => setForm((p) => ({ ...p, meds: [...p.meds, { name: "", dose: "", freq: "" }] }));
  const updMed = (i, k, v) => setForm((p) => ({ ...p, meds: p.meds.map((m, idx) => idx === i ? { ...m, [k]: v } : m) }));
  const rmMed = (i) => setForm((p) => ({ ...p, meds: p.meds.filter((_, idx) => idx !== i) }));

  const send = async () => {
    if (!form.patient_name || !form.diag) { notify("Error", "Fill patient and diagnosis", "error"); return; }
    if (!form.meds.some((m) => m.name)) { notify("Error", "Add at least one medication", "error"); return; }
    setSaving(true);
    const res = await API.addPrescription({ ...form, meds: form.meds.filter((m) => m.name) });
    if (res.ok) { notify("Sent!", "Prescription delivered to patient vault", "success"); setForm({ patient_name: "", diag: "", meds: [{ name: "", dose: "", freq: "" }] }); load(); }
    setSaving(false);
  };

  return (
    <div className="hh-page hh-page-enter">
      <div className="hh-page-header">
        <h1 style={{ fontFamily: "var(--font-heading)" }}>E-Prescriptions</h1>
        <p>Write and send digital prescriptions directly to patient vaults</p>
      </div>

      <div className="hh-grid-2">
        {/* Prescription pad */}
        <Card style={{ border: "2px solid var(--border)" }}>
          {/* Letterhead */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 18, borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "var(--cyan)", lineHeight: 1, fontFamily: "var(--font-heading)" }}>℞</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--text)", fontSize: 15 }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user?.specialty} · {user?.hospital}</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{user?.doctor_id}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <FormInput label="Patient Name *" placeholder="Patient name" value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} />
            <FormInput label="Diagnosis *" placeholder="Diagnosis" value={form.diag} onChange={(e) => setForm({ ...form, diag: e.target.value })} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Medications</div>
            {form.meds.map((m, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                <input className="hh-input" placeholder="Medicine name" value={m.name} onChange={(e) => updMed(i, "name", e.target.value)} style={{ padding: "8px 11px" }} aria-label="Medicine name" />
                <input className="hh-input" placeholder="Dose" value={m.dose} onChange={(e) => updMed(i, "dose", e.target.value)} style={{ padding: "8px 11px" }} aria-label="Dose" />
                <input className="hh-input" placeholder="Frequency" value={m.freq} onChange={(e) => updMed(i, "freq", e.target.value)} style={{ padding: "8px 11px" }} aria-label="Frequency" />
                {i > 0 && (
                  <button onClick={() => rmMed(i)} aria-label="Remove medication" style={{ background: "var(--rose-dim)", border: "none", borderRadius: 8, color: "var(--rose)", cursor: "pointer", padding: "0 10px", fontSize: 16 }}>✕</button>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addMedRow} style={{ marginTop: 4 }}>+ Add Medicine</Button>
          </div>

          <Button variant="primary" style={{ width: "100%", justifyContent: "center" }} onClick={send} disabled={saving}>
            {saving ? <><Spinner size={15} color="#fff" /> Sending…</> : "📤 Send Prescription"}
          </Button>
        </Card>

        {/* Sent history */}
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 14 }}>
            Sent Prescriptions ({rxs.length})
          </div>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner size={24} /></div>
          ) : rxs.length === 0 ? (
            <EmptyState icon="📝" title="No prescriptions yet" text="Send your first prescription using the form." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {rxs.map((rx) => (
                <Card key={rx.id} hover>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{rx.patient_name}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{rx.diag}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{rx.date}</div>
                  </div>
                  {rx.meds.map((m, i) => (
                    <div key={i} style={{ fontSize: 12, padding: "6px 10px", background: "var(--surface2)", borderRadius: 7, marginBottom: 5, color: "var(--text)", display: "flex", gap: 6 }}>
                      <span style={{ fontWeight: 700 }}>{m.name}</span>
                      {m.dose && <span style={{ color: "var(--text-muted)" }}>· {m.dose}</span>}
                      {m.freq && <span style={{ color: "var(--text-faint)" }}>· {m.freq}</span>}
                    </div>
                  ))}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
