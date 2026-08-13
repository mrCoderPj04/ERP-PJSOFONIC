<p align="center">
  <img src="./public/logo.png" alt="PJSOFONIC ERP Logo" width="200" />
</p>

# 🏢 PJSOFONIC ERP — Next.js Frontend UI Client

[![Render Deployment](https://img.shields.io/badge/Render-Live_Deployed-brightgreen?logo=render)](https://erp-pjsofonic.onrender.com/login)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

Official Enterprise Resource Planning (ERP) Frontend UI for **PJSOFONIC**.

---

## 🌐 Live Production Links

- 🚀 **Live Frontend Web App**: [https://erp-pjsofonic.onrender.com/login](https://erp-pjsofonic.onrender.com/login)
- ⚙️ **Live Backend API**: [https://pjsofonic-erp-backend.onrender.com/api](https://pjsofonic-erp-backend.onrender.com/api)
- 🔐 **EMS Auth API Integration**: `https://erp-backend-1-02lc.onrender.com/api`
- 📁 **CRM Projects Integration**: `https://pjsofonic-crm-backend.onrender.com`

---

## 🔑 Key Features & Business Workflows

- 🛑 **No Superadmin / Zero Dummy Fallback Data**: Purged all fake employees (e.g. Alex Rivera). Login is strictly restricted to registered staff in EMS.
- 👤 **Real-time Logged-in Staff Metadata**: Displays employee Name, Department, Designation, Email, Phone, Employee ID, and Profile Picture across Dashboard, Header, Sidebar, and Profile.
- 📊 **CRM Project Auto-Routing**: Customer projects approved in CRM automatically flow into the Team Leader's Project section.
- 👥 **Task Assignment to Registered Staff**: Team Leaders assign tasks with a dropdown containing all live registered EMS staff members.
- 🧪 **Quality Testing Pipeline**: Completed tasks automatically route to the Quality & AGM Quality department testing queue with strict statuses: `IN PROCESS` and `DONE`.

---

## 🛠️ Environment Variables (`.env`)

```env
NEXT_PUBLIC_BACKEND_URL="https://pjsofonic-erp-backend.onrender.com/api"
```

---

## 🚀 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build production bundle locally
npm run build
```

- Open [http://localhost:3000](http://localhost:3000) in your browser.
