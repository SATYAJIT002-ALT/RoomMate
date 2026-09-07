# RoomMate — Real-World Roommate & Shared-Housing Compatibility Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-roommate--live.vercel.app-00dfa2?style=for-the-badge&logo=vercel)](https://roommate-live.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)

> **“Find someone you can actually live with, not just someone looking for a room.”**

🌐 **Live Application URL:** **[https://roommate-live.vercel.app](https://roommate-live.vercel.app)**  
👑 **Admin Dashboard:** **[https://roommate-live.vercel.app/admin/login](https://roommate-live.vercel.app/admin/login)**

RoomMate is a production-ready, real-world roommate and shared-housing platform designed for college students, interns, and young professionals in India.

Unlike conventional flat-finding portals that simply list vacant spaces, RoomMate calculates **bidirectional living compatibility** based on actual daily habits, sleep schedules, cleanliness expectations, noise sensitivity, dietary habits, budget overlap, and strict non-negotiable deal breakers.

---

## 🌟 Core Pillars & Principles

### 1. Real Users & Real Data Only
* **No Artificial Content**: Zero fake/seeded users, zero fake roommates, zero mock reviews, zero artificial conversations.
* **Authentic Empty States**: When no listings or matches exist, proper empty states guide the user.
* **Deterministic Matching**: Same inputs consistently produce the same explainable scores.

### 2. Two Separate Types of Data
Every user maintains two distinct categories of information:
* **My Actual Lifestyle**: *How do I actually live?* (e.g., Night owl, Cleanliness 9/10, Non-smoker, Quiet environment, Introverted).
* **My Roommate Preferences**: *What kind of person am I comfortable living with?* (e.g., Prefers night owl, Non-smoker only, Cleanliness $\ge$ 7/10, Comfortable with male/female).

### 3. Bidirectional Matching Engine
Evaluates the relationship from **both directions**:
1. **Direction 1**: User A's preferences $\to$ User B's actual lifestyle.
2. **Direction 2**: User B's preferences $\to$ User A's actual lifestyle.
3. **Lifestyle Harmony**: Direct coexistence of sleep schedules, cleanliness differences, noise tolerance, and social habits.
4. **Housing & Budget**: City, locality, and overlapping monthly rent limits.
5. **Mutual Gender Comfort**: Compares both users' gender comfort settings (must be mutual).
6. **Deal Breakers (Hard Filter)**: If either user's strict deal breaker (smoking, pets, quiet hours) is violated, the user is excluded from recommendations.
7. **Soft Preferences**: Personality alignment and shared hobbies contribute weighted bonuses.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Next.js Route Handlers / Server APIs, TypeScript |
| **Database & ORM** | PostgreSQL, Prisma ORM 7 |
| **Authentication** | Secure JWT Sessions, HttpOnly Cookies, Bcrypt Password Hashing |
| **Real-Time Communication** | Server-Sent Events (SSE) & WebSocket / RealTimeBus |
| **Analytics** | Recharts Data Visualization |
| **Deployment Target** | Vercel, Supabase / Neon PostgreSQL |

---

## 🔒 Security & Role Architecture

### User Roles
1. **USER**: Standard users who register publicly to find roommates, create room listings, match, and chat.
2. **ADMIN**: Platform owners who moderate users, review safety reports, verify student IDs, and inspect analytics.

### Strict Role Separation Rules
* **No Public Admin Registration**: Public sign-up forms assign `role = USER` with no admin checkbox or selector.
* **Owner Admin Bootstrapping**: Admin accounts are provisioned via environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) during setup with secure password hashing.
* **Switch Accounts, Never Switch Roles**: The platform owner can operate an admin account (`owner@gmail.com`) and a separate user account (`student@gmail.com`). Switching authenticates the target account without altering database roles.
* **Server-Side Authorization**: Every admin API verifies `authenticated === true && role === "ADMIN"`. Normal users receive `403 Forbidden`.

---

## 📐 Matching Engine Weights

| Category | Weight | Description |
|---|---|---|
| **Deal Breakers** | **Hard Filter** | Excludes match if strict non-negotiables are violated |
| **Lifestyle Compatibility** | **25%** | Sleep schedule, cleanliness slider, noise tolerance, AC usage |
| **Budget & Location** | **20%** | Target city, locality overlap, and rental budget range |
| **Personality & Nature** | **15%** | Desired characteristics in a roommate |
| **Habits & Food** | **15%** | Smoking, alcohol, guests, dietary preferences |
| **Housing Requirements** | **15%** | Housing type (Flat/PG), room type (Private/Shared), amenities |
| **Hobbies & Interests** | **10%** | Secondary bonus (Cricket, Gaming, Coding, Music) |

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js v20+ 
* PostgreSQL (Local PostgreSQL, Supabase, or Neon)

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd roommate

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/roommate?schema=public"

# Platform Owner & Initial Admin Setup
ADMIN_EMAIL="owner@roommate.internal"
ADMIN_PASSWORD="AdminSecurePass2026!"
ADMIN_NAME="Platform Owner"

# Session Secret
JWT_SECRET="your-super-secret-jwt-key-production"
```

### 4. Database Setup & Prisma Generation
```bash
# Generate Prisma Client
npx prisma generate

# Apply Migrations / Push Schema
npx prisma db push
```

### 5. Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Application Routes

### Public & Authenticated User Routes
* `/` — Startup landing page with matching engine explainer and FAQs
* `/register` — User registration (Strict `role = USER`)
* `/login` — User authentication
* `/onboarding` — 9-step lifestyle and roommate preference questionnaire
* `/discover` — Roommate match discovery with bidirectional compatibility reports
* `/rooms` — Real room listings browse, search, and approximate map markers
* `/rooms/new` — Create room listing with AI Description Assistant
* `/rooms/[id]` — Room details with personalized housing match score and reviews
* `/messages` — Real-time 1-on-1 messaging
* `/groups` — Roommate group flat-hunting
* `/saved` — Bookmarked rooms and roommates
* `/profile` — Edit lifestyle, preferences, deal breakers, and target budget
* `/dashboard` — Personal dashboard and profile completion tracker

### Administrator Routes
* `/admin/login` — Dedicated admin authentication
* `/admin` — Real platform analytics and metrics overview
* `/admin/users` — User management, suspension, and college ID verification
* `/admin/listings` — Room listings review and fraudulent listing removal
* `/admin/reports` — Safety and community report investigations
* `/admin/verifications` — Student ID review and badge allocation

---

## 🛡️ Safety & Privacy Protections
1. **No Exact Public Addresses**: Only approximate neighborhood landmarks are exposed.
2. **Student & Identity Badges**: Verified college/company status without public document exposure.
3. **Safety Reporting & Blocking**: In-app reporting for harassment or fraudulent listings.
4. **Permanent Safety Notice**: Direct warning encouraging independent physical verification prior to financial transactions.

---

## 📄 License
MIT License. Built for real people finding shared-housing harmony.
