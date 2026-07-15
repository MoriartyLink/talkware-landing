# Abstract Functions Collaboration Document

This document lists the important app-level functions and their responsibilities. These are not abstract classes; they are the core reusable behaviors and handler functions currently embedded in page components.

## App Orchestration

### `App`

Location: `src/App.tsx`

- Owns `showSplash`.
- Renders `SplashScreen` until completion.
- Mounts app routes after the splash transition.

## Landing Page Functions

### `fetchData`

Location: `src/pages/LandingPage.tsx`

- Runs once on page load.
- Fetches `events`, `highlights`, `co_creators`, `volunteers`, and `founding_team`.
- Filters events with `archived = false`.
- Orders highlights by `num`, people tables by `created_at`, and founding team by `sort_order`.
- Updates local React state if each table returns rows.

### `displayEvents`

Location: `src/pages/LandingPage.tsx`

- Derived constant for public event cards.
- Currently equals the non-archived `events` fetched from Supabase.

### `displayHighlights`

Location: `src/pages/LandingPage.tsx`

- Derived constant for past event cards.
- Uses database highlights when available.
- Falls back to hardcoded highlight objects when the table is empty.

## Event Detail Functions

### `getYouTubeEmbedId(url)`

Location: `src/pages/EventDetailPage.tsx`

- Accepts a YouTube URL, embed URL, short URL, or raw 11-character video ID.
- Returns the YouTube video ID when a pattern matches.
- Returns `null` for non-YouTube media.

### `fetchData`

Location: `src/pages/EventDetailPage.tsx`

- Runs when the route `id` changes.
- Fetches one event by `id`.
- Fetches ordered event media and sections.
- Fetches highlights linked by `event_id`.
- Updates detail page state.

### `photos`, `videos`, `groupedSections`

Location: `src/pages/EventDetailPage.tsx`

- `photos` filters `event_media` where `media_type = photo`.
- `videos` filters `event_media` where `media_type = video`.
- `groupedSections` groups `event_sections` by `section_type`.

## Admin Auth Functions

### `handleLogin(event)`

Location: `src/pages/AdminDashboard.tsx`

- Prevents default form submission.
- Calls `supabase.auth.signInWithPassword`.
- Shows an alert on auth error.

### `handleLogout`

Location: `src/pages/AdminDashboard.tsx`

- Calls `supabase.auth.signOut`.

## Admin Data Functions

### `fetchData`

Location: `src/pages/AdminDashboard.tsx`

- Fetches all admin-managed tables.
- Does not filter archived events because admins need to see all events.
- Logs individual query errors.

### `getTableName(tab)`

Location: `src/pages/AdminDashboard.tsx`

- Maps UI tab keys to database table names.
- Special case: `founders` maps to `founding_team`.

### `handleSave(event)`

Location: `src/pages/AdminDashboard.tsx`

- Prevents default form submission.
- Removes `id` and `created_at` from form payloads.
- Updates an existing row when `isEditing` is an existing ID.
- Inserts a new row when `isEditing` is `new`.
- Clears editing state and refreshes data after success.

### `handleDelete(table, id)`

Location: `src/pages/AdminDashboard.tsx`

- Confirms deletion.
- Deletes one row from the provided table by `id`.
- Refreshes admin data after success.

### `handleArchive(eventId, archived)`

Location: `src/pages/AdminDashboard.tsx`

- Toggles `events.archived`.
- Refreshes admin data after success.

### `handleToggleFounders(id, current)`

Location: `src/pages/AdminDashboard.tsx`

- Toggles `founding_team.active`.
- Refreshes admin data after success.

### `handleFileUpload(event, folder)`

Location: `src/pages/AdminDashboard.tsx`

- Reads the selected file from an `<input type="file">`.
- Uploads it into Supabase Storage bucket `assets`.
- Stores the public URL in `formData.image_url`.
- Folder examples: `highlights`, `co-creators`, `volunteers`, `founders`.

## Admin Event Detail Functions

### `fetchEventDetails(eventId)`

Location: `src/pages/AdminDashboard.tsx`

- Fetches `event_media` and `event_sections` for one event.
- Orders both by `sort_order`.
- Populates the event detail editor inside the event form.

### `addMedia(eventId)`

Location: `src/pages/AdminDashboard.tsx`

- Inserts a new `event_media` row.
- Requires a non-empty URL.
- Uses `eventMedia.length + 1` as `sort_order`.
- Refreshes event details after success.

### `deleteMedia(mediaId, eventId)`

Location: `src/pages/AdminDashboard.tsx`

- Confirms deletion.
- Deletes one `event_media` row.
- Refreshes event details after success.

### `addSection(eventId)`

Location: `src/pages/AdminDashboard.tsx`

- Inserts a new `event_sections` row.
- Requires a non-empty title.
- Uses `eventSections.length + 1` as `sort_order`.
- Refreshes event details after success.

### `deleteSection(sectionId, eventId)`

Location: `src/pages/AdminDashboard.tsx`

- Confirms deletion.
- Deletes one `event_sections` row.
- Refreshes event details after success.

