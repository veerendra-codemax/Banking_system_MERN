# MERN Bank — Internet Banking System

A full-stack starter project for an online banking system built on MongoDB, Express, React, and Node (MERN).

## Features

- **Registration & JWT auth** — signup opens a savings account automatically
- **Email/OTP verification** — 6-digit code required before login; falls back to console-logging in dev if no SMTP is configured
- **Password reset** via OTP
- **Account balance & transaction history** with pagination
- **Fund transfers** between accounts, done atomically with a MongoDB session transaction (won't leave money "stuck" halfway)
- **Bill payments**
- **Saved payees (beneficiaries)**
- **Admin console** — bank-wide stats, freeze/unfreeze accounts, activate/deactivate users, view all transactions

## Stack

- Backend: Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Nodemailer
- Frontend: React 18, Vite, React Router, Tailwind CSS, Axios

## Project layout

```
mern-banking/
├── backend/
│   ├── config/db.js
│   ├── controllers/        # business logic
│   ├── middleware/         # auth guard, error handler
│   ├── models/             # User, Account, Transaction, Beneficiary
│   ├── routes/
│   ├── .env.example
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   └── pages/
    └── index.html
```

## Getting started

### 1. Prerequisites

- Node.js 18+
- A MongoDB instance. **Fund transfers use a multi-document transaction**, which requires MongoDB to be running as a replica set (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster already is one — easiest path). A single standalone `mongod` will throw an error on transfer.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, and optionally SMTP_* for real emails
npm run dev
```

The API runs on `http://localhost:5000`. Health check: `GET /api/health`.

If you leave `SMTP_HOST` blank, OTP codes are printed to the backend console instead of emailed — convenient for local testing.

To make your own account an admin, add its email to `ADMIN_EMAILS` in `.env` **before** registering with that email.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` calls to the backend (see `vite.config.js`).

### 4. Try it out

1. Register a new account → check the backend console (or your inbox) for the OTP.
2. Verify the OTP → you're logged in and land on the dashboard with a freshly opened savings account (₹0 balance).
3. Register a second user so you have somewhere to transfer money to, and note its account number.
4. From the first account, go to **Transfer** and send funds to the second account's number.
5. Register a third user with an email listed in `ADMIN_EMAILS` to explore the **Admin** console.

## Security notes for going further

This is a learning/starter scaffold, not a production-audited system. Before using anything like this for real money, you'd want to add at minimum: rate limiting tuned per-route (login especially), 2FA beyond email OTP, audit logging, idempotency keys on transfers, HTTPS everywhere, secrets management, dependency scanning, and a proper compliance review (KYC/AML) — banking is a regulated industry.
