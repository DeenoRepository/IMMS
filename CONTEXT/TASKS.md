# TASKS

## Task ID: task-monorepo-init
Title: Monorepo Workspace Setup
Status: done
Priority: high
Dependencies: []

### Description
Initialize npm workspaces configuration, root configuration files, and move folder structure under /system as per the system specification.

### Checklist
- [x] Create root package.json with workspaces definition
- [x] Create root tsconfig.json for shared configuration
- [x] Create system folder structure (/system/frontend, /system/backend, /system/modules, /system/packages)
- [x] Relocate packages/ui to system/packages/ui

### Notes
None.

---

## Task ID: task-mech-ui-init
Title: Design System Package (@mech/ui) Setup
Status: done
Priority: high
Dependencies: [task-monorepo-init]

### Description
Initialize the design system package `@mech/ui` inside `system/packages/ui` including package configuration, CSS design tokens, and core components.

### Checklist
- [x] Create package.json and tsconfig.json for @mech/ui
- [x] Define design tokens (colors, typography, spacing) in src/tokens.css
- [x] Implement base components (Button, Input, Card) in TypeScript
- [x] Export all components and design tokens from src/index.ts
- [x] Verify that package compiles correctly

### Notes
None.

---

## Task ID: task-frontend-init
Title: Frontend Shell App Initialization
Status: done
Priority: high
Dependencies: [task-mech-ui-init]

### Description
Initialize the Frontend Shell React+TS project inside `system/frontend` using Vite, configure tsconfig and package.json workspaces.

### Checklist
- [x] Run create-vite with react-ts template in system/frontend
- [x] Install dependencies (react-router-dom, zustand, lucide-react, and workspace dependency @mech/ui)
- [x] Configure vite.config.ts and tsconfig.json for workspace integration

### Notes
None.

---

## Task ID: task-frontend-store
Title: Frontend Shell Auth & Module Stores
Status: done
Priority: medium
Dependencies: [task-frontend-init]

### Description
Implement state management using Zustand for user authentication (JWT/roles) and module registry management.

### Checklist
- [x] Create authStore.ts to manage user status, roles, and token
- [x] Create moduleStore.ts to register modules and list authorized routes

### Notes
None.

---

## Task ID: task-frontend-layout
Title: Frontend Shell Layout & Routing
Status: done
Priority: medium
Dependencies: [task-frontend-store]

### Description
Develop the main Layout (Sidebar, Header) and routing configuration.

### Checklist
- [x] Implement Header component with user profile & logout
- [x] Implement Sidebar with links dynamically loaded from module registry according to user role
- [x] Configure AppRoutes.tsx with guards for private, public, and role-restricted routes
- [x] Set up main shell styling and import @mech/ui CSS

### Notes
None.

---

## Task ID: task-frontend-views
Title: Frontend Shell Core Views (Login & Dashboard)
Status: done
Priority: medium
Dependencies: [task-frontend-layout]

### Description
Build base pages (Login page with role switcher and Main Dashboard with quick links).

### Checklist
- [x] Create Login page allowing selection of roles (mechanic, chief_mechanic, warehouse_manager, admin)
- [x] Create basic Home/Dashboard view displaying welcome message and system status cards
- [x] Implement Unauthorized view for forbidden access

### Notes
None.

---

## Task ID: task-backend-init
Title: Backend NestJS Initialization
Status: done
Priority: high
Dependencies: [task-frontend-views]

### Description
Initialize NestJS project in `system/backend` using `@nestjs/cli`, configure TS and workspaces.

### Checklist
- [x] Run Nest CLI init command inside system/backend
- [x] Install authentication and database libraries (TypeORM, pg, JWT, Passport, bcryptjs)
- [x] Create basic .env template file at backend root

### Notes
None.

---

## Task ID: task-backend-db
Title: Backend Database & Config Setup
Status: done
Priority: medium
Dependencies: [task-backend-init]

### Description
Set up TypeORM database connection and config loading.

### Checklist
- [x] Create ORM options reading from .env
- [x] Integrate TypeORM Module into main app.module.ts

### Notes
None.

---

## Task ID: task-backend-auth
Title: Backend Authentication & RBAC Guards
Status: done
Priority: high
Dependencies: [task-backend-db]

### Description
Implement JWT authentication, roles decorator, and RolesGuard.

### Checklist
- [x] Implement JwtStrategy to validate JWT headers
- [x] Implement Roles decorator and RolesGuard to check user RBAC status
- [x] Configure AuthModule and AuthController with login and test endpoints
- [x] Verify build and endpoint behavior

### Notes
None.

