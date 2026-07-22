# 🏨 StayEase — Hotel Reservation Platform

A full-stack, Booking.com-inspired hotel reservation platform. Customers search and book hotels, Hotel Managers list and manage their properties, and Admins oversee the whole platform.

Built with **Spring Boot + MongoDB** on the backend and **React + TypeScript + Redux Toolkit + TailwindCSS** on the frontend, secured with **JWT + Spring Security** and role-based access.

```
StayEase/
├── backend/    # Spring Boot REST API (Java 17, MongoDB, Spring Security, JWT, Twilio, Mail)
├── frontend/   # React + Vite + TypeScript + Redux Toolkit + TailwindCSS
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## ✨ Features

| # | Feature | Details |
|---|---------|---------|
| 1 | **Authentication & Accounts** | Register, login, JWT access/refresh tokens, profile management, change/forgot/reset password, role-based access (Customer, Hotel Manager, Admin) |
| 2 | **Hotel Management** | Managers create/edit/delete hotels — info, amenities, images, policies, status |
| 3 | **Room Management** | Room inventory per hotel: type, price, capacity, units, images, availability |
| 4 | **Search & Discovery** | Search by destination + filter by price, rating, star rating, amenities; sort by price/rating/newest |
| 5 | **Booking** | Date-range availability checks, create/view/cancel bookings, booking references |
| 6 | **Payments** | Simulated gateway with transaction records and payment status tracking |
| 7 | **Booking History** | Customers see their trips; Managers monitor bookings for their hotels |
| 8 | **Reviews & Ratings** | Verified guests review hotels; aggregate ratings recomputed automatically |
| 9 | **Notifications** | Email (SMTP) + SMS (Twilio) on booking/payment events — feature-flagged |
| 10 | **Dashboards & Reports** | Dedicated dashboards for Customer, Manager, Admin with KPIs and revenue charts |

---

## 🧰 Tech Stack

**Backend:** Java 17 · Spring Boot 3.3 · Spring Web (REST) · Spring Data MongoDB · Spring Security · JWT (jjwt) · Spring Mail · Twilio SDK · springdoc OpenAPI (Swagger)

**Frontend:** React 18 · TypeScript · Vite · Redux Toolkit · React Router · Axios · TailwindCSS · Recharts · react-hot-toast · lucide-react

**Database:** MongoDB

---

## 🚀 Quick Start

### Option A — Docker (easiest, runs everything)

Requires Docker Desktop.

```bash
cd StayEase
docker compose up --build
```

- Frontend → http://localhost:8081
- Backend API → http://localhost:8080 (Swagger at http://localhost:8080/swagger-ui.html)
- MongoDB → localhost:27017

### Option B — Run locally (dev mode)

**Prerequisites:** Java 17+, Maven 3.9+, Node 18+, and MongoDB running locally (or a MongoDB Atlas URI).

**1. Backend**
```bash
cd backend
cp .env.example .env          # then edit values (see "Credentials" below)
mvn spring-boot:run
```
API starts on http://localhost:8080.

**2. Frontend**
```bash
cd frontend
cp .env.example .env          # default VITE_API_BASE_URL=/api works with the Vite proxy
npm install
npm run dev
```
App starts on http://localhost:5173 (Vite proxies `/api` → `localhost:8080`).

---

## 👤 Demo Accounts

Seeded automatically on first startup (when `SEED_ENABLED=true`):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@stayease.com` | `Admin@123` |
| Hotel Manager | `manager@stayease.com` | `Manager@123` |
| Customer | `customer@stayease.com` | `Customer@123` |

Three demo hotels with rooms are also seeded. On the login page you can click a demo account to auto-fill it.

> 💳 **Payment testing:** the gateway is simulated. Any card details succeed, **except** a card number ending in `0000`, which simulates a decline.

---

## 🔑 Credentials & Configuration

All secrets are supplied via environment variables — **nothing is hard-coded or committed**. Copy `backend/.env.example` → `backend/.env` and fill in:

| Variable | Required? | What it is / where to get it |
|----------|-----------|------------------------------|
| `MONGODB_URI` | ✅ Yes | Local Mongo (`mongodb://localhost:27017/stayease`) or a **MongoDB Atlas** connection string |
| `JWT_SECRET` | ✅ Yes | Any random string ≥ 64 chars. Generate one (see below) |
| `CORS_ALLOWED_ORIGINS` | ✅ Yes (prod) | Your deployed frontend URL(s), comma-separated |
| `MAIL_ENABLED` + `MAIL_*` | Optional | SMTP for email notifications (e.g. Gmail App Password) |
| `TWILIO_ENABLED` + `TWILIO_*` | Optional | Twilio Account SID, Auth Token, and a Twilio phone number for SMS |
| `SEED_ENABLED` | Optional | `true` to seed demo data on first run |

**Notifications are OFF by default** — the app runs fully without mail/Twilio credentials (messages are logged to the console instead). See [`SETUP_CREDENTIALS.md`](./SETUP_CREDENTIALS.md) for step-by-step instructions on obtaining each credential.

Generate a JWT secret:
```bash
# any of these
openssl rand -base64 64
# or in Node:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📚 API Documentation

With the backend running, open **Swagger UI**: http://localhost:8080/swagger-ui.html

Key endpoints:

| Area | Endpoint |
|------|----------|
| Auth | `POST /api/auth/register`, `/login`, `/refresh`, `/forgot-password`, `/reset-password` |
| Hotels | `GET /api/hotels` (search), `GET /api/hotels/{id}`, `POST/PUT/DELETE /api/hotels` |
| Rooms | `GET /api/rooms/hotel/{hotelId}`, `GET /api/rooms/{id}/availability`, `POST/PUT/DELETE` |
| Bookings | `POST /api/bookings`, `GET /api/bookings/mine`, `/manager`, `POST /api/bookings/{id}/cancel` |
| Payments | `POST /api/payments`, `GET /api/payments/booking/{id}` |
| Reviews | `GET /api/reviews/hotel/{id}`, `POST /api/reviews` |
| Dashboards | `GET /api/dashboard/customer`, `/manager`, `/admin` |

---

## ☁️ Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for full walkthroughs.

- **Backend** → Render (via `render.yaml` blueprint), Railway, or AWS EC2 (Dockerfile provided)
- **Frontend** → Vercel (`vercel.json`) or Netlify (`netlify.toml`)
- **Database** → MongoDB Atlas (free tier)

---

## 🧪 Build & Test

```bash
# Backend
cd backend && mvn clean package        # builds jar (tests use embedded Mongo)

# Frontend
cd frontend && npm run build           # type-checks + production build
```

---

## 📄 License

MIT — free to use for learning and demos.
