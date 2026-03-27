# YABS PRO Services

Corporate PRO services management platform for UAE-based businesses. Handles company formation, visa processing, document management, employee records, invoicing, and government compliance tracking.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM 6
- **Auth:** JWT-based with bcrypt password hashing
- **Styling:** Tailwind CSS 4
- **Email:** Nodemailer (SMTP)
- **File Storage:** MinIO (S3-compatible)
- **Invoicing:** Zoho Invoice API (OAuth 2.0)
- **Calendar:** Google Calendar API
- **Push Notifications:** Ntfy
- **AI Chat:** Ollama (local LLM)
- **OCR:** Tesseract.js
- **WhatsApp:** Meta Business API
- **PWA:** Service worker with offline support

## Features

- **Multi-role dashboard** — Admin, Staff, and Client portals
- **Company management** — UAE trade licenses, establishment cards, immigration files
- **Employee records** — Visa tracking, Emirates ID, labor cards, health insurance
- **Service requests** — Workflow engine with status tracking and timelines
- **Document management** — Upload, OCR scanning, expiry alerts
- **Invoicing** — Zoho Invoice integration with VAT calculations
- **Calendar sync** — Google Calendar for appointment scheduling
- **Notifications** — Email (SMTP), push (Ntfy), and WhatsApp alerts
- **Expiry monitoring** — Cron jobs for license, visa, and document expiry checks
- **Reports & export** — Admin reports with data export capabilities
- **AI assistant** — Ollama-powered chat widget for quick queries

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- MinIO instance (for file storage)

## Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/kumarcorpx-pixel/prozone.git
   cd prozone
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Fill in the values — see `.env.example` for descriptions of each variable.

4. **Set up the database:**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

## Project Structure

```
app/
├── (auth)/           # Login, signup, password reset
├── (marketing)/      # Public pages (about, contact, FAQ, services)
├── admin/            # Admin dashboard and management pages
├── dashboard/        # Client dashboard
├── staff/            # Staff portal
├── api/              # API routes
│   ├── auth/         # Authentication endpoints
│   ├── data/         # CRUD for companies, employees, documents
│   ├── cron/         # Scheduled jobs (expiry checks, backups)
│   ├── invoices/     # Zoho Invoice integration
│   ├── calendar/     # Google Calendar events
│   └── notifications/# Push notification endpoints
components/           # Shared React components
lib/                  # Utilities, API clients, auth, email, etc.
prisma/               # Database schema
```

## Deployment

Build for production:

```bash
npm run build
npm start
```

Configure cron jobs for `/api/cron/expiry-check`, `/api/cron/invoice-reminder`, and `/api/cron/backup` using an external scheduler with a `Bearer <CRON_SECRET>` authorization header.
