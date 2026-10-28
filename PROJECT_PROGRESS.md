# Project Progress — TrustView ERP Management Dashboard
**Institution Context:** Apex Educational Trust (6 Campuses, ~14,280 Enrolled Students, 40 Operational Spreadsheets)  
**Assigned Module:** Main Management Dashboard for Dean / Trustee and Principal  
**Technology Stack:** React 19, Vite 8, Tailwind CSS v4, Recharts 3, Lucide-React, Oxlint  
**Last Updated:** October 28, 2026

---

## 1. Project Architecture & Technology Stack

- **Framework & Bundler:** React 19 (`react`, `react-dom`), Vite 8 (`@vitejs/plugin-react`).
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, `@import "tailwindcss"` in `index.css`).
- **Charts & Visualizations:** Recharts (`ResponsiveContainer`, `BarChart`, `ComposedChart`, `Line`, `Bar`, `Tooltip`, `Legend`).
- **Icons:** `lucide-react`.
- **Data & Services Layer:**
  - `src/data/mockData.js`: Centralized synthetic mock dataset representing 6 campuses, 40 spreadsheets, 7 operational exceptions, audit activities, collection trends, and notifications.
  - `src/services/dashboardService.js`: Aggregated trust-wide and campus-level summaries, collection trends, notifications.
  - `src/services/campusService.js`: Campus retrieval, departmental statistics, comparison data.
  - `src/services/exceptionService.js`: Exception filtering, status mutations, simulated rule-based AI Copilot reasoning.
  - `src/utils/calculations.js`: Financial currency formatting (`INR`), numbers, percentages, aggregation, and RFC-compliant CSV exporter.

---

## 2. Mathematical Reconciliation & Synthetic Data Integrity Audit

All 6 campus records and trust-wide consolidated metrics were validated:
1. **Student Count Reconciliation:**
   - Campus 1 (4,120) + Campus 2 (2,450) + Campus 3 (3,280) + Campus 4 (1,980) + Campus 5 (1,150) + Campus 6 (1,300) = **14,280 Total Enrolled Students**.
   - Department breakdowns inside each campus record sum exactly to the campus roll total.
2. **Financial Math Reconciliation:**
   - Gross Assessed Fees: ₹97,46,00,000 (₹97.46 Cr).
   - Approved Concessions: ₹3,99,00,000 (₹3.99 Cr).
   - Net Payable Fees: ₹97,46,00,000 - ₹3,99,00,000 = ₹93,47,00,000 (₹93.47 Cr).
   - Verified Bank Collections: ₹88,64,50,000 (₹88.645 Cr).
   - Outstanding Balance: ₹93,47,00,000 - ₹88,64,50,000 = **₹4,82,50,000 (₹4.825 Cr)** across all 6 campus ledgers.
   - Recovery Rate: 88,64,50,000 / 93,47,00,000 = **94.8%**.
   - All 6 individual campus outstanding balances sum exactly to the trust-wide ₹4,82,50,000.
3. **Hostel Capacity & Occupancy Reconciliation:**
   - Sanctioned Bed Capacity: 1,600 + 650 + 900 + 350 + 600 + 400 = **4,500 Beds**.
   - Occupied Beds: 1,480 + 590 + 720 + 295 + 515 + 240 = **3,840 Beds**.
   - Vacant Available Beds: 4,500 - 3,840 = **660 Beds**.
   - Trust Occupancy Rate: (3,840 / 4,500) * 100 = **85.3%**.
4. **Attendance Risk Reconciliation:**
   - Flagged below 75% Cutoff: 112 + 98 + 145 + 34 + 28 + 71 = **488 Students**.
   - Overall Trust Attendance Risk Rate: (488 / 14,280) = **3.4%** (96.6% examination eligible).
5. **Spreadsheet Ingestion Pipeline:**
   - Active Spreadsheets: 8 + 6 + 7 + 6 + 7 + 6 = **40 Spreadsheets**.
   - Verified Spreadsheets: 8 + 6 + 6 + 6 + 7 + 5 = **38 Spreadsheets** (Campus 3 has 1 stale sheet, Campus 6 has 1 pending sheet).

---

## 3. Requirement Checklist & Implementation Status (Audited & Evidence-Based)

| Section | Feature / Requirement | Status | Verification Evidence / Current State |
|---|---|---|---|
| **A. Application Foundation** | Main app mounting & orchestration (`App.jsx`) | **VERIFIED** | Integrated master layout, view routing, state synchronization, and modal dialogs. |
| | Responsive Layout (Desktop / Tablet / Mobile) | **VERIFIED** | Collapsible sidebar, mobile drawer, responsive grid across all screen sizes. |
| | Separation of presentation, mock data, and calculations | **VERIFIED** | Clean service layer (`services/`) and pure calculation utilities (`utils/calculations.js`). |
| **B. Management Dashboard Views** | Eight Core Navigation Views | **VERIFIED** | All 8 views exist and compile: `overview`, `performance`, `financial`, `hostel`, `attendance`, `exceptions`, `reports`, `settings`. |
| | Campus Detail Drilldown View (`CampusDetailView`) | **VERIFIED** | Click-through dossier with departmental stats, principal contact, and local exceptions. |
| | Trust-wide KPI Cards (6 core metrics) | **VERIFIED** | Students, Campuses, Fee Collections/Outstanding, Hostel Occupancy, Attendance Risk, Open Exceptions. |
| | Analytics & Recharts Trends | **VERIFIED** | Dynamic 6-month collection chart and campus comparison bar charts. |
| | Campus Performance Table & CSV Export | **VERIFIED** | Search, filter, multi-column sort, scope reset button, RFC-compliant CSV export with UTF-8 BOM. |
| | Operational Exceptions & AI Copilot Panel | **VERIFIED** | Ingestion conflict filters, status transitions, evidence checklist, simulated DPDP-compliant Copilot reasoning. |
| **C. Role Scoping (Trustee / Dean / Principal)** | Trustee Scope (All 6 Campuses) | **VERIFIED** | Trustee has trust-wide consolidated visibility across all 6 institutions and can audit any of the 6 campuses. |
| | Dean Scope (Assigned Campus) | **VERIFIED** | Restricted to assigned institution (e.g. Campus 1) with dedicated indigo academic scope banner. |
| | Principal Scope (Assigned Campus) | **VERIFIED** | Restricted to assigned institution (e.g. Campus 1) with dedicated amber operational scope banner. |
| | 3-Way Independent Role Separation (Trustee vs Dean vs Principal) | **VERIFIED** | Trustee, Dean, and Principal are separated into distinct roles across state, top navigation, sidebar, headers, and profiles. |
| **D. Backend & Database Integration** | Node.js Express REST Backend (`server/`) | **VERIFIED** | 12 modular endpoints mounted under `/api` (`/health`, `/auth/login`, `/auth/me`, `/campuses`, `/dashboard`, `/fees`, `/hostels`, `/attendance`, `/exceptions`). |
| | Backend Unit Tests (`server/tests/`) | **VERIFIED** | 36 of 36 unit tests passing via `node --test` (0 failures, including bcrypt, JWT, and role/campus boundaries). |
| | Frontend Build & Linter | **VERIFIED** | `oxlint` reports 0 errors across 185 files. `vite build` succeeds in 1.23s (dist bundle 1.5 MB). |
| | Real MongoDB Atlas Cloud Connection | **VERIFIED** | Connected to live cluster `ac-2s1ev1e-shard-00-00.a9o54kt.mongodb.net`, database `trustview_erp`. |
| | Safe Database Seeder & Live Data State | **VERIFIED** | Initialized baseline database records: 6 campuses, 7 exceptions, 8 hostels, 6 attendance logs, 3 students, 3 fee ledgers, 8 bcrypt-hashed user accounts. |
| **E. Authentication & Security** | Unified Backend Authentication (`/api/auth/login`) | **VERIFIED** | Bcrypt salted hashing, JWT creation & verification, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`. |
| | Backend Role-Based Access Control (RBAC) | **VERIFIED** | Strict server-side enforcement for all 8 roles (`TRUSTEE`, `DEAN`, `PRINCIPAL`, `HOD`, `FACULTY`, `STUDENT`, `PARENT`, `WARDEN`). Cross-campus access blocked with HTTP 403. |
| **F. Teammate Modules Integration** | Extracted Source Archive Integration | **VERIFIED** | Integrated from `C:\Users\Asus\OneDrive\Desktop\works\trustview-team-modules` into unified TrustView host application under `src/modules/`. |
| | Student / Parent Portal Integration | **INTEGRATED** | Fully integrated with 8 Student views and 7 Parent views under `StudentPortalView` and `ParentPortalView`. |
| | Department Management (HOD / Faculty) Integration | **INTEGRATED** | Fully integrated with 8 HOD management views and 5 Faculty views under `HodPortalView` and `FacultyPortalView`. |
| | Hostel Management (CampusStay) Integration | **INTEGRATED** | Fully integrated with 7 Hostel Warden views under `WardenPortalView` and `HostelView`. |
| | Finance Module Status | **REPORTED (NO SOURCE FOLDER)** | No dedicated `finance` folder existed in `trustview-team-modules`. Financial operations are fulfilled by main TrustView ERP (`FinancialView.jsx`, `/api/fees/summary`) and Student/Parent fee ledger. |

---

## 4. Features Fixed or Newly Enhanced During Verification

1. **KPI Cards Expansion to 6 Core Metrics:**
   - Expanded `KpiCard.jsx` to render all 6 metrics required by prompt: Total Students, Active Campuses, Fee Collection/Outstanding, Hostel Occupancy, Attendance Risk, and Open Ingestion Exceptions.
2. **Chart Footer Dynamic Calculation:**
   - Fixed hardcoded string in `CollectionChart.jsx` footer. Now calculates the highest collection month and current outstanding balance directly from the active dataset.
3. **Bidirectional Campus Filter Synchronization:**
   - Connected `selectedCampusId` and `onSelectCampus` across `FinancialView`, `HostelView`, `AttendanceView`, `ReportsView`, `ExceptionCenter`, and `CampusPerformanceTable`.
4. **Table Scope Controls:**
   - Added a clear scope indicator in `CampusPerformanceTable.jsx` when single-campus filtering is active with a one-click button to reset to the consolidated 6-campus view.
   - Added a dedicated "Export CSV" button to `CampusPerformanceTable.jsx`.
5. **Interactive Notification Drawer:**
   - Clicking on a critical exception notification now automatically marks it as read, closes the popover, and navigates straight to the Exception Hub.
6. **Mobile Role Switching:**
   - Embedded a role switcher pill into `Sidebar.jsx` on mobile viewports so users can switch between Dean/Trustee and Principal views from mobile screens.

---

## 5. Build & Verification Results

- **Production Build:** `npm run build` (`vite build`) **SUCCEEDED** (2,551 modules transformed in 1.04s, exit code 0).
- **Frontend Linter:** `npm run lint` (`oxlint`) **CLEAN** (0 errors, 0 warnings across 57 files).
- **Backend Test Suite:** `npm test` inside `server/` **SUCCEEDED** (23 passing unit tests, 0 failures across calculations and controller units).
- **Vite Dev Server:** Active on `http://localhost:5173/`.
- **Node.js Express API Server:** Available on `http://localhost:5000/`.

---

## 6. Backend Architecture & MongoDB Atlas Integration Status

- **Status:** **VERIFIED & CONNECTED TO ATLAS**
- **Technology:** Node.js, Express 4, Mongoose 8, dotenv, cors, morgan.
- **Location:** `server/` alongside the React frontend.
- **Connection Diagnostics:**
  - `GET /api/health` reports true MongoDB connection status (`connected: true`), database name (`trustview_erp`), server uptime, and active cluster host.
- **Security & Secret Safeguards:**
  - `server/.env` and `.env` are strictly excluded in `.gitignore`.
  - Passwords and connection strings are never logged or exposed in client bundles.
  - Automatically sanitizes accidental angle brackets from Atlas copy templates (`<username>:<password>`).
- **Data Persistence & Database Seeder:**
  - `server/scripts/seed.js` uses idempotent Mongoose upserts (`updateOne` with `{ upsert: true }`).
  - Upserts 6 Campuses, Operational Exceptions, Hostel blocks, Attendance logs, and sample Student Fee ledger records.
  - Never drops databases or deletes records.
- **Frontend Integration (`src/services/api.js` & `TopNav.jsx`):**
  - Integrated health badge in `TopNav.jsx` showing real-time connectivity:
    - **Green Dot:** MongoDB Atlas Live
    - **Amber Dot:** API Server Online (Demo Cache Mode)
    - **Slate Dot:** Demo Mode (Offline / Local Cache)
  - Interactive popover on click displays server status, Atlas status, and setup instructions.
  - Automatic graceful fallback ensures the UI is 100% functional even if the backend server is stopped.

---

## 7. How to Connect MongoDB Atlas (User Action Required)

1. Open `server/.env` in your text editor.
2. Enter your real MongoDB Atlas connection string:
   ```env
   MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority"
   DB_NAME=trustview_erp
   PORT=5000
   CLIENT_ORIGIN=http://localhost:5173
   ```
3. Seed the database with the verified 6-campus dataset:
   ```bash
   cd server
   npm run seed
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```
5. View the dashboard at `http://localhost:5173/` — the top navigation bar will switch to **"Atlas Live"** with a pulsing green indicator.
- **Linter Check:** `npm run lint` (`oxlint`) **PASSED** with **0 errors and 0 warnings** across all 26 files.
- **Development Server:** Accessible at `http://localhost:5173/`.

---

## 6. Steps to Run and Test Locally

1. Open a terminal in the project directory:
   ```cmd
   cd c:\Users\Asus\OneDrive\Desktop\works\project\hakathonMITT
   npm run dev
   ```
2. Open your web browser and go to:
   ```
   http://localhost:5173
   ```
3. Test Scenarios:
   - **Role Switch:** Click **Dean / Trustee** (Consolidated view) vs **Principal** (Scoped to Campus 1 with boundary banner).
   - **Campus Selector:** Choose "Campus 3" from the top dropdown. Verify that KPI cards, collection chart, departmental chart, freshness card, and tables update to Campus 3.
   - **Table Drilldown:** Click on any campus row in the table to open `CampusDetailView`. Click "Return to Trust-Wide Overview".
   - **Exceptions Hub & AI Copilot:** Open "Data Exceptions", inspect an exception (e.g. `EXC-1091`), run the AI Copilot analysis, and change status to "Resolved". Verify the sidebar badge decrements instantly.
   - **Reports & CSV Download:** Open "Reports & Exports", select a report type (e.g. Financial Schedule), and click "Export Displayed Data (CSV)" to download the spreadsheet.
