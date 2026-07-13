# Contributing

Thank you for contributing to Talkware Community Landing. Keep changes simple, focused, and easy to review.

## Workflow

1. Create a new branch from the latest main branch.
2. Install dependencies with `npm install`.
3. Make a small, focused change.
4. Run the required checks.
5. Open a pull request with a clear summary and testing notes.

## Local Development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Required Checks

Run these before submitting a pull request:

```bash
npm run lint
npm run build
```

## Code Guidelines

- Use TypeScript for application code.
- Keep components small and readable.
- Prefer clear names over comments.
- Follow the existing project structure.
- Avoid unrelated formatting or refactors.
- Do not commit generated build output from `dist/`.
- Do not commit secrets or local environment files.

## Environment Variables

Create a local `.env` file when needed:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never commit `.env` or Supabase secret keys.

## Database Changes

- Update the relevant SQL setup file when schema or policy changes are needed.
- Keep row-level security behavior clear.
- Include seed data only when it helps development or testing.

## Pull Request Checklist

Before opening a pull request, confirm that:

- The change has a clear purpose.
- `npm run lint` passes.
- `npm run build` passes.
- Documentation is updated when behavior changes.
- Screenshots are included for visible UI changes.

## Commit Messages

Use short, descriptive commit messages.

Examples:

```text
Update README setup steps
Add event detail loading state
Fix admin image upload validation
```
