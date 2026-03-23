// ═══════════════════════════════════════════════════════
// AUTH PAGE — Sign In + Register
// ═══════════════════════════════════════════════════════

import { useState } from "react";
import API from "../api/client.js";
import { Spinner, FormInput, Button } from "../components/index.jsx";

const DEMO = {
  patient: { email: "patient@demo.com", password: "demo123" },
  doctor: { email: "doctor@demo.com", password: "demo123" },
  admin: { email: "admin@demo.com", password: "demo123" },
};

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    specialty: "",
    hospital: "",
    license: "",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr("");
    setLoading(true);

    try {
      let res;

      if (mode === "login") {
        res = await API.login(form.email, form.password);
      } else {
        if (!form.name || !form.email || !form.password) {
          setErr("Please fill all required fields.");
          setLoading(false);
          return;
        }

        if (form.password.length < 6) {
          setErr("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        res = await API.register({
          name: form.name,
          email: form.email,
          password: form.password,
          role,
          specialty: form.specialty,
          hospital: form.hospital,
          license: form.license,
        });
      }

      if (!res.ok) {
        setErr(res.error || "Something went wrong.");
      } else {
        onLogin(res.user);
      }
    } catch {
      setErr("Connection error. Please try again.");
    }

    setLoading(false);
  };

  // FIXED: renamed from useDemo → applyDemo
  const applyDemo = (r) => {
    setForm((f) => ({ ...f, ...DEMO[r] }));
    setMode("login");
    setRole(r);
  };

  return (
    <div className="hh-auth-page" style={{ fontFamily: "var(--font-sans)" }}>
      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "var(--grad-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow: "0 8px 24px rgba(0,212,255,0.35)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>

          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 22,
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            Health Hub History
          </div>

          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Your secure medical records platform
          </div>
        </div>

        {/* Card */}
        <div className="hh-auth-card">
          {/* Tabs */}
          <div className="hh-tabs" style={{ marginBottom: 24 }}>
            {[
              ["login", "Sign In"],
              ["register", "Register"],
            ].map(([m, lbl]) => (
              <button
                key={m}
                className={`hh-tab ${mode === m ? "active" : ""}`}
                onClick={() => {
                  setMode(m);
                  setErr("");
                }}
              >
                {lbl}
              </button>
            ))}
          </div>

          {/* Role selector */}
          {mode === "register" && (
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {[
                ["patient", "👤", "Patient"],
                ["doctor", "🩺", "Doctor"],
              ].map(([r, ic, lbl]) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 10,
                    border: `1px solid ${
                      role === r ? "var(--cyan)" : "var(--border)"
                    }`,
                    background: role === r ? "var(--cyan-dim)" : "transparent",
                    color: role === r ? "var(--cyan)" : "var(--text-muted)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {ic} {lbl}
                </button>
              ))}
            </div>
          )}

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
            {mode === "register" && (
              <FormInput
                label="Full Name *"
                placeholder="Your full name"
                value={form.name}
                onChange={set("name")}
              />
            )}

            <FormInput
              label="Email *"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={set("email")}
            />

            <FormInput
              label="Password *"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
            />
          </div>

          {/* Error */}
          {err && (
            <div
              role="alert"
              style={{
                background: "var(--rose-dim)",
                border: "1px solid rgba(255,77,107,0.3)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12,
                color: "var(--rose)",
                marginBottom: 16,
              }}
            >
              ⚠ {err}
            </div>
          )}

          {/* Submit */}
          <Button
            variant="primary"
            onClick={submit}
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "12px 0" }}
          >
            {loading ? (
              <Spinner size={18} color="#fff" />
            ) : mode === "login" ? (
              "Sign In →"
            ) : (
              "Create Account →"
            )}
          </Button>

          {/* Demo */}
          <div
            style={{
              marginTop: 20,
              padding: 14,
              background: "var(--surface2)",
              borderRadius: 12,
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text-faint)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 10,
              }}
            >
              Try Demo Accounts
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              {[
                ["patient", "👤", "Patient"],
                ["doctor", "🩺", "Doctor"],
                ["admin", "⚙️", "Admin"],
              ].map(([r, ic, lbl]) => (
                <button
                  key={r}
                  onClick={() => applyDemo(r)}
                  style={{
                    flex: 1,
                    fontSize: 12,
                    padding: "7px 0",
                    borderRadius: 8,
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {ic} {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}