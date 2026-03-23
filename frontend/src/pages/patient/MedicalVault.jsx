// ═══════════════════════════════════════════════════════
// MEDICAL VAULT
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import API from "../../api/client.js";
import {
  Badge, Button, Modal, Spinner, EmptyState,
  FormInput, SelectInput, SearchBar, CardHeader,
} from "../../components/index.jsx";

const CATS = ["Prescription", "Lab Report", "Radiology", "Discharge", "Vaccination", "Bill", "Insurance", "Other"];
const CAT_ICON = { Prescription: "💊", "Lab Report": "🧪", Radiology: "🩻", Discharge: "🏥", Vaccination: "💉", Bill: "🧾", Insurance: "📋", Other: "📄" };
const CAT_COLOR = { Prescription: "var(--violet)", "Lab Report": "var(--cyan)", Radiology: "var(--amber)", Discharge: "var(--green)", Vaccination: "var(--rose)", Bill: "var(--amber)", Insurance: "var(--green)", Other: "var(--text-muted)" };

export default function MedicalVault({ notify, user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [viewRec, setViewRec] = useState(null);
  const [form, setForm] = useState({ name: "", category: "Lab Report", hospital: "", doctor: "", date: "", diagnosis: "", tags: "" });
  const [uploading, setUploading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const fileRef = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const load = async () => {
    setLoading(true);
    const res = await API.getRecords({ category: cat === "All" ? null : cat, search });
    if (res.ok) setRecords(res.records);
    setLoading(false);
  };

  useEffect(() => { load(); }, [cat, search]);

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFilePreview({ name: file.name, url: ev.target.result, type: file.type, size: (file.size / 1024 / 1024).toFixed(2) + " MB" });
    reader.readAsDataURL(file);
    setForm((f) => ({ ...f, name: f.name || file.name.replace(/\.[^.]+$/, "") }));
  };

  const submit = async () => {
    if (!form.name || !form.category) { notify("Error", "Name and category are required", "error"); return; }
    setUploading(true);
    const res = await API.addRecord({ ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean), size: filePreview?.size || "Unknown", shared: false, file_url: filePreview?.url || null, fileType: filePreview?.type || null });
    if (res.ok) {
      notify("Uploaded!", `${form.name} saved to vault`, "success");
      setShowAdd(false);
      setForm({ name: "", category: "Lab Report", hospital: "", doctor: "", date: "", diagnosis: "", tags: "" });
      setFilePreview(null);
      load();
    } else notify("Error", res.error, "error");
    setUploading(false);
  };

  const del = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    const res = await API.deleteRecord(id);
    if (res.ok) { notify("Deleted", name, "info"); load(); }
  };

  const toggleShare = async (rec) => {
    await API.updateRecord(rec.id, { shared: !rec.shared });
    notify(rec.shared ? "Made Private" : "Now Shared", rec.name, "success");
    load();
  };

  return (
    <div className="hh-page hh-page-enter">
      {/* Header */}
      <div className="hh-header-row">
        <div className="hh-page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontFamily: "var(--font-heading)" }}>Medical Vault</h1>
          <p>{records.length} records · Secured with AES-256 encryption</p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          <span>+</span> Upload Record
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} placeholder="Search records…" />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["All", ...CATS].map((c) => (
            <button key={c} className={`hh-chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>
              {c !== "All" ? CAT_ICON[c] + " " : ""}{c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={32} /></div>
      ) : records.length === 0 ? (
        <EmptyState icon="🗃️" title="No records found" text={search ? `No records match "${search}"` : "Upload your first medical record to get started."} action={!search && <Button variant="primary" onClick={() => setShowAdd(true)}>+ Upload First Record</Button>} />
      ) : (
        <div className="hh-grid-auto">
          {records.map((r) => {
            const col = CAT_COLOR[r.category] || "var(--cyan)";
            return (
              <div key={r.id} className="hh-record-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: col + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: `1px solid ${col}30` }}>
                    {CAT_ICON[r.category] || "📄"}
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {r.shared && <Badge type="green">Shared</Badge>}
                    <Badge type="gray">{r.category}</Badge>
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>{r.name}</div>
                {r.diagnosis && <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>📋 {r.diagnosis}</div>}
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 12 }}>🏥 {r.hospital} · 👨‍⚕️ {r.doctor} · {r.date}</div>

                {r.tags?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                    {r.tags.map((t) => (
                      <span key={t} style={{ fontSize: 11, padding: "2px 8px", background: "var(--surface2)", borderRadius: 99, color: "var(--text-muted)", border: "1px solid var(--border)" }}>#{t}</span>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 6 }}>
                  <Button variant="ghost" size="sm" style={{ flex: 1 }} onClick={() => setViewRec(r)}>👁 View</Button>
                  <Button variant={r.shared ? "ghost" : "success"} size="sm" style={{ flex: 1 }} onClick={() => toggleShare(r)}>
                    {r.shared ? "🔒 Private" : "🔗 Share"}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => del(r.id, r.name)} aria-label="Delete record">🗑</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showAdd && (
        <Modal
          title="Upload Medical Record"
          onClose={() => { setShowAdd(false); setFilePreview(null); }}
          footer={
            <>
              <Button variant="ghost" onClick={() => { setShowAdd(false); setFilePreview(null); }}>Cancel</Button>
              <Button variant="primary" onClick={submit} disabled={uploading}>
                {uploading ? <><Spinner size={15} color="#fff" /> Uploading…</> : "Upload Record"}
              </Button>
            </>
          }
        >
          {/* File drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${filePreview ? "var(--green)" : "var(--border)"}`, borderRadius: 12, padding: "20px", textAlign: "center", cursor: "pointer", marginBottom: 20, background: filePreview ? "var(--green-dim)" : "var(--surface2)", transition: "all 0.2s" }}
            role="button" tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            aria-label="Upload file"
          >
            <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFile} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
            {filePreview ? (
              <div>
                <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>{filePreview.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{filePreview.size}</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>Click to attach file</div>
                <div style={{ fontSize: 11, color: "var(--text-faint)" }}>PDF, JPG, PNG, DOC supported</div>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <FormInput label="Record Name *" placeholder="e.g. Blood CBC Report" value={form.name} onChange={set("name")} />
            </div>
            <SelectInput label="Category *" value={form.category} onChange={set("category")}>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </SelectInput>
            <FormInput label="Date" type="date" value={form.date} onChange={set("date")} />
            <FormInput label="Hospital" placeholder="Hospital name" value={form.hospital} onChange={set("hospital")} />
            <FormInput label="Doctor" placeholder="Doctor name" value={form.doctor} onChange={set("doctor")} />
            <div style={{ gridColumn: "1/-1" }}>
              <FormInput label="Diagnosis" placeholder="e.g. Type 2 Diabetes" value={form.diagnosis} onChange={set("diagnosis")} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <FormInput label="Tags (comma separated)" placeholder="e.g. diabetes, annual, fasting" value={form.tags} onChange={set("tags")} />
            </div>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {viewRec && (
        <Modal title={viewRec.name} onClose={() => setViewRec(null)}
          footer={
            <>
              <Button variant={viewRec.shared ? "ghost" : "success"} onClick={() => { toggleShare(viewRec); setViewRec(null); }}>
                {viewRec.shared ? "🔒 Make Private" : "🔗 Share"}
              </Button>
              <Button variant="ghost" onClick={() => setViewRec(null)}>Close</Button>
            </>
          }
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[["Category", viewRec.category], ["Date", viewRec.date], ["Hospital", viewRec.hospital], ["Doctor", viewRec.doctor], ["Diagnosis", viewRec.diagnosis || "—"], ["Size", viewRec.size || "Unknown"]].map(([l, v]) => (
              <div key={l} style={{ background: "var(--surface2)", borderRadius: 10, padding: "11px 13px" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{v}</div>
              </div>
            ))}
          </div>
          {viewRec.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {viewRec.tags.map((t) => (
                <span key={t} style={{ fontSize: 12, padding: "3px 10px", background: "var(--cyan-dim)", borderRadius: 99, color: "var(--cyan)", border: "1px solid rgba(0,212,255,0.25)" }}>#{t}</span>
              ))}
            </div>
          )}
          {viewRec.file_url && viewRec.fileType?.startsWith("image") && (
            <div style={{ marginTop: 16 }}>
              <img src={viewRec.file_url} alt="Medical record" style={{ width: "100%", borderRadius: 10, border: "1px solid var(--border)" }} />
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
