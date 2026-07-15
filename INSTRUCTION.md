# Unified Contributor Card System — Instructions

## Overview

All contributor types (Founding Team, Co-Creator, Volunteer, Website Contributor) are now stored in a **single `contributors` table** in Supabase. Each person has a `tag` field indicating their role type, an `active` boolean for status, and a `joined_at` date to calculate contribution duration.

## Database Schema

### `contributors` table

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `name` | TEXT | Contributor's name |
| `role` | TEXT | Their specific role/title |
| `tag` | TEXT | One of: `founding_team`, `co_creator`, `volunteer`, `website_contributor` |
| `image_url` | TEXT | Profile photo URL (Supabase storage or external) |
| `active` | BOOLEAN | `true` = currently active, `false` = no longer active |
| `joined_at` | DATE | Date they started contributing (used to calculate duration) |
| `sort_order` | INT | Display order (lower = first) |
| `created_at` | TIMESTAMPTZ | Auto-generated record timestamp |

### Tag Values

| Tag | Label | Color |
|---|---|---|
| `founding_team` | Founding Team | Amber/Orange |
| `co_creator` | Co-Creator | Violet/Purple |
| `volunteer` | Volunteer | Emerald/Green |
| `website_contributor` | Website Contributor | Sky/Blue |

## Migration

Run `migration_unified_contributors.sql` in the Supabase SQL Editor to:

1. Create the new `contributors` table
2. Migrate existing data from `founding_team`, `co_creators`, and `volunteers`
3. Set up RLS policies (public read, authenticated write)
4. Create indexes for fast filtering

After verifying data, uncomment the `DROP TABLE` lines to remove old tables.

## Admin Hub — Contributors Tab

The Admin Dashboard (`/admin`) has a single **Contributors** tab that manages all contributor types:

### Adding a Contributor
1. Click **Add New**
2. Fill in: Name, Role, Tag (dropdown), Profile Image (upload), Active status, Joined Date
3. Click **Save**

### Editing a Contributor
1. Click the edit icon on any contributor row
2. Modify fields as needed
3. Click **Save**

### Toggling Active/Inactive
- Click the contributor row to toggle active status
- Active contributors show with full opacity + green pulse dot
- Inactive contributors show at reduced opacity + grey dot

### Filtering
- Use the tag filter dropdown in the list header to filter by contributor type

## Landing Page — Contributor Cards

The landing page (`/`) displays all contributors in a unified "Our People" section:

### Card Features
- **Tag Badge**: Color-coded label (Founding Team, Co-Creator, etc.)
- **Active/Inactive Indicator**: Green pulse dot for active, grey for inactive
- **Profile Image**: 3:4 aspect ratio with hover zoom
- **Name & Role**: Displayed below the image
- **Contribution Duration**: Shows days/months/years since `joined_at`

### Filter Pills
Users can filter contributors by tag using pill buttons above the grid. Each pill shows the count of contributors in that category.

## Architecture Notes

### Current Setup (Monolith)
The admin hub is currently part of the same Vite app at `/admin`. Both the landing page and admin share the same Supabase client.

### Future: Separate Admin Deployment
To separate the admin hub into its own deployment:

1. **Create a new Vite project** for the admin hub
2. **Move** `AdminDashboard.tsx` and admin components to the new project
3. **Both projects** use the same Supabase URL and keys
4. **Landing page** only needs the Supabase anon key (public read)
5. **Admin hub** needs authenticated access (login required)
6. **No custom API needed** — Supabase acts as the backend API via its client SDK
7. Deploy admin to a separate subdomain (e.g., `admin.talkware.com`)

### API Flow
```
Landing Page (public)
  └── supabase.from('contributors').select('*')  [anon key, public read]

Admin Hub (authenticated)
  └── supabase.auth.signInWithPassword(...)       [login]
  └── supabase.from('contributors').insert(...)   [authenticated write]
  └── supabase.from('contributors').update(...)   [authenticated write]
  └── supabase.from('contributors').delete(...)   [authenticated write]
```

## File Reference

| File | Purpose |
|---|---|
| `migration_unified_contributors.sql` | DB migration script |
| `src/pages/LandingPage.tsx` | Public contributor cards with filters |
| `src/pages/AdminDashboard.tsx` | Admin CRUD for contributors |
| `src/lib/supabase.ts` | Supabase client config |
| `INSTRUCTION.md` | This file |

## Environment Setup

Create a `.env` file in the project root with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The app reads these values from `src/lib/supabase.ts`.

### Local Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

The Vite dev server uses port `3000` by default.

| Route | Purpose |
|---|---|
| `/` | Public landing page |
| `/event/:id` | Event detail page |
| `/admin` | Admin dashboard |

## Supabase Storage

Profile images should be uploaded to the `assets` storage bucket.

Recommended folder paths:

| Folder | Use |
|---|---|
| `contributors/` | Unified contributor profile images |
| `events/` | Event and highlight images |
| `founders/` | Legacy founder images, if still referenced |

The `assets` bucket should be public if the landing page displays images directly from Supabase public URLs.

### Storage Policy Notes

Use these permissions as the intended behavior:

| Action | Access |
|---|---|
| Read public images | Public |
| Upload images | Authenticated admin |
| Update/delete images | Authenticated admin |

## Contributor Data Rules

### Required Fields

Every contributor should have:

1. `name`
2. `role`
3. `tag`
4. `active`
5. `joined_at`

`image_url` is optional at the database level, but the public card design works best when every contributor has a profile image.

### Sorting Rules

Use `sort_order` to control manual ordering.

Recommended order:

1. Founding Team
2. Co-Creators
3. Volunteers
4. Website Contributors

Within each tag, use smaller `sort_order` values for people who should appear first.

### Active Status Rules

Do not delete contributors just because they are no longer active.

Use:

```text
active = false
```

This preserves contribution history while allowing the UI to show the person as inactive.

## Migration Verification Checklist

After running `migration_unified_contributors.sql`, verify the migration before removing legacy tables.

### 1. Check Contributor Counts

Run:

```sql
SELECT tag, COUNT(*)
FROM public.contributors
GROUP BY tag
ORDER BY tag;
```

Compare the result with the old tables:

```sql
SELECT COUNT(*) FROM public.founding_team;
SELECT COUNT(*) FROM public.co_creators;
SELECT COUNT(*) FROM public.volunteers;
```

### 2. Check Empty Required Fields

Run:

```sql
SELECT *
FROM public.contributors
WHERE name IS NULL
   OR role IS NULL
   OR tag IS NULL
   OR joined_at IS NULL;
```

This query should return no rows.

### 3. Check Image URLs

Run:

```sql
SELECT name, tag, image_url
FROM public.contributors
WHERE image_url IS NULL OR image_url = '';
```

Add missing profile images from the admin dashboard or update them manually in Supabase.

### 4. Check Public Read Access

Open the landing page while signed out of Supabase.

The contributor cards should load without requiring admin authentication.

## Admin Dashboard Implementation Checklist

If the admin dashboard still uses the legacy tabs (`founding_team`, `co_creators`, `volunteers`), update it to use the unified `contributors` table.

### Replace Legacy Contributor State

Replace separate state values:

```text
founders
coCreators
volunteers
```

with:

```text
contributors
```

### Replace Contributor Fetch Queries

Use:

```ts
supabase
  .from('contributors')
  .select('*')
  .order('sort_order', { ascending: true })
  .order('created_at', { ascending: true })
```

instead of reading from:

```text
founding_team
co_creators
volunteers
```

### Replace Admin Tabs

Recommended admin tabs:

| Tab | Table |
|---|---|
| Events | `events` |
| Highlights | `highlights` |
| Contributors | `contributors` |

The old `Founders`, `Co-Creators`, and `Volunteers` tabs should be replaced by a single `Contributors` tab with a tag filter.

### Contributor Form Fields

The contributor form should include:

| Field | Input Type |
|---|---|
| Name | Text input |
| Role | Text input |
| Tag | Select dropdown |
| Image URL / Upload | Text input + upload button |
| Active | Checkbox or toggle |
| Joined At | Date input |
| Sort Order | Number input |

### Save Behavior

Insert/update records only in:

```text
contributors
```

Do not write new contributor data to the old tables after migration.

## Landing Page Behavior

The landing page should treat Supabase as the source of truth for contributors.

Expected query:

```ts
supabase
  .from('contributors')
  .select('*')
  .order('sort_order', { ascending: true })
  .order('created_at', { ascending: true })
```

### Empty States

If no contributors are returned:

1. Keep the section layout stable
2. Show a small empty state or hide the contributor grid
3. Log the Supabase error to the console if the query fails

Do not silently fall back to legacy contributor arrays unless that fallback is intentionally temporary.

## Troubleshooting

### Contributors Do Not Appear

Check:

1. `.env` has `VITE_SUPABASE_ANON_KEY`
2. The `contributors` table exists
3. RLS public read policy exists
4. The records have valid `tag` values
5. The browser console has no Supabase errors

### Admin Cannot Save Contributors

Check:

1. You are signed in through Supabase Auth
2. The authenticated write policy exists
3. The form is saving to `contributors`
4. The `tag` value matches one of the allowed values
5. Required fields are not empty

### Images Do Not Load

Check:

1. The `assets` bucket exists
2. The bucket is public, or image URLs use a signed URL flow
3. `image_url` contains a complete URL or valid public path
4. The uploaded file path does not include unexpected spaces or special characters

### Migration Fails Because Old Tables Are Missing

If one or more old tables do not exist, comment out that specific migration block before running the migration.

For example, if `volunteers` does not exist, skip:

```sql
INSERT INTO public.contributors (...)
SELECT ...
FROM public.volunteers;
```

## Deployment Notes

Before deploying:

1. Run `npm run lint`
2. Run `npm run build`
3. Confirm the landing page loads while signed out
4. Confirm `/admin` requires login
5. Confirm an authenticated admin can create, edit, and deactivate contributors

### Static Hosting

This is a Vite single-page app. Configure the host to rewrite all routes to:

```text
/index.html
```

This is required for direct visits to `/admin` and `/event/:id`.

## Cleanup After Migration

Only remove old contributor tables after:

1. The landing page reads from `contributors`
2. The admin dashboard writes to `contributors`
3. All contributor images still load
4. The migration verification queries look correct
5. A production backup exists

Then run the optional `DROP TABLE` statements from the migration file.

## Future Enhancements

Potential improvements:

1. Add database-level `updated_at`
2. Add admin-only soft delete for contributors
3. Add drag-and-drop sorting for `sort_order`
4. Add image deletion from Supabase Storage when replacing profile photos
5. Add a contributor detail modal or profile page
6. Add stricter admin authorization beyond any authenticated user
7. Add a read-only audit log for contributor changes
