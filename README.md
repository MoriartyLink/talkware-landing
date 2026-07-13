# Talkware Community Landing

A modern landing page for the Talkware Community, a home for tech builders in Mandalay. The site includes a public landing page and an authenticated admin hub for managing community content.

## Features

- Public landing page with hero, events, highlights, founding members, volunteers, and contact sections
- Event detail pages for public event information
- Admin hub at `/admin` for managing events, highlights, co-creators, and volunteers
- Supabase Auth, PostgreSQL, Storage, and row-level security
- Image uploads for highlights, co-creators, and volunteers

## Tech Stack

| Area | Stack |
| --- | --- |
| Frontend | React 19, Vite 6, TypeScript |
| Styling | Tailwind CSS 4, Motion |
| Routing | React Router DOM 7 |
| Icons | Lucide React |
| Backend | Supabase |

## Requirements

- Node.js 18 or newer
- npm
- Supabase project

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set up Supabase

Run the SQL in `supabase_setup.sql` from the Supabase SQL Editor.

Optional sample data:

```text
seed_data.sql
```

## Development

Start the local dev server:

```bash
npm run dev
```

Local URLs:

- Public site: `http://localhost:3000/`
- Admin hub: `http://localhost:3000/admin`

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Build the production app |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run TypeScript checks |
| `npm run clean` | Remove `dist` |

## Production Build

```bash
npm run build
```

The build output is generated in `dist/` and can be deployed to static hosting providers such as Netlify, Vercel, or Cloudflare Pages.

## Admin Access

1. Create an email/password user in Supabase Auth.
2. Go to `/admin`.
3. Sign in with the Supabase user.
4. Manage events, highlights, co-creators, and volunteers.

## Database

The main setup script is `supabase_setup.sql`. It creates tables, storage policies, and row-level security policies.

Access model:

- Public users can read published content.
- Authenticated users can create, update, and delete content.

Additional SQL helpers are available in:

- `seed_data.sql`
- `diagnose_schema.sql`
- `clean_setup_v3.sql`

## Contributing

See `CONTRIBUTING.md` for the contribution workflow, coding standards, and pull request checklist.

## License

BSD-3-Clause
