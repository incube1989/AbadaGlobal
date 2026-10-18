---
title: Source — Admin Panel Increment Doc
tags: [source, admin, rights]
created: 2026-10-18
updated: 2026-10-18
---

# Source — Admin Panel Increment Doc

Summary of [`Design/Increment/adminpage.md`](../../Increment/adminpage.md)
(archived as `Design/Archive/adminpage.md`).

On the administration page the admin sees the list of all users and can:

- change the rights of a user (except super admin)
- ban a user
- see users' private data

Decisions applied for version0.2 (see
[`Plans/version0.2/plan.md`](../../../Plans/version0.2/plan.md)):

- administrators may change/ban each other; only super admin is protected
- all data is public for now — private-data visibility is deferred to a later
  version
- banned users cannot log in; login shows "You are banned, contact
  administrator"

See [[concepts/rights-model|Rights Model]].