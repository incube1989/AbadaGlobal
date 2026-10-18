---
title: Source — Users and Persons Increment Doc
tags: [source, users, persons, domain]
created: 2026-10-18
updated: 2026-10-18
---

# Source — Users and Persons Increment Doc

Summary of [`Design/Increment/usersandperson.md`](../../Increment/usersandperson.md)
(archived as `Design/Archive/usersandperson.md`).

- A **user** is an entity on the site defined by technical parameters (email).
- A **person** is a record of a real person in the school, identified by
  country + nickname (in Portuguese, *apelido*).
- A user may be linked to **exactly one** person — meaning this is the account
  of that person.
- A person entity can exist without a linked user entity, and vice versa.

For version0.2 a person is intentionally minimal: nickname + country only
(further fields come later). See [[concepts/domain-model|Domain Model]].