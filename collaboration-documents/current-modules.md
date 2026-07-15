# Current Modules Collaboration Document

## Runtime Stack

- React 19 with Vite 6.
- TypeScript for application source.
- React Router for `/`, `/event/:id`, and `/admin`.
- Supabase for PostgreSQL data, Auth, and Storage.
- Tailwind CSS 4 utilities through `src/index.css`.
- Motion and Lucide React for animation and icons.

## Source Modules

### `src/main.tsx`

Application entry point. It mounts the React app and loads the global stylesheet.

### `src/App.tsx`

Top-level router and splash orchestration.

- Shows `SplashScreen` first.
- Switches to page routes after the splash calls `onFinish`.
- Routes:
  - `/` -> `LandingPage`
  - `/event/:id` -> `EventDetailPage`
  - `/admin` -> `AdminDashboard`

### `src/components/SplashScreen.tsx`

Intro screen component shown before route content. It receives an `onFinish` callback from `App`.

### `src/pages/LandingPage.tsx`

Public landing page.

- Reads public data from Supabase.
- Shows mission, upcoming events, past event highlights, story, founding team, co-creators, volunteers, and footer/contact areas.
- Uses fallback hardcoded past highlights only when the `highlights` table returns no rows.
- Uses `events.archived = false` for public upcoming events.
- Links past event cards to `/event/:event_id` when a highlight has `event_id`.

### `src/pages/EventDetailPage.tsx`

Public event detail page.

- Reads one event by route `id`.
- Reads `event_media`, `event_sections`, and linked `highlights`.
- Supports photo galleries, YouTube embeds, local video URLs, section groups, and related highlights.

### `src/pages/AdminDashboard.tsx`

Authenticated admin hub.

- Uses Supabase email/password auth.
- Lets signed-in users manage events, highlights, co-creators, volunteers, and founding team.
- Lets admins add event media and event sections while editing an existing event.
- Uploads images to the public `assets` Supabase Storage bucket.

### `src/lib/supabase.ts`

Supabase client factory.

- Reads `VITE_SUPABASE_URL`, with a fallback project URL.
- Reads `VITE_SUPABASE_ANON_KEY`.
- Exports a shared `supabase` client.

## SQL and Data Files

### `supabase_setup.sql`

Current canonical setup script. It includes:

- Main content tables.
- `events.archived`.
- `highlights.event_id`.
- Event detail tables.
- RLS policies.
- Storage policies for the `assets` bucket.

### `seed_data.sql`

Sample content for local or Supabase Dashboard seeding.

### `diagnose_schema.sql`

Schema inspection/debug helper.

### `clean_setup_v3.sql`

Older reset script. It does not include every field/table used by the current React code. Do not treat it as the active schema unless it is updated first.

## Static Assets

- `public/splash-screen.mp4` is the splash video.
- UI references `/logo.png` and several `/assets/...` image paths. These must be available under `public/` at runtime or served by the hosting environment.

