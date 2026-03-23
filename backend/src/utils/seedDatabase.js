/**
 * HealthHub History — Seed Database
 * ═══════════════════════════════════════════════════════
 * Creates demo users, pricing plans, and a rich set of
 * realistic sample data so the platform looks active and
 * fully functional for recruiter / portfolio demos.
 *
 * Run:  npm run seed    (from /backend or root)
 *
 * Demo credentials after seed:
 *   patient@demo.com  / demo123   → Patient: Rahul Sharma
 *   doctor@demo.com   / demo123   → Doctor:  Dr. Kavya Sharma (Cardiology)
 *   admin@demo.com    / demo123   → Admin:   Admin User
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const connectDB = require("../config/database");

// ── MODELS ────────────────────────────────────────────
const User         = require("../models/User");
const Record       = require("../models/Record");
const Vital        = require("../models/Vital");
const Medication   = require("../models/Medication");
const Appointment  = require("../models/Appointment");
const Share        = require("../models/Share");
const Prescription = require("../models/Prescription");
const Plan         = require("../models/Plan");
const Payment      = require("../models/Payment");
const AuditLog     = require("../models/AuditLog");

// ── HELPERS ───────────────────────────────────────────
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

// ── SEED ──────────────────────────────────────────────
const seed = async () => {
  await connectDB();
  console.log("\n🌱  HealthHub History — Seeding database...\n");

  const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  const pw = await bcrypt.hash("demo123", ROUNDS);

  // ── 1. PLANS ─────────────────────────────────────────
  await Plan.deleteMany({});
  await Plan.insertMany([
    {
      name: "Free",
      price: 0,
      currency: "INR",
      storage: 1,
      records: 10,
      shares: 2,
      active: true,
      trialDays: 0,
      description: "Perfect for getting started",
      features: ["10 medical records", "1 GB encrypted storage", "2 doctor shares/month", "Vitals tracking", "Community support"],
    },
    {
      name: "Basic",
      price: 99,
      currency: "INR",
      storage: 5,
      records: 50,
      shares: 10,
      active: true,
      trialDays: 7,
      description: "Great for regular patients",
      features: ["50 medical records", "5 GB encrypted storage", "10 doctor shares/month", "Health timeline", "Medication tracker", "Email support"],
    },
    {
      name: "Premium",
      price: 299,
      currency: "INR",
      storage: 25,
      records: 999999,
      shares: 9999,
      active: true,
      trialDays: 14,
      description: "For power users & families",
      features: ["Unlimited records", "25 GB encrypted storage", "Unlimited doctor shares", "AI health insights", "Priority support", "Family profiles (3 members)", "Export as PDF"],
    },
    {
      name: "Hospital",
      price: 2999,
      currency: "INR",
      storage: 1000,
      records: 999999,
      shares: 999999,
      active: true,
      trialDays: 30,
      description: "Enterprise for clinics & hospitals",
      features: ["Everything in Premium", "1 TB storage", "Unlimited family profiles", "REST API access", "Custom branding", "Bulk patient import", "Dedicated account manager", "SLA guarantee"],
    },
  ]);
  console.log("✅  Plans seeded (Free / Basic / Premium / Hospital)");

  // ── 2. DEMO USERS ─────────────────────────────────────
  await User.deleteMany({
    email: { $in: ["patient@demo.com", "doctor@demo.com", "admin@demo.com", "dr.mehta@hospital.com", "dr.iyer@apollo.com"] },
  });

  const patient = await User.create({
    name: "Rahul Sharma",
    email: "patient@demo.com",
    password: pw,
    role: "patient",
    avatar: "👤",
    phone: "+91 9876543210",
    dob: "1988-04-12",
    gender: "Male",
    blood: "B+",
    allergies: "Penicillin, Dust mites",
    address: "42, Laxmi Nagar, New Delhi — 110092",
    emergency_contact: "Priya Sharma · +91 9876500000",
    plan: "Basic",
    storage_used: 1.8,
    status: "active",
    verified: true,
  });

  const doctor = await User.create({
    name: "Dr. Kavya Sharma",
    email: "doctor@demo.com",
    password: pw,
    role: "doctor",
    avatar: "🩺",
    phone: "+91 9871234560",
    specialty: "Cardiologist",
    hospital: "Apollo Hospital, Delhi",
    license: "MCI/2021/98765",
    doctor_id: "DOC001",
    plan: "Premium",
    status: "verified",
    verified: true,
    bio: "Senior Cardiologist with 12 years of experience in interventional cardiology. MBBS from AIIMS Delhi, DM Cardiology from PGI Chandigarh.",
  });

  await User.create({
    name: "Admin User",
    email: "admin@demo.com",
    password: pw,
    role: "admin",
    avatar: "⚙️",
    phone: "+91 9000000001",
    plan: "Admin",
    status: "active",
    verified: true,
  });

  // Extra doctors to make the platform feel alive
  const drMehta = await User.create({
    name: "Dr. Ramesh Mehta",
    email: "dr.mehta@hospital.com",
    password: pw,
    role: "doctor",
    avatar: "🩺",
    phone: "+91 9123456789",
    specialty: "Neurologist",
    hospital: "AIIMS Delhi",
    license: "MCI/2020/12345",
    doctor_id: "DOC002",
    plan: "Premium",
    status: "pending_verification",
    verified: false,
  });

  await User.create({
    name: "Dr. Sunita Iyer",
    email: "dr.iyer@apollo.com",
    password: pw,
    role: "doctor",
    avatar: "🩺",
    phone: "+91 9988776655",
    specialty: "General Physician",
    hospital: "Apollo Hospital, Chennai",
    license: "TN/MCI/2019/54321",
    doctor_id: "DOC003",
    plan: "Basic",
    status: "verified",
    verified: true,
  });

  console.log("✅  Demo users seeded");
  console.log("    patient@demo.com  / demo123");
  console.log("    doctor@demo.com   / demo123");
  console.log("    admin@demo.com    / demo123\n");

  // ── 3. MEDICAL RECORDS ────────────────────────────────
  await Record.deleteMany({ user_id: patient._id });

  const records = await Record.insertMany([
    {
      user_id: patient._id,
      name: "Complete Blood Count (CBC)",
      category: "Lab Report",
      hospital: "Apollo Hospital, Delhi",
      doctor: "Dr. Kavya Sharma",
      date: daysAgo(14),
      diagnosis: "Iron Deficiency Anaemia — Haemoglobin 9.8 g/dL",
      notes: "Follow-up in 4 weeks. Iron supplementation prescribed.",
      tags: ["blood", "haemoglobin", "anaemia", "CBC"],
      shared: true,
      size: "1.2 MB",
      file_type: "PDF",
    },
    {
      user_id: patient._id,
      name: "Chest X-Ray PA View",
      category: "Radiology",
      hospital: "Fortis Healthcare, Gurugram",
      doctor: "Dr. Ravi Verma",
      date: daysAgo(42),
      diagnosis: "No active disease. Lungs clear.",
      notes: "Routine annual check-up.",
      tags: ["xray", "chest", "radiology", "annual"],
      shared: false,
      size: "4.8 MB",
      file_type: "DICOM",
    },
    {
      user_id: patient._id,
      name: "Cardiology Consultation & Prescription",
      category: "Prescription",
      hospital: "AIIMS Delhi",
      doctor: "Dr. Kavya Sharma",
      date: daysAgo(60),
      diagnosis: "Hypertension Stage 1 — BP 148/92 mmHg",
      notes: "Lifestyle modification advised. Amlodipine 5mg initiated.",
      tags: ["heart", "bp", "hypertension", "prescription"],
      shared: true,
      size: "245 KB",
      file_type: "PDF",
    },
    {
      user_id: patient._id,
      name: "MRI Brain — Axial & Sagittal Cuts",
      category: "Radiology",
      hospital: "Medanta — The Medicity",
      doctor: "Dr. Ramesh Mehta",
      date: daysAgo(90),
      diagnosis: "No abnormality detected. White matter unremarkable.",
      notes: "Ordered to rule out migraine-related lesions.",
      tags: ["mri", "brain", "neurology", "scan"],
      shared: false,
      size: "18.3 MB",
      file_type: "DICOM",
    },
    {
      user_id: patient._id,
      name: "Lipid Profile & HbA1c",
      category: "Lab Report",
      hospital: "SRL Diagnostics",
      doctor: "Dr. Sunita Iyer",
      date: daysAgo(21),
      diagnosis: "Total Cholesterol 218 mg/dL. HbA1c 5.9% (Pre-diabetic range).",
      notes: "Dietary counselling recommended. Repeat in 3 months.",
      tags: ["cholesterol", "diabetes", "lipid", "HbA1c"],
      shared: true,
      size: "890 KB",
      file_type: "PDF",
    },
    {
      user_id: patient._id,
      name: "COVID-19 Vaccination Certificate",
      category: "Vaccination",
      hospital: "Delhi Govt. Vaccination Centre",
      doctor: "Nurse Rajni Kapoor",
      date: daysAgo(365),
      diagnosis: "Covishield — Dose 2 complete. Booster received.",
      notes: "Certificate valid for international travel.",
      tags: ["covid", "vaccine", "covishield", "certificate"],
      shared: false,
      size: "120 KB",
      file_type: "PDF",
    },
    {
      user_id: patient._id,
      name: "Discharge Summary — Appendectomy",
      category: "Discharge Summary",
      hospital: "Max Super Speciality Hospital",
      doctor: "Dr. Anil Gupta",
      date: daysAgo(400),
      diagnosis: "Acute appendicitis. Laparoscopic appendectomy performed successfully.",
      notes: "Discharged after 2 days. No complications. Follow-up at 10 days.",
      tags: ["surgery", "appendix", "discharge", "laparoscopy"],
      shared: false,
      size: "2.1 MB",
      file_type: "PDF",
    },
    {
      user_id: patient._id,
      name: "ECG Report — 12-Lead",
      category: "Diagnostic",
      hospital: "Apollo Hospital, Delhi",
      doctor: "Dr. Kavya Sharma",
      date: daysAgo(7),
      diagnosis: "Normal sinus rhythm. HR 72 bpm. No ST changes.",
      notes: "Routine pre-medication ECG.",
      tags: ["ecg", "heart", "cardiology", "rhythm"],
      shared: true,
      size: "320 KB",
      file_type: "PDF",
    },
  ]);
  console.log(`✅  ${records.length} medical records seeded`);

  // ── 4. VITALS ─────────────────────────────────────────
  await Vital.deleteMany({ user_id: patient._id });

  const vitalsData = [
    // Last 14 days — realistic variation
    { d: 0,  bp: "122/80", sugar: "98",  hr: "74", wt: "72.4", spo2: "98", temp: "98.6" },
    { d: 1,  bp: "119/78", sugar: "102", hr: "76", wt: "72.5", spo2: "98", temp: "98.4" },
    { d: 2,  bp: "124/82", sugar: "96",  hr: "72", wt: "72.3", spo2: "99", temp: "98.7" },
    { d: 3,  bp: "121/79", sugar: "105", hr: "80", wt: "72.6", spo2: "97", temp: "98.8" },
    { d: 4,  bp: "118/76", sugar: "99",  hr: "73", wt: "72.4", spo2: "98", temp: "98.6" },
    { d: 5,  bp: "126/84", sugar: "110", hr: "78", wt: "72.7", spo2: "98", temp: "98.9" },
    { d: 6,  bp: "120/80", sugar: "101", hr: "75", wt: "72.5", spo2: "99", temp: "98.6" },
    { d: 7,  bp: "115/74", sugar: "97",  hr: "71", wt: "72.2", spo2: "99", temp: "98.4" },
    { d: 8,  bp: "128/86", sugar: "108", hr: "82", wt: "72.8", spo2: "97", temp: "98.8" },
    { d: 9,  bp: "122/81", sugar: "103", hr: "77", wt: "72.6", spo2: "98", temp: "98.6" },
    { d: 10, bp: "119/79", sugar: "99",  hr: "74", wt: "72.4", spo2: "98", temp: "98.5" },
    { d: 11, bp: "117/76", sugar: "95",  hr: "70", wt: "72.1", spo2: "99", temp: "98.4" },
    { d: 12, bp: "125/83", sugar: "106", hr: "79", wt: "72.7", spo2: "98", temp: "98.7" },
    { d: 13, bp: "121/80", sugar: "100", hr: "75", wt: "72.5", spo2: "98", temp: "98.6" },
  ];

  await Vital.insertMany(vitalsData.map(v => ({
    user_id: patient._id,
    date: daysAgo(v.d),
    bp: v.bp,
    sugar: v.sugar,
    hr: v.hr,
    wt: v.wt,
    spo2: v.spo2,
    temp: v.temp,
  })));
  console.log(`✅  ${vitalsData.length} vital readings seeded (14-day history)`);

  // ── 5. MEDICATIONS ────────────────────────────────────
  await Medication.deleteMany({ user_id: patient._id });

  await Medication.insertMany([
    {
      user_id: patient._id,
      name: "Amlodipine",
      dose: "5mg",
      freq: "Once Daily",
      time: "Morning (after breakfast)",
      for_condition: "Hypertension",
      prescribed_by: "Dr. Kavya Sharma",
      start_date: daysAgo(60),
      stock: 24,
      active: true,
      notes: "Monitor BP daily. Do not skip.",
    },
    {
      user_id: patient._id,
      name: "Metformin",
      dose: "500mg",
      freq: "Twice Daily",
      time: "With meals",
      for_condition: "Pre-diabetic management",
      prescribed_by: "Dr. Sunita Iyer",
      start_date: daysAgo(21),
      stock: 42,
      active: true,
      notes: "Take with food to reduce GI side effects.",
    },
    {
      user_id: patient._id,
      name: "Ferrous Sulphate",
      dose: "150mg",
      freq: "Once Daily",
      time: "Evening (empty stomach)",
      for_condition: "Iron Deficiency Anaemia",
      prescribed_by: "Dr. Kavya Sharma",
      start_date: daysAgo(14),
      stock: 26,
      active: true,
      notes: "Take with Vitamin C for better absorption. Avoid tea/coffee.",
    },
    {
      user_id: patient._id,
      name: "Aspirin",
      dose: "75mg",
      freq: "Once Daily",
      time: "Night (after dinner)",
      for_condition: "Cardiovascular prophylaxis",
      prescribed_by: "Dr. Kavya Sharma",
      start_date: daysAgo(60),
      stock: 8,
      active: true,
      notes: "Low dose for heart protection. Stock running low — refill soon.",
    },
    {
      user_id: patient._id,
      name: "Pantoprazole",
      dose: "40mg",
      freq: "Once Daily",
      time: "Morning (30 min before breakfast)",
      for_condition: "Gastric protection (with Aspirin)",
      prescribed_by: "Dr. Kavya Sharma",
      start_date: daysAgo(60),
      stock: 30,
      active: true,
      notes: "Continue as long as on Aspirin.",
    },
    {
      user_id: patient._id,
      name: "Cetirizine",
      dose: "10mg",
      freq: "Once Daily (as needed)",
      time: "Night",
      for_condition: "Allergic rhinitis",
      prescribed_by: "Dr. Sunita Iyer",
      start_date: daysAgo(120),
      stock: 0,
      active: false,
      notes: "Take only during allergy season. Currently not required.",
    },
  ]);
  console.log("✅  6 medications seeded");

  // ── 6. APPOINTMENTS ───────────────────────────────────
  await Appointment.deleteMany({ user_id: patient._id });

  await Appointment.insertMany([
    {
      user_id: patient._id,
      doctor: "Dr. Kavya Sharma",
      specialty: "Cardiology",
      hospital: "Apollo Hospital, Delhi",
      date: daysAgo(-7),   // 7 days in the future
      time: "10:30 AM",
      type: "Follow-up",
      status: "Scheduled",
      notes: "Blood pressure follow-up. Bring last 2 weeks of BP readings.",
    },
    {
      user_id: patient._id,
      doctor: "Dr. Sunita Iyer",
      specialty: "General Physician",
      hospital: "Apollo Hospital, Delhi",
      date: daysAgo(-14),  // 14 days in the future
      time: "2:00 PM",
      type: "Consultation",
      status: "Scheduled",
      notes: "HbA1c review and dietary counselling session.",
    },
    {
      user_id: patient._id,
      doctor: "Dr. Kavya Sharma",
      specialty: "Cardiology",
      hospital: "Apollo Hospital, Delhi",
      date: daysAgo(60),
      time: "11:00 AM",
      type: "Initial Consultation",
      status: "Completed",
      notes: "Hypertension diagnosis and medication plan initiated.",
    },
    {
      user_id: patient._id,
      doctor: "Dr. Ramesh Mehta",
      specialty: "Neurology",
      hospital: "AIIMS Delhi",
      date: daysAgo(90),
      time: "9:00 AM",
      type: "Consultation",
      status: "Completed",
      notes: "MRI ordered to rule out migraine-related brain lesions.",
    },
    {
      user_id: patient._id,
      doctor: "Dr. Sunita Iyer",
      specialty: "General Physician",
      hospital: "Apollo Hospital, Chennai",
      date: daysAgo(21),
      time: "4:30 PM",
      type: "Lab Review",
      status: "Completed",
      notes: "Lipid profile and HbA1c results discussed.",
    },
  ]);
  console.log("✅  5 appointments seeded (3 past, 2 upcoming)");

  // ── 7. DOCTOR SHARES ──────────────────────────────────
  await Share.deleteMany({ user_id: patient._id });

  await Share.insertMany([
    {
      user_id: patient._id,
      doctor_id: "DOC001",
      doctor_ref: doctor._id,
      doctor_name: "Dr. Kavya Sharma",
      specialty: "Cardiology",
      records: ["Complete Blood Count (CBC)", "Cardiology Consultation & Prescription", "ECG Report — 12-Lead"],
      record_ids: [records[0]._id, records[2]._id, records[7]._id],
      date: daysAgo(7),
      status: "Active",
      expires: daysAgo(-30),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      user_id: patient._id,
      doctor_id: "DOC003",
      doctor_name: "Dr. Sunita Iyer",
      specialty: "General Physician",
      records: ["Lipid Profile & HbA1c", "Complete Blood Count (CBC)"],
      record_ids: [records[4]._id, records[0]._id],
      date: daysAgo(21),
      status: "Active",
      expires: daysAgo(-10),
      expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  ]);
  console.log("✅  2 doctor shares seeded");

  // ── 8. PRESCRIPTIONS ──────────────────────────────────
  await Prescription.deleteMany({ doctor_id: doctor._id });

  await Prescription.insertMany([
    {
      doctor_id: doctor._id,
      patient_name: "Rahul Sharma",
      patient_id: patient._id,
      diag: "Hypertension Stage 1 + Iron Deficiency Anaemia",
      date: daysAgo(14),
      meds: [
        { name: "Amlodipine",     dose: "5mg",  freq: "Once Daily", duration: "3 months" },
        { name: "Aspirin",        dose: "75mg", freq: "Once Daily", duration: "3 months" },
        { name: "Pantoprazole",   dose: "40mg", freq: "Once Daily", duration: "3 months" },
        { name: "Ferrous Sulphate",dose: "150mg",freq: "Once Daily", duration: "2 months" },
      ],
      notes: "Advise low-sodium diet, daily morning walk 30 min, reduce stress.",
      status: "Sent",
    },
    {
      doctor_id: doctor._id,
      patient_name: "Rahul Sharma",
      patient_id: patient._id,
      diag: "Hypertension — Initial Management",
      date: daysAgo(60),
      meds: [
        { name: "Amlodipine", dose: "5mg", freq: "Once Daily", duration: "1 month (trial)" },
      ],
      notes: "Start with Amlodipine. Reassess BP in 4 weeks.",
      status: "Sent",
    },
  ]);
  console.log("✅  2 e-prescriptions seeded");

  // ── 9. PAYMENTS ───────────────────────────────────────
  await Payment.deleteMany({ user_id: patient._id });

  await Payment.insertMany([
    {
      user_id: patient._id,
      amount: 99,
      currency: "INR",
      plan: "Basic",
      status: "paid",
      date: daysAgo(30),
      invoice: "INV-2025-0847",
      razorpay_order_id: "order_demo_001",
    },
    {
      user_id: patient._id,
      amount: 99,
      currency: "INR",
      plan: "Basic",
      status: "paid",
      date: daysAgo(60),
      invoice: "INV-2025-0712",
      razorpay_order_id: "order_demo_000",
    },
  ]);
  console.log("✅  2 payment records seeded");

  // ── 10. AUDIT LOGS ────────────────────────────────────
  await AuditLog.deleteMany({ user_id: { $in: [patient._id, doctor._id] } });

  await AuditLog.insertMany([
    { user_id: patient._id,  action: "login",                 detail: "Patient demo login",                         ip: "127.0.0.1", ts: new Date() },
    { user_id: patient._id,  action: "record_uploaded",       detail: "Uploaded: Complete Blood Count (CBC)",       ip: "127.0.0.1", ts: new Date(Date.now() - 1000 * 60 * 10) },
    { user_id: patient._id,  action: "vitals_logged",         detail: "Vitals entry: BP 122/80, HR 74, Wt 72.4",   ip: "127.0.0.1", ts: new Date(Date.now() - 1000 * 60 * 30) },
    { user_id: patient._id,  action: "share_created",         detail: "Shared 3 records with DOC001",              ip: "127.0.0.1", ts: new Date(Date.now() - 1000 * 60 * 60) },
    { user_id: doctor._id,   action: "login",                 detail: "Doctor demo login",                         ip: "127.0.0.1", ts: new Date() },
    { user_id: doctor._id,   action: "prescription_created",  detail: "Prescription issued for Rahul Sharma",      ip: "127.0.0.1", ts: new Date(Date.now() - 1000 * 60 * 20) },
    { user_id: doctor._id,   action: "records_accessed",      detail: "Accessed shared records for Rahul Sharma",  ip: "127.0.0.1", ts: new Date(Date.now() - 1000 * 60 * 45) },
  ]);
  console.log("✅  7 audit log entries seeded");

  // ── SUMMARY ───────────────────────────────────────────
  console.log(`
╔═══════════════════════════════════════════════════╗
║         🎉  SEED COMPLETE — HealthHub History      ║
╠═══════════════════════════════════════════════════╣
║  DEMO CREDENTIALS (password: demo123)             ║
║  ─────────────────────────────────────────────    ║
║  Patient  →  patient@demo.com                     ║
║  Doctor   →  doctor@demo.com                      ║
║  Admin    →  admin@demo.com                       ║
╠═══════════════════════════════════════════════════╣
║  DATA SEEDED                                      ║
║  ─────────────────────────────────────────────    ║
║  4  Pricing Plans                                 ║
║  5  Users (patient, 3 doctors, 1 admin)           ║
║  8  Medical Records                               ║
║  14 Vital Readings                                ║
║  6  Medications                                   ║
║  5  Appointments (3 past, 2 upcoming)             ║
║  2  Doctor Shares                                 ║
║  2  E-Prescriptions                               ║
║  2  Payment Records                               ║
║  7  Audit Log Entries                             ║
╠═══════════════════════════════════════════════════╣
║  Start:  npm run dev                              ║
║  Open:   http://localhost:3000                    ║
╚═══════════════════════════════════════════════════╝
`);

  await mongoose.connection.close();
};

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
