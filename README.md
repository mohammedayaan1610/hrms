# Pulse HRMS - Enterprise Human Resource Management System

A unified, full-stack Human Resource Management System built with Next.js 16 (App Router), TailwindCSS, NextAuth.js, and MongoDB Atlas (Mongoose).

---

## Features

- **Role-Based Access Control (RBAC)**: Strict role segregation between Employees and People Operations (Admin).
- **Data Isolation**: Employees can only view and manage their own profile and leave records. Server-side session validation protects all employee endpoints.
- **Leave Management**:
  - Initial entitlement of 5 days each for **Casual Leave**, **Sick Leave**, and **Medical Leave** (15 days total).
  - Only approved leaves deduct from available balance. Pending and rejected leaves do not reduce remaining quota.
  - Server-side balance check, date consistency checks, and duplicate approval prevention.
- **Admin Workforce Oversight**: Real-time employee directory, employee creation, and leave approval/rejection workflows.

---

## Prerequisites

- **Node.js**: v18.17+ or v20+
- **MongoDB**: A running MongoDB instance or MongoDB Atlas cluster URI.

---

## Setup & Installation

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd hrms
npm install
```

### 2. Configure Environment Variables

Copy the example environment configuration file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and provide your credentials:

```ini
# MongoDB Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/hrms?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_hex_32

# Admin Setup Configuration (used by scripts/create-admin.mjs)
ADMIN_EMAIL=admin@pulsehrms.com
ADMIN_PASSWORD=your_secure_admin_password_min_12_chars
ADMIN_EMPLOYEE_ID=HRMS-ADMIN-001
```

> **Security Note**: Never commit `.env.local` or environment secrets to Git.

---

## Database & Admin Setup

### 1. Create Initial Administrator Account

Run the administrative seed script:

```bash
node --env-file=.env.local scripts/create-admin.mjs
```

### 2. Verify Admin Account

Verify the account in the database:

```bash
node --env-file=.env.local scripts/check-admin.mjs
```

---

## Running the Application

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## Security Architecture

1. **Authentication & Identity**: Protected API routes resolve identity using `getServerSession(authOptions)`. Client-supplied IDs are never trusted for ownership or authorization.
2. **Access Control**: Returns `401 Unauthorized` for unauthenticated requests and `403 Forbidden` for unauthorized roles.
3. **Transaction Safety**: Leave request approvals enforce single-transition states (`Pending` -> `Approved` / `Rejected`) to prevent double deduction or race conditions.
4. **Input Sanitation & Validation**:
   - Dates must be valid and `startDate <= endDate`.
   - Days must be positive integers not exceeding remaining quota.
   - Employee IDs and email addresses enforce uniqueness.
