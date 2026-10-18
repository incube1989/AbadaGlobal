# MVP Plan

Tasks and plan for building and running the AbadaGlobal MVP.

| File | Purpose |
| ---- | ------- |
| [`plan.md`](plan.md) | Scope, architecture, key decisions, data model, run instructions |
| [`tasks.md`](tasks.md) | Ordered, actionable task list used to build and verify the MVP |

## Source of scope

- [`MVPscope`](../../MVPscope) — MVP feature list (calendar, login, navigation
  panel, under construction page, restricted page, language switcher, event page)
- [Design wiki](../../Design/wiki/index.md) — calendar spec, domain model,
  navigation panel, restricted/under-construction copy, hardcoded events
- [API contract](../../Contracts/api/openapi.yaml) — OpenAPI source of truth

## Run at a glance

```bash
# 1. PostgreSQL up (see plan.md for options)
# 2. Backend
cd Backend && npm install && npm run db:migrate && npm run dev
# 3. Frontend (new terminal)
cd Frontend && npm install && npm run dev
# 4. Open http://localhost:5173
```

Logins: `admin@gmail.com` / `1234`, `user@gmail.com` / `4321`.