<div align="center">

<img src="https://img.shields.io/badge/HealthHub-History-00d4ff?style=for-the-badge&logo=heart&logoColor=white" alt="HealthHub History" />

# 🏥 HealthHub History
### Full-Stack Digital Health Records Platform

**A production-grade healthcare SaaS application where patients securely store medical records, track vitals, and share data with doctors — built with React, Node.js/Express, and MongoDB.**

<br />

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<br />

[**→ View Live Demo**](#-demo-credentials) · [**→ Quick Start**](#-quick-start) · [**→ API Docs**](#-api-reference) · [**→ Architecture**](#-architecture)

</div>

---

## 📖 Overview

HealthHub History is a **complete digital healthcare platform** that solves a real-world problem: fragmented, paper-based medical records that patients can never access when they need them most.

The platform provides three distinct, role-specific experiences:

| Role | What they can do |
|------|-----------------|
| **Patient** | Upload & organise medical records, track vitals/medications, share records with doctors, view health timeline |
| **Doctor** | Access patient-shared records, issue e-prescriptions, manage patient list, professional verified profile |
| **Admin** | User management, doctor verification, platform analytics, billing plan management, full audit logs |

> **Built for India's healthcare ecosystem** — supports INR payments via Razorpay, Indian phone number formats, and regional hospitals.

---

## ✨ Key Features

### For Patients
- **Medical Record Vault** — Encrypted storage for lab reports, radiology scans, prescriptions, discharge summaries, vaccination certificates
- **Doctor Sharing System** — Share specific records with verified doctors via unique Doctor ID; revoke access anytime
- **Health Timeline** — Chronological view of complete medical history
- **Vitals Tracker** — Daily logs for BP, blood sugar, heart rate, weight, SpO₂, temperature with trend visualisation
- **Medication Tracker** — Active/inactive medications with dosage, frequency, and low-stock alerts
- **Appointment Management** — Schedule and track doctor visits with status (scheduled/completed/cancelled)

### For Doctors
- **Patient Records Access** — View records patients have explicitly shared
- **E-Prescriptions** — Issue digital prescriptions sent directly to patient vault
- **Patient List** — Manage all patients who have shared data
- **Verified Profile** — Medical license verification through admin workflow

### For Admins
- **User Management** — View, edit, suspend, or delete any user account
- **Doctor Verification** — Approve or reject doctor license applications
- **Analytics Dashboard** — Platform-wide metrics: registrations, records, prescriptions, revenue
- **Billing Plan Management** — Create, modify, and deactivate subscription plans
- **Audit Logs** — Full audit trail of all user actions across the platform

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER / APP                      │
│                                                              │
│   React 18 Frontend (Vite / CRA)                            │
│   ├── src/api/client.js  ← Real fetch() + JWT interceptors  │
│   ├── Role-based routing (patient / doctor / admin)         │
│   ├── Sora + DM Sans design system                          │
│   └── Dark-mode-first UI with CSS variables                 │
└───────────────────┬─────────────────────────────────────────┘
                    │  HTTPS REST API
                    │  Authorization: Bearer <JWT>
┌───────────────────▼─────────────────────────────────────────┐
│                  EXPRESS.JS BACKEND (:5000)                  │
│                                                              │
│   Middleware Stack                                           │
│   ├── helmet + cors + morgan                                 │
│   ├── express-rate-limit                                     │
│   ├── JWT authMiddleware (verify + refresh)                  │
│   ├── roleMiddleware (patient / doctor / admin guards)       │
│   └── multer uploadMiddleware (file handling)                │
│                                                              │
│   Route → Controller → Service pattern                      │
│   /api/auth        /api/records      /api/vitals            │
│   /api/medications /api/appointments /api/shares            │
│   /api/prescriptions /api/payments   /api/admin             │
└───────────────────┬─────────────────────────────────────────┘
                    │  Mongoose ODM
┌───────────────────▼─────────────────────────────────────────┐
│                     MONGODB ATLAS                            │
│   Collections: users · records · vitals · medications       │
│   appointments · shares · prescriptions · payments          │
│   plans · audit_logs · upgrades · notifications             │
└─────────────────────────────────────────────────────────────┘

Optional Services (graceful fallback if not configured):
   Redis  ─── Session caching & rate limit storage
   AWS S3 ─── File upload storage
   Razorpay ─ Payment processing
   SMTP ───── Email notifications
```

---

## 🔐 Authentication Flow

```
1.  POST /api/auth/login
    └── Returns { accessToken (15m TTL), refreshToken (7d TTL), user }

2.  Frontend stores tokens via TokenStore (localStorage)

3.  Every API request includes:
    Authorization: Bearer <accessToken>

4.  On 401 TOKEN_EXPIRED:
    └── POST /api/auth/refresh (sends refreshToken cookie)
    └── Gets new accessToken → retries original request transparently

5.  On logout:
    └── POST /api/auth/logout → token blacklisted in Redis/in-memory
    └── localStorage cleared
```

Role-based access is enforced at the route level:
```javascript
// Doctor-only route example
router.get("/doctor-records", auth, role("doctor"), getDoctorSharedRecords);
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **MongoDB** (Atlas free tier or local)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/healthhub-history.git
cd healthhub-history
```

### 2. Install all dependencies
```bash
npm run install:all
```

### 3. Configure the backend environment
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your values:
```env
# Required
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxx.mongodb.net/healthhub
JWT_ACCESS_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<generate another one>
NODE_ENV=development
PORT=5000

# Optional — platform works without these (graceful fallbacks)
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=false

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

### 4. Seed the database with demo data
```bash
npm run seed
```

This creates **demo accounts** and populates the database with realistic sample data:

| Role    | Email                | Password | What's pre-loaded |
|---------|----------------------|----------|-------------------|
| Patient | patient@demo.com     | demo123  | 8 records, 14 vitals, 6 medications, 5 appointments |
| Doctor  | doctor@demo.com      | demo123  | 2 prescriptions, verified profile |
| Admin   | admin@demo.com       | demo123  | Full analytics access |

### 5. Start both servers
```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |
| API Docs | http://localhost:5000/api/docs |

---

## 🎭 Demo Credentials

> **No account creation needed** — use these to explore all three roles instantly.

```
Patient:  patient@demo.com  /  demo123
Doctor:   doctor@demo.com   /  demo123
Admin:    admin@demo.com    /  demo123
```

The demo patient account comes pre-loaded with:
- Blood CBC, Chest X-Ray, MRI Brain, ECG, Lipid Profile, COVID Vaccine Certificate, Discharge Summary, and Cardiology Prescription
- 14 days of vitals history (BP, sugar, HR, weight, SpO₂)
- Active medications: Amlodipine, Metformin, Ferrous Sulphate, Aspirin
- 2 upcoming appointments, 3 past appointments
- Active share with demo Doctor account
- 2 e-prescriptions from demo Doctor

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create new account | None |
| POST | `/api/auth/login` | Login → JWT tokens | None |
| POST | `/api/auth/logout` | Logout (blacklist token) | Required |
| GET | `/api/auth/me` | Get current user profile | Required |
| POST | `/api/auth/refresh` | Refresh access token | Refresh token |

### Medical Records
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/records` | List own records | Patient, Doctor |
| POST | `/api/records` | Upload new record | Patient |
| PUT | `/api/records/:id` | Update record metadata | Patient |
| DELETE | `/api/records/:id` | Delete record | Patient |

### Vitals, Medications, Appointments
Same REST pattern under `/api/vitals`, `/api/medications`, `/api/appointments` — all support full CRUD for the authenticated patient.

### Doctor Sharing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shares` | List patient's shares |
| POST | `/api/shares` | Share records with a doctor |
| PATCH | `/api/shares/:id/revoke` | Revoke doctor access |
| GET | `/api/shares/find-doctor/:doctorId` | Look up doctor by ID |
| GET | `/api/shares/doctor-records` | Doctor: see shared patient records |

### Prescriptions
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/prescriptions` | List prescriptions | Patient, Doctor |
| POST | `/api/prescriptions` | Issue prescription | Doctor |
| PATCH | `/api/prescriptions/:id` | Update status | Doctor |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | All users with filters |
| PATCH | `/api/admin/users/:id` | Update user (suspend, verify, etc.) |
| GET | `/api/admin/analytics` | Platform-wide metrics |
| GET | `/api/admin/audit-logs` | Full audit trail |
| GET | `/api/admin/upgrades` | Pending upgrade requests |
| GET | `/api/admin/plans` | All pricing plans |
| POST | `/api/admin/plans` | Create plan |

---

## 📁 Project Structure

```
healthhub-history/
│
├── frontend/                        ← React 18 app (:3000)
│   ├── public/index.html
│   └── src/
│       ├── api/
│       │   └── client.js            ★ Fetch-based API client with JWT
│       ├── components/
│       │   ├── index.jsx            Reusable UI primitives
│       │   └── ChatBot.jsx          In-app assistant
│       ├── hooks/
│       │   └── useNotifs.js         Toast notification system
│       ├── layout/
│       │   ├── Sidebar.jsx
│       │   └── Topbar.jsx
│       ├── pages/
│       │   ├── Landing.jsx          ★ Marketing landing page
│       │   ├── Auth.jsx             Login / Register
│       │   ├── patient/
│       │   │   ├── PatientDashboard.jsx
│       │   │   ├── MedicalVault.jsx
│       │   │   └── PatientPages.jsx  (Vitals, Meds, Appointments, Share, Timeline)
│       │   ├── doctor/
│       │   │   └── DoctorPages.jsx   (Dashboard, Patients, Prescriptions)
│       │   ├── admin/
│       │   │   └── AdminPages.jsx    (Dashboard, Users, Analytics, Plans, Logs)
│       │   └── shared/
│       │       └── Profile.jsx
│       ├── styles/
│       │   └── globals.css          Design system (CSS variables, components)
│       └── App.jsx                  ★ Root app + routing
│
├── backend/                         ← Express API (:5000)
│   └── src/
│       ├── config/
│       │   ├── database.js          MongoDB connection
│       │   ├── redis.js             Redis + in-memory fallback
│       │   ├── s3.js                AWS S3 stub
│       │   └── razorpay.js          Razorpay stub
│       ├── controllers/             Business logic layer
│       │   ├── authController.js
│       │   ├── recordController.js
│       │   ├── vitalController.js
│       │   ├── medicationController.js
│       │   ├── appointmentController.js
│       │   ├── shareController.js
│       │   ├── prescriptionController.js
│       │   ├── paymentController.js
│       │   ├── adminController.js
│       │   └── analyticsController.js
│       ├── middleware/
│       │   ├── authMiddleware.js    JWT verification
│       │   ├── roleMiddleware.js    Role-based guards
│       │   ├── rateLimiter.js       express-rate-limit
│       │   ├── uploadMiddleware.js  multer config
│       │   ├── validationMiddleware.js
│       │   └── errorHandler.js
│       ├── models/                  Mongoose schemas
│       │   ├── User.js              (patient / doctor / admin)
│       │   ├── Record.js
│       │   ├── Vital.js
│       │   ├── Medication.js
│       │   ├── Appointment.js
│       │   ├── Share.js
│       │   ├── Prescription.js
│       │   ├── Payment.js
│       │   ├── Plan.js
│       │   ├── Upgrade.js
│       │   ├── AuditLog.js
│       │   └── Notification.js
│       ├── routes/                  Express routers
│       ├── services/
│       │   ├── emailService.js
│       │   ├── paymentService.js
│       │   ├── fileService.js
│       │   └── analyticsService.js
│       ├── utils/
│       │   ├── seedDatabase.js      ★ Demo data seeder
│       │   └── logger.js
│       ├── app.js                   Express app setup
│       └── server.js                Entry point
│
└── package.json                     Root (runs both with concurrently)
```

---

## 🛠 Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React 18 | Hooks-based, no Redux |
| **Routing** | Custom state router | Lightweight, no react-router |
| **Fonts** | Sora + DM Sans + DM Mono | Google Fonts |
| **HTTP Client** | Fetch API (custom wrapper) | JWT interceptors, auto-refresh |
| **Backend** | Node.js 18 + Express 4 | REST API |
| **Database** | MongoDB Atlas | Mongoose ODM |
| **Auth** | JWT (access + refresh tokens) | Token blacklist via Redis |
| **File Storage** | AWS S3 (optional) | multer for local fallback |
| **Cache** | Redis (optional) | In-memory fallback included |
| **Payments** | Razorpay (optional) | Demo mode without keys |
| **Email** | Nodemailer + SMTP | Console logging fallback |
| **Rate Limiting** | express-rate-limit | Per-IP + per-user |
| **Logging** | Winston | Structured JSON logs |
| **Security** | helmet, cors, bcryptjs | Industry standard |

---

## ⚙️ Available Scripts

### Root (runs both servers concurrently)
```bash
npm run dev          # Start both frontend and backend in dev mode
npm run seed         # Seed database with demo data
npm run install:all  # Install dependencies in all workspaces
```

### Backend (`cd backend`)
```bash
npm run dev    # nodemon src/server.js
npm start      # node src/server.js (production)
npm run seed   # node src/utils/seedDatabase.js
```

### Frontend (`cd frontend`)
```bash
npm start      # React dev server on :3000
npm run build  # Production build
```

---

## 🔒 Security Highlights

- **JWT with short TTL** — access tokens expire in 15 minutes
- **Refresh token rotation** — issued as HttpOnly cookies
- **Token blacklisting** — logout invalidates tokens server-side
- **bcryptjs** — passwords hashed with configurable salt rounds (default: 10)
- **Role guards** — every route protected by `auth` + `role()` middleware
- **Rate limiting** — 100 req/15min per IP on all endpoints
- **CORS** — explicit origin whitelist
- **Helmet** — sets secure HTTP headers
- **Input validation** — express-validator on all mutation endpoints

---

## 🌱 Environment Variables Reference

### Required
```env
MONGODB_URI          # MongoDB connection string
JWT_ACCESS_SECRET    # 64-byte hex string
JWT_REFRESH_SECRET   # 64-byte hex string (different from above)
```

### Optional (platform works without these)
```env
PORT                 # Default: 5000
NODE_ENV             # development | production
BCRYPT_ROUNDS        # Default: 10

REDIS_URL            # Default: disabled (in-memory fallback)
REDIS_ENABLED        # true | false

AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_S3_BUCKET

RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET

SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
FROM_EMAIL
```

---

## 🗺 Roadmap

- [ ] AI-powered health insights (OpenAI integration)
- [ ] PDF export for medical records
- [ ] Family profiles / dependent accounts
- [ ] WhatsApp notifications via Twilio
- [ ] Video consultation booking
- [ ] ABDM (Ayushman Bharat Digital Mission) integration
- [ ] React Native mobile app

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

Built and maintained as a full-stack portfolio project.

If you found this useful, a ⭐ on GitHub is appreciated!

---

<div align="center">
<sub>Built with ❤️ using React · Node.js · Express · MongoDB</sub>
</div>
