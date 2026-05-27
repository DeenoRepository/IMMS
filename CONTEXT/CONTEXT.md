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
- Equipment Passportization (Attachments & Version Control) fully implemented.
- Equipment & Document Change History (Audit Log) fully implemented with automatic change tracking and chronological frontend timeline tab.
- Expanded equipment card (technical passport) parameters implemented including serial number, model, manufacturer, manufacture year, inventory number, criticality level, and power rating (kW).
- Equipment Category Management & Dynamic Attributes (mandatory/auxiliary) fully implemented on backend validation, database mapping, seeding, and interactive Category Manager / dynamic form inputs UI on frontend.
- Equipment Standard Field Templating (visibility and dynamic backend/frontend validation requirements per standard field) fully implemented with a dedicated settings manager UI for administrators.
- Dynamic global standard field addition and deletion (custom fields stored in JSONB mapped to template controls) fully implemented on both backend and frontend.
- Premium corporate Enterprise Light Theme implemented with refined HSL colors, slate/indigo primary accents, emerald green success states, crimson danger states, and dynamic button text contrast overlays.
- Equipment Mandatory Document Templates (checking for uploaded files matching global or category-specific templates and warning of missing required documents inside the passport) fully implemented.
- Technical Document Previews (native rendering of PDF, images, plain text, and placeholder displays for unsupported formats) fully implemented inside the technical passport.
- Document Upload Constraints (dynamic allowed extensions list and maximum file size validation limits, client-side pre-checks, strict server-side Multer security validations, and a dedicated Upload Settings manager tab for admins) fully implemented.
- High-Fidelity Modal Windows UI/UX Redesign (translucent dark overlays, deep backdrop blurs, organic spring-like scale transitions, perfect circular SVG close buttons, and seamless footers) fully implemented.


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
- `task-backend-passportization`: Equipment Passportization Backend API
- `task-frontend-passportization`: Equipment Passportization Frontend UI
- `task-backend-changelog`: Equipment Change Log Backend API
- `task-frontend-changelog`: Equipment Change Log Frontend UI
- `task-backend-equipment-fields`: Expand Equipment Fields Backend
- `task-frontend-equipment-fields`: Expand Equipment Fields Frontend
- `task-backend-equipment-categories`: Implement Equipment Categories Backend
- `task-frontend-equipment-categories`: Implement Equipment Categories Frontend
- `task-backend-equipment-template`: Implement Standard Equipment Card Field Templating Backend
- `task-frontend-equipment-template`: Implement Standard Equipment Card Field Templating Frontend
- `task-backend-dynamic-template-fields`: Implement Dynamic Template Fields Backend
- `task-frontend-dynamic-template-fields`: Implement Dynamic Template Fields Frontend
- `task-backend-mandatory-docs`: Implement Mandatory Document Templates Backend
- `task-frontend-mandatory-docs`: Implement Mandatory Document Templates Frontend
