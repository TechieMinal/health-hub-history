// ═══════════════════════════════════════════════════════
// HEALTHHUB HISTORY — Landing Page (Founder Edition)
// A world-class SaaS landing page for healthcare
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import API from "../api/client.js";

// ── DATA ──────────────────────────────────────────────

const FEATURES = [
  {
    icon: "📋",
    title: "Medical Record Vault",
    desc: "Securely store lab reports, prescriptions, radiology scans, and discharge summaries — all encrypted, all in one place.",
    color: "#00d4ff",
    bg: "rgba(0,212,255,0.08)",
  },
  {
    icon: "🔗",
    title: "Doctor Sharing",
    desc: "Share your records with verified doctors using their unique Doctor ID. Full consent control — revoke access any time.",
    color: "#00e58d",
    bg: "rgba(0,229,141,0.08)",
  },
  {
    icon: "❤️",
    title: "Vitals Tracker",
    desc: "Log blood pressure, blood sugar, heart rate, and weight over time. Visualise trends and catch changes early.",
    color: "#ff4d6b",
    bg: "rgba(255,77,107,0.08)",
  },
  {
    icon: "📅",
    title: "Appointment Management",
    desc: "Schedule, track, and manage doctor visits. Get reminders and keep a complete history of all consultations.",
    color: "#8b6fff",
    bg: "rgba(139,111,255,0.08)",
  },
  {
    icon: "💊",
    title: "E-Prescriptions",
    desc: "Doctors send digital prescriptions directly to patient vaults. No paper, no lost slips — always retrievable.",
    color: "#ffb930",
    bg: "rgba(255,185,48,0.08)",
  },
  {
    icon: "📊",
    title: "Admin Analytics",
    desc: "Platform administrators monitor user activity, verify doctors, manage plans, and review full audit logs.",
    color: "#00d4ff",
    bg: "rgba(0,212,255,0.08)",
  },
];

const STEPS = [
  { num: "01", title: "Create your account", desc: "Register as a Patient, Doctor, or Admin. Verification ensures only real healthcare professionals access sensitive data.", icon: "👤" },
  { num: "02", title: "Upload your records", desc: "Add lab reports, prescriptions, scans, and any medical documents. Everything is encrypted and categorised automatically.", icon: "📂" },
  { num: "03", title: "Share with your doctor", desc: "Enter your doctor's unique ID to grant secure access. They see only what you share — nothing more.", icon: "🔗" },
  { num: "04", title: "Track your health history", desc: "Use the timeline, vitals graphs, and medication tracker to monitor your health journey over months and years.", icon: "📈" },
];

const STATS = [
  { value: "50K+",  label: "Patients Registered" },
  { value: "8K+",   label: "Verified Doctors" },
  { value: "2M+",   label: "Records Stored" },
  { value: "99.9%", label: "Platform Uptime" },
];

const ROLES = [
  {
    role: "Patient",
    emoji: "🧑‍⚕️",
    color: "#00d4ff",
    perks: ["Upload & organise all medical records", "Share records with any verified doctor", "Track vitals & medications daily", "Full health timeline & history"],
    demo: "patient@demo.com",
  },
  {
    role: "Doctor",
    emoji: "👨‍⚕️",
    color: "#00e58d",
    perks: ["Access records patients share with you", "Issue digital e-prescriptions instantly", "Manage patient relationships securely", "Professional verified profile"],
    demo: "doctor@demo.com",
  },
  {
    role: "Admin",
    emoji: "🛡️",
    color: "#8b6fff",
    perks: ["Full platform user management", "Doctor verification workflow", "Analytics & audit logging", "Manage plans and upgrades"],
    demo: "admin@demo.com",
  },
];

const TECH_STACK = [
  { name: "React 18",        cat: "Frontend",      color: "#61dafb" },
  { name: "Node.js",         cat: "Backend",       color: "#74da7d" },
  { name: "Express.js",      cat: "Backend",       color: "#8b6fff" },
  { name: "MongoDB",         cat: "Database",      color: "#4db33d" },
  { name: "JWT Auth",        cat: "Security",      color: "#ff4d6b" },
  { name: "REST API",        cat: "Architecture",  color: "#ffb930" },
];

// ── HELPER COMPONENTS ─────────────────────────────────

function Badge({ children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.22)",
      borderRadius: 100, padding: "5px 16px", fontSize: 11, fontWeight: 700,
      color: "var(--cyan)", letterSpacing: "0.06em", textTransform: "uppercase",
    }}>{children}</span>
  );
}

function SectionHeading({ badge, title, sub, center = true }) {
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: 52 }}>
      {badge && <div style={{ marginBottom: 16 }}><Badge>{badge}</Badge></div>}
      <h2 style={{
        fontFamily: "var(--font-heading)", fontSize: "clamp(26px,3.5vw,42px)",
        fontWeight: 900, color: "var(--text)", lineHeight: 1.15, marginBottom: 14,
      }}>{title}</h2>
      {sub && (
        <p style={{
          color: "var(--text-muted)", fontSize: 16, lineHeight: 1.7,
          maxWidth: 560, margin: center ? "0 auto" : "0",
        }}>{sub}</p>
      )}
    </div>
  );
}

// ── MAIN EXPORT ────────────────────────────────────────

export default function Landing({ onStart }) {
  const [plans, setPlans] = useState([]);
  const [activeRole, setActiveRole] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    API.getPlans().then((r) => { if (r.ok) setPlans(r.plans); });
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goStart = () => { if (onStart) onStart(); };

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--text)", overflowX: "hidden" }}>

      {/* ── AMBIENT ORBS ── */}
      <div aria-hidden="true" style={{ position: "fixed", top: "-5%", left: "20%", width: 700, height: 500, background: "radial-gradient(ellipse, rgba(0,212,255,0.055) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div aria-hidden="true" style={{ position: "fixed", bottom: "10%", right: "5%", width: 500, height: 400, background: "radial-gradient(ellipse, rgba(139,111,255,0.045) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ══════════════════════════════
          NAV
      ══════════════════════════════ */}
      <nav style={{
        display: "flex", alignItems: "center",
        padding: "0 clamp(20px,4vw,56px)", height: 64,
        borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(7,16,30,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: "linear-gradient(135deg, #00d4ff, #8b6fff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 18px rgba(0,212,255,0.35)",
          }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 16, color: "var(--text)", letterSpacing: "-0.01em" }}>
            HealthHub <span style={{ color: "var(--cyan)" }}>History</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="hh-btn hh-btn-ghost" style={{ fontSize: 13, padding: "8px 18px" }} onClick={goStart}>Sign In</button>
          <button className="hh-btn hh-btn-primary" style={{ fontSize: 13, padding: "8px 18px" }} onClick={goStart}>Get Started Free →</button>
        </div>
      </nav>

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section style={{ textAlign: "center", padding: "96px clamp(20px,4vw,56px) 80px", maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 28 }}>
          <Badge>🔒 Enterprise-Grade Security · Encrypted Storage · Privacy-First</Badge>
        </div>
        <h1 style={{
          fontFamily: "var(--font-heading)", fontWeight: 900, lineHeight: 1.08,
          fontSize: "clamp(34px,5.5vw,64px)", marginBottom: 24,
          background: "linear-gradient(135deg, #ddeeff 30%, #00d4ff 65%, #8b6fff 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: "-0.02em",
        }}>
          Your Complete Medical History,<br />Secure &amp; Always Accessible
        </h1>
        <p style={{ fontSize: "clamp(15px,1.8vw,19px)", color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 600, margin: "0 auto 44px" }}>
          A modern healthcare platform where patients securely store medical records,
          track vitals, and share information with doctors — all in one encrypted vault.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 60 }}>
          <button className="hh-btn hh-btn-primary" style={{ fontSize: 15, padding: "14px 36px", borderRadius: 12 }} onClick={goStart}>
            Start Free Today →
          </button>
          <button className="hh-btn hh-btn-ghost" style={{ fontSize: 15, padding: "14px 36px", borderRadius: 12 }} onClick={goStart}>
            Try Demo Account
          </button>
        </div>

        {/* Dashboard UI Preview */}
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 24,
          textAlign: "left", maxWidth: 780, margin: "0 auto",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.06)",
        }}>
          {/* Browser chrome */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#ff4d6b","#ffb930","#00e58d"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
            </div>
            <div style={{ flex: 1, background: "var(--surface)", borderRadius: 8, padding: "5px 14px", fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
              app.healthhub.in / dashboard
            </div>
          </div>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Records",      val: "24",  color: "#00d4ff", icon: "📋" },
              { label: "Vitals Logged",val: "156", color: "#00e58d", icon: "❤️" },
              { label: "Appointments", val: "8",   color: "#8b6fff", icon: "📅" },
              { label: "Prescriptions",val: "12",  color: "#ffb930", icon: "💊" },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--surface)", borderRadius: 12, padding: "12px 14px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 16, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 20, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Records + Vitals row */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
            <div style={{ background: "var(--surface)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Recent Records</div>
              {[
                { name: "Blood CBC Report",          cat: "Lab Report",   date: "Aug 15", color: "#00d4ff" },
                { name: "Chest X-Ray",               cat: "Radiology",    date: "Jul 03", color: "#8b6fff" },
                { name: "Cardiology Prescription",   cat: "Prescription", date: "Jun 18", color: "#00e58d" },
              ].map(r => (
                <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "6px 0", borderBottom: "1px solid rgba(26,52,82,0.5)" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 12, color: "var(--text)", fontWeight: 500 }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{r.cat}</div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{r.date}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "var(--surface)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Today's Vitals</div>
              {[
                { label: "BP", val: "122/80", unit: "mmHg", color: "#ff4d6b", pct: "72%" },
                { label: "HR", val: "74",     unit: "bpm",  color: "#00e58d", pct: "60%" },
                { label: "Wt", val: "72.4",   unit: "kg",   color: "#00d4ff", pct: "55%" },
              ].map(v => (
                <div key={v.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: "var(--text-muted)" }}>{v.label}</span>
                    <span style={{ color: v.color, fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      {v.val} <span style={{ fontSize: 9, color: "var(--text-faint)" }}>{v.unit}</span>
                    </span>
                  </div>
                  <div style={{ height: 3, background: "var(--border)", borderRadius: 4 }}>
                    <div style={{ height: 3, width: v.pct, background: v.color, borderRadius: 4, opacity: 0.7 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* {/* ══════════════════════════════
          STATS STRIP
      ══════════════════════════════ 
      <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "28px clamp(20px,4vw,56px)", background: "var(--surface)" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "clamp(28px,7vw,100px)", flexWrap: "wrap", maxWidth: 900, margin: "0 auto" }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px,3vw,36px)", fontWeight: 900, color: "var(--cyan)", letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div> */}

      {/* ══════════════════════════════
          FEATURES
      ══════════════════════════════ */}
      <section id="features" style={{ maxWidth: 1100, margin: "0 auto", padding: "88px clamp(20px,4vw,56px)" }}>
        <SectionHeading
          badge="Platform Capabilities"
          title="Everything you need to manage your health"
          sub="A complete digital health platform for patients, doctors, and healthcare administrators — built to handle real-world complexity."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18,
              padding: "28px 26px", cursor: "default",
              transition: "transform 0.25s, box-shadow 0.25s, border-color 0.25s",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = f.color + "44";
                e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px ${f.color}22`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: f.bg,
                border: `1px solid ${f.color}30`, display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: 18, fontSize: 24,
              }}>{f.icon}</div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 10 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          HOW IT WORKS
      ══════════════════════════════ */}
      <section id="how-it-works" style={{ background: "var(--surface)", padding: "88px clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <SectionHeading
            badge="Getting Started"
            title="Up and running in 4 simple steps"
            sub="No complex setup. No hidden configuration. Just sign up and start building your health history."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 24 }}>
            {STEPS.map(s => (
              <div key={s.num} style={{ textAlign: "center", padding: "0 8px" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--card), var(--surface2))",
                  border: "2px solid var(--border)", display: "flex", alignItems: "center",
                  justifyContent: "center", margin: "0 auto 20px", fontSize: 28,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}>{s.icon}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cyan)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>STEP {s.num}</div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
        
      {/* ══════════════════════════════
          ARCHITECTURE
      ══════════════════════════════ 
      <section style={{ background: "var(--surface)", padding: "88px clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <SectionHeading
            badge="Architecture"
            title="Modern full-stack architecture"
            sub="Production-grade engineering across every layer — from React frontend to MongoDB persistence."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 32, alignItems: "start" }}>
            {/* Architecture diagram 
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: "28px 24px", fontFamily: "var(--font-mono)" }}>
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 20, fontWeight: 500, letterSpacing: "0.06em" }}>// SYSTEM ARCHITECTURE</div>
              {[
                { layer: "React 18 Frontend",   role: "UI + State Management",      color: "#61dafb", icon: "⚛️" },
                { layer: "REST API (Axios)",     role: "JWT Auth Interceptors",       color: "#00d4ff", icon: "🔄", arrow: true },
                { layer: "Express.js Backend",  role: "Controllers + Middleware",     color: "#74da7d", icon: "⚡", arrow: true },
                { layer: "MongoDB Atlas",        role: "Mongoose ODM",                color: "#4db33d", icon: "🍃", arrow: true },
              ].map(l => (
                <div key={l.layer}>
                  {l.arrow && <div style={{ display: "flex", justifyContent: "center", padding: "4px 0", color: "var(--text-faint)", fontSize: 12 }}>↕</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--surface)", borderRadius: 10, border: `1px solid ${l.color}22` }}>
                    <span style={{ fontSize: 18 }}>{l.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: l.color }}>{l.layer}</div>
                      <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{l.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            // Tech stack badges
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {TECH_STACK.map(t => (
                  <div key={t.name} style={{
                    background: "var(--card)", border: "1px solid var(--border)",
                    borderRadius: 12, padding: "14px 16px",
                    transition: "transform 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = ""}
                  >
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14, color: t.color, marginBottom: 4 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.cat}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "14px 18px", background: "var(--card)", border: "1px solid var(--border-light)", borderRadius: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Optional Integrations</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.8 }}>
                  <span style={{ color: "var(--text)" }}>Redis</span> caching ·{" "}
                  <span style={{ color: "var(--text)" }}>AWS S3</span> file storage ·{" "}
                  <span style={{ color: "var(--text)" }}>Razorpay</span> payments ·{" "}
                  <span style={{ color: "var(--text)" }}>SMTP</span> email notifications
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      */}

    {/* ══════════════════════════════
    PRICING (dynamic from API)
══════════════════════════════ */}
{plans.filter(p => p.active).length > 0 && (
  <section
    id="pricing"
    style={{
      maxWidth: 1100,
      margin: "0 auto",
      padding: "100px clamp(20px,4vw,56px)",
    }}
  >
    <SectionHeading
      badge="Pricing"
      title="Simple, transparent pricing"
      sub="Start free forever. Upgrade only when you need more storage or features."
    />

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 26,
        alignItems: "stretch",
      }}
    >
      {plans.filter(p => p.active).map(plan => {
        const featured = plan.name === "Premium";

        return (
          <div
            key={plan.name}
            style={{
              background: featured
                ? "linear-gradient(160deg,#101e32,#0f1a2c)"
                : "var(--card)",
              border: `1.5px solid ${
                featured ? "var(--violet)" : "var(--border)"
              }`,
              borderRadius: 20,
              padding: "28px 24px",
              position: "relative",

              /* important layout fixes */
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 430,

              /* premium highlight */
              transform: featured ? "scale(1.04)" : "scale(1)",
              boxShadow: featured
                ? "0 10px 40px rgba(139,111,255,0.25)"
                : "none",

              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = featured
                ? "scale(1.06)"
                : "translateY(-5px)";
              e.currentTarget.style.boxShadow =
                "0 24px 60px rgba(0,0,0,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = featured
                ? "scale(1.04)"
                : "";
              e.currentTarget.style.boxShadow = featured
                ? "0 10px 40px rgba(139,111,255,0.25)"
                : "none";
            }}
          >
            {/* MOST POPULAR badge */}
            {featured && (
              <div
                style={{
                  position: "absolute",
                  top: -14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background:
                    "linear-gradient(135deg,#00d4ff,#8b6fff)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "6px 18px",
                  borderRadius: 100,
                  letterSpacing: "0.06em",
                }}
              >
                ⭐ MOST POPULAR
              </div>
            )}

            {/* PLAN HEADER */}
            <div>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  fontSize: 20,
                  color: "var(--text)",
                  marginBottom: 8,
                }}
              >
                {plan.name}
              </div>

              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 32,
                  fontWeight: 800,
                  color: featured ? "var(--violet)" : "var(--cyan)",
                  marginBottom: 6,
                }}
              >
                {plan.price === 0 ? "Free" : `₹${plan.price}`}
                {plan.price > 0 && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 400,
                      color: "var(--text-faint)",
                    }}
                  >
                    /mo
                  </span>
                )}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginBottom: 22,
                  lineHeight: 1.5,
                }}
              >
                {plan.description}
              </div>

              <div
                style={{
                  height: 1,
                  background: "var(--border)",
                  marginBottom: 20,
                }}
              />
            </div>

            {/* FEATURES */}
            <div>
              {(plan.features || []).map((f, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    marginBottom: 10,
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "var(--green)",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    ✓
                  </span>
                  {f}
                </div>
              ))}
            </div>

            {/* BUTTON */}
            <button
              className={
                featured
                  ? "hh-btn hh-btn-primary"
                  : "hh-btn hh-btn-ghost"
              }
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: 24,
                fontSize: 13,
              }}
              onClick={goStart}
            >
              {plan.name === "Free"
                ? "Start Free"
                : `Try Free ${plan.trialDays || 7} Days`}
            </button>
          </div>
        );
      })}
    </div>
  </section>
)}

      {/* ══════════════════════════════
          ROLE SHOWCASE
      ══════════════════════════════ */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "88px clamp(20px,4vw,56px)" }}>
        <SectionHeading
          badge="Three Roles, One Platform"
          title="Built for every healthcare stakeholder"
          sub="Whether you're a patient, a doctor, or a hospital admin — HealthHub History has a dedicated experience for you."
        />
        {/* Role tabs */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }}>
          {ROLES.map((r, i) => (
            <button key={r.role} onClick={() => setActiveRole(i)} style={{
              background: activeRole === i ? r.color + "18" : "var(--card)",
              border: `1.5px solid ${activeRole === i ? r.color + "55" : "var(--border)"}`,
              borderRadius: 12, padding: "10px 22px", cursor: "pointer",
              color: activeRole === i ? r.color : "var(--text-muted)", fontWeight: 600,
              fontSize: 14, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
              fontFamily: "var(--font-sans)",
            }}>
              <span>{r.emoji}</span> {r.role}
            </button>
          ))}
        </div>

      {/* Active role panel */}
        {ROLES.map((r, i) => i === activeRole && (
          <div key={r.role} style={{
            background: "var(--card)", border: `1px solid ${r.color}33`,
            borderRadius: 20, padding: "36px 40px",
            display: "flex", gap: 40, flexWrap: "wrap", alignItems: "center",
            boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${r.color}08`,
          }}>
            <div style={{ fontSize: 72, lineHeight: 1 }}>{r.emoji}</div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 18 }}>
                {r.role} Dashboard
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                {r.perks.map(p => (
                  <div key={p} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
                    <span style={{ color: r.color, fontSize: 14, marginTop: 1, flexShrink: 0 }}>✓</span> {p}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <button className="hh-btn hh-btn-primary" style={{ fontSize: 13, padding: "9px 22px" }} onClick={goStart}>
                  Try as {r.role} →
                </button>
                <code style={{
                  fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-faint)",
                  background: "var(--surface)", padding: "6px 12px",
                  borderRadius: 8, border: "1px solid var(--border)",
                }}>{r.demo} / demo123</code>
              </div>
            </div>
          </div>
        ))}
      </section>


      {/* {/* ══════════════════════════════
          DEMO ACCOUNTS
      ══════════════════════════════ 
      <section style={{ background: "var(--surface)", padding: "88px clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
          <SectionHeading
            badge="Try Instantly"
            title="Live demo — no signup required"
            sub="Three pre-seeded accounts let you explore every role immediately. All demo data is realistic and fully functional."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 18 }}>
            {ROLES.map(r => (
              <div key={r.role} style={{
                background: "var(--card)", border: `1px solid ${r.color}33`,
                borderRadius: 18, padding: "28px 24px", textAlign: "left",
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{r.emoji}</div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, color: r.color, marginBottom: 16 }}>{r.role}</div>
                <div style={{ background: "var(--surface)", borderRadius: 10, padding: "10px 14px", marginBottom: 8, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  <span style={{ color: "var(--text-faint)" }}>email  </span>
                  <span style={{ color: "var(--text)" }}>{r.demo}</span>
                </div>
                <div style={{ background: "var(--surface)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  <span style={{ color: "var(--text-faint)" }}>pass   </span>
                  <span style={{ color: "var(--text)" }}>demo123</span>
                </div>
                <button
                  className="hh-btn hh-btn-ghost"
                  style={{ width: "100%", justifyContent: "center", fontSize: 13, color: r.color, borderColor: r.color + "44" }}
                  onClick={goStart}
                >
                  Login as {r.role} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ══════════════════════════════
          FINAL CTA
      ══════════════════════════════ */}
      <section style={{ padding: "96px clamp(20px,4vw,56px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(0,212,255,0.055) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🏥</div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(26px,4vw,46px)", fontWeight: 900, color: "var(--text)", lineHeight: 1.1, marginBottom: 18 }}>
            Start managing your health records securely today
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
            Join thousands of patients and doctors already using HealthHub History to simplify healthcare management across India.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="hh-btn hh-btn-primary" style={{ fontSize: 16, padding: "16px 44px", borderRadius: 13 }} onClick={goStart}>
              Create Free Account →
            </button>
            <button className="hh-btn hh-btn-ghost" style={{ fontSize: 16, padding: "16px 44px", borderRadius: 13 }} onClick={goStart}>
              Login
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FOOTER
      ══════════════════════════════ */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "36px clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 32, flexWrap: "wrap", marginBottom: 32 }}>
            <div style={{ maxWidth: 300 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #00d4ff, #8b6fff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 15 }}>HealthHub History</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
                A full-stack digital health records platform. Built with React, Node.js, Express, and MongoDB. Open source under MIT License.
              </p>
            </div>
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              {[
                { heading: "Platform",    links: ["Features", "Pricing", "Demo", "API Docs"] },
                { heading: "Tech Stack",  links: ["React 18", "Node.js + Express", "MongoDB", "JWT Auth"] },
                { heading: "Legal",       links: ["Privacy Policy", "Terms of Service", "HIPAA Compliance", "MIT License"] },
              ].map(col => (
                <div key={col.heading}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>{col.heading}</div>
                  {col.links.map(l => (
                    <div key={l} style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10, cursor: "pointer", transition: "color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                    >{l}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 12, color: "var(--text-faint)" }}>© 2025 HealthHub History · Secure Medical Records Platform · MIT License</div>
            <a href="https://github.com" target="_blank" rel="noreferrer" style={{
              fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s", textDecoration: "none",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
