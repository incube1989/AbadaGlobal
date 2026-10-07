# Frontend — Site part

React + Vite + TypeScript single-page application for the AbadaGlobal site.

## Stack

- [React 19](https://react.dev) with TypeScript
- [Vite 7](https://vite.dev) build tool and dev server
- [React Router 7](https://reactrouter.com) for routing
- [Vitest](https://vitest.dev) + Testing Library for unit tests

## Getting started

```bash
npm install
npm run dev       # starts dev server on http://localhost:5173
```

During development, API calls to `/api/*` are proxied to the backend at
`http://localhost:3000` (see [`vite.config.ts`](vite.config.ts)). Point
`VITE_API_BASE_URL` at a remote API in `.env` when needed — see
[`.env.example`](.env.example).

## Scripts

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Type-check and produce a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run the TypeScript compiler without emitting |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |

## Structure

```
src/
├── api/          # typed API client (mirrors Contracts/api/openapi.yaml)
│   ├── client.ts # fetch wrapper + endpoint functions
│   └── types.ts  # response/request types
├── components/   # reusable UI components
├── pages/        # route-level page components
├── styles/       # global styles
└── tests/        # Vitest setup + test files
```

## Conventions

- The API surface is defined in [`../Contracts/api/openapi.yaml`](../Contracts/api/openapi.yaml).
  Keep `src/api/types.ts` in sync with the contract — update the contract first.
- Components live in `components/`, one file per component.
- Tests colocate under `src/tests/`; test files use the `*.test.tsx` suffix.