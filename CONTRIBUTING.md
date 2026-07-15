# Contributing

## Tests

Place tests next to the code they cover using a clear suffix such as `.test.ts` or `.test.tsx`. For shared behavior, prefer a nearby `__tests__/` folder inside the relevant feature or module directory.

## Formatting

Use the existing TypeScript and React style in `src/`. Before opening a PR, run:

```bash
npm run lint
npm run build
```

Keep changes focused and avoid unrelated formatting churn.

## Pull Requests

Open a PR from a feature branch. Include a short summary, testing notes, and screenshots for UI changes. Link any related issue, and call out database or environment changes clearly.
