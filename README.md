<p align="center">
  <img src="./public/logo.png" alt="PJSOFONIC ERP Logo" width="220" />
</p>

# 🏢 PJSOFONIC ERP — Enterprise Cloud Platform (Next.js Client)

[![Render Frontend Deployment](https://img.shields.io/badge/Render-Live_Deployed-brightgreen?logo=render)](https://erp-pjsofonic.onrender.com/login)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-project__erp-3ECF8E?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)

Enterprise Resource Planning (ERP) platform frontend for **PJSOFONIC Enterprise Ecosystem**, featuring multi-department collaboration across Admin, Team Leaders, Full Stack Engineers, and Quality Assurance with automated CRM ingestion, QMS test suite integration, real-time EMS messaging, and Excel/PDF reporting.

---

## 🌐 Live Production Architecture & Links

| Service | Role | Live URL / Endpoint |
|---|---|---|
| **ERP Frontend** | Main Web Application UI | [https://erp-pjsofonic.onrender.com/login](https://erp-pjsofonic.onrender.com/login) |
| **ERP Backend API** | Express REST API & Database Gateway | [https://pjsofonic-erp-backend.onrender.com/api](https://pjsofonic-erp-backend.onrender.com/api) |
| **EMS Directory & Auth** | Real-Time Staff Directory & Login | `https://erp-backend-1-02lc.onrender.com/api` |
| **CRM Backend** | Customer Projects Ingestion | `https://pjsofonic-crm-backend.onrender.com` |
| **QMS Quality Suite** | Live Quality Management & Testing Engine | [https://pjsofonic-qms.onrender.com/](https://pjsofonic-qms.onrender.com/) |
| **Supabase Database** | Cloud PostgreSQL Schema (`project_erp`) | `https://ffauweryjzpnskdaqcyp.supabase.co` |

---

## 📊 End-to-End Master Workflow Diagram

```mermaid
flowchart TD
    %% 1. AUTHENTICATION (Left Box)
    subgraph S1 ["🔐 1. Authentication & EMS Identity Gateway"]
        direction TB
        AUTH_IN["Staff Login Screen (/login)<br/>(Employee ID / Email + Password)"]
        EMS_AUTH["EMS Backend Auth API<br/>(https://erp-backend-1-02lc.onrender.com)"]
        ROLE_CHECK{"Role & Department<br/>Classification"}
        ROLE_A["👑 ADMIN<br/>(Portfolio & Approvals)"]
        ROLE_TL["👑 TEAM LEADER<br/>(Dual Workbench)"]
        ROLE_FS["💻 FULL STACK<br/>(4 Deliverables)"]
        ROLE_QA["🛡️ QUALITY / QA<br/>(3 Reports & QMS)"]

        AUTH_IN --> EMS_AUTH
        EMS_AUTH --> ROLE_CHECK
        ROLE_CHECK --> ROLE_A
        ROLE_CHECK --> ROLE_TL
        ROLE_CHECK --> ROLE_FS
        ROLE_CHECK --> ROLE_QA
    end

    %% 2. STAGE 1 (Center Top Box)
    subgraph S2 ["👑 2. Stage 1: Project Creation & Dispatch"]
        direction TB
        CRM_IN["CRM Customer Projects Ingestion<br/>(https://pjsofonic-crm-backend.onrender.com)"]
        ADMIN_MANUAL["Admin Manual Project Creation Desk<br/>(Projects Desk /projects)"]
        ADMIN_HUB["Admin Project Master Control Desk<br/>(Ingests client scope & budget)"]
        SELECT_TL["Select Department Team Leader<br/>(Registered EMS Team Leaders Dropdown)"]
        NOTIF_1["🔔 Real-Time System Notification Sent<br/>('[Admin] assigned project to you')"]

        CRM_IN --> ADMIN_HUB
        ADMIN_MANUAL --> ADMIN_HUB
        ADMIN_HUB --> SELECT_TL
        SELECT_TL --> NOTIF_1
    end

    %% 3. STAGE 2 (Center Upper Box)
    subgraph S3 ["💻 3. Stage 2: Team Leader Execution & 4 Deliverables"]
        direction TB
        TL_DASH["Team Leader Assigned Projects Workbench<br/>(Dashboard 'Assigned Projects')"]
        ASSIGN_FS["TL Assigns to Full Stack Engineer<br/>([FS ID] Full Name)"]
        NOTIF_2["🔔 Real-Time Notification Dispatched<br/>('[TL Name] assigned project to you')"]
        FS_DESK["Full Stack Engineer Workspace Desk"]
        UPLOAD_DELIV["Upload 4 Required Deliverables:<br/>1. 📑 Implementation Plan (Architecture & DB)<br/>2. 🖼️ Logo Image Asset URL<br/>3. 📝 Walkthrough Guide (Setup & Tests)<br/>4. 📊 Workflow Architecture Chart"]
        TL_REVIEW["TL Production Review & Approval<br/>(Clicks 'Approve & Send to Quality')"]
        SENT_TO_QA["Status: SENT_TO_QUALITY"]

        TL_DASH --> ASSIGN_FS
        ASSIGN_FS --> NOTIF_2
        NOTIF_2 --> FS_DESK
        FS_DESK --> UPLOAD_DELIV
        UPLOAD_DELIV --> TL_REVIEW
        TL_REVIEW --> SENT_TO_QA
    end

    %% 4. STAGE 3 (Center Lower Box)
    subgraph S4 ["🛡️ 4. Stage 3: Quality Assurance & QMS Testing Platform"]
        direction TB
        QA_QUEUE["Quality Assurance Testing Queue<br/>(Live at /quality & /api/qms/projects)"]
        BTN_1["🔘 Button 1: Submit 3 QA Reports<br/>(Bug, Test & Quality Report Grade A+)"]
        BTN_2["🔘 Button 2: Approve Report<br/>(Marks status: QUALITY_APPROVED)"]
        BTN_3["🔘 Button 3: Test Project (QMS)<br/>(Opens https://pjsofonic-qms.onrender.com)"]
        QA_VERIFIED["Quality Sign-off Granted & Verified"]
        NOTIF_3["🔔 Real-Time Notification Fired<br/>('QA approved reports for project')"]

        QA_QUEUE --> BTN_1
        QA_QUEUE --> BTN_2
        QA_QUEUE --> BTN_3
        BTN_1 --> QA_VERIFIED
        BTN_2 --> QA_VERIFIED
        BTN_3 --> QA_VERIFIED
        QA_VERIFIED --> NOTIF_3
    end

    %% 5. STAGE 4 (Center Bottom Box)
    subgraph S5 ["🏁 5. Stage 4: Final Sign-Off & Project Closure"]
        direction TB
        TL_QA_SEC["Team Leader Quality Review Workbench<br/>(Reviews verified 3 QA Reports)"]
        TL_SUBMIT_DONE["TL Clicks 'Project All Done'<br/>(Status: SUBMITTED_TO_ADMIN)"]
        ADMIN_FINAL["Admin Final Review Command Desk"]
        ADMIN_TOTAL_APP["Admin Grants Final Total Approval"]
        PROJECT_COMPLETED["🎉 Project Marked COMPLETED (🟢)<br/>(Across all user profiles & databases)"]
        EXPORTS["📊 Instant Dossier Exports & Archive<br/>• Project Dossier PDF • Project Data Excel • Timesheets Excel"]

        TL_QA_SEC --> TL_SUBMIT_DONE
        TL_SUBMIT_DONE --> ADMIN_FINAL
        ADMIN_FINAL --> ADMIN_TOTAL_APP
        ADMIN_TOTAL_APP --> PROJECT_COMPLETED
        PROJECT_COMPLETED --> EXPORTS
    end

    %% 6. SHARED SERVICES (Right Box)
    subgraph S6 ["⚡ 6. Real-Time Shared Ecosystem Services"]
        direction LR
        CHAT_HUB["💬 Chat Hub<br/>• Team & Direct DM"]
        TIMESHEET["⏱️ Timesheet<br/>• 1-Click DONE"]
        NOTIF_ENGINE["🔔 Alerts Bus<br/>• Dynamic Names"]
        GATEWAYS["🚀 Gateways<br/>• ProjectOS & QMS"]
    end

    %% Main Vertical Sequence
    S2 --> S3
    S3 --> S4
    S4 --> S5
```

---

## 🔄 Multi-Department Roles & Responsibilities

### 1. 👑 Admin Command Hub
- Ingests active customer projects directly from CRM.
- Selects Department Team Leader from registered EMS Team Leaders (`[TL ID] Full Name - Department`).
- Downloads PDF and Excel project dossiers.
- Grants **Final Total Approval**, marking the project as Completed across all profiles.

### 2. 👑 Team Leader Dual Workbench
- **Production Section (`Assigned Projects`)**:
  - Automatically fetches projects assigned by Admin in real-time.
  - Assigns projects to Full Stack Engineers (`[FS ID] Full Name`).
  - Reviews the **4 Full Stack submitted deliverables** (Implementation Plan, Logo Image, Walkthrough, Workflow Chart).
  - Approves and dispatches project directly to the **Quality Profile & QMS**.
- **Quality Section**:
  - Reviews the **3 verified QA reports** (Bug report, Test report, Quality report).
  - Downloads Team Timesheets in Excel and Project Dossiers in PDF/Excel.
  - Submits **"Project All Done"** to Admin for final sign-off.

### 3. 💻 Full Stack Engineer Execution Desk
- Views assigned projects and daily engineering tasks.
- Uploads the **4 required deliverables**:
  1. `Implementation Plan` (Architecture, schemas, endpoints)
  2. `Logo Image` (Asset URL preview)
  3. `Walkthrough` (Test cases, setup guide, demo notes)
  4. `Workflow Chart` (Architecture / process diagram)
- Manages daily interactive **Timesheet TODOs** with one-click Done toggling.

### 4. 🛡️ Quality Assurance Hub & QMS Integration
- Prioritized Quality Auditor workspace.
- Distinct separate actions:
  - **`Submit 3 QA Reports` / `Edit 3 QA Reports`**: Enters Bug Report, Test Report, and Quality Report.
  - **`Approve Report`**: Grants Quality Approval (`QUALITY_APPROVED`) and forwards to Team Leader.
  - **`Test Project`**: Opens the live QMS test platform: [`https://pjsofonic-qms.onrender.com/`](https://pjsofonic-qms.onrender.com/).

---

## 🔔 Real-Time System Notifications & Alerts

Live notification engine synchronized across all profiles with dynamic employee names:
- **Project Assignment**: `"You assigned project <Name> to <Recipient>"` / `"<Sender> assigned project <Name> to you"`
- **Deliverables Uploaded**: `"<Full Stack Name> submitted 4 deliverables for <Project Name>"`
- **Sent to Quality**: `"<TL Name> approved deliverables and sent <Project Name> to Quality testing"`
- **Quality Approved**: `"<QA Auditor Name> approved QA reports for <Project Name>"`
- **Project All Done**: `"<TL Name> marked <Project Name> ALL DONE and submitted for final approval"`
- **Direct & Team Chat**: `"<Sender Name> sent you a message: <text>"`
- **Timesheet Logged / Completed**: `"<Employee Name> created timesheet: <task>"` / `"<Employee Name> marked timesheet task as Done"`

---

## 💬 Two-Way Real-Time EMS Communication Hub (`/communication`)

- **Team Channel Tab**:
  - For **Team Leader Login**: Directory strictly displays **Full Stack Engineers (`💻`)** and **Quality Staff (`🛡️`)**.
  - For **Admin Login**: Directory strictly displays **Team Leaders (`👑`)** and **Quality Staff (`🛡️`)**.
- **Direct DM Chat Tab**:
  - Displays **ALL registered employees** from the live EMS database (`https://erp-backend-1-02lc.onrender.com/api/employees`).
  - Real-time 2-way messaging sync across open tabs and browser windows.

---

## 📊 Automated PDF & Excel Reporting

- **Project Dossiers**: Formatted export with client scope, financial budget, production deliverables, and verified QA reports.
- **Team Timesheets**: Formatted Excel export detailing employee IDs, completed tasks, and total logged hours.

---

## 🛠️ Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_BACKEND_URL="https://pjsofonic-erp-backend.onrender.com/api"
NEXT_PUBLIC_CRM_API_BASE="https://pjsofonic-crm-backend.onrender.com"
NEXT_PUBLIC_EMS_API_BASE="https://erp-backend-1-02lc.onrender.com/api"
NEXT_PUBLIC_PROJECTOS_API_BASE="https://sofo-projectos.onrender.com"
NEXT_PUBLIC_QMS_API_BASE="https://pjsofonic-qms.onrender.com"
NEXT_PUBLIC_SUPABASE_URL="https://ffauweryjzpnskdaqcyp.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_bLkboY3aqcA-LRqg7VROgw_IjxTh84f"
```

---

## 🚀 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server
npm run dev

# 3. Build production bundle
npm run build

# 4. Start production server
npm run start
```
