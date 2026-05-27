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

---

## Task ID: task-ui-controls
Title: Design System Controls Extension
Status: done
Priority: high
Dependencies: [task-backend-auth]

### Description
Rename package to `@core/ui` and implement remaining core, data, and industrial components inside the package.

### Checklist
- [x] Rename `@mech/ui` to `@core/ui` across the codebase and re-link workspaces
- [x] Add new component CSS styles to index.css
- [x] Create Select and Modal components
- [x] Create Tabs and Badge components
- [x] Create Table component (with sorting & column custom rendering)
- [x] Create Industrial components (EquipmentStatusIndicator, DowntimeBadge, MaintenancePriorityTag)
- [x] Export all components from index.ts and compile the package successfully

### Notes
None.

---

## Task ID: task-backend-equipment
Title: Equipment Backend CRUD API
Status: done
Priority: high
Dependencies: [task-ui-controls]

### Description
Create Equipment entity, service, controller, and DTOs on the backend, and register them.

### Checklist
- [x] Create Equipment TypeORM Entity
- [x] Create CreateEquipmentDto and UpdateEquipmentDto with validation
- [x] Create EquipmentService implementing CRUD logic (with seed data)
- [x] Create EquipmentController exposing REST endpoints with JWT/RBAC guards
- [x] Register EquipmentModule in app.module.ts and compile successfully

### Notes
None.

---

## Task ID: task-frontend-equipment
Title: Equipment Frontend Module
Status: done
Priority: high
Dependencies: [task-backend-equipment]

### Description
Build the Equipment view on the frontend, integrating list table, CRUD forms inside modals, and API calls.

### Checklist
- [x] Create API client functions to fetch, create, update, and delete equipment
- [x] Create Equipment main page displaying equipment list using `@core/ui` Table and search filters
- [x] Create EquipmentModal component using `@core/ui` Select, Input, and Modal
- [x] Integrate the Equipment view into the Frontend Shell routes to replace the placeholder
- [x] Verify functionality (create, edit, delete, permissions check) and ensure it builds correctly

### Notes
None.

---

## Task ID: task-backend-maintenance
Title: Maintenance Backend CRUD API
Status: done
Priority: high
Dependencies: [task-frontend-equipment]

### Description
Implement the Maintenance entity, DTOs, CRUD service (with db seed), and controller with JWT and RBAC guards.

### Checklist
- [x] Implement Maintenance TypeORM Entity and relation to Equipment
- [x] Implement validation DTOs (CreateMaintenanceDto and UpdateMaintenanceDto)
- [x] Implement MaintenanceService with database seeding logic
- [x] Implement MaintenanceController with secured endpoints
- [x] Register MaintenanceModule in app.module.ts and verify build

---

## Task ID: task-frontend-maintenance
Title: Maintenance Frontend Module
Status: done
Priority: high
Dependencies: [task-backend-maintenance]

### Description
Build the Maintenance list page, metrics headers, scheduling form modal, and route routing.

### Checklist
- [x] Implement Maintenance.tsx dashboard page using @core/ui Table, filters, and metrics
- [x] Implement MaintenanceModal.tsx with role restrictions
- [x] Register path="maintenance" to use the new Maintenance view in AppRoutes.tsx
- [x] Verify functionality (CRUD under different roles) and verify full workspace build

---

## Task ID: task-backend-passportization
Title: Equipment Passportization Backend API
Status: done
Priority: high
Dependencies: [task-frontend-maintenance]

### Description
Implement database entities, TypeORM registry, upload folders initialization, file-upload service methods, and secured controller upload/download endpoints.

### Checklist
- [x] Create EquipmentDocument and EquipmentDocumentVersion Entities
- [x] Register new entities in equipment.module.ts
- [x] Implement service methods (addDocument, addDocumentVersion, getDocuments, deleteDocument) and upload folder check
- [x] Implement controller endpoints with JwtAuthGuard, RolesGuard, and Multer FileInterceptor
- [x] Verify build and endpoint behavior

---

## Task ID: task-frontend-passportization
Title: Equipment Passportization Frontend UI
Status: done
Priority: high
Dependencies: [task-backend-passportization]

### Description
Integrate Tabbed UI layout, Document list, expansion version history timeline, download handler, and document upload forms inside EquipmentModal.tsx.

### Checklist
- [x] Refactor EquipmentModal.tsx with @core/ui Tabs (Specs vs Documents tabs)
- [x] Implement document rows list with current active version info
- [x] Implement expandable document version history timeline
- [x] Implement download button calling the authenticated download endpoint
- [x] Implement upload forms (Create Document / Upload Version) with role restrictions
- [x] Verify functionality (uploading, versioning, downloading) and verify clean workspace build

---

## Task ID: task-backend-changelog
Title: Equipment Change Log Backend API
Status: done
Priority: high
Dependencies: [task-frontend-passportization]

### Description
Implement database audit logging structure, automatic log hook on create/update/docs-change, and log query endpoints.

### Checklist
- [x] Create EquipmentChangeLog database Entity
- [x] Register entity in equipment.module.ts
- [x] Implement logChange helper and attach audit triggers in EquipmentService
- [x] Expose GET /api/equipment/:id/change-log endpoint in EquipmentController
- [x] Verify build and endpoint behavior

---

## Task ID: task-frontend-changelog
Title: Equipment Change Log Frontend UI
Status: done
Priority: high
Dependencies: [task-backend-changelog]

### Description
Add Change History tab and design dynamic audit timeline inside EquipmentModal.tsx.

### Checklist
- [x] Add 'Change History' tab in EquipmentModal.tsx
- [x] Implement history log fetch call on tab activation
- [x] Render chronological timeline event cards (with colored badges and specifications diff logs)
- [x] Verify functionality (logs show username and details) and verify clean workspace build

---

## Task ID: task-backend-equipment-fields
Title: Expand Equipment Fields Backend
Status: done
Priority: high
Dependencies: [task-frontend-changelog]

### Description
Expand database columns in Equipment entity, add validations in DTOs, update DB seeds, and support audit logging for new fields.

### Checklist
- [x] Add new fields to Equipment database entity and criticality enum
- [x] Update validations in Create/Update Equipment DTOs
- [x] Update EquipmentService DB seeding with extended details
- [x] Update EquipmentService update() method with audit log diffing for new fields
- [x] Verify backend compilation

---

## Task ID: task-frontend-equipment-fields
Title: Expand Equipment Fields Frontend
Status: done
Priority: high
Dependencies: [task-backend-equipment-fields]

### Description
Implement layout and inputs in EquipmentModal form specs, show criticality badges in Equipment list table, and update search logic.

### Checklist
- [x] Add new properties to EquipmentFormValues interface and states
- [x] Refactor Specifications form with two-column responsive grid inputs
- [x] Implement read-only parameters layout for mechanic role in specs form
- [x] Display criticality column in Equipment page list table using MaintenancePriorityTag
- [x] Update search filter query to match new parameters
- [x] Verify compilation and functionality

---

## Task ID: task-backend-equipment-categories
Title: Implement Equipment Categories Backend
Status: done
Priority: high
Dependencies: [task-frontend-equipment-fields]

### Description
Create entities for EquipmentCategory, EquipmentCategoryAttribute, and EquipmentAttributeValue. Add validations, category CRUD controller, updated seeds, and service save/validation logic.

### Checklist
- [x] Create EquipmentCategory, EquipmentCategoryAttribute, and EquipmentAttributeValue entities
- [x] Register new entities in backend EquipmentModule
- [x] Create CreateCategoryDto and update Create/Update Equipment DTOs
- [x] Implement category CRUD methods and seeds in EquipmentService
- [x] Update EquipmentService create()/update() methods to handle dynamic attributes validation and values persistence
- [x] Expose categories API endpoints in EquipmentController
- [x] Verify backend compilation

---

## Task ID: task-frontend-equipment-categories
Title: Implement Equipment Categories Frontend
Status: done
Priority: high
Dependencies: [task-backend-equipment-categories]

### Description
Implement Category Manager, dynamic form inputs with required/optional attribute validation, and table displays on frontend.

### Checklist
- [x] Implement Category Manager dialog (Admins & Chief Mechanics)
- [x] Add Category dropdown selector to Equipment form specs
- [x] Implement dynamic inputs loading and validation for mandatory/auxiliary attributes
- [x] Render dynamic properties in equipment table list and read-only modal layout
- [x] Verify frontend build and functionality

---

## Task ID: task-backend-equipment-template
Title: Implement Standard Equipment Card Field Templating Backend
Status: done
Priority: high
Dependencies: [task-frontend-equipment-categories]

### Description
Implement database schema, seeding, CRUD endpoints, and validation for standard equipment fields template configurations.

### Checklist
- [x] Create EquipmentStandardTemplate database entity
- [x] Register new entity in backend EquipmentModule
- [x] Implement CRUD service methods and database seeding of default templates
- [x] Implement backend dynamic validation in Create/Update Equipment CRUD using the active template config
- [x] Expose standard-template REST endpoints with JWT/RBAC guards in EquipmentController
- [x] Verify backend compilation

---

## Task ID: task-frontend-equipment-template
Title: Implement Standard Equipment Card Field Templating Frontend
Status: done
Priority: high
Dependencies: [task-backend-equipment-template]

### Description
Implement settings UI to toggle standard fields' visibility and requirement status, dynamically render form fields, and filter main table columns based on the template.

### Checklist
- [x] Add Standard Fields Template tab inside Category Manager dialog (renamed to Categories & Templates Manager)
- [x] Implement GET/PUT API client functions for standard templates
- [x] Implement frontend form configuration editing and saving for standard fields
- [x] Dynamically render and validate fields in EquipmentModal specs form based on template rules
- [x] Dynamically show/hide columns in Equipment main dashboard table based on template rules
- [x] Verify frontend build and full workspace functionality

---

## Task ID: task-backend-dynamic-template-fields
Title: Implement Dynamic Template Fields Backend
Status: done
Priority: high
Dependencies: [task-frontend-equipment-template]

### Description
Implement dynamic standard card field addition/deletion including database columns schema update, seeding adjustments, REST endpoints, and backend dynamic validation.

### Checklist
- [x] Update EquipmentStandardTemplate entity with type, displayName, and isCustom columns
- [x] Add customFields JSONB column to Equipment entity
- [x] Update DTO validations to support customFields object
- [x] Update DB Seeding with types and display names
- [x] Implement addStandardField and deleteStandardField methods in EquipmentService
- [x] Update validateStandardTemplateRules and diffing logic for custom fields in EquipmentService
- [x] Expose POST and DELETE template endpoints in EquipmentController
- [x] Verify backend compilation

---

## Task ID: task-frontend-dynamic-template-fields
Title: Implement Dynamic Template Fields Frontend
Status: done
Priority: high
Dependencies: [task-backend-dynamic-template-fields]

### Description
Implement template field editor form, dynamic table list column mapping, and dynamic modal input rendering for custom fields.

### Checklist
- [x] Create UI form to add custom fields in Standard Fields Template settings tab
- [x] Add Delete button for custom template fields in settings tab
- [x] Implement API calls for POST and DELETE standard template fields
- [x] Dynamically render input fields for active custom template fields in EquipmentModal Specifications form
- [x] Map custom standard fields inside submit payload and handle validation checks in EquipmentModal
- [x] Dynamically display visible custom standard fields in Equipment list columns
- [x] Verify frontend build and full workspace functionality

---

## Task ID: task-backend-mandatory-docs
Title: Implement Mandatory Document Templates Backend
Status: done
Priority: high
Dependencies: [task-frontend-dynamic-template-fields]

### Description
Create required document entities, add migration/seeding, implement template CRUD controllers, and build document completeness validator.

### Checklist
- [x] Create EquipmentRequiredDocument database entity for mandatory document templates
- [x] Add documentType column to EquipmentDocument entity
- [x] Register new entity in backend EquipmentModule
- [x] Add seed script parameters for default required documents (e.g. Technical Passport, Instruction Manual)
- [x] Implement required-documents CRUD service methods in EquipmentService
- [x] Expose REST endpoints with JWT/RBAC guards in EquipmentController
- [x] Verify backend builds successfully

---

## Task ID: task-frontend-mandatory-docs
Title: Implement Mandatory Document Templates Frontend
Status: done
Priority: high
Dependencies: [task-backend-mandatory-docs]

### Description
Add templates manager tab in settings UI, integrate required documents checks, and show warning notifications for missing files in passport view.

### Checklist
- [x] Implement Mandatory Documents Template tab inside Category & Template Manager modal
- [x] Add API calls to retrieve, create, and delete required document templates
- [x] Update document upload forms to support select dropdown for required Document Type
- [x] Implement checklist of required documents in technical passport tab showing missing ones
- [x] Display alert/notification headers with missing document types if passport is incomplete
- [x] Verify frontend compilation and full workspace functionality

---

## Task ID: task-ui-modal-redesign
Title: High-Fidelity Modal Windows UI/UX Redesign
Status: done
Priority: medium
Dependencies: [task-frontend-mandatory-docs]

### Description
Improve UI/UX of modal windows to make them feel highly professional and polished (translucent dark overlays, deep backdrop blurs, organic scale transitions, circular SVG close buttons, and seamless footers).

### Checklist
- [x] Integrate backdrop blur and translucent dark background variables
- [x] Configure smooth organic bezier spring scale transitions on modal entry
- [x] Upgrade close button inside Modal component to custom SVG icon with circular hover background
- [x] Refine footer padding and background color to be seamless
- [x] Add elegant narrow micro-scrollbar styles to modal bodies
- [x] Verify full project compilation

---

## Task ID: task-ui-spacings-polish
Title: Alignment and Spacing Polish for Blocks and Controls
Status: done
Priority: medium
Dependencies: [task-ui-modal-redesign]

### Description
Review and refine all paddings, margins, gaps, and border boundaries inside core visual blocks (widgets, list grids, panels, registry cards) and interactive controls (modals, dropdowns, inputs, buttons, timeline nodes) to establish a highly professional and clean corporate style (Modern Enterprise Style). Ensure robust styling compilation.

### Checklist
- [x] Inspect and adjust margins/paddings on Dashboard metrics and card actions
- [x] Standardize Select element inside Login form using UI Select control and align heights
- [x] Standardize gaps and row margins inside Equipment and Maintenance registry lists
- [x] Polish inline document upload and checklist badges vertical alignments inside modal windows
- [x] Rebuild design system `@core/ui` and verify clean compilation and visual updates

---

## Task ID: task-ui-equipment-advanced-filters
Title: Professional and Convenient Advanced Filters on Equipment Registry
Status: done
Priority: high
Dependencies: [task-ui-spacings-polish]

### Description
Implement a highly professional, interactive, and convenient filtering panel for the Equipment Registry. The UI will support a main search bar, status count badges, a collapsible "Advanced Filters" drawer grid (filtering by category, criticality, location, and manufacturer), an active filters indicator count, and a unified "Reset Filters" action button.

### Checklist
- [x] Refactor Equipment.tsx state to manage multiple advanced filters (category, criticality, manufacturer)
- [x] Build search input with a dynamic clear button ("x")
- [x] Implement collapsible advanced filters card panel with slide-down transition
- [x] Render active filters indicators and matching items count summary
- [x] Implement a unified "Reset Filters" action button to restore defaults
- [x] Verify full monorepo production compilation and test functionality

---

## Task ID: task-backend-change-approval
Title: Equipment Specification Change Approval System Backend
Status: done
Priority: high
Dependencies: [task-ui-equipment-advanced-filters]

### Description
Implement the database schemas, services, DTOs, and REST API controller endpoints on the backend to handle a professional Equipment Change Approval Workflow. Allow mechanics to propose specification edits and enable chief mechanics/admins to review, approve, or reject these proposals, applying modifications reactively.

### Checklist
- [x] Create EquipmentChangeRequest TypeORM database entity schema
- [x] Implement validation DTOs (ProposeChangeDto, ReviewChangeDto)
- [x] Register entity and update backend EquipmentModule imports
- [x] Implement service methods (createChangeRequest, getPendingChangeRequests, approveChangeRequest, rejectChangeRequest) in EquipmentService
- [x] Expose secured REST endpoints with JwtAuthGuard and RolesGuard checks in EquipmentController
- [x] Verify backend compilation and TypeORM migration status

---

## Task ID: task-frontend-change-approval
Title: Equipment Specification Change Approval System Frontend UI
Status: done
Priority: high
Dependencies: [task-backend-change-approval]

### Description
Build the Change Request management dashboard and specifications proposal forms on the frontend. Unlock specs editing inside EquipmentModal for the mechanic role, prompting them to submit change proposals. Build an interactive Manager panel for chief mechanics and admins to review diff logs and trigger approvals.

### Checklist
- [x] Implement client API handlers for change requests endpoints in api.ts
- [x] Refactor EquipmentModal.tsx specs form inputs to be editable for the mechanic role
- [x] Update form submit trigger in EquipmentModal to propose a change request if active role is mechanic
- [x] Add "Change Requests" management button and modal tab inside Category & Template Manager settings
- [x] Render interactive specifications Diff View comparing current values with proposed changes
- [x] Implement Approve and Reject triggers with review feedbacks inside the manager dashboard
- [x] Verify full monorepo production compilation and verify end-to-end functionality








