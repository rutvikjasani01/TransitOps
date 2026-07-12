# NAVIX – Smart Fleet Management Platform

NAVIX (formerly TransitOps) is a premium, smart transport operations and fleet management platform developed for the Odoo Hackathon. The application is built with a modern Next.js 15 frontend, a robust Express.js backend, and a PostgreSQL database using Prisma ORM.

---

## 🚀 Key Features

- **NAVIX Brand UI**: Sleek, dark-mode design system with a responsive side-drawer, and smooth micro-interactions.
- **Premium Splash Loader**: Road-line loading bar featuring a driving truck animation, status messages, and smooth transitions into the app dashboard.
- **Role-Based Simulator Access**: Quick-selector login options matching simulated database profiles for **Fleet Managers**, **Dispatchers**, **Safety Officers**, and **Financial Analysts**.
- **Real-Time Data Integration**: Fully connected APIs tracking vehicles, drivers, trips, fuel metrics, maintenance tickets, and operational expenses in a live PostgreSQL database.
- **Intelligent Dispatch System**: Prevents dispatches if a vehicle is in maintenance/retired, driver has an expired license/is suspended, or cargo weight exceeds limits.
- **Operational Cost Computations**: Automated calculation of fuel efficiencies based on sequential odometer entries, maintenance logs, and financial charts.

---

## 🛠️ Tech Stack & Requirements

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion, Axios, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, Prisma ORM, CORS, Helmet, Express-Rate-Limit, BCrypt, JWT.
- **Database**: PostgreSQL (v15+ or local service).

---

## 🔧 Installation & Setup

### 1. Database Configuration
1. Ensure a local PostgreSQL server is running on port `5432`.
2. Create or verify the environment configuration file in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:123@localhost:5432/transitops?schema=public"
   PORT=4000
   JWT_SECRET="transitops_super_secret_key_12345"
   CLIENT_ORIGIN="http://localhost:3000"
   ```

### 2. Backend Installation & Database Setup
Navigate to the `backend` directory, install packages, and prepare database schemas:
```bash
cd backend
npm install

# Push structural tables to PostgreSQL
npx prisma db push --force-reset

# Seed baseline operations profiles (vehicles, drivers, default transactions)
npx prisma db seed

# Start the Express server
npm run dev
```
*The API server will listen on [http://localhost:4000](http://localhost:4000).*

### 3. Frontend Installation & Startup
Navigate to the root workspace directory, install dependencies, and run the Next.js compilation:
```bash
npm install
npm run dev
```
*The web dashboard runs at [http://localhost:3000](http://localhost:3000).*

---

## 🔐 Simulator Login Accounts
Use the quick-select logins on the portal page or enter credentials manually:

| Simulator Role | Credentials | Access Level |
| :--- | :--- | :--- |
| **Fleet Manager** | `manager@navix.com` / `password123` | Full administrative controls, reports, registry CRUDs, fuel logs, and maintenance shop bookings. |
| **Dispatcher** | `driver@navix.com` / `password123` | Control over scheduling dispatches, vehicle statuses, and trip workflows. |
| **Safety Officer** | `safety@navix.com` / `password123` | Roster viewing, safety metrics auditing, driver profiles monitoring. |
| **Financial Analyst** | `finance@navix.com` / `password123` | Operational expenses tables, fuel transactions audit logs. |

---

## 📦 Directory Structure
- `/src/components/layout/Shell.tsx`: Global app layout containing the sidebar, navbar, search bars, notifications dropdowns, and the premium **NAVIX** opening splash animation.
- `/src/contexts/TransitStateContext.tsx`: Client-side state broker coordinating mutations and Axios REST queries.
- `/backend/prisma/schema.prisma`: Normalized model maps.
- `/backend/src/services/`: LIVE database transaction logic for assets, driver licensing locks, and calculated logs.
