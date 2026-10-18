# version0.2 Plan

Plan and tasks for the AbadaGlobal version0.2 increment.

| File | Purpose |
| ---- | ------- |
| [`plan.md`](plan.md) | Scope, architecture, key decisions, data model, run instructions |
| [`tasks.md`](tasks.md) | Ordered, actionable task list used to build and verify version0.2 |

## Source of scope

- [`Design/Increment/version0.2.md`](../../Design/Increment/version0.2.md) — feature list
- Supporting increment docs: adminpage, levelofrights, moderationpage,
  usersandperson, calendar, navigationpanel
- [Design wiki](../../Design/wiki/index.md) and
  [API contract](../../Contracts/api/openapi.yaml)

## What's new vs. the MVP

- 4-level rights model: default | moderator | administrator | super admin
- Admin panel (list users, change rights, ban/unban)
- Moderation page (countries / regions / persons, 3 tabs)
- Event create / edit / soft-delete; event now has country+region, status, and
  an owner list
- User banning (banned users cannot log in)
- Super-admin guarantee (startup fatal check)
- Two new nav buttons (moderation, administration) shown by rights

## Run at a glance

```bash
# 1. PostgreSQL up (see MVP plan.md for options)
# 2. Backend
cd Backend && npm install && npm run db:migrate && npm run dev
# 3. Frontend (new terminal)
cd Frontend && npm install && npm run dev
# 4. Open http://localhost:5173
```

Logins: `superadmin@gmail.com` / `1234`, `admin@gmail.com` / `1234`,
`user@gmail.com` / `4321`.
