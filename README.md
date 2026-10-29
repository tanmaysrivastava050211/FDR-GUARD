# FDR-GUARD: AICTE National Security Deposit & FDR Management Portal
### Smart India Hackathon (SIH 2026) — Complete Full-Stack Solution

An autonomous, centralized regulatory system for AICTE to manage, verify, track, and scrutinize Fixed Deposit Receipts (FDRs) and security deposits submitted by technical institutions across India.

---

## 🚀 Key Highlights & Architecture

- **Backend**: **FastAPI (Python 3.12)** with async endpoints, Pydantic v2 schemas, and JWT security.
- **Computer Vision / OCR**: **EasyOCR (PyTorch v2.14)** for automated text extraction from scanned FDR documents with confidence scoring and bounding-box coordinates.
- **Database**: **PostgreSQL** (configured via `DATABASE_URL` with resilient SQLite auto-fallback for zero-crash evaluations).
- **Frontend**: **Next.js 16 (App Router)** + **React** + **Tailwind CSS** + **Lucide Icons**.
- **Separate Micro-Directory Structure**:
  - `backend/`: FastAPI application, EasyOCR service, SQLAlchemy models, Alembic/migrations, upload directory.
  - `frontend/`: Next.js App Router application with dual-portal role segregation.

---

## 🏛️ Distinct Role-Based Portals

### 1. Dedicated Dual-Role Gateway (`/login`)
- 1-Click Fast Login for Jury & Evaluators:
  - 🏛️ **AICTE Regulatory Authority**: *Dr. Rajeshwar Sharma (Director Approval)* or *Pooja Deshmukh (Scrutiny Official)*
  - 🎓 **Technical College Representative**: *Delhi Technological Institute* or *Aryabhatta College of Engineering*
- Persistent Role Switcher in the top navigation bar for immediate switching between perspectives.

### 2. AICTE Directorate / Scrutiny Portal (`/admin/...`)
- **Executive Portfolio Dashboard** (`/admin/dashboard`):
  - Total Security Corpus (₹ Cr), active vs maturing vs overdue deposits.
  - Automated High-Risk Discrepancy Alerts (e.g. duplicate reference flags).
  - Issuing Bank Distribution (SBI, PNB, Canara Bank, Bank of Baroda).
- **Master FDR Repository** (`/admin/repository`):
  - Real-time search across FDR numbers, institutions, AICTE IDs, and banks.
  - Multi-criteria filtering by verification status and maturity window.
- **EasyOCR Scrutiny & Verification Studio** (`/admin/scrutiny`):
  - **Side-by-Side Comparison**: Uploaded physical FDR certificate on the left, institutional entered data vs EasyOCR extracted fields on the right.
  - Discrepancy Flagging (Amount mismatches, invalid maturity date spans, duplicate instruments).
  - Official Determination Buttons: *Approve & Mark Verified*, *Request Institutional Correction*, *Flag for Scrutiny*.
- **Maturity & Escalation Engine** (`/admin/maturity`):
  - Visual timeline for 30-day advance notice, 15-day urgent prompt, and overdue escalation.
  - Manual & scheduled trigger for automated reminder dispatch.
- **Security Deposit Release Clearance** (`/admin/releases`):
  - 5-stage regulatory clearance checklist before releasing joint liens.
- **Tamper-Evident Audit Ledger** (`/admin/audit`):
  - Chronological immutable event history with origin IP and downloadable CSV ledger.

### 3. Institutional College Portal (`/institution/...`)
- **Compliance Health Dashboard** (`/institution/dashboard`):
  - Identity banner with AICTE ID and official compliance badge (`Compliant` or `Under Scrutiny`).
  - Active FDR guarantees and action-required discrepancy notices.
- **Submit New FDR with Live EasyOCR Auto-Scan** (`/institution/submit-fdr`):
  - Drag-and-drop receipt upload.
  - **Live EasyOCR scan button**: automatically extracts Bank Name, Reference No, Deposit Amount, and Maturity Date into form fields!
  - Pre-validation against duplicate instruments.
- **Pledged FDRs** (`/institution/my-fdrs`):
  - Institutional ledger with official AICTE verification status badges and scrutiny remarks.
- **Renewal & Replacement Desk** (`/institution/renewals`):
  - Link expiring deposits to new replacement FDRs to preserve continuous regulatory compliance lineage.
- **Deposit Refund Application** (`/institution/release-request`):
  - Apply for refund remittance with bank details and governing body clearance attachments.

---

## 🛠️ How to Run Locally

### Quick Launch (Windows)
Double click `run_servers.bat` in the root folder, or start each service:

### 1. Backend (FastAPI + EasyOCR)
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 2. Frontend (Next.js)
```bash
cd frontend
npm run dev -- -p 3001
```
- Web Application: [http://localhost:3001/login](http://localhost:3001/login)

---

## 🧪 Evaluation Test Scenarios (SIH Jury Walkthrough)

| Scenario | Steps to Demonstrate in App | Expected Result |
| :--- | :--- | :--- |
| **Dual Portal Login** | Open `/login`, toggle between AICTE Directorate and College tabs. Click 1-Click login. | Directly loads corresponding customized dashboard. |
| **Live EasyOCR Auto-Scan** | Go to `/institution/submit-fdr`, click test certificate *Valid SBI Certificate*. Click *Scan with EasyOCR*. | EasyOCR extracts ₹25,00,000, SBI, and maturity date directly into the form fields. |
| **Side-by-Side Scrutiny Studio** | Go to `/admin/scrutiny`, select `FDR-26001` or `FDR-26005`. | Side-by-side certificate preview vs data reconciliation table with discrepancy flags. |
| **Duplicate Instrument Detection** | Inspect `FDR-26005` in Scrutiny Studio. | System displays **CRITICAL: Duplicate reference SBI-884219 already pledged in FDR-26001**! |
| **Maturity & Escalation Alerts** | Go to `/admin/maturity`, click *Run Reminder Engine Now*. | System evaluates dates and dispatches policy notices (30-day, 15-day, overdue). |
| **Security Deposit Release** | Go to `/admin/releases`, select `REL-26001` (North Valley Institute) and click *Approve Refund Release*. | Updates status, releases lien, and logs event in audit trail. |
| **Audit Ledger Export** | Go to `/admin/audit`, click *Export CSV Ledger*. | Downloads full chronological compliance CSV ledger. |
