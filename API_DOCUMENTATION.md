# API Documentation — Project Tracker

Base URL: `http://localhost:5000`

All responses use the JSON envelope:

```json
{
  "success": true | false,
  "data": <payload>,          // present on success
  "count": <number>,          // present on list endpoints
  "error": { "message": "…" } // present on failure
}
```

---

## Table of Contents

1. [Health Check](#1-health-check)
2. [List Projects](#2-list-projects)
3. [Get Project by ID](#3-get-project-by-id)
4. [Create Project](#4-create-project)
5. [Update Project Status](#5-update-project-status)
6. [Delete Project (Soft)](#6-delete-project-soft)
7. [Data Model](#7-data-model)
8. [Status Transition Rules](#8-status-transition-rules)
9. [Error Codes Reference](#9-error-codes-reference)

---

## 1. Health Check

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/health` |

### Response `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2026-02-11T10:00:00.000Z"
}
```

---

## 2. List Projects

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/projects` |

### Query Parameters

| Param | Type | Default | Description |
|---|---|---|---|
| `status` | string | — | Filter by status. One of `active`, `on_hold`, `completed`. |
| `search` | string | — | Case-insensitive substring match on `name` or `clientName`. |
| `sortBy` | string | `createdAt` | Sort field. Allowed: `createdAt`, `startDate`. |
| `sortOrder` | string | `desc` | Sort direction. `asc` or `desc`. |

### Example Request

```
GET /projects?status=active&search=acme&sortBy=startDate&sortOrder=asc
```

### Response `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "name": "Website Redesign",
      "clientName": "Acme Corp",
      "status": "active",
      "startDate": "2026-01-15",
      "endDate": "2026-06-30",
      "description": "Full website overhaul",
      "createdAt": "2026-01-10T08:30:00.000Z",
      "updatedAt": "2026-01-10T08:30:00.000Z",
      "deletedAt": null
    }
  ],
  "count": 1
}
```

### Error Responses

| Status | Condition |
|---|---|
| `400` | Invalid `status` value (not in allowed list) |

---

## 3. Get Project by ID

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/projects/:id` |

### Path Parameters

| Param | Type | Description |
|---|---|---|
| `id` | string (UUID) | The project's unique identifier |

### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "Website Redesign",
    "clientName": "Acme Corp",
    "status": "active",
    "startDate": "2026-01-15",
    "endDate": "2026-06-30",
    "description": "Full website overhaul",
    "createdAt": "2026-01-10T08:30:00.000Z",
    "updatedAt": "2026-01-10T08:30:00.000Z",
    "deletedAt": null
  }
}
```

### Error Responses

| Status | Condition |
|---|---|
| `404` | Project not found or has been soft-deleted |

---

## 4. Create Project

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/projects` |
| **Content-Type** | `application/json` |

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | **Yes** | Project name (whitespace-trimmed). |
| `clientName` | string | **Yes** | Client name (whitespace-trimmed). |
| `startDate` | string | **Yes** | Start date in `YYYY-MM-DD` format. Year must be 1000–9999. |
| `endDate` | string | No | End date in `YYYY-MM-DD` format. Must be ≥ `startDate`. Year must be 1000–9999. |
| `status` | string | No | Initial status. Defaults to `active`. Must be one of `active`, `on_hold`, `completed`. |
| `description` | string | No | Free-text description. |

### Example Request

```json
{
  "name": "Mobile App v2",
  "clientName": "Globex Inc",
  "startDate": "2026-03-01",
  "endDate": "2026-09-30",
  "description": "Second version of the mobile application"
}
```

### Response `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Mobile App v2",
    "clientName": "Globex Inc",
    "status": "active",
    "startDate": "2026-03-01",
    "endDate": "2026-09-30",
    "description": "Second version of the mobile application",
    "createdAt": "2026-02-11T12:00:00.000Z",
    "updatedAt": "2026-02-11T12:00:00.000Z",
    "deletedAt": null
  }
}
```

### Error Responses

| Status | Condition |
|---|---|
| `400` | Missing or blank `name` |
| `400` | Missing or blank `clientName` |
| `400` | Missing `startDate` |
| `400` | `startDate` or `endDate` not in `YYYY-MM-DD` format |
| `400` | Year outside 1000–9999 range |
| `400` | `endDate` earlier than `startDate` |
| `400` | Invalid `status` value |

---

## 5. Update Project Status

| | |
|---|---|
| **Method** | `PATCH` |
| **Path** | `/projects/:id/status` |
| **Content-Type** | `application/json` |

### Path Parameters

| Param | Type | Description |
|---|---|---|
| `id` | string (UUID) | The project's unique identifier |

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `status` | string | **Yes** | New status. One of `active`, `on_hold`, `completed`. |

### Example Request

```json
{
  "status": "on_hold"
}
```

### Response `200 OK`

Returns the full updated project object (same shape as [Get Project by ID](#3-get-project-by-id)).

### Status Transition Rules

| Current Status | Allowed Transitions |
|---|---|
| `active` | `on_hold`, `completed` |
| `on_hold` | `active`, `completed` |
| `completed` | *(none — terminal state)* |

### Error Responses

| Status | Condition |
|---|---|
| `400` | `status` missing from request body |
| `400` | Invalid status value |
| `400` | Disallowed status transition (e.g. `completed` → `active`) |
| `404` | Project not found or has been soft-deleted |

---

## 6. Delete Project (Soft)

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/projects/:id` |

### Path Parameters

| Param | Type | Description |
|---|---|---|
| `id` | string (UUID) | The project's unique identifier |

### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully",
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  }
}
```

> **Note:** This is a **soft delete**. The record is not removed from the database; instead the `deletedAt` field is set to the current timestamp. Soft-deleted projects are excluded from all GET queries.

### Error Responses

| Status | Condition |
|---|---|
| `404` | Project not found or already soft-deleted |

---

## 7. Data Model

### `projects` table (SQLite)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | UUID v4 |
| `name` | TEXT | NOT NULL | Project name |
| `clientName` | TEXT | NOT NULL | Client / company name |
| `status` | TEXT | NOT NULL, CHECK in (`active`, `on_hold`, `completed`) | Current status |
| `startDate` | TEXT | NOT NULL | `YYYY-MM-DD` |
| `endDate` | TEXT | nullable | `YYYY-MM-DD` |
| `description` | TEXT | nullable | Free-text description |
| `createdAt` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updatedAt` | TEXT | NOT NULL | ISO 8601 timestamp, updated on every mutation |
| `deletedAt` | TEXT | nullable | ISO 8601 timestamp, set on soft delete |

---

## 8. Status Transition Rules

```
  ┌────────┐       ┌─────────┐
  │ active │──────▶│ on_hold │
  │        │◀──────│         │
  └───┬────┘       └────┬────┘
      │                 │
      │   ┌───────────┐ │
      └──▶│ completed │◀┘
           └───────────┘
           (terminal — no
            outgoing transitions)
```

- `active` → `on_hold` 
- `active` → `completed` 
- `on_hold` → `active` 
- `on_hold` → `completed` 
- `completed` → *(any)*  — terminal state

---

## 9. Error Codes Reference

All error responses follow this shape:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable description"
  }
}
```

In development mode (`NODE_ENV=development`), a `stack` field is also included.

| HTTP Status | Meaning |
|---|---|
| `400` | Bad Request — validation failure, invalid input, or disallowed transition |
| `404` | Not Found — requested project does not exist or is soft-deleted |
| `500` | Internal Server Error — unexpected failure |
