# TransitOps backend

Express API using mock in-memory storage. No database is connected.

## Run

```bash
npm install
copy .env.example .env
npm run dev
```

The API is served at `http://localhost:4000/api/v1`.

## Mock accounts

All accounts use password `TransitOps123!`.

| Role | Email |
| --- | --- |
| Fleet Manager | fleet.manager@transitops.local |
| Driver | driver@transitops.local |
| Safety Officer | safety.officer@transitops.local |
| Financial Analyst | financial.analyst@transitops.local |

## Authentication endpoints

- `POST /auth/login` — `{ email, password }`
- `POST /auth/logout` — bearer token required
- `GET /auth/me` — bearer token required


## Vehicle endpoints

All vehicle routes require a bearer token. Any authenticated role can read. Only a Fleet Manager can create, edit, change status, or delete.

- `GET /vehicles?status=&type=&search=`
- `GET /vehicles/:vehicleId`
- `POST /vehicles`
- `PATCH /vehicles/:vehicleId` — vehicle fields only; status is intentionally excluded
- `PATCH /vehicles/:vehicleId/status` — `{ "status": "In Shop" }`
- `DELETE /vehicles/:vehicleId`

The mock store enforces case-insensitive unique registration numbers, positive capacity and acquisition cost, non-negative/non-decreasing odometers, valid types/statuses, and no update or deletion of a vehicle on an active trip. `On Trip` is managed only by trip dispatch/completion. Manager-controlled status changes are `Available → In Shop/Retired` and `In Shop → Available/Retired`; a retired vehicle cannot be reactivated.

## Driver endpoints

All driver routes require a bearer token. Any authenticated role can read. Fleet Managers and Safety Officers can create, edit, and change driver status; only Fleet Managers can remove a driver.

- `GET /drivers?status=&search=`
- `GET /drivers/:driverId`
- `POST /drivers`
- `PATCH /drivers/:driverId`
- `PATCH /drivers/:driverId/status`
- `DELETE /drivers/:driverId`

License numbers are unique without regard to case. License expiry is validated as a date and returned as `licenseExpired`. Expired licenses cannot be assigned an Available status. Safety scores must be 0–100. `On Trip` is controlled by trip dispatch/completion; active drivers cannot be edited, reclassified, or deleted.

## Fuel log endpoints

All fuel-log routes require a bearer token. Any authenticated role can read. Fleet Managers and Financial Analysts can create, edit, and delete entries.

- `GET /fuel-logs?vehicleId=&from=&to=`
- `GET /fuel-logs/summary?vehicleId=&from=&to=`
- `GET /fuel-logs/:fuelLogId`
- `POST /fuel-logs`
- `PATCH /fuel-logs/:fuelLogId`
- `DELETE /fuel-logs/:fuelLogId`

Each entry validates its vehicle, date, positive litres/cost, and odometer sequence. The API calculates `costPerLiter` and `efficiency` (km/L), recalculating a vehicle’s related logs after changes. A fuel reading raises the stored vehicle odometer when appropriate; fuel cannot be logged against a retired vehicle.

## Expense endpoints

All expense routes require a bearer token. Any authenticated role can read. Fleet Managers and Financial Analysts can create, edit, and delete expenses.

- `GET /expenses?category=&vehicleId=&from=&to=`
- `GET /expenses/summary?category=&vehicleId=&from=&to=`
- `GET /expenses/:expenseId`
- `POST /expenses`
- `PATCH /expenses/:expenseId`
- `DELETE /expenses/:expenseId`

Expenses validate category, positive amount, date, description, and optional vehicle reference. The summary provides total operational cost, average expense, totals by category, and totals by vehicle.
Use `Authorization: Bearer <accessToken>` for protected endpoints. Logout revokes the current token in mock storage; restarting the API clears that revocation list.
