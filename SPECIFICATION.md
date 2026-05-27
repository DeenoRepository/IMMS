# Technical Specification for AI Agent
## CMMS Enterprise System for Maintenance Department

---

# 1. Project Objective

Develop a web-based CMMS (Computerized Maintenance Management System) for managing the Chief Mechanical Engineer department of an enterprise.

The system will be deployed in a local on-premise environment (Ubuntu Server 24.04 VPS) and must operate fully within a closed network (LAN).

### Core goals:
- Equipment management
- Preventive and corrective maintenance (PPR / repairs)
- Maintenance request handling
- Downtime tracking
- Spare parts warehouse management
- Operational analytics

---

# 2. System Architecture

## 2.1 High-Level Architecture

```
Frontend Shell (React SPA)
        ↓
Design System (@mech/ui)
        ↓
Business Modules
        ↓
Backend API (NestJS or .NET 8)
        ↓
PostgreSQL Database
```

---

## 2.2 Modular Concept

The system is built as a modular platform.

Each module is independent and self-contained:

- maintenance
- warehouse
- equipment
- requests
- analytics

Each module:
- registers itself in the Shell
- provides its own routes
- uses only the shared Design System
- does NOT implement its own UI framework

---

# 3. Frontend System (Shell + Modules)

## 3.1 Technology Stack

- React + TypeScript
- Vite
- React Router
- Zustand or Redux Toolkit
- Axios

---

## 3.2 Shell Responsibilities

The Shell is the core frontend application responsible for:

- Application layout (Header + Sidebar)
- Authentication handling
- Routing system
- Dynamic module loading
- Module registry management
- Role-based UI rendering

---

## 3.3 Module Registry

Modules are defined in a centralized registry:

```ts
{
  key: "maintenance",
  title: "Maintenance Management",
  route: "/maintenance",
  icon: "wrench",
  loader: () => import("modules/maintenance")
}
```

---

## 3.4 Navigation System

The sidebar menu is automatically generated from the module registry.

---

# 4. Design System (@mech/ui)

## 4.1 Purpose

A unified UI system shared across all modules.

It is a mandatory dependency.

---

## 4.2 Rules

### Forbidden in modules:
- Custom UI components
- External UI frameworks (MUI, Ant Design, Bootstrap)
- Inline styling as primary approach

### Allowed:
- Only components from @mech/ui
- Only design tokens
- Only shared visualization components

---

## 4.3 Core UI Components

### Basic Components
- Button
- Input
- Select
- Modal
- Card
- Tabs
- Badge
- Tooltip

---

### Data Components
- Table (universal)
- DataGrid
- FilterPanel
- StatusBadge

---

### Industrial Components
- EquipmentStatusIndicator
- DowntimeBadge
- MaintenancePriorityTag

---

### Visualization Components
- LineChart (downtime tracking)
- BarChart (load analysis)
- PieChart (maintenance distribution)
- Timeline (event history)

---

## 4.4 Design Tokens

All styling must rely on design tokens:

- color palette (status-based)
- spacing scale
- border radius scale
- typography scale

---

# 5. Backend System

## 5.1 Technology Options

- NestJS (preferred)
- OR .NET 8 Web API

---

## 5.2 Core Modules

### Authentication
- JWT-based authentication
- Refresh token support
- Role-based access control (RBAC)

### Equipment Management
- CRUD operations
- Equipment metadata
- Lifecycle tracking

### Maintenance System
- Preventive maintenance (PPR)
- Corrective maintenance
- Work order tracking

### Warehouse
- Spare parts inventory
- Stock tracking
- Consumption records

### Requests
- Maintenance requests
- Status workflow

### Analytics
- Downtime metrics
- Equipment utilization
- Maintenance statistics

---

## 5.3 API Design

RESTful API with JSON responses:

```
GET /api/equipment
POST /api/maintenance
GET /api/analytics/downtime
```

---

# 6. Database Schema (PostgreSQL)

## 6.1 Equipment
- id
- name
- type
- location
- status
- commissioning_date

---

## 6.2 Maintenance
- id
- equipment_id
- type (PPR / repair)
- status
- planned_date
- completed_date

---

## 6.3 Downtime
- id
- equipment_id
- start_time
- end_time
- reason

---

## 6.4 Warehouse Items
- id
- name
- quantity
- unit
- min_stock_level

---

## 6.5 Requests
- id
- equipment_id
- description
- priority
- status

---

# 7. Security Model (RBAC)

## Roles
- mechanic
- chief_mechanic
- warehouse_manager
- admin

## Rules
- Access is role-based
- Backend is the source of truth for permissions

---

# 8. Deployment Requirements

## Environment
- Ubuntu Server 24.04 (on-premise VPS)
- Fully offline LAN operation supported

---

## Infrastructure
- Docker
- Docker Compose
- Nginx reverse proxy

---

## Services
- frontend (Shell)
- backend API
- PostgreSQL database

---

## Routing
- / → frontend shell
- /api → backend service

---

# 9. Monorepository Structure

```
/system
  /frontend
  /backend
  /modules
  /packages
      /ui
      /charts
      /types
      /api-client
```

---

# 10. AI Agent Requirements

The AI agent responsible for implementation must follow these rules:

## 10.1 Architecture Rules
- Maintain strict modular architecture
- No cross-module dependencies
- Separation of UI, logic, and data layers

## 10.2 UI Rules
- MUST use @mech/ui only
- MUST NOT implement local UI components inside modules

## 10.3 Code Quality
- TypeScript required everywhere
- Strict typing enforced
- No code duplication

## 10.4 Integration Rules
- Modules must not break Shell
- All changes must be backward compatible

---

# 11. Constraints

The following are strictly prohibited:

- External UI libraries (Material UI, Ant Design, Bootstrap)
- Inline CSS as primary styling method
- Direct module-to-module communication
- Bypassing the design system

---

# 12. Definition of Done (DoD)

The system is considered complete when:

- Shell loads successfully with navigation
- At least two modules are functional (equipment, maintenance)
- UI uses only @mech/ui components
- Backend supports full CRUD operations
- RBAC is implemented
- System runs via Docker Compose
- System works in isolated LAN environment

---

# 13. Extensibility Requirements

The system must support:

- Adding new modules without modifying Shell
- Extending UI kit without breaking modules
- Replacing backend without frontend redesign

---

# End of Specification

