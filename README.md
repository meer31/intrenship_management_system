# Internship Management Portal (IMP)
### Directorate of Industrial Liaison & Career Services
**Architected & Developed by Qodex Software**

---

## 1. Executive Summary

The **Internship Management Portal (IMP)** is an institutional, multi-role web platform designed to digitize and streamline the end-to-end undergraduate and postgraduate internship placement lifecycle for universities and higher education institutions.

The platform provides dedicated, role-tailored dashboards and workflows for:
1. **Director / Administrator**: Full institutional governance over departments, cohorts, students, faculty focal persons, corporate opportunities, nomination decisions, analytics, and printable documentation.
2. **Department Focal Person**: Isolated departmental oversight to vet candidate academic standing, endorse applications to the Director, track student dossiers, and review post-training reports.
3. **Student**: Intuitive career portal to discover corporate opportunities, submit applications with statements of purpose and resumes, track nomination milestones, preview and download digitally verified official approval letters, and submit final completion reports.

---

## 2. Technology Stack & Architecture

- **Core Framework**: React 19, TypeScript, Vite
- **Styling & Design System**: Tailwind CSS (Academic Professional theme tokens), Lucide React
- **Routing**: React Router DOM (Declarative, Protected & Role-guarded routing)
- **Forms & Validation**: React Hook Form, Zod schema validation
- **Analytics & Visualizations**: Recharts (Responsive Area, Bar, and Donut charts)
- **Document Generation**: jsPDF (Official institutional recommendation letters & tabular audit reports)
- **Notifications**: Sonner (Rich, accessible toast notifications)
- **HTTP Client**: Axios with centralized request/response interceptors and bearer token authorization
- **State & Storage**: React Context API (`AuthContext`) paired with a persistent reactive mock datastore (`mockStorage.ts`) in `localStorage`

---

## 3. Design System — "Academic Professional"

The portal strictly adheres to the approved Academic Professional color tokens and design language:

| Design Token | Hex Code | Primary Usage |
| :--- | :--- | :--- |
| **Navy Blue** | `#142D4E` | Sidebar, primary brand buttons, headings, navigation |
| **Academic Teal** | `#168F88` | Active indicators, selected elements, success states |
| **Page Background** | `#F4F7FA` | Global background canvas |
| **Card Background** | `#FFFFFF` | Elevation cards, modals, data tables |
| **Primary Text** | `#1E293B` | High-contrast body & header typography |
| **Secondary Text** | `#64748B` | Subheadings, metadata, captions |
| **Border** | `#DCE4EC` | Clean, subtle card & table separators |
| **Warning / Pending** | `#D69E36` | Pending reviews, awaiting evaluation |
| **Danger / Rejected** | `#D65A5A` | Rejections, destructive confirmations |

### Application Status Standards
- **Applied**: Neutral Blue (`#2563EB`)
- **Pending Focal Person Review**: Amber (`#D69E36`)
- **Rejected by Focal Person**: Muted Red (`#D65A5A`)
- **Forwarded to Director**: Purple (`#7C3AED`)
- **Approved by Director**: Teal / Green (`#168F88`)
- **Rejected by Director**: Muted Red (`#D65A5A`)
- **Completed**: Institutional Teal (`#168F88`)
- **Report Pending**: Amber (`#D69E36`)
- **Report Submitted / Approved**: Blue / Green

---

## 4. Key Modules & Features Implemented

### 4.1 Directorate / Administrator Module
- **Overview Dashboard**: 10 key metric stat cards, monthly application vs. approval trend area chart, department-wise placement comparison bar chart, quick links, and recent submissions table.
- **Student Management**: Full CRUD, search, department and batch filters, GPA validation, CNIC checks, status toggles (Active/Inactive), and pagination.
- **Department Management**: Management of academic divisions, department codes, focal person assignment, and enrolled student counters.
- **Batch Management**: Academic cohorts setup with start/end calendar years and student allocation tracking.
- **Focal Person Management**: Directory of faculty coordinators, department appointments, contact credentials, and authorization status.
- **Corporate Internship Management**: Multi-section form configuring corporate partner details, location, stipend, work arrangement (On-site, Hybrid, Remote), requirements, eligible departments and batches, quota slots breakdown, deadline, and publication status.
- **Application Dossier Review**: Comprehensive application pipeline with multi-tab filters, candidate review dossiers with full audit trails, and Director decision modal (Approve/Reject with justification). Approval triggers automatic generation of an official numbered letter.
- **Reporting & Analytics**: Date, department, batch, and company filters; interactive charts; tabular audit logs; and functional **Export to Excel (CSV)** and **Export to PDF** buttons.
- **Report Repository**: Centralized archive of submitted student technical reports with download capability and faculty/director grading (`Excellent`, `Satisfactory`, `Unsatisfactory`).
- **Institutional Settings**: Portal configuration, academic year parameters, minimum CGPA threshold, automated notification toggles, and mock datastore reset tool.

### 4.2 Department Focal Person Module
- **Department Overview**: 8 isolated department statistics, recent student applications, and active departmental opportunities.
- **Department Student Roster**: Roster restricted strictly to the focal person's assigned department. Adding students automatically locks the department ID.
- **Department Internships**: Listing of corporate opportunities eligible for students in the assigned department with quota slots breakdown.
- **Nomination Requests**: Review queue where focal persons vet candidate prerequisites and either **Endorse & Forward to Director** or **Reject with Reason**.
- **Department Reports**: Departmental placement charts and cohort breakdown with Excel/PDF export.
- **Department Report Repository**: View and download final completion reports submitted by department students.
- **Faculty Profile**: Manage faculty focal person contact information and office details.

### 4.3 Student Portal
- **Student Dashboard**: 7 KPI stat cards, interactive 4-stage institutional placement workflow timeline, recent applications status, and featured company openings.
- **Academic Profile**: Verified institutional details (Roll No, CNIC, Degree, CGPA, Batch) and editable contact information (Cell, Alternate Email, LinkedIn, GitHub).
- **Available Internships**: Responsive cards featuring corporate partner logos, stipend, deadline, slots, eligibility checks, search, and filters.
- **Internship Details & Application**: Complete role specifications and prerequisites. Includes dynamic guard checks (Deadline passed, department mismatch, cohort mismatch, or already applied). The application modal includes a Statement of Purpose and verified resume attachment.
- **My Applications**: Status badges and detailed review milestones audit trail.
- **Official Approval Letters**: Stamped recommendation letters featuring university crest, reference number, Director & Focal signatures, and working **Print** and **Download PDF** features.
- **Completion Reports**: Upload interface supporting PDF/DOCX (up to 10 MB), executive summary submission, upload progress simulation, and status/grade tracking.
- **Notifications & Settings**: Institutional alerts with direct navigation links, email preference toggles, and security password updates.

---

## 5. Instant Demo Credentials

For demonstration and testing purposes, quick login chips are built into both the **Login Page** and the **Top Navigation Bar**:

| Role | Name & Title | Email | Default Password |
| :--- | :--- | :--- | :--- |
| **Director / Admin** | Prof. Dr. Arshad Munir | `director@qodex.edu.pk` | `password123` |
| **Focal Person (CS)** | Dr. Tariq Mahmood | `focal.cs@qodex.edu.pk` | `password123` |
| **Focal Person (SE)** | Engr. Aisha Siddiqui | `focal.se@qodex.edu.pk` | `password123` |
| **Student** | Hamza Farooq (2021-CS-104) | `hamza.cs@student.qodex.edu.pk` | `password123` |

*(You can also switch roles on the fly at any time via the **"Demo Switch"** dropdown in the top navbar without logging out).*

---

## 6. Local Setup and Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24 LTS tested)
- **npm**: v9.0.0 or higher

### Steps to Run

1. **Clone or navigate to the repository directory**:
   ```bash
   cd d:\IMS
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Verify `.env` (or copy from `.env.example`):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_NAME="Internship Management Portal"
   VITE_ENABLE_MOCK_STORAGE=true
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

5. **Run Type Checking & Production Build**:
   ```bash
   npm run build
   ```

6. **Preview Production Build**:
   ```bash
   npm run preview
   ```

7. **Run Linter**:
   ```bash
   npm run lint
   ```

---

## 7. Future MERN Backend Integration Strategy

The frontend service layer in `src/services/` (`student.service.ts`, `internship.service.ts`, `application.service.ts`, etc.) is fully decoupled from the UI layer. When the Express.js / MongoDB backend is connected:
1. Update `VITE_API_BASE_URL` in `.env` to point to the live Express API.
2. In each service module, swap the mock storage calls with standard `apiClient.get()`, `apiClient.post()`, `apiClient.put()`, and `apiClient.delete()` endpoints.
3. The centralized Axios client in `src/services/api.ts` already attaches JWT Bearer tokens from storage and intercepts `401 Unauthorized` responses to redirect to the institutional login page.

---
*Developed with enterprise engineering standards by **Qodex Software**.*
