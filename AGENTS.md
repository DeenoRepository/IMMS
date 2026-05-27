# AI Agent Instructions and Documentation System

---

# 1. Purpose

This document defines how AI agents must operate, plan, and retrieve knowledge while implementing the CMMS Enterprise system.

It introduces a **split-document knowledge system** to prevent large context loading and reduce token usage.

---

# 2. Core Principle

The agent MUST NOT load or process the full documentation at once.

Instead, it MUST:
- Load only relevant document chunks
- Use indexed retrieval
- Work in minimal context mode
- Avoid global rereading of all docs

---

# 3. Documentation Structure (Chunked System)

All documentation is split into small atomic files.

## 3.1 Directory Structure

```
/docs
  /index.md
  /core
      auth.md
      architecture.md
      routing.md

  /frontend
      shell.md
      modules.md
      ui-system.md
      state-management.md

  /backend
      api-design.md
      auth.md
      rbac.md
      services.md

  /database
      schema-equipment.md
      schema-maintenance.md
      schema-warehouse.md

  /ui
      design-system.md
      components-basic.md
      components-industrial.md
      charts.md
      tokens.md

  /deployment
      docker.md
      nginx.md
      ubuntu-setup.md

  /agent
      execution-rules.md
      task-system.md
      context-system.md
      token-rules.md
```

---

# 4. Index File Rule (CRITICAL)

## /docs/index.md

This file is the ONLY entry point for agents.

It contains:
- list of available documents
- short description of each file
- pointers to relevant sections

Agents MUST start from index.md.

---

# 5. Document Loading Rules

## 5.1 Lazy Loading

Agents MUST:
- Load only ONE document at a time
- Never load full /docs directory
- Never concatenate multiple documents unless explicitly required

---

## 5.2 Context Limit Rule

Maximum active context per task:
- 1 core document
- 1 domain document (frontend/backend/ui/database)
- 1 agent rule document

Total: max 3 files per reasoning cycle

---

## 5.3 Retrieval Rule

If information is missing:
- consult /docs/index.md
- then load the smallest relevant file
- do NOT preload related files speculatively

---

# 6. Agent Instruction System

Agent behavior is defined in /docs/agent/*

These files are mandatory and MUST override all implicit behavior.

---

## 6.1 execution-rules.md
Defines:
- step-by-step execution flow
- planning requirements
- implementation order rules

---

## 6.2 task-system.md
Defines:
- TASKS.md structure
- checklist rules
- task lifecycle

---

## 6.3 context-system.md
Defines:
- CONTEXT.md structure
- state tracking rules
- update rules after each task

---

## 6.4 token-rules.md
Defines:
- minimal output requirements
- diff-only updates
- prohibition of repetition

---

# 7. Document Granularity Rules

Each document MUST:
- contain a single topic only
- be independently understandable
- be under ~300–500 lines equivalent

If a document grows larger:
- it MUST be split into sub-documents

Example:
```
ui/components.md →
   ui/components-buttons.md
   ui/components-tables.md
```

---

# 8. Anti-Context Explosion Rules

Agents MUST NOT:
- load all UI docs at once
- load full backend spec at once
- duplicate information across files

Agents MUST:
- reference instead of duplicate
- fetch only required sections

---

# 9. Cross-Reference System

Documents may reference others using lightweight pointers:

Example:
```
See: /docs/ui/tokens.md#colors
```

BUT:
- no full file embedding
- no multi-file concatenation

---

# 10. Execution Strategy for Agents

When starting a task:

1. Open /docs/index.md
2. Identify relevant domain
3. Load only required doc chunk
4. Execute planning phase
5. Implement task
6. Update TASKS.md and CONTEXT.md
7. Stop

---

# 11. Performance Optimization Rules

To reduce token usage:

- prefer references over explanations
- reuse definitions
- avoid repeating architecture
- use short structured outputs
- never restate unchanged context

---

# 12. Forbidden Behaviors

Agents MUST NOT:
- load entire documentation tree
- duplicate content between files
- ignore index.md entry rule
- combine unrelated domains in one context load

---

# 13. Task Planning and Task Storage System

## 13.1 Purpose

This section defines how AI agents must create, store, read, and update tasks during system implementation.

The goal is to ensure:
- deterministic execution
- persistent task tracking
- minimal context usage
- clear implementation traceability

---

## 13.2 Task Planning Requirement (MANDATORY)

Before starting any implementation, the agent MUST:

1. Analyze the feature or requirement
2. Break it into atomic tasks
3. Ensure each task is independently implementable
4. Define execution order (dependency chain)
5. Estimate complexity (low / medium / high)

No implementation is allowed before task decomposition is completed.

---

## 13.3 Task Storage Location

All tasks MUST be stored in:

```
/CONTEXT/TASKS.md
```

This file is the SINGLE source of truth for all task execution tracking.

---

## 13.4 TASKS.md Structure

Each task MUST follow this structure:

```
## Task ID: <unique-id>
Title: <short description>
Status: pending | in_progress | done
Priority: low | medium | high
Dependencies: [task-id, task-id]

### Description
<short description of what must be implemented>

### Checklist
- [ ] step 1
- [ ] step 2
- [ ] step 3

### Notes
<optional implementation notes>
```

---

## 13.5 Task Lifecycle

A task MUST follow this lifecycle:

1. pending → created during planning phase
2. in_progress → actively being implemented
3. done → all checklist items completed and verified

No task may skip states.

---

## 13.6 Task Reading Rules

Before executing ANY work, the agent MUST:

1. Open `/CONTEXT/TASKS.md`
2. Identify highest priority `pending` task
3. Check dependencies are completed
4. Move task to `in_progress`

Only ONE task may be in progress at a time unless explicitly allowed.

---

## 13.7 Task Update Rules

After ANY modification:

- update checklist items
- update task status
- write minimal changes only (diff-based updates preferred)

---

## 13.8 Context Synchronization

After completing a task, the agent MUST:

1. Mark task as `done`
2. Update `/CONTEXT/CONTEXT.md`
3. Log important decisions in `/CONTEXT/DECISIONS.md` if applicable

---

## 13.9 Anti-Duplication Rule

Agents MUST NOT:
- create duplicate tasks
- split a task into multiple identical subtasks
- re-implement already completed tasks

---

## 13.10 Minimal Context Principle

When working with tasks:

- ONLY TASKS.md may be loaded for execution planning
- CONTEXT.md is used only for state awareness
- No other documents should be loaded unless required

---

# End of AI Agent Instruction System

