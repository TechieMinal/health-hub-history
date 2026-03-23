// ═══════════════════════════════════════════════════════
// PROFILE SETTINGS
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import API from "../../api/client.js";
import { Badge, Button, Spinner, FormInput, CardHeader } from "../../components/index.jsx";

export default function Profile({ user: initialUser, notify }) {
  const [user, setUser] = useState(initialUser);
  const [form, setForm] = useState({ name: initialUser.name, email: initialUser.email || "", phone: initialUser.phone || "", blood: initialUser.blood || "B+", allergies: initialUser.allergies || "" });
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState("profile");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setPw = (k) => (e) => setPwForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    API.getPayments().then((r) => { if (r.ok) setPayments(r.payments); });
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await API.updateProfile(form);
    if (res.ok) { setUser(res.user); notify("Saved!", "Profile updated successfully", "success"); }
    else notify("Error", res.error, "error");
    setSaving(false);
  };

  const changePw = async () => {
    if (pwForm.new !== pwForm.confirm) { notify("Error", "New passwords don't match", "error"); return; }
    if (pwForm.new.length < 6) { notify("Error", "Password must be 6+ characters", "error"); return; }
    setSavingPw(true);
    const res = await API.changePassword(pwForm.old, pwForm.new);
    if (res.ok) { notify("Changed!", "Password updated", "success"); setPwForm({ old: "", new: "", confirm: "" }); }
    else notify("Error", res.error, "error");
    setSavingPw(false);
  };

  const roleColor = { patient: "var(--cyan)", doctor: "var(--green)", admin: "var(--violet)" }[user.role] || "var(--cyan)";

  return (
    <div className="hh-page hh-page-enter">
      <div className="hh-page-header">
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Profile Settings</h1>
        <p>Manage your account, security, and billing preferences</p>
      </div>

      {/* Tabs */}
      <div className="hh-tabs" style={{ marginBottom: 24, maxWidth: 420 }}>
        {[["profile", "👤 Profile"], ["security", "🔒 Security"], ["billing", "💳 Billing"]].map(([t, l]) => (
          <button key={t} className={`hh-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {tab === "profile" && (
        <div className="hh-grid-2">
          {/* Profile card */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${roleColor}, ${roleColor}80)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 14, boxShadow: `0 8px 24px ${roleColor}40` }}>
              {user.avatar}
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 20, color: "var(--text)", marginBottom: 4 }}>{user.name}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, textTransform: "capitalize" }}>{user.role} Account</div>
            <Badge type={user.role === "doctor" ? "green" : user.role === "admin" ? "violet" : "blue"} style={{ marginTop: 10 }}>
              ✓ Verified
            </Badge>

            <div style={{ width: "100%", marginTop: 20, display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                ["🆔 ID", `${user.role.toUpperCase().slice(0,3)}-${user.id}`],
                ["📅 Member Since", user.joined],
                ["☁️ Plan", user.plan],
                ...(user.doctor_id ? [["🩺 Doctor ID", user.doctor_id]] : []),
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", background: "var(--surface2)", borderRadius: 9, fontSize: 13, textAlign: "left" }}>
                  <span style={{ color: "var(--text-muted)" }}>{l}</span>
                  <span style={{ fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Edit form */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
            <CardHeader title="Edit Profile" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FormInput label="Full Name" value={form.name} onChange={set("name")} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FormInput label="Email" type="email" value={form.email} onChange={set("email")} />
                <FormInput label="Phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
              </div>
              {user.role === "patient" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="hh-label" htmlFor="blood-group">Blood Group</label>
                    <select id="blood-group" className="hh-input" value={form.blood} onChange={set("blood")}>
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <FormInput label="Known Allergies" placeholder="e.g. Penicillin" value={form.allergies} onChange={set("allergies")} />
                </div>
              )}
              <Button variant="primary" onClick={save} disabled={saving} style={{ alignSelf: "flex-start" }}>
                {saving ? <><Spinner size={15} color="#fff" /> Saving…</> : "💾 Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY TAB */}
      {tab === "security" && (
        <div style={{ maxWidth: 500, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
            <CardHeader title="Change Password" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FormInput label="Current Password" type="password" placeholder="••••••••" value={pwForm.old} onChange={setPw("old")} />
              <FormInput label="New Password" type="password" placeholder="••••••••" value={pwForm.new} onChange={setPw("new")} />
              <FormInput label="Confirm New Password" type="password" placeholder="••••••••" value={pwForm.confirm} onChange={setPw("confirm")} />
              <Button variant="primary" onClick={changePw} disabled={savingPw} style={{ alignSelf: "flex-start" }}>
                {savingPw ? <Spinner size={15} color="#fff" /> : "🔒 Update Password"}
              </Button>
            </div>
          </div>

          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
            <CardHeader title="Security Details" />
            {[["🔐 Encryption", "AES-256 end-to-end"], ["🛡️ Authentication", "JWT + Secure sessions"], ["🔍 Audit Logging", "All actions recorded"], ["📧 2FA", "Email OTP available"]].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", background: "var(--surface2)", borderRadius: 9, fontSize: 13, marginBottom: 7 }}>
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                <span style={{ color: "var(--green)", fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BILLING TAB */}
      {tab === "billing" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>Current Plan</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Your active subscription</div>
              </div>
              <Badge type="blue" style={{ fontSize: 13, padding: "6px 16px" }}>{user.plan}</Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {[["Storage", "5 GB"], ["Records", "Unlimited"], ["Sharing", "10/month"]].map(([l, v]) => (
                <div key={l} style={{ background: "var(--surface2)", borderRadius: 11, padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 800, color: "var(--cyan)" }}>{v}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
            <CardHeader title="Payment History" />
            {payments.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "30px 0", fontSize: 13 }}>No payment history</div>
            ) : (
              <div className="hh-table-wrap">
                <table className="hh-table">
                  <thead><tr>{["Invoice", "Plan", "Amount", "Date", "Status"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td style={{ color: "var(--cyan)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{p.invoice}</td>
                        <td><Badge type="blue">{p.plan}</Badge></td>
                        <td style={{ fontWeight: 700, color: "var(--green)" }}>₹{p.amount}</td>
                        <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{p.date}</td>
                        <td><Badge type="green">{p.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
