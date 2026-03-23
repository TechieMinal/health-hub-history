// ═══════════════════════════════════════════════════════
// HEALTH HUB HISTORY — Root App (Redesigned)
// ═══════════════════════════════════════════════════════

import { useState, useEffect, createContext, useContext } from "react";
import API from "./api/client.js";

// Styles
import "./styles/globals.css";

// Auth
import Auth from "./pages/Auth.jsx";

// Layout
import Sidebar from "./layout/Sidebar.jsx";
import Topbar from "./layout/Topbar.jsx";

// Notifications
import { useNotifs, Notifs } from "./hooks/useNotifs.js";

// Shared pages
import Landing from "./pages/Landing.jsx";
import Profile from "./pages/shared/Profile.jsx";

// Patient pages
import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import MedicalVault from "./pages/patient/MedicalVault.jsx";
import {
  ShareRecords, HealthTimeline, VitalsTracker, Medications, Appointments,
} from "./pages/patient/PatientPages.jsx";

// Doctor pages
import { DoctorDashboard, DoctorPatients, EPrescriptions } from "./pages/doctor/DoctorPages.jsx";

// Admin pages
import { AdminDashboard, UserManagement, Analytics, PlanManagement, AuditLogs } from "./pages/admin/AdminPages.jsx";

// ChatBot
import ChatBot from "./components/ChatBot.jsx";

// ── AUTH CONTEXT ─────────────────────────────────────
const AuthCtx = createContext(null);
export function useAuth() { return useContext(AuthCtx); }

// ── APP SHELL ─────────────────────────────────────────
function AppShell({ user, page, setPage, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar user={user} page={page} setPage={setPage} onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden", minWidth: 0 }}>
        <Topbar user={user} page={page} setPage={setPage} onMenuClick={() => setSidebarOpen(o => !o)} />
        <main style={{ flex: 1, overflowY: "auto" }} id="main-content">
          {children}
        </main>
      </div>
      <ChatBot />
    </div>
  );
}

// ── ROUTE RENDERER ────────────────────────────────────
function renderPage(user, page, props) {
  if (user?.role === "patient") {
    if (page === "dashboard")    return <PatientDashboard {...props} />;
    if (page === "vault")        return <MedicalVault {...props} />;
    if (page === "timeline")     return <HealthTimeline {...props} />;
    if (page === "share")        return <ShareRecords {...props} />;
    if (page === "vitals")       return <VitalsTracker {...props} />;
    if (page === "medications")  return <Medications {...props} />;
    if (page === "appointments") return <Appointments {...props} />;
    if (page === "profile")      return <Profile {...props} />;
  }
  if (user?.role === "doctor") {
    if (page === "dashboard")    return <DoctorDashboard {...props} />;
    if (page === "patients")     return <DoctorPatients {...props} />;
    if (page === "vault")        return <MedicalVault {...props} />;
    if (page === "prescriptions")return <EPrescriptions {...props} />;
    if (page === "profile")      return <Profile {...props} />;
  }
  if (user?.role === "admin") {
    if (page === "dashboard")    return <AdminDashboard {...props} />;
    if (page === "users")        return <UserManagement {...props} />;
    if (page === "analytics")    return <Analytics {...props} />;
    if (page === "plans")        return <PlanManagement {...props} />;
    if (page === "logs")         return <AuditLogs {...props} />;
    if (page === "profile")      return <Profile {...props} />;
  }
  return <PatientDashboard {...props} />;
}

// ── ROOT APP ─────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const { list, add: notify, rm } = useNotifs();

  useEffect(() => {
    const u = API.getCachedUser();
    const token = localStorage.getItem("hhh_access_token");
    if (u && token) { setUser(u); setScreen("app"); }
    const onForceLogout = () => { setUser(null); setScreen("landing"); notify("Session expired", "Please sign in again.", "warning"); };
    window.addEventListener("hhh:logout", onForceLogout);
    return () => window.removeEventListener("hhh:logout", onForceLogout);
  }, []);

  const login = (u) => { setUser(u); setScreen("app"); setPage("dashboard"); notify("Welcome back!", `Signed in as ${u.name}`, "success"); };
  const logout = async () => { await API.logout(); setUser(null); setScreen("landing"); notify("Signed out", "See you soon!", "info"); };

  return (
    <AuthCtx.Provider value={{ user, notify }}>
      <style>{`
        @media (max-width: 768px) {
          .hh-sidebar { display: flex; }
          #hh-menu-mobile { display: flex !important; }
          .hh-desktop-only { display: none !important; }
        }
        @media (min-width: 769px) {
          .hh-sidebar { transform: translateX(0) !important; }
        }
      `}</style>

      {screen === "landing" && <><Landing onStart={() => setScreen("auth")} /><Notifs list={list} rm={rm} /></>}
      {screen === "auth" && <><Auth onLogin={login} /><Notifs list={list} rm={rm} /></>}
      {screen === "app" && user && (
        <>
          <AppShell user={user} page={page} setPage={setPage} onLogout={logout}>
            {renderPage(user, page, { user, notify, setPage })}
          </AppShell>
          <Notifs list={list} rm={rm} />
        </>
      )}
    </AuthCtx.Provider>
  );
}
