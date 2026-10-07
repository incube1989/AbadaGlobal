# API contracts

This folder holds the canonical API documentation for the project.

## Single source of truth

[`openapi.yaml`](openapi.yaml) is the **single source of truth** for the HTTP
API surface. It is written as an [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0)
document and describes every endpoint, request, and response.

Workflow:

1. Change the contract first — add/edit the endpoint in `openapi.yaml`.
2. Implement it in the [`Backend`](../../Backend/README.md).
3. Consume it from the [`Frontend`](../../Frontend/README.md) (types in
   `Frontend/src/api/types.ts` should mirror the contract schemas).

## Versioning

- The `info.version` field in `openapi.yaml` is the API version.
- Non-breaking additions bump the patch/minor version.
- Breaking changes (renamed/removed endpoints or fields, changed semantics)
  bump the major version and must be coordinated across Frontend and Backend.

## Base path

All paths in `openapi.yaml` are relative to the API base path. Locally the API
is served at `http://localhost:3000/api` (see the `servers` section of the
spec). The frontend dev proxy forwards `/api/*` there automatically.

## Tooling

You can render the spec with any OpenAPI viewer, e.g.:

- https://editor.swagger.io — paste the YAML to browse and validate
- VS Code extensions such as "OpenAPI (Swagger) Editor"

## Adding a new endpoint

1. Add the path + operations in `openapi.yaml` with full request/response schemas.
2. Add reusable schemas to `components.schemas` instead of inlining them.
3. Add the matching route/controller/service in the backend.
4. Add matching types + client function in the frontend.
5. Log the change in the wiki (`Design/wiki/log.md`) if it affects project knowledge.