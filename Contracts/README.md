# Contracts — API documentation

The shared API contract between the frontend and the backend.

## Layout

```
Contracts/
└── api/
    ├── openapi.yaml   # OpenAPI 3.1 spec — the single source of truth
    └── README.md      # conventions and usage guide
```

## Why a dedicated folder

Both the [`Frontend`](../Frontend/README.md) and the
[`Backend`](../Backend/README.md) depend on the same HTTP surface. Keeping the
contract in one place prevents drift: the backend implements it, the frontend
consumes it, and any change starts here.

See [`api/README.md`](api/README.md) for conventions and versioning rules.