# MET — Maharaja Educational Trust ERP

[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-8.9-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests Passing](https://img.shields.io/badge/Tests-69%2F69%20Passed-brightgreen.svg)](#testing)

**MET — Maharaja Educational Trust ERP** (TrustView ERP) is an enterprise-grade multi-campus institutional management platform engineered for the **Maharaja Educational Trust**. It provides unified governance, double-entry financial reconciliation, student lifecycle management, hostel bed inventory allocation, academic tracking, and role-based access control across six distinct educational institutions.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Repository Structure](#5-repository-structure)
6. [Prerequisites](#6-prerequisites)
7. [Installation and Local Setup](#7-installation-and-local-setup)
8. [Environment Variables](#8-environment-variables)
9. [Campus and Role-Based Access Control](#9-campus-and-role-based-access-control)
10. [API Documentation](#10-api-documentation)
11. [Vercel and Backend Deployment Guide](#11-vercel-and-backend-deployment-guide)
12. [MongoDB Atlas Configuration](#12-mongodb-atlas-configuration)
13. [Security and Data Protection](#13-security-and-data-protection)
14. [Testing & Quality Assurance](#14-testing--quality-assurance)
15. [Troubleshooting](#15-troubleshooting)
16. [Future Improvements](#16-future-improvements)
17. [License and Contributions](#17-license-and-contributions)
18. [Project Links and Information](#18-project-links-and-information)

---

## 1. Project Overview

The Maharaja Educational Trust oversees six premier campuses encompassing engineering, polytechnic, arts & science, pre-university, secondary, and postgraduate programs. Managing these institutions historically presented significant challenges: fragmented spreadsheets, disconnected fee collection systems, inconsistent student identities across transfers, and delayed financial reporting.

**MET ERP** resolves these challenges by introducing:
* **A Single Source of Truth:** Centralized database on MongoDB Atlas unifying 14,280+ students, 4,500+ hostel beds, and trust-wide fee records.
* **Strict Institutional Boundaries:** Strict role-based scoping ensuring Principal, Dean, HOD, Faculty, Student, and Parent accounts only access authorized records, while Trustees retain consolidated trust-level visibility.
* **Double-Entry Financial Integrity:** Immutable financial ledger entries, bank UTR reconciliation, and automated reminder suppression on cleared balances.
* **Operational Autonomy with Trust Oversight:** Campuses run isolated rule engines (attendance criteria, late fee grace periods) without cross-campus side effects.

---

## 2. Key Features

### 🏛️ Six-Campus Executive Trust Portal
* **Dedicated 3×2 Campus Dashboard:** Instant visual overview of all 6 institutions with real-time student count, fee collection rate, hostel occupancy, and operational health.
* **One-Click Deep-Dive:** Trustees can drill down into any campus to review individual departments, faculty loads, and ledger accounts, with a persistent `← Back to All Campuses` navigation bar.
* **Consolidated KPI Metrics:** Real-time calculation of total enrollment (14,280 students), gross assessed fees, concessions, verified collections, and net outstanding dues.

### 💰 Finance Management & Fee Ledger
* **Immutable Double-Entry Ledger:** Append-only ledger recording debits, credits, and adjustments. Every transaction preserves full audit metadata.
* **Transaction Reversals:** Incorrect entries cannot be deleted; they must be reversed via opposing ledger entries with documented authorization.
* **Bank UTR Payment Reconciliation:** Automated matching of bank UTR identifiers to prevent duplicate payment entry.
* **Automated Reminder Suppression:** Intelligent suppression of payment notifications as soon as student dues reach zero.

### 🎓 Student Master Registry & Identity Resolution
* **Canonical Student Directory:** Centralized registry reconciling local campus roll numbers, state register numbers, and Aadhaar-hashed identifiers.
* **Duplicate Detection Engine:** Algorithmic similarity scoring detecting duplicate student entries resulting from campus transfers or re-admissions.
* **Human-Approved Merges:** Interactive side-by-side reconciliation tool allowing registrars to merge duplicate records while preserving academic and financial history.

### ⚙️ Campus Rules Engine
* **Campus-Isolated Rule Sets:** Configure individual minimum attendance percentages (default 75%), fee due dates, and concession eligibility per campus.
* **Semantic Versioning & Audit:** Every rule change increments its version number and records author metadata.
* **Isolated Recalculation:** Triggering recalculation for one campus updates only that institution's risk counters without modifying the other five campuses.

### 🛏️ Hostel Inventory & Atomic Bed Allocation
* **Real-Time Capacity Matrix:** Visual tracking of total hostel capacity (4,500 beds) and occupancy (3,840 occupied / 85.3% trust-wide).
* **Atomic Bed Reservation:** Concurrency-safe bed allocation preventing double-booking of any hostel room or bed.
* **Room-Level Filters:** Filter by campus, block name, gender, and occupancy state.

### 📥 Guided Spreadsheet Import Engine
* **Intelligent Column Mapping:** Auto-detects headers from legacy CSV/Excel spreadsheets.
* **Pre-Commit Validation:** Flags missing USNs, invalid numbers, and format mismatches before committing to the live database.
* **Quarantine Pipeline:** Approves valid rows immediately while quarantining erroneous rows for manual correction.

### 📢 Student Grievance & Complaint Management
* **Student Self-Service Portal:** Students can submit categorized grievances (Academic, Hostel, Facility, Fee, General) with severity levels.
* **Auto-Routing:** Grievances route automatically to the appropriate HOD, Warden, or Principal based on category and campus.
* **Audit Trail & Timestamps:** Tracks lifecycle status (`PENDING`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) with resolver notes.

### 🛡️ Operational Exception Engine & AI Copilot
* **Proactive Anomaly Detection:** Continuous scanning for fee collection gaps, high attendance drop-offs, and unassigned beds.
* **Copilot Guidance Panel:** Actionable recommendations for administrative staff to resolve edge-case exceptions.

---

## 3. Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19.3**, **Vite 8.3** | Lightning-fast Single-Page Application (SPA) with HMR and optimized asset bundling |
| **Styling & Icons** | **Tailwind CSS 4.3**, **Lucide React** | Modern dark-theme institutional design with responsive layouts and accessible icons |
| **Data Visualization** | **Recharts 3.10** | Dynamic responsive charts for monthly fee collection trends and campus comparisons |
| **Routing** | **React Router 7.18** | Client-side routing with role-guarded routes and state preservation |
| **Backend Runtime** | **Node.js 20+ (ES Modules)** | Asynchronous event-driven server runtime |
| **API Framework** | **Express 4.21** | RESTful API server with modular controllers, middleware, and route handlers |
| **Database & ODM** | **MongoDB Atlas**, **Mongoose 8.9** | Cloud-native multi-model document store with schemas, indexes, and transactions |
| **Authentication & RBAC** | **JWT (jsonwebtoken)**, **bcryptjs** | Stateless JSON Web Tokens, salted password hashing, and role/campus scoping middleware |
| **Testing & Linting** | **Node.js Native Test Runner (`node --test`)**, **Oxlint** | Built-in zero-dependency unit and integration test runner with ultra-fast linting |
| **Hosting & CI/CD** | **Vercel** (Frontend), **Render** (Backend) | Global edge CDN for static assets and resilient cloud web service for Node.js API |

---

## 4. System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Vercel Edge CDN)"]
        Browser["Desktop & Mobile Web Browsers"]
        SPA["React 19 SPA (Vite)
        - Institutional Dark Theme
        - Role Guarded Views
        - Campus Selector (3x2 Grid)"]
    end

    subgraph APILayer ["Backend Application Layer (Render)"]
        API["Express 4 REST API (/api)"]
        AuthMid["JWT Auth & Campus Scoping Middleware"]
        Controllers["Module Controllers:
        - Campuses & Dashboard
        - Fee Ledger & Rules
        - Student Registry & Hostels
        - Complaints & Audit"]
    end

    subgraph DBLayer ["Database Layer (MongoDB Atlas Cluster)"]
        Atlas[("MongoDB Atlas
        Replica Set (trustview_erp)")]
        UsersCol[("Users & Credentials")]
        CampusesCol[("Campuses & Departments")]
        LedgerCol[("Fee Ledger & Balances")]
        StudentsCol[("Canonical Students")]
        HostelsCol[("Hostel Inventory & Beds")]
        ComplaintsCol[("Complaints & Audit Logs")]
    end

    Browser -->|HTTPS Requests| SPA
    SPA -->|REST API Calls (Bearer JWT)| API
    API --> AuthMid
    AuthMid --> Controllers
    Controllers --> Atlas
    Atlas --- UsersCol
    Atlas --- CampusesCol
    Atlas --- LedgerCol
    Atlas --- StudentsCol
    Atlas --- HostelsCol
    Atlas --- ComplaintsCol
```

---

## 5. Repository Structure

```
├── .env.example                     # Frontend environment variable template
├── index.html                       # HTML5 entry point with MET branding
├── package.json                     # Frontend dependencies, scripts, and package metadata
├── render.yaml                      # Render Blueprint Infrastructure-as-Code for backend
├── vercel.json                      # Vercel deployment config (SPA rewrites, cache headers)
├── vite.config.js                   # Vite configuration with React and Tailwind plugins
│
├── src/                             # React 19 Frontend Source
│   ├── main.jsx                     # React DOM root render
│   ├── App.jsx                      # Top-level routing, auth verification, and layout shell
│   ├── assets/                      # Static logos, institution crests, and SVG icons
│   ├── components/
│   │   ├── auth/                    # Secure Sign-In forms and session guards
│   │   ├── complaints/              # Student grievance submission and management modal
│   │   ├── dashboard/               # 3x2 Campus Selector, KPI cards, Recharts trends
│   │   ├── exceptions/              # Operational anomalies and AI Copilot panel
│   │   ├── home/                    # Public campus selection landing page
│   │   ├── layout/                  # Responsive Header, Navbar, and profile controls
│   │   └── views/                   # Full-page role modules (Attendance, Audit, Registry)
│   ├── context/                     # React Context (AuthContext with persistent session)
│   ├── data/                        # Campus metadata, seed constants, and mock fallbacks
│   ├── modules/                     # Standalone domain submodules (Finance, Hostels, etc.)
│   ├── services/                    # API client (Axios-like fetch wrapper with token injection)
│   └── utils/                       # Currency formatters, date parsers, math helpers
│
└── server/                          # Express 4 Node.js Backend Source
    ├── .env.example                 # Backend environment variable template
    ├── package.json                 # Server dependencies, scripts, and test definitions
    ├── src/
    │   ├── server.js                # Server entry point & Atlas connection lifecycle
    │   ├── app.js                   # Express application setup, CORS policy, route mounting
    │   ├── config/                  # MongoDB Atlas Mongoose connection configuration
    │   ├── controllers/             # Business logic for all 16 API domains
    │   ├── middleware/              # JWT auth, RBAC role guard, and campus scope validator
    │   ├── models/                  # 15 Mongoose schemas (Campus, User, Ledger, Student, etc.)
    │   ├── routes/                  # Express Router modules mounted under /api/*
    │   └── services/                # Calculation engines, audit logger, and reconciler
    ├── scripts/
    │   ├── seed.js                  # Idempotent database seeder (initializes 6 campuses & accounts)
    │   ├── testComplaintsWorkflow.js# Live E2E complaints test against Atlas
    │   └── checkCounts.js           # Database verification script
    └── test/                        # 69 automated unit & integration test suites
```

---

## 6. Prerequisites

Before running the application locally or deploying to the cloud, ensure you have:

* **Node.js**: Version `20.18.0` or higher (LTS recommended)
* **npm**: Version `10.0.0` or higher
* **MongoDB**: A free cloud cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) (or local MongoDB v7.0+)
* **Git**: Installed and configured on your machine

---

## 7. Installation and Local Setup

Follow these exact steps to run the complete stack locally:

### Step 1: Clone the Repository
```bash
git clone https://github.com/basavaraja-byte/ERP-project.git
cd ERP-project
```

### Step 2: Install Dependencies
Install dependencies for both frontend and backend:

```bash
# Install root frontend dependencies
npm install

# Install backend server dependencies
cd server
npm install
cd ..
```

### Step 3: Configure Environment Variables
Copy the example environment files:

```bash
# Configure backend environment
cp server/.env.example server/.env

# Configure frontend environment (optional for local dev)
cp .env.example .env
```

Open `server/.env` in your text editor and add your MongoDB Atlas connection string and a secure JWT secret:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/trustview_erp?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_here_at_least_32_characters
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Step 4: Seed the Database
Populate MongoDB Atlas with the official six campuses, sample student registries, fee ledgers, and demo role accounts:

```bash
cd server
npm run seed
cd ..
```

### Step 5: Start the Development Servers
Open two separate terminal windows:

**Terminal 1 — Backend API Server:**
```bash
cd server
npm start
# Server starts on http://localhost:5000
# Connected to MongoDB Atlas: trustview_erp
```

**Terminal 2 — Frontend Application:**
```bash
npm run dev
# Frontend Vite dev server starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 8. Environment Variables

### Frontend Variables (`.env`)
> [!IMPORTANT]
> All variables prefixed with `VITE_` are bundled into client-side JavaScript and exposed to the public browser. **Never place secrets, private keys, or passwords in frontend environment files.**

| Variable Name | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | Production | `https://trustview-erp-api.onrender.com` | Base URL of the deployed Express backend API |
| `VITE_API_BASE_URL` | Optional | `https://trustview-erp-api.onrender.com` | Fallback alias for backend API resolution |

### Backend Variables (`server/.env`)
> [!WARNING]
> Keep `server/.env` strictly confidential. It must never be committed to Git. The repository's `.gitignore` explicitly excludes `.env`.

| Variable Name | Required | Example | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | Yes | `5000` | Port on which the Express server listens |
| `MONGODB_URI` | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/trustview_erp` | Authenticated MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | `met_production_jwt_signing_key_987654321` | High-entropy secret key used to sign and verify JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration duration (`1d`, `7d`, `24h`) |
| `NODE_ENV` | Yes | `production` or `development` | Enables production optimizations and strict error masks |
| `CLIENT_URL` | Yes | `https://met-erp.vercel.app,http://localhost:5173` | Comma-separated list of allowed origins for CORS headers |

---

## 9. Campus and Role-Based Access Control

### The Six Official Campuses
| # | Campus Identifier | Official Institutional Name | Code | Type | Established |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 1 | `campus-1` | **Maharaja Institute of Technology** | `MIT` | Engineering & Technology | 2007 |
| 2 | `campus-2` | **Maharaja Polytechnic College** | `MPC` | Polytechnic Diploma | 2009 |
| 3 | `campus-3` | **Maharaja College of Arts & Science** | `MCAS` | Degree (Arts & Science) | 2012 |
| 4 | `campus-4` | **Maharaja PU College** | `MPUC` | Pre-University (11th & 12th) | 2014 |
| 5 | `campus-5` | **Maharaja School** | `MS` | K-10 Primary & Secondary | 2016 |
| 6 | `campus-6` | **MIT for Masters** | `MITM` | Postgraduate & Research | 2018 |

### Role Permissions Matrix
The system enforces strict multi-tenant boundaries at the database and middleware levels:

| Role | Campus Scope | Multi-Campus Access | Primary Modules & Permissions |
| :--- | :--- | :---: | :--- |
| `TRUSTEE` | Trust-Wide (All 6) | ✅ Yes | Consolidated 3×2 grid, trust financial reports, cross-campus comparisons, system audit log. |
| `DEAN` | Assigned Campus | ❌ No | Campus executive oversight, department metrics, attendance risk lists, fee collection rates. |
| `PRINCIPAL` | Assigned Campus | ❌ No | Campus operational management, student registry, campus exceptions, rule configuration. |
| `FINANCE_MANAGER` | Assigned Campus / Trust | ⚠️ Scoped | Fee ledger entries, payment reconciliation, bank UTR imports, reminder suppression. |
| `HOD` | Assigned Campus & Dept | ❌ No | Department faculty overview, student attendance tracking, department grievance resolution. |
| `FACULTY` | Assigned Campus & Dept | ❌ No | Course attendance entry, internal test grades, student feedback. |
| `STUDENT` | Self-Record Only | ❌ No | Personal fee balance, receipt download, attendance stats, complaint submission and tracking. |
| `PARENT` | Ward-Record Only | ❌ No | Ward academic performance, fee dues, payment history, attendance warnings. |
| `WARDEN` | Assigned Hostel Block | ❌ No | Hostel room and bed occupancy, room allocation, maintenance requests. |

---

## 10. API Documentation

All API endpoints are prefixed with `/api` and return standardized JSON responses:

### Authentication & Sessions
* `POST /api/auth/login` — Authenticate with email and password. Returns signed JWT and user profile.
* `GET /api/auth/me` — *(Auth Required)* Return current authenticated user profile and campus assignment.

### Campuses & Executive Dashboards
* `GET /api/campuses` — Return all 6 campuses (for Trustee) or assigned campus (for Principal/Dean).
* `GET /api/campuses/:id` — Return full institutional profile and department breakdown for campus.
* `GET /api/dashboard/summary` — Return consolidated trust KPIs (enrollment, fee recovery, occupancy, risks).
* `GET /api/dashboard/trends` — Return 6-month historical fee collection data points.

### Fee Ledger & Financials
* `GET /api/fees/summary` — Return trust-wide or campus-specific gross assessed, concessions, and collected fees.
* `GET /api/ledger/entries` — Query double-entry fee transactions filtered by student, campus, or date.
* `POST /api/ledger/import` — Reconcile batch bank receipts with automated UTR deduplication.
* `POST /api/ledger/reversal` — Create an immutable opposing entry with mandatory reason notes.

### Students, Rules, and Hostels
* `GET /api/students/registry` — Retrieve student directory with duplicate candidate flags.
* `POST /api/students/registry/merge` — Execute authorized merge of duplicate student identities.
* `GET /api/rules/:campusId` — Fetch current rules (attendance threshold, late fees) and version history.
* `PUT /api/rules/:campusId` — Update campus rules and trigger isolated recalculation.
* `GET /api/hostels/summary` — Return hostel bed capacity and occupancy figures.
* `GET /api/hostels/inventory` — Return real-time room-by-room bed allocation matrix.
* `POST /api/hostels/inventory/allocate` — Atomically assign bed to student ID.

### Complaints & Audit
* `GET /api/complaints` — Retrieve complaints scoped by user role (own for Student, campus for HOD/Principal).
* `POST /api/complaints` — Submit a new student grievance.
* `PATCH /api/complaints/:id` — Update complaint status (`IN_PROGRESS`, `RESOLVED`, `CLOSED`).
* `GET /api/audit` — Query append-only audit trail logs (Trustee & Principal).
* `GET /api/health` — Public endpoint verifying API server status and MongoDB Atlas connection.

---

## 11. Vercel and Backend Deployment Guide

### A. Deploy Frontend on Vercel

The frontend is fully configured for deployment on Vercel as a Single-Page Application (SPA) using [`vercel.json`](vercel.json).

#### 1. Import Repository into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** > **"Project"**.
3. Select your GitHub repository: `basavaraja-byte/ERP-project`.
4. Configure the project:
   * **Project Name**: `met-erp` *(Preferred production name: `met-erp.vercel.app`)*
   * **Framework Preset**: `Vite` (automatically detected)
   * **Root Directory**: `./`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. In **Environment Variables**, add:
   * `VITE_API_URL`: URL of your deployed Express backend (e.g. `https://trustview-erp-api.onrender.com`).
6. Click **Deploy**.

#### 2. Domain & Naming Status
* **Preferred URL**: `https://met.vercel.app` — *Notice: Short 3-letter project slugs on Vercel are globally reserved or registered by pre-existing projects.*
* **Recommended Active Alternative**: `https://met-erp.vercel.app` *(or `https://maharaja-erp.vercel.app`)*.

---

### B. Deploy Backend on Render

The backend is configured with Infrastructure-as-Code via [`render.yaml`](render.yaml).

#### 1. Deploy via Render Blueprint
1. Log in to [Render](https://dashboard.render.com).
2. Click **"New +"** > **"Blueprint"**.
3. Connect repository `basavaraja-byte/ERP-project`.
4. Render automatically reads `render.yaml` and sets:
   * **Root Directory**: `server`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
   * **Health Check Path**: `/api/health`
5. Enter the two required environment variables in the Render dashboard:
   * `MONGODB_URI`: Your MongoDB Atlas connection string.
   * `JWT_SECRET`: A secure 32+ character signing key.
   * `CLIENT_URL`: `https://met-erp.vercel.app` (or your chosen Vercel frontend URL).
6. Click **Apply**. Render will deploy the API and provide your backend URL (e.g. `https://trustview-erp-api.onrender.com`).

---

## 12. MongoDB Atlas Configuration

1. **Create an Atlas Cluster:**
   * Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and deploy an M0 Free Tier or M10+ dedicated cluster.
2. **Network Access (IP Whitelist):**
   * In Atlas, navigate to **Security** > **Network Access**.
   * Add IP `0.0.0.0/0` (Allow access from anywhere) to allow both Render backend instances and local development environments to connect securely.
3. **Database User:**
   * In **Security** > **Database Access**, create a user with `Read and write to any database` privileges.
4. **Obtain Connection String:**
   * Click **Connect** > **Drivers** (Node.js) > copy the connection URI:
     `mongodb+srv://<username>:<password>@<cluster-url>/trustview_erp?retryWrites=true&w=majority`
   * Substitute `<username>` and `<password>` with your database user credentials.

---

## 13. Security and Data Protection

* **Password Security:** All user credentials are encrypted with `bcryptjs` using 10 salt rounds. Passwords are never stored or logged in plain text and are excluded by default (`select: false`) from Mongoose user queries.
* **Stateless JWT Tokens:** Cryptographically signed tokens with configurable expiration (`JWT_EXPIRES_IN`). No server-side session leaks.
* **Server-Side Campus Scoping:** Frontend role checks are purely for UI convenience. The backend middleware (`enforceCampusScope`) validates every incoming request to ensure that users cannot inspect or modify records outside their assigned campus.
* **Immutable Audit Trail:** High-risk actions (ledger reversals, duplicate merges, rule updates, role promotions) create append-only logs recording the actor's user ID, IP address, timestamp, and before/after state diffs.
* **Sanitized Secrets:** No credentials, tokens, or environment files are tracked in Git. Example templates (`.env.example`) provide placeholder documentation only.

---

## 14. Testing & Quality Assurance

The project includes automated test coverage powered by the zero-dependency Node.js Native Test Runner (`node --test`).

### Run Backend Unit & Integration Tests
```bash
cd server
npm test
```

### Verified Test Results (69 Passed / 0 Failed)
```
✔ Controller API Units (Zero Network Socket / Fully Sandboxed) (12 tests)
✔ Authentication & RBAC Middleware Unit Tests (8 tests)
✔ Math calculation utilities (2 tests)
✔ TrustView Consolidated Metrics Reconciliation (4 tests)
✔ Single Campus (Principal Scope) Metrics (1 test)
✔ Role-Based Campus Access Boundaries (3 tests)
✔ Grievance & Complaint Management Controller Units (8 tests)
✔ Master Workflows — Part 1: Student Registry Merge (2 tests)
✔ Master Workflows — Part 2: Rules Engine Isolation (2 tests)
✔ Master Workflows — Part 3: Fee Ledger & Reversals (5 tests)
✔ Master Workflows — Part 4: Guided Spreadsheet Import (3 tests)
✔ Master Workflows — Part 5: Hostel Inventory Allocation (3 tests)
✔ Master Workflows — Part 6: Audit Trail Immutability (2 tests)

ℹ tests 69 | suites 0 | pass 69 | fail 0 | duration_ms 1156.3
```

### Run Frontend Production Build & Code Quality Check
```bash
# Verify production compilation
npm run build

# Run fast code linting
npm run lint
```

---

## 15. Troubleshooting

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **CORS error in browser console** | Backend `CLIENT_URL` does not include the frontend origin. | Update `server/.env` or Render environment settings to include your Vercel URL in `CLIENT_URL`. |
| **`MongooseServerSelectionError` on server startup** | IP address is not whitelisted in MongoDB Atlas or connection string has invalid credentials. | In Atlas, check **Network Access** to ensure `0.0.0.0/0` is allowed and verify username/password. |
| **Vercel route returns 404 on page refresh** | SPA router rewrites missing. | Verified fixed in [`vercel.json`](vercel.json) using explicit rewrite rules routing all non-asset paths to `/index.html`. |
| **`401 Unauthorized` on API requests** | JWT token expired or missing in `Authorization: Bearer <token>` header. | Log out and log back in, or check that `api.js` is attaching the token from `localStorage`. |
| **Port 5000 in use error on Windows** | A previous Node background process is holding the port. | Terminate the process using `netstat -ano \| findstr :5000` and `taskkill /PID <PID> /F`. |

---

## 16. Future Improvements

* [ ] **Biometric & RFID Attendance Integration:** Direct hardware hooks with on-premise turnstiles and classroom biometric scanners.
* [ ] **Automated Payment Gateway Webhooks:** Direct integrations with Razorpay, Cashfree, and UPI deep-links for immediate fee settlement.
* [ ] **SMS & WhatsApp Parent Alerts:** Automated notification delivery for attendance deficits and fee receipts via Twilio or Gupshup.
* [ ] **Parent Portal Mobile Application:** React Native mobile app for parents to monitor academic progress and make fee payments.
* [ ] **Export to Tally & SAP:** Built-in accounting bridges to export the verified fee ledger directly to standard ERP accounting software.

---

## 17. License and Contributions

This project was built for the **Maharaja Educational Trust** as an enterprise-grade ERP solution.

* **License:** Licensed under the [MIT License](LICENSE).
* **Contributions:** Pull requests are welcome. For major architectural changes, please open an issue first to discuss intended modifications.

---

## 18. Project Links and Information

* **GitHub Repository:** [https://github.com/basavaraja-byte/ERP-project](https://github.com/basavaraja-byte/ERP-project)
* **Frontend Vercel Deployment:** [https://met-erp.vercel.app](https://met-erp.vercel.app) *(or 1-click import via [Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbasavaraja-byte%2FERP-project))*
* **Backend API on Render:** Configured via [`render.yaml`](render.yaml)
* **Institutional Ownership:** **Maharaja Educational Trust (MET)**
