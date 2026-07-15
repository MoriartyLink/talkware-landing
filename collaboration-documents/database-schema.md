# Database Schema Collaboration Document

## Canonical Schema Source

Use `supabase_setup.sql` as the active schema source. `clean_setup_v3.sql` is older and is missing current event detail support.

## Tables

### `events`

Stores public event announcements and event detail parent records.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, defaults to `gen_random_uuid()` |
| `title` | `text` | Required |
| `date` | `text` | Display date/time string |
| `type` | `text` | Check: `Meetup`, `Training` |
| `location` | `text` | Optional |
| `speaker` | `text` | Optional |
| `description` | `text` | Optional |
| `link` | `text` | Optional registration URL |
| `archived` | `boolean` | Defaults to `false`; landing page hides archived events |
| `created_at` | `timestamptz` | Defaults to current UTC time |

### `highlights`

Stores past event cards on the landing page and optional related cards on event detail pages.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `num` | `text` | Display sequence such as `01` |
| `title` | `text` | Optional in SQL, treated as content by UI |
| `date` | `text` | Display date |
| `place` | `text` | Display venue |
| `time` | `text` | Display time |
| `image_url` | `text` | Public image URL |
| `highlight` | `text` | Required summary text |
| `event_id` | `uuid` | Optional FK to `events(id)` |
| `created_at` | `timestamptz` | Defaults to current UTC time |

### `co_creators`

Stores co-creator profile cards.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `name` | `text` | Required |
| `role` | `text` | Required |
| `image_url` | `text` | Optional public image URL |
| `created_at` | `timestamptz` | Defaults to current UTC time |

### `volunteers`

Stores volunteer profile cards.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `name` | `text` | Required |
| `role` | `text` | Required |
| `image_url` | `text` | Optional public image URL |
| `created_at` | `timestamptz` | Defaults to current UTC time |

### `founding_team`

Stores founding team profile cards.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `name` | `text` | Required |
| `role` | `text` | Required |
| `image_url` | `text` | Optional public image URL |
| `active` | `boolean` | Defaults to `true`; currently changes opacity in UI |
| `sort_order` | `int` | Controls landing/admin ordering |
| `created_at` | `timestamptz` | Defaults to current UTC time |

### `event_media`

Stores event detail photos and videos.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `event_id` | `uuid` | Required FK to `events(id)`, cascades on delete |
| `media_type` | `text` | Check: `photo`, `video` |
| `title` | `text` | Optional |
| `url` | `text` | Required media URL |
| `caption` | `text` | Optional |
| `sort_order` | `int` | Display order |
| `created_at` | `timestamptz` | Defaults to current UTC time |

### `event_sections`

Stores structured event detail content blocks.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `event_id` | `uuid` | Required FK to `events(id)`, cascades on delete |
| `section_type` | `text` | Check: `highlight`, `activity`, `game`, `win` |
| `title` | `text` | Required |
| `description` | `text` | Optional |
| `subtitle` | `text` | Optional |
| `icon` | `text` | Optional; currently stored but not dynamically rendered |
| `sort_order` | `int` | Display order |
| `created_at` | `timestamptz` | Defaults to current UTC time |

## Access Model

- Row Level Security is enabled on all content tables.
- Public users can `SELECT` all content tables.
- Authenticated users can `INSERT`, `UPDATE`, and `DELETE`.
- Supabase Storage bucket `assets` is expected to be public.
- Public users can read `storage.objects` for `assets`.
- Authenticated users can manage `storage.objects` for `assets`.

## Relationship Summary

- `highlights.event_id` optionally links a past event card to an event detail page.
- `event_media.event_id` and `event_sections.event_id` belong to one event.
- Deleting an event cascades to its media and sections.

