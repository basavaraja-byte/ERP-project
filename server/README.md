# TrustView ERP — Backend API & MongoDB Atlas Integration

This directory contains the production-ready Node.js, Express, and Mongoose backend service for the **TrustView ERP Management Dashboard**.

---

## 1. Architecture Overview

- **Runtime:** Node.js (ES Modules `"type": "module"`)
- **Web Framework:** Express.js 4.x
- **Database ODM:** Mongoose 8.x
- **Configuration:** dotenv (`server/.env`)
- **Security & CORS:** Configured for `http://localhost:5173` with credentials support
- **Logging:** Morgan HTTP request logger
- **Testing:** Node.js Native Test Runner (`node:test`, `node:assert`)
- **Resilience Layer:** Built-in dual-mode fallback. If `MONGODB_URI` is not yet configured, the server starts safely in demonstration mode without crashing, providing instant API responses while reporting disconnected status to the health monitor.

```
server/
├── src/
│   ├── config/
│   │   └── database.js             # Mongoose connection manager & health introspection
│   ├── models/
│   │   ├── Campus.js               # Campus schema with financial & enrollment aggregates
│   │   ├── Student.js              # Student demographic & program records
│   │   ├── FeeRecord.js            # Fee ledger schema with auto-calculated net payable
│   │   ├── Hostel.js               # Hostel block capacity and occupancy
│   │   ├── AttendanceRecord.js     # Attendance risk audit logs
│   │   ├── OperationalException.js # Spreadsheet ingestion exception records
│   │   └── index.js                # Centralized model registry
│   ├── controllers/
│   │   ├── healthController.js     # Health check & Atlas connection diagnostics
│   │   ├── campusController.js     # Campus listing and single-campus lookup
│   │   ├── dashboardController.js  # Trust-wide & single-campus KPI aggregations
│   │   ├── feeController.js        # Fee collections, concessions, and outstanding audit
│   │   ├── hostelController.js     # Bed capacity and occupancy analytics
│   │   ├── attendanceController.js # Attendance risk counts and exam eligibility
│   │   └── exceptionController.js  # Operational exceptions & status transitions
│   ├── routes/
│   │   ├── healthRoutes.js
│   │   ├── campusRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── feeRoutes.js
│   │   ├── hostelRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── exceptionRoutes.js
│   │   └── index.js                # Master route router mounted at /api
│   ├── services/
│   │   └── metricsService.js       # Business logic, math integrity & cache synchronization
│   ├── middleware/
│   │   └── errorHandler.js         # Centralized error formatting & 404 handler
│   ├── app.js                      # Express application setup
│   └── server.js                   # HTTP server lifecycle & graceful shutdown
├── scripts/
│   └── seed.js                     # Safe idempotent database seeder (upserts without dropping)
├── tests/
│   ├── calculations.test.js        # Unit tests verifying mathematical reconciliation
│   └── api.test.js                 # Sandboxed unit tests for all controller endpoints
├── .env.example                    # Template environment variables (safe for Git)
├── .gitignore                      # Strict ignore rules excluding .env and logs
├── package.json                    # Scripts and dependencies
└── README.md                       # Backend documentation (this file)
```

---

## 2. Quick Start Guide

### Step 1: Install Backend Dependencies
*(Already completed during setup)*
```bash
cd server
npm install
```

### Step 2: Configure MongoDB Atlas Connection String
1. Open `server/.env` in your editor.
2. Set your MongoDB Atlas connection URI:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
DB_NAME=trustview_erp
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```
> **Security Notice:** `server/.env` is strictly ignored by Git and will never be committed or logged.

### Step 3: Seed Database (Safe & Idempotent)
Populate your MongoDB Atlas cluster with the 6 campuses, operational exceptions, hostels, and sample ledgers:
```bash
npm run seed
```
> The seeder uses **Mongoose upserts** (`updateOne(..., { $set }, { upsert: true })`). It never drops collections or wipes existing records.

### Step 4: Start the Backend Server
Development mode with hot-reloading:
```bash
npm run dev
```
Production start:
```bash
npm run start
```
The server will listen at `http://localhost:5000`.

---

## 3. Running Backend Tests

Run the comprehensive unit test suite:
```bash
cd server
npm test
```
The test suite executes 23 unit tests across:
- Metric reconciliation (14,280 students, ₹97.46 Cr gross, ₹3.99 Cr concessions, ₹93.47 Cr net, ₹88.645 Cr collections, 94.8% collection rate, 85.3% hostel occupancy).
- All 12 controller endpoints (Health, Campuses, Dashboard, Fees, Hostels, Attendance, Exceptions).

---

## 4. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check reporting server uptime & live MongoDB Atlas connection status |
| `GET` | `/api/campuses` | List all 6 institutions with consolidated metrics |
| `GET` | `/api/campuses/:id` | Detailed metrics and departmental breakdown for a single campus |
| `GET` | `/api/dashboard/summary` | Consolidated or single-campus KPI summary (`?campusId=all` or `?campusId=campus-1`) |
| `GET` | `/api/dashboard/trends` | 6-month fee collection and outstanding trends (`?campusId=all`) |
| `GET` | `/api/fees/summary` | Financial ledger breakdown (gross assessed, concessions, net, collected, outstanding) |
| `GET` | `/api/hostels/summary` | Total hostel capacity, occupied beds, and occupancy rate |
| `GET` | `/api/attendance/risks` | Attendance risk counts (<75% threshold) and exam-eligible counts |
| `GET` | `/api/exceptions` | Ingestion exceptions filterable by `campusId`, `status`, `priority`, `category` |
| `PATCH` | `/api/exceptions/:id/status` | Update exception status (`Open`, `In Review`, `Resolved`, `Dismissed`) with audit note |

---

## 5. Frontend Integration & Offline Resilience

- The frontend connects via `VITE_API_BASE_URL=http://localhost:5000/api` (configured in root `.env`).
- In `TopNav.jsx`, a live connection pill displays:
  - **Atlas Live (Green Dot):** Connected to MongoDB Atlas cluster.
  - **API Live (Amber Dot):** Node.js backend is running; MongoDB Atlas URI is pending.
  - **Demo Mode (Slate Dot):** Backend server is stopped; React renders from synchronized local cache.
- The UI remains 100% interactive under all network conditions.

