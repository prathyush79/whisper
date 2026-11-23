# WHISPER — Anonymous College Confession Platform

**Tagline:** Say what you never could.

A real, working anonymous confession website for college communities with admin moderation.

---

## Features

- 100% anonymous submissions (no student accounts)
- Admin approval required before anything is public
- Secure one-time owner setup (no default password)
- Pending / Approved / Rejected workflow
- Public feed with Latest + Trending + category filters
- Like + Report
- Mobile-first clean design
- Privacy notice

---

## Quick Start (Beginner)

### 1. Requirements
- Node.js 18+ (https://nodejs.org)
- VS Code or any editor

### 2. Install
```bash
cd whisper
npm install
```

### 3. Create environment file
```bash
cp .env.example .env
```

Edit `.env` and set a PostgreSQL connection string plus two long random secrets:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
SETUP_SECRET="generate-a-long-random-string"
JWT_SECRET="generate-another-long-random-string"
```

Generate secrets (Mac/Linux):
```bash
openssl rand -hex 32
```

### 4. Create database
```bash
npx prisma db push
```

### 5. Run locally
```bash
npm run dev
```

Open http://localhost:3000

---

## Create the Owner (first time only)

1. Go to http://localhost:3000/admin/setup
2. Enter the exact `SETUP_SECRET` from your `.env`
3. Choose an email + strong password
4. Submit

The setup page permanently closes after success.

Then go to http://localhost:3000/admin and log in.

---

## Admin usage

- **Dashboard** → see numbers + switch between Pending / Published / Rejected
- **Pending** → Approve or Reject each confession
- **Published** → view live content, permanently delete if needed
- **Rejected** → view or delete

Only **Approved** confessions appear on the public site.

---

## Deploy to Vercel (production)

### Important: Use a real database

SQLite does not work well on Vercel. Use free Supabase Postgres:

1. Create account at https://supabase.com
2. Create a new project
3. Go to Project Settings → Database → Connection string (URI)
4. Copy the connection string

### Deploy steps

1. Push this project to a GitHub repository
2. Go to https://vercel.com → New Project → Import the repo
3. In Environment Variables add:
   - `DATABASE_URL` = your Supabase connection string
   - `SETUP_SECRET` = your long secret
   - `JWT_SECRET` = another long secret
4. Deploy

After deploy:
- Visit `https://your-site.vercel.app/admin/setup`
- Create the owner using the same SETUP_SECRET
- Then manage everything from `/admin`

---

## Managing from Android

- Open the site in Chrome
- Bookmark `/admin`
- The whole interface is mobile-friendly

---

## Backup

**PostgreSQL (Supabase/Neon):** Use the provider dashboard's backup/export tools. The production database is PostgreSQL; Vercel's filesystem is ephemeral, so SQLite is not supported.

---

## Project structure

```
src/
  app/
    page.tsx              → Homepage
    submit/               → Confession form
    confessions/          → Public feed
    admin/
      setup/              → One-time owner creation
      login/              → Admin login
      page.tsx            → Dashboard + moderation
    privacy/              → Privacy notice
    api/                  → All server endpoints
  lib/
    db.ts                 → Prisma client
    auth.ts               → Password + session helpers
prisma/schema.prisma      → Database models
```

---

## Security summary

- No public admin registration
- Owner created only via one-time secret
- Passwords hashed with bcrypt
- Sessions are signed JWTs in httpOnly cookies
- Public APIs never return pending or rejected confessions
- Admin APIs require valid session

Built to be simple enough for a non-programmer to manage after the initial setup.
