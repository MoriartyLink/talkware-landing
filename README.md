<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Talkware Community Landing

A modern landing page for the **Talkware Community** — a home for passionate tech builders in Mandalay. Built with React, Supabase, and Tailwind CSS.

## Features

- **Landing Page** — Hero section, Upcoming Events, Highlights, Founding Members, Volunteers, and Contact sections
- **Admin Hub** (`/admin`) — Authenticated dashboard for managing:
  - Events (create, edit, delete)
  - Highlights (create, edit, delete)
  - Co-creators (create, edit, delete)
  - Volunteers (create, edit, delete)
- **Supabase Backend** — Row-level security with public read / authenticated write access
- **Image Upload** — Direct-to-Supabase Storage upload for highlights, co-creators, and volunteers

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, TypeScript |
| Styling | Tailwind CSS 4, Motion (Framer Motion) |
| Icons | Lucide React |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Routing | React Router DOM 7 |

## Database Schema

### Events

```sql
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT,
    type TEXT CHECK (type IN ('Meetup', 'Training')),
    location TEXT,
    speaker TEXT,
    description TEXT,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

See [`supabase_setup.sql`](./supabase_setup.sql) for the full schema including highlights, co-creators, and volunteers tables.

## Setup

### Prerequisites

- Node.js 18+
- A Supabase project

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Initialize the database

Run the SQL from [`supabase_setup.sql`](./supabase_setup.sql) in your Supabase Dashboard → SQL Editor.

### 4. Seed sample data (optional)

Run [`seed_data.sql`](./seed_data.sql) in the Supabase SQL Editor.

### 5. Start the dev server

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

- **Public page**: `http://localhost:3000/`
- **Admin hub**: `http://localhost:3000/admin`

## Build for Production

```bash
npm run build
```

Output is in `dist/` — deploy this folder to any static hosting (Netlify, Vercel, Cloudflare Pages, etc.).

## Admin Access

1. Navigate to `/admin`
2. Sign in with a Supabase Auth user (email/password)
3. The authenticated user must have the `authenticated` role in Supabase (default for signed-in users)

## RLS Policies

The project uses Supabase Row Level Security:

- **Public Read**: Anyone can `SELECT` from all tables (via the anon key)
- **Admin Write**: Only `authenticated` users can `INSERT`, `UPDATE`, or `DELETE`

See [`supabase_setup.sql`](./supabase_setup.sql) for the exact policy definitions.

## License

BSD-3-Clause

