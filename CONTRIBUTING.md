# Contributing

## Tests

Place tests next to the code they cover using `.test.ts` or `.test.tsx`. For shared behavior, use a nearby `__tests__/` folder inside the relevant feature or module directory.

## Formatting

Follow the existing TypeScript and React style in `src/`. Before submitting a PR, run:

```bash
npm run lint
npm run build
```

Avoid unrelated formatting or refactors.

## Pull Requests

Open a PR from a feature branch. Include a short summary, testing notes, and screenshots for UI changes. Call out database or environment changes clearly.
