# Project Tracking System

A full-stack project tracking application built with **React** (Frontend) and **Node.js/Express** (Backend). This system allows users to manage projects, track their status, and filter/search through them efficiently.

## Features

- **Project Management**: Create, view, update, and delete projects.
- **Status Tracking**: Enforced status transitions (Active → On Hold/Completed).
- **Filtering & Search**: Server-side filtering by status and text search by name/client.
- **Responsive Design**: Modern, clean UI built with Tailwind CSS.
- **Data Persistence**: SQLite database with soft-delete support.

---

## Tech Stack

### Backend
- **Node.js** & **Express**: API server.
- **Better-SQLite3**: Fast, server-less SQL database engine.
- **Architecture**: Service-Controller-Route pattern for clean separation of concerns.

### Frontend
- **React** (Vite): UI library.
- **Tailwind CSS**: Styling.
- **Axios**: API requests.
- **Lucide React**: Icons.

---

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```
The server will start on `http://localhost:5000`.

### 2. Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on `http://localhost:5173` (or 5174 if 5173 is busy).

---

## API Documentation

### Base URL: `http://localhost:5000`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/projects` | List all projects. Supports query params: `status`, `search`, `sortBy`, `sortOrder`. |
| **POST** | `/projects` | Create a new project. Body: `{ name, clientName, startDate, ... }`. |
| **GET** | `/projects/:id` | Get a project by ID. |
| **PATCH** | `/projects/:id/status` | Update status. Body: `{ status: 'active' | 'on_hold' | 'completed' }`. |
| **DELETE** | `/projects/:id` | Soft delete a project. |

---

## Assumptions & Trade-offs

1.  **Database**: Used **SQLite** (`better-sqlite3`) for simplicity and portability. It requires no external server setup, making it perfect for this assignment. For a larger scale app, I would switch to PostgreSQL.
2.  **Soft Delete**: Implemented "soft delete" (setting `deletedAt` timestamp) instead of hard delete. This is a common enterprise pattern to preserve data history.
3.  **State Management**: Used a custom React Hook (`useProjects`) for state management. For a more complex app, I would use **TanStack Query** (React Query) for better caching and background refetching.
4.  **Validation**: Basic validation is done on both client and backend. Backend ensures data integrity (e.g., `endDate >= startDate`).

---

## AI Usage Disclosure

## AI Tool Used

- **Google Gemini** 

---

## Where AI Was Used

AI assistance was primarily used for:

- Debugging dependency and environment issues (Vite, Tailwind CSS, Better-SQLite3 compatibility)
- Resolving runtime errors and minor syntax issues
- Verifying edge cases in status transition logic
- Troubleshooting build and setup configuration issues

---

## Where AI Was NOT Relied On

The following aspects were fully designed and implemented independently:

- Application architecture (Service–Controller–Route pattern)
- Database schema design and relationships
- Business rules (status transitions and validation constraints)
- Soft delete strategy (`deletedAt` timestamp pattern)
- API design and REST endpoint structuring
- Server-side filtering, search, and sorting logic
- Frontend state management using a custom `useProjects` hook
- Overall project structure and folder organization

---

## What I Modified or Rejected

- Refactored AI-suggested logic into a clean Service layer
- Improved separation of concerns between controller and service
- Rewrote parts of CRUD logic for clarity and maintainability
- Strengthened validation logic (e.g., `endDate >= startDate`)
- Removed unnecessary abstractions that added complexity
- Optimized database queries for efficient filtering and sorting

---

## What I Fully Understand

I can confidently explain:

- Backend request lifecycle (Route → Controller → Service → Database)
- SQLite schema design and query execution
- Soft delete implementation and its trade-offs
- Status transition enforcement logic
- Frontend data flow and state management
- API filtering and sorting mechanisms
- Error handling and validation strategies

---

## What Required Verification

- Better-SQLite3 configuration nuances
- Tailwind build configuration troubleshooting
- Dependency version alignment during setup

---

