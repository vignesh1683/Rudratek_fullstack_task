# Assumptions & Trade-offs — Project Tracker

This document captures the key design decisions, assumptions, trade-offs, and known limitations of the Project Tracker application.

---

## Table of Contents

1. [Database Choice](#1-database-choice)
2. [Soft Delete vs Hard Delete](#2-soft-delete-vs-hard-delete)
3. [ID Generation (UUID v4)](#3-id-generation-uuid-v4)
4. [Status Transitions](#4-status-transitions)
5. [Validation Strategy](#5-validation-strategy)
6. [Sorting & Filtering](#6-sorting--filtering)
7. [Frontend State Management](#7-frontend-state-management)
8. [Authentication & Authorisation](#8-authentication--authorisation)
9. [Error Handling](#9-error-handling)
10. [CORS Configuration](#10-cors-configuration)
11. [Date Handling](#11-date-handling)
12. [Concurrency & Performance](#12-concurrency--performance)
13. [Edge Cases Considered](#13-edge-cases-considered)
14. [Known Limitations](#14-known-limitations)
15. [Future Improvements](#15-future-improvements)

---

## 1. Database Choice

**Decision:** SQLite via `better-sqlite3`.

**Why:**
- Zero configuration — no external database server to install or manage.
- Single-file persistence (`backend/data/projects.db`) — easy to move, reset, or back up.
- Synchronous API from `better-sqlite3` keeps the service layer straightforward.

**Trade-off:**
- Not suitable for high-concurrency production workloads or multi-server deployments.
- No native date/time type — dates are stored as ISO 8601 text strings.

**Production alternative:** PostgreSQL or MySQL with an async driver and a migration tool (e.g. Knex, Prisma, or Drizzle).

---

## 2. Soft Delete vs Hard Delete

**Decision:** Soft delete — `DELETE /projects/:id` sets a `deletedAt` timestamp instead of removing the row.

**Why:**
- Preserves data history and allows recovery.
- Common enterprise pattern for audit trails and compliance.

**Trade-off:**
- All read queries must include `WHERE deletedAt IS NULL`, adding a small amount of filtering overhead.
- No mechanism is currently provided to permanently purge or restore soft-deleted records.
- Over time the table grows without cleanup.

---

## 3. ID Generation (UUID v4)

**Decision:** Project IDs are generated server-side using `uuid` v4 (`uuidv4()`).

**Why:**
- Globally unique without coordination or auto-increment sequences.
- Safe for distributed systems if the project scales later.

**Trade-off:**
- UUIDs are 36 characters — larger than an integer key; slightly less efficient for indexing in SQLite.
- IDs are opaque; no ordering information is embedded (use `createdAt` for chronological order).

---

## 4. Status Transitions

**Decision:** Enforced transition rules in `projectService.js`:

| From | Allowed To |
|---|---|
| `active` | `on_hold`, `completed` |
| `on_hold` | `active`, `completed` |
| `completed` | *(none)* |

**Why:**
- Prevents logically invalid state changes (e.g. reopening a completed project).
- Business rule is centralised in the service layer, making it easy to test and change.

**Assumption:**
- `completed` is a terminal state. If a future requirement needs reopening, the transition map can be extended.

**Trade-off:**
- Rules are hard-coded. A more flexible system would store transitions in configuration or a database table.

---

## 5. Validation Strategy

**Decision:** Validation happens in two places:
1. **Frontend** — basic form validation before submission (required fields, date logic).
2. **Backend service layer** — authoritative validation that enforces all invariants.

**Rules enforced on the backend:**
- `name`, `clientName`, and `startDate` are required and must be non-blank.
- Dates must match `YYYY-MM-DD` format with year in range 1000–9999.
- `endDate` (if provided) must be ≥ `startDate`.
- `status` must be one of `active`, `on_hold`, `completed`.
- SQLite `CHECK` constraint on the `status` column adds a database-level guard.

**Trade-off:**
- No schema validation library (e.g. Joi, Zod) is used — validation is manual. For a larger API surface, a schema library would reduce boilerplate and improve consistency.

---

## 6. Sorting & Filtering

**Decision:** Sorting and filtering are done server-side via SQL query construction.

**Details:**
- Filtering by `status` uses an exact match.
- Text search (`search` param) uses SQL `LIKE` with wildcards on `name` and `clientName` (case-insensitive in SQLite by default for ASCII).
- Sorting is limited to `createdAt` and `startDate` fields; any unrecognised `sortBy` value falls back to `createdAt`.
- Sort order defaults to `desc`; any value other than `asc` is treated as `desc`.

**Trade-off:**
- No pagination — all matching results are returned in a single response. For large datasets this would need `LIMIT` / `OFFSET` or cursor-based pagination.
- The allowed sort fields are hard-coded.

---

## 7. Frontend State Management

**Decision:** A custom React hook (`useProjects`) manages all project state, fetching, and mutations.

**Why:**
- Lightweight and sufficient for the current feature set.
- No additional dependencies beyond React itself.

**Trade-off:**
- No automatic cache invalidation or background refetching. Every mutation triggers a manual re-fetch.
- For a larger or more interactive app, **TanStack Query (React Query)** would provide caching, deduplication, optimistic updates, and retry logic out of the box.

---

## 8. Authentication & Authorisation

**Assumption:** The application is single-user and runs on a trusted local network. **No authentication or authorisation is implemented.**

**Trade-off:**
- Any client that can reach the server can create, modify, or delete projects.
- For production, add JWT-based auth (or session cookies) and role-based access control.

---

## 9. Error Handling

**Decision:** A global Express error handler middleware (`errorHandler.js`) catches all errors and returns a consistent JSON envelope.

- A custom `AppError` class carries an HTTP status code.
- In development (`NODE_ENV=development`), the stack trace is included in the response.
- Unhandled errors default to `500 Internal Server Error`.

**Trade-off:**
- Error messages are simple strings, not structured error codes. A production API would benefit from machine-readable error codes (e.g. `VALIDATION_FAILED`, `INVALID_TRANSITION`).

---

## 10. CORS Configuration

**Decision:** CORS is enabled globally with default settings (`app.use(cors())`).

**Why:**
- The frontend (Vite dev server on port 5173) and backend (Express on port 5000) run on different origins during development.

**Trade-off:**
- The current config allows requests from **any origin**. In production, restrict CORS to the specific frontend domain.

---

## 11. Date Handling

**Assumption:** All dates are stored and exchanged as plain `YYYY-MM-DD` strings (no timezone or time component). Timestamps (`createdAt`, `updatedAt`, `deletedAt`) are full ISO 8601 strings generated via `new Date().toISOString()` (UTC).

**Trade-off:**
- No timezone awareness for `startDate` / `endDate`. The application assumes the user's local interpretation of the date is sufficient.
- SQLite has no native `DATE` type; comparisons rely on string ordering, which works correctly for the `YYYY-MM-DD` format.

---

## 12. Concurrency & Performance

**Assumptions:**
- Single-server, low-traffic deployment.
- `better-sqlite3` is synchronous and runs in the Node.js main thread, but is extremely fast for typical workloads.
- WAL (Write-Ahead Logging) mode is enabled for better concurrent read performance.

**Trade-off:**
- Under heavy concurrent writes, SQLite may become a bottleneck. For multi-process or clustered deployments, switch to a client-server database.

---

## 13. Edge Cases Considered

| Scenario | Handling |
|---|---|
| Creating a project with all-whitespace `name` | Rejected — `name` is trimmed and checked for emptiness |
| `endDate` before `startDate` | Rejected with `400` |
| Transitioning from `completed` to any status | Rejected — `completed` is terminal |
| Deleting an already-deleted project | Returns `404` (soft-deleted rows are invisible to queries) |
| Sorting by an unknown field | Falls back to `createdAt` |
| Invalid `sortOrder` value | Falls back to `desc` |
| `search` param with only whitespace | Ignored (treated as no search) |

---

## 14. Known Limitations

1. **No pagination** — the list endpoint returns all matching rows.
2. **No authentication** — any HTTP client can access any endpoint.
3. **No automated tests** — the codebase has no unit or integration tests.
4. **No project field updates** — only status can be changed after creation; name, dates, description, and client are immutable once created.
5. **No undo for soft deletes** — there is no restore endpoint.
6. **Frontend hardcodes `localhost:5000`** — the API base URL is not configurable via environment variables.

---

## 15. Future Improvements

- Add `PUT /projects/:id` to allow editing all project fields.
- Implement pagination (`page`, `limit` or cursor-based).
- Add authentication (JWT or session-based) and role-based access.
- Introduce a schema validation library (Joi / Zod) for request bodies.
- Add automated tests (Jest / Vitest for backend, React Testing Library for frontend).
- Use TanStack Query on the frontend for caching and background sync.
- Provide a restore endpoint (`PATCH /projects/:id/restore`).
- Make the frontend API base URL configurable via Vite environment variables.
- Add database migrations for schema evolution.
