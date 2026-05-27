# CONTEXT

## Workspace State
- Monorepository workspace initialized with npm workspaces.
- Shared TypeScript configuration (`tsconfig.json`) created.
- Project structure organized under `/system`.
- Design system package `@core/ui` created with core CSS variables (tokens) and base components (`Button`, `Input`, `Card`).
- Frontend Shell application initialized under `/system/frontend` with dynamic routing, Zustand auth and module stores, App Layout (Sidebar + Header), and core views (Login + Dashboard).
- Backend API initialized under `/system/backend` using NestJS, integrated with TypeORM/PostgreSQL connection pooling, and configured with JWT validation and RBAC guards (roles: `mechanic`, `chief_mechanic`, `warehouse_manager`, `admin`).
- Equipment Management module fully implemented with NestJS CRUD endpoints and React dashboard/CRUD modal views.
- Maintenance Management (PPR / Repairs) module fully implemented with NestJS CRUD endpoints and React dashboard/CRUD modal views.

## Completed Tasks
- `task-monorepo-init`: Monorepo Workspace Setup
- `task-mech-ui-init`: Design System Package (@core/ui) Setup
- `task-frontend-init`: Frontend Shell App Initialization
- `task-frontend-store`: Frontend Shell Auth & Module Stores
- `task-frontend-layout`: Frontend Shell Layout & Routing
- `task-frontend-views`: Frontend Shell Core Views (Login & Dashboard)
- `task-backend-init`: Backend NestJS Initialization
- `task-backend-db`: Backend Database & Config Setup
- `task-backend-auth`: Backend Authentication & RBAC Guards
- `task-ui-controls`: Design System Controls Extension
- `task-backend-equipment`: Equipment Backend CRUD API
- `task-frontend-equipment`: Equipment Frontend Module
- `task-backend-maintenance`: Maintenance Backend CRUD API
- `task-frontend-maintenance`: Maintenance Frontend Module
