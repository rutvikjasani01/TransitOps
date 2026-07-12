# 🚚 TransitOps – Smart Transport Operations Platform

> A modern Transport Operations Management System that digitizes vehicle, driver, trip, maintenance, fuel, and expense management while providing real-time operational insights.

![Status](https://img.shields.io/badge/Status-In%20Development-blue)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)
![Express.js](https://img.shields.io/badge/Backend-Express.js-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![License](https://img.shields.io/badge/License-MIT-orange)

---

# 📖 Overview

TransitOps is a centralized transport management platform designed to help logistics companies efficiently manage their fleet operations.

The platform replaces traditional spreadsheets and manual logbooks by providing a modern web-based solution for managing:

- 🚛 Vehicles
- 👨‍✈️ Drivers
- 📦 Trips
- 🔧 Maintenance
- ⛽ Fuel Logs
- 💰 Expenses
- 📊 Reports & Analytics

The system ensures that all transport operations follow business rules while providing actionable insights through dashboards and reports.

---

# 🎯 Problem Statement

Many logistics companies still rely on Excel sheets and paper records to manage their fleet.

This often causes:

- Scheduling conflicts
- Vehicle overbooking
- Driver assignment errors
- Expired licenses
- Missed maintenance
- Poor expense tracking
- Lack of operational visibility

TransitOps solves these problems by providing a centralized digital platform.

---

# ✨ Features

## 🔐 Authentication

- Secure Login
- JWT Authentication
- Role-Based Access Control (RBAC)
- Protected Routes
- Session Management

---

## 👥 User Roles

### Fleet Manager

- Manage Vehicles
- Maintenance Management
- Dashboard
- Reports

### Dispatcher

- Create Trips
- Assign Vehicles
- Assign Drivers
- Track Deliveries

### Safety Officer

- Driver Management
- License Monitoring
- Safety Score Tracking

### Financial Analyst

- Expense Management
- Fuel Tracking
- Cost Analysis
- Profitability Reports

---

# 📊 Dashboard

Interactive dashboard displaying:

- Active Vehicles
- Available Vehicles
- Vehicles in Maintenance
- Retired Vehicles
- Active Trips
- Pending Trips
- Completed Trips
- Drivers On Duty
- Fleet Utilization
- Fuel Efficiency
- Operational Cost
- Vehicle ROI

Includes:

- Interactive Charts
- KPI Cards
- Recent Activities
- Quick Actions
- Search & Filters

---

# 🚛 Vehicle Management

- Add Vehicle
- Edit Vehicle
- Delete Vehicle
- Vehicle Details
- Vehicle Status Tracking

### Vehicle Information

- Registration Number
- Vehicle Name
- Model
- Vehicle Type
- Maximum Load Capacity
- Odometer
- Acquisition Cost
- Status

Vehicle Status

- Available
- On Trip
- In Shop
- Retired

---

# 👨‍✈️ Driver Management

Manage driver information including:

- Name
- License Number
- License Category
- License Expiry
- Contact Number
- Safety Score
- Driver Status

Driver Status

- Available
- On Trip
- Off Duty
- Suspended

---

# 📦 Trip Management

Create and manage trips.

Trip Workflow

```
Draft
   ↓
Dispatched
   ↓
Completed

or

Cancelled
```

Trip Information

- Source
- Destination
- Driver
- Vehicle
- Cargo Weight
- Planned Distance
- Trip Date

---

# 🔧 Maintenance

Track vehicle servicing.

Features

- Maintenance History
- Maintenance Cost
- Maintenance Timeline
- Vehicle Availability
- Service Notes

---

# ⛽ Fuel Management

Track fuel usage.

Includes

- Fuel Logs
- Fuel Cost
- Fuel Consumption
- Fuel Efficiency

---

# 💰 Expense Management

Track operational expenses.

Categories

- Fuel
- Maintenance
- Toll
- Parking
- Other Expenses

---

# 📈 Reports & Analytics

Generate reports for

- Fleet Utilization
- Fuel Efficiency
- Operational Cost
- Vehicle ROI
- Maintenance Cost
- Expense Breakdown

Export

- CSV
- PDF (Optional)

---

# 📌 Business Rules

The system strictly enforces the following rules:

- Vehicle registration number must be unique.
- Retired vehicles cannot be assigned to trips.
- Vehicles under maintenance cannot be dispatched.
- Drivers with expired licenses cannot be assigned.
- Suspended drivers cannot be assigned.
- A vehicle already on a trip cannot be assigned again.
- A driver already on a trip cannot be assigned again.
- Cargo weight cannot exceed vehicle capacity.
- Dispatching a trip automatically changes driver and vehicle status to **On Trip**.
- Completing a trip automatically restores driver and vehicle status to **Available**.
- Cancelling a trip restores assigned resources.
- Creating a maintenance record automatically changes vehicle status to **In Shop**.
- Closing maintenance restores vehicle availability.

---

# 🎨 UI Features

- Modern Dashboard
- Responsive Design
- Dark Mode
- Light Mode
- Glassmorphism UI
- Smooth Animations
- Interactive Charts
- Loading Skeletons
- Toast Notifications
- Beautiful Tables
- Search
- Filters
- Sorting
- Pagination

---

# 🛠 Tech Stack

## Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts
- Lucide Icons

---

## Backend

- Node.js
- Express.js
- JWT
- bcrypt

---

## Database

- PostgreSQL

---

# 📁 Project Structure

```
TransitOps/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── contexts/
│   ├── lib/
│   ├── styles/
│   └── utils/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/your-username/transitops.git
cd transitops
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Backend

```bash
cd backend
npm install
npm run dev
```

---

## PostgreSQL

Create a PostgreSQL database.

Example

```sql
CREATE DATABASE transitops;
```

Update your `.env` file with your database credentials.

---

# 🔑 Environment Variables

Backend

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=transitops
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
```

---

# 📅 Development Roadmap

- [x] Project Setup
- [ ] Authentication
- [ ] Dashboard
- [ ] Vehicle Management
- [ ] Driver Management
- [ ] Trip Management
- [ ] Maintenance Module
- [ ] Fuel Module
- [ ] Expense Module
- [ ] Reports & Analytics
- [ ] Notifications
- [ ] Dark/Light Theme
- [ ] Testing
- [ ] Deployment

---

# 🌟 Future Enhancements

- Email Notifications
- Vehicle Document Management
- GPS Tracking
- Live Vehicle Location
- Driver Performance Analytics
- Predictive Maintenance
- Mobile Application
- Multi-language Support

---

# 👨‍💻 Team

Developed as part of a Hackathon project.

---

# 📄 License

This project is licensed under the MIT License.

---

## ⭐ If you found this project useful, consider giving it a star on GitHub!