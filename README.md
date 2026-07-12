# 🚚 TransitOps – Smart Transport Operations Platform

## Overview

TransitOps is a modern transport operations management platform designed to help organizations efficiently manage their fleet, drivers, trips, maintenance, fuel consumption, and operational expenses from a single centralized dashboard.

The platform replaces traditional spreadsheet-based workflows with an intuitive digital solution that improves operational visibility, minimizes scheduling conflicts, and streamlines day-to-day fleet management.

**Built for:** Odoo Hackathon (8-hour build)
**Objective:** Build an end-to-end transport operations platform that digitizes vehicle, driver, dispatch, maintenance, and expense management while enforcing business rules and providing operational insights.

---

## Problem Statement

Many transport and logistics companies still rely on manual records to manage vehicles, drivers, maintenance schedules, and operational expenses. This often results in:

* Vehicle scheduling conflicts
* Underutilized fleet resources
* Missed maintenance schedules
* Expired driver licenses
* Inaccurate expense tracking
* Limited operational insights

TransitOps addresses these challenges by providing a centralized platform with automated workflows, real-time tracking, and intelligent analytics.

---

## Target Users / Roles

> ⚠️ **Note:** The source problem statement assigns trip creation to the **Driver** role rather than a separate Dispatcher role. This README follows that definition — adjust if your implementation introduces a dedicated Dispatcher role instead.

* **Fleet Manager** – Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency.
* **Driver** – Creates trips, assigns vehicles and drivers, and monitors active deliveries.
* **Safety Officer** – Ensures driver compliance, tracks license validity, and monitors safety scores.
* **Financial Analyst** – Reviews operational expenses, fuel consumption, maintenance costs, and profitability.

---

## Key Features

### Authentication & Access Control

* Secure login using email and password
* Role-Based Access Control (RBAC)
* Only authenticated users can access the application

### Dashboard

KPIs displayed:
* Active Vehicles
* Available Vehicles
* Vehicles in Maintenance
* Active Trips
* Pending Trips
* Drivers On Duty
* Fleet Utilization (%)

Filters: by vehicle type, status, and region.

### Vehicle Registry

Master list of vehicles with the following fields:
* Registration Number (**unique**)
* Vehicle Name / Model
* Type
* Maximum Load Capacity
* Odometer
* Acquisition Cost
* Status: `Available` · `On Trip` · `In Shop` · `Retired`

### Driver Management

Driver profiles with the following fields:
* Name
* License Number
* License Category
* License Expiry Date
* Contact Number
* Safety Score
* Status: `Available` · `On Trip` · `Off Duty` · `Suspended`

### Trip Management

* Create trips by selecting source, destination, available vehicle, available driver, cargo weight, and planned distance
* Trip lifecycle: `Draft → Dispatched → Completed → Cancelled`
* Cargo weight validated against vehicle's max load capacity before dispatch

### Maintenance Management

* Create maintenance records for vehicles
* Adding a vehicle to a Maintenance Log automatically switches its status to `In Shop`, removing it from the driver/vehicle selection pool
* Closing a maintenance record restores the vehicle to `Available` (unless the vehicle is `Retired`)

### Fuel & Expense Tracking

* Fuel log management (liters, cost, date)
* Other operational expenses (tolls, maintenance, etc.)
* Automatic computation of total operational cost (Fuel + Maintenance) per vehicle

### Reports & Analytics

* Fuel Efficiency (Distance / Fuel)
* Fleet Utilization
* Operational Cost
* Vehicle ROI:

  $$ROI = \frac{Revenue - (Maintenance + Fuel)}{Acquisition\ Cost}$$

* CSV export (**mandatory**); PDF export (optional / bonus)

---

## Mandatory Business Rules

* Vehicle registration number must be unique
* `Retired` or `In Shop` vehicles must never appear in the dispatch selection
* Drivers with expired licenses or `Suspended` status cannot be assigned to trips
* A driver or vehicle already marked `On Trip` cannot be assigned to another trip
* Cargo weight must not exceed the vehicle's maximum load capacity
* Dispatching a trip automatically sets both vehicle and driver status to `On Trip`
* Completing a trip automatically resets both vehicle and driver status to `Available`
* Cancelling a dispatched trip restores the vehicle and driver to `Available`
* Creating an active maintenance record automatically changes vehicle status to `In Shop`
* Closing maintenance restores the vehicle to `Available` (unless `Retired`)

---

## Example Workflow

1. Register a vehicle **Van-05** with a maximum capacity of 500 kg. Status = `Available`.
2. Register driver **Alex** with a valid driving license.
3. Create a trip with Cargo Weight = 450 kg.
4. System validates 450 kg ≤ 500 kg and allows dispatch.
5. Vehicle and Driver status automatically become `On Trip`.
6. Complete the trip by entering the final odometer and fuel consumed.
7. System marks both Vehicle and Driver as `Available`.
8. Create a maintenance record (e.g., Oil Change). Vehicle status automatically becomes `In Shop` and is hidden from dispatch.
9. Reports update operational cost and fuel efficiency based on the latest trip and fuel log.

---

## Technology Stack

### Frontend
* React.js
* Tailwind CSS
* TypeScript
* Framer Motion

### Backend
* Odoo Framework
* NextJS

### Database
* PostgreSQL

### Charts & Analytics
* Chart.js / Recharts

### Version Control
* Git
* GitHub

> Note: The problem statement does not mandate a specific tech stack — this is the team's chosen implementation stack.

---

## Expected Database Entities

* Users
* Roles
* Vehicles
* Drivers
* Trips
* Maintenance Logs
* Fuel Logs
* Expenses

---

## Core Modules

* Authentication
* Dashboard
* Vehicle Registry
* Driver Management
* Trip Management
* Maintenance
* Fuel Logs
* Expense Management
* Reports & Analytics
* Notifications

---

## Project Structure

```text
TransitOps/
├── frontend/
├── backend/
├── assets/
├── components/
├── pages/
├── services/
├── database/
├── public/
└── README.md
```

---

## Mandatory Deliverables

* Responsive web interface
* Authentication with RBAC
* CRUD for Vehicles and Drivers
* Trip Management with validations
* Automatic status transitions
* Maintenance workflow
* Fuel & Expense tracking
* Dashboard with KPIs
* Charts and visual analytics

## Bonus Features

* PDF export
* Email reminders for expiring licenses
* Vehicle document management
* Search, filters, and sorting
* Dark mode

## Future Enhancements (post-hackathon)

* AI-powered fleet insights
* Predictive maintenance
* Real-time GPS tracking
* Driver performance analytics
* Mobile application
* Automated notifications
* Document management
* Advanced reporting

---

## Mockup

Excalidraw wireframe: https://link.excalidraw.com/l/65VNwvy7c4X/1FHGDNgD2td

---

## Team

Developed as part of the **Odoo Hackathon** to demonstrate a scalable and efficient transport operations management solution.

---

## License

This project is developed for educational and hackathon purposes.
