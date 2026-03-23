/**
 * ═══════════════════════════════════════════════════════════════
 * Health Hub History — Real API Client
 *
 * Every method in this file calls a real Express backend endpoint.
 * There is NO in-memory DB, NO fake data, NO localStorage "database".
 *
 * localStorage is used ONLY for JWT token storage — standard SPA
 * practice.  All application data lives in MongoDB.
 *
 * Base URL resolution order:
 *   1. VITE_API_URL       – set in frontend/.env for Vite projects
 *   2. REACT_APP_API_URL  – set in frontend/.env for CRA projects
 *   3. http://localhost:5000/api  – hard-coded dev fallback
 * ═══════════════════════════════════════════════════════════════
 */

// Supports both Vite (import.meta.env) and Create-React-App (process.env)
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

// ── JWT Token Store ───────────────────────────────────────────
// PURPOSE: Persist JWT tokens across page refreshes.
// "hhh_" prefix avoids collisions with other apps on the same origin.
//
// KEYS:
//   hhh_access_token  — short-lived (15m) JWT sent as Authorization: Bearer
//   hhh_refresh_token — long-lived (7d) JWT used to get a new access token
//   hhh_user          — cached user object (avoids an extra /auth/me call)
//
// DATA (records, vitals, meds, etc.) is NEVER stored here.
// All application data lives exclusively in MongoDB on the backend.
const TokenStore = {
  getAccess:  () => localStorage.getItem("hhh_access_token"),
  getRefresh: () => localStorage.getItem("hhh_refresh_token"),

  setTokens(access, refresh) {
    localStorage.setItem("hhh_access_token", access);
    if (refresh) localStorage.setItem("hhh_refresh_token", refresh);
  },

  clearTokens() {
    localStorage.removeItem("hhh_access_token");
    localStorage.removeItem("hhh_refresh_token");
    localStorage.removeItem("hhh_user");
  },

  getUser() {
    try { return JSON.parse(localStorage.getItem("hhh_user")); } catch { return null; }
  },
  setUser(user) { localStorage.setItem("hhh_user", JSON.stringify(user)); },
};

// ── Core HTTP wrapper ─────────────────────────────────────────
// All API methods call request().  It:
//   1. Attaches Authorization: Bearer <token> to every request
//   2. Detects TOKEN_EXPIRED 401s and silently refreshes the token
//   3. Dispatches "hhh:logout" when refresh fails (App.jsx clears state)
let _refreshPromise = null; // prevents simultaneous refresh races

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = TokenStore.getAccess();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Remove Content-Type for FormData (browser sets boundary automatically)
  if (options.body instanceof FormData) delete headers["Content-Type"];

  let res = await fetch(url, { ...options, headers });

  // Auto-refresh on 401 TOKEN_EXPIRED
  if (res.status === 401) {
    const errData = await res.clone().json().catch(() => ({}));
    if (errData.code === "TOKEN_EXPIRED") {
      if (!_refreshPromise) {
        _refreshPromise = refreshAccessToken().finally(() => { _refreshPromise = null; });
      }
      const refreshed = await _refreshPromise;
      if (refreshed) {
        // Retry original request with new token
        headers.Authorization = `Bearer ${TokenStore.getAccess()}`;
        res = await fetch(url, { ...options, headers });
      } else {
        // Refresh failed — force logout
        TokenStore.clearTokens();
        window.dispatchEvent(new Event("hhh:logout"));
        return { ok: false, error: "Session expired. Please log in again." };
      }
    }
  }

  const data = await res.json().catch(() => ({ ok: false, error: "Invalid server response" }));
  return data;
}

async function refreshAccessToken() {
  const refreshToken = TokenStore.getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (data.ok) {
      TokenStore.setTokens(data.accessToken, data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ── API Object — same interface as the old mock API ────────────
const API = {
  // ── Auth ─────────────────────────────────────────────────────
  async login(email, password) {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      TokenStore.setTokens(res.accessToken, res.refreshToken);
      TokenStore.setUser(res.user);
    }
    return res;
  },

  async register(data) {
    const res = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      TokenStore.setTokens(res.accessToken, res.refreshToken);
      TokenStore.setUser(res.user);
    }
    return res;
  },

  async logout() {
    const refreshToken = TokenStore.getRefresh();
    await request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
    TokenStore.clearTokens();
    return { ok: true };
  },

  // Returns the cached user object (avoids a round-trip on every render)
  // Use API.getCurrentUser().then() when you need the server-fresh version.
  getCachedUser() {
    return TokenStore.getUser();
  },

  // GET /api/auth/me  — fetches fresh user data from server
  async refreshUser() {
    const res = await request("/auth/me");
    if (res.ok) TokenStore.setUser(res.user);
    return res;
  },

  // ── Profile ──────────────────────────────────────────────────
  async updateProfile(data) {
    const res = await request("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (res.ok) TokenStore.setUser(res.user);
    return res;
  },

  async changePassword(oldPass, newPass) {
    return request("/users/me/password", {
      method: "PUT",
      body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
    });
  },

  // ── Records ──────────────────────────────────────────────────
  async getRecords(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "All") params.set("category", filters.category);
    if (filters.search) params.set("search", filters.search);
    const q = params.toString();
    return request(`/records${q ? "?" + q : ""}`);
  },

  async addRecord(data) {
    // If data has a file_url (base64), send as JSON (no real file upload in demo)
    // For real file uploads use FormData
    if (data._file instanceof File) {
      const form = new FormData();
      form.append("file", data._file);
      const { _file, ...rest } = data;
      form.append("data", JSON.stringify(rest));
      // Send as FormData
      return request("/records", {
        method: "POST",
        body: form,
        headers: {}, // Let browser set Content-Type with boundary
      });
    }
    return request("/records", { method: "POST", body: JSON.stringify(data) });
  },

  async updateRecord(id, data) {
    return request(`/records/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },

  async deleteRecord(id) {
    return request(`/records/${id}`, { method: "DELETE" });
  },

  // ── Vitals ───────────────────────────────────────────────────
  async getVitals() {
    return request("/vitals");
  },

  async addVital(data) {
    return request("/vitals", { method: "POST", body: JSON.stringify(data) });
  },

  async deleteVital(id) {
    return request(`/vitals/${id}`, { method: "DELETE" });
  },

  // ── Medications ──────────────────────────────────────────────
  async getMeds() {
    return request("/medications");
  },

  async addMed(data) {
    return request("/medications", { method: "POST", body: JSON.stringify(data) });
  },

  async updateMed(id, data) {
    return request(`/medications/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },

  async deleteMed(id) {
    return request(`/medications/${id}`, { method: "DELETE" });
  },

  // ── Appointments ─────────────────────────────────────────────
  async getAppts() {
    return request("/appointments");
  },

  async addAppt(data) {
    return request("/appointments", { method: "POST", body: JSON.stringify(data) });
  },

  async updateAppt(id, data) {
    return request(`/appointments/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },

  async cancelAppt(id) {
    return request(`/appointments/${id}/cancel`, { method: "PATCH" });
  },

  // ── Doctor Sharing ───────────────────────────────────────────
  async getShares() {
    return request("/shares");
  },

  async addShare(data) {
    return request("/shares", { method: "POST", body: JSON.stringify(data) });
  },

  async revokeShare(id) {
    return request(`/shares/${id}/revoke`, { method: "PATCH" });
  },

  async findDoctor(doctorId) {
    return request(`/shares/find-doctor/${doctorId}`);
  },

  // ── Doctor — Patients & Shared Records ───────────────────────
  async getDoctorPatients() {
    return request("/prescriptions/patients");
  },

  async getSharedRecords() {
    return request("/shares/doctor-records");
  },

  // ── Timeline ─────────────────────────────────────────────────
  async getTimeline() {
    // Timeline is built from records — same endpoint, different processing
    const res = await request("/records?limit=100");
    if (!res.ok) return res;
    const iconMap = { Prescription: "💊", "Lab Report": "🧪", Radiology: "🩻", Discharge: "🏥", Vaccination: "💉", Bill: "🧾", Other: "📄" };
    const colorMap = { Prescription: "#00cfff", "Lab Report": "#00e59e", Radiology: "#9b6dff", Discharge: "#ffb347", Vaccination: "#00e59e", Bill: "#ff5b6e", Other: "#6a8faf" };
    const events = (res.records || []).map((r) => ({
      date: r.date, icon: iconMap[r.category] || "📄", title: r.name,
      hospital: r.hospital, doctor: r.doctor, type: r.category,
      diagnosis: r.diagnosis, color: colorMap[r.category] || "#6a8faf",
    }));
    return { ok: true, events };
  },

  // ── Prescriptions ────────────────────────────────────────────
  async getPrescriptions() {
    return request("/prescriptions");
  },

  async addPrescription(data) {
    return request("/prescriptions", { method: "POST", body: JSON.stringify(data) });
  },

  // ── Plans & Payments ─────────────────────────────────────────
  async getPlans() {
    return request("/payments/plans");
  },

  async getPayments() {
    return request("/payments");
  },

  async getAllPayments() {
    return request("/admin/payments");
  },

  async initiatePayment(planName, amount) {
    return request("/payments/create-order", {
      method: "POST",
      body: JSON.stringify({ plan: planName, amount }),
    });
  },

  async confirmPayment(planName, amount, verifyData) {
    // verifyData contains razorpay_order_id, razorpay_payment_id, razorpay_signature
    // In demo mode (no Razorpay), we pass dummy values
    const body = verifyData || {
      razorpay_order_id: `demo_order_${Date.now()}`,
      razorpay_payment_id: `demo_pay_${Date.now()}`,
      razorpay_signature: "demo_signature",
      plan: planName,
      amount,
    };
    const res = await request("/payments/verify", { method: "POST", body: JSON.stringify(body) });
    if (res.ok) {
      // Update cached user with new plan
      const user = TokenStore.getUser();
      if (user) TokenStore.setUser({ ...user, plan: planName });
    }
    return res;
  },

  // ── Upgrades ─────────────────────────────────────────────────
  async getUpgrades() {
    return request("/admin/upgrades");
  },

  async requestUpgrade(from, to) {
    return request("/payments/upgrade", { method: "POST", body: JSON.stringify({ from, to }) });
  },

  async processUpgrade(id, action) {
    return request(`/admin/upgrades/${id}`, { method: "PATCH", body: JSON.stringify({ action }) });
  },

  // ── Admin ────────────────────────────────────────────────────
  async getUsers(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return request(`/admin/users${params ? "?" + params : ""}`);
  },

  async updateUser(id, data) {
    return request(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  async deleteUser(id) {
    return request(`/admin/users/${id}`, { method: "DELETE" });
  },

  async getAnalytics() {
    return request("/admin/analytics");
  },

  async getAuditLogs() {
    return request("/admin/audit-logs");
  },

  async updatePlan(id, data) {
    return request(`/admin/plans/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
};

export { API, TokenStore };
export default API;
