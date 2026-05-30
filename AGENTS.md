# AGENTS.md

## Project Rule Zero
This is an existing, deployed product. Do not rebuild Social Media Flowboard / SM Tracker from scratch unless the task explicitly requires it.

## Working Principles
- Inspect the existing structure, data flow, and current behavior before editing.
- Make small, safe, traceable changes that are easy to review and rollback.
- Preserve working business logic unless the task explicitly calls for a behavior change.
- Protect user, client, and brand-scoped data flows in every change.
- Treat role access, metrics, logged updates, reporting, and persistence as critical systems.
- Prefer incremental edits over broad refactors.
- Do not rename or relocate core files without a strong reason and explicit note.
- Do not introduce new frameworks just to solve a local problem.

## Critical System Areas
These areas should be considered high-risk when touched:
- Authentication and magic-link sign-in flow
- Admin, manager, and client role access
- Client and brand scoping
- Planning and scheduled content creation
- Logged For Update / execution logging
- Post link editing and metrics editing
- Performance reporting and dashboard summaries
- Calendar and month-filter logic
- Data persistence across refresh, logout, and relogin

## Required Workflow For Every Task
1. Read only the files needed for the task.
2. Summarize the current implementation before making edits.
3. Identify the exact user flow and data flow being changed.
4. Make the smallest safe implementation that solves the task.
5. Run relevant checks before finishing.
6. Document what changed, what was verified, and any assumptions.

## Editing Guardrails
- Never wipe or replace working screens with new implementations unless explicitly instructed.
- Preserve current UI structure and business terminology unless the task requires a change.
- Avoid touching unrelated screens while working in a scoped area.
- Keep backwards compatibility for existing local demo data and shared Supabase mode where possible.
- If a behavior is unclear, state the assumption in the task note or PR summary.

## Validation Expectations
Run the lightest relevant validation for the task, such as:
- `npm run build` for app-wide safety after UI or logic changes
- targeted manual flow checks for auth, role access, client scoping, metrics, reporting, and calendar views
- data persistence verification after changes that touch storage or Supabase sync

## Task Completion Note
After each task, record:
- files changed
- user-facing behavior changed
- risk areas checked
- verification performed
- assumptions or follow-up items
