# Architecture

## Overview
Social Media Flowboard is a Vite + React single-page application with two operating modes:
- local demo mode using browser storage
- shared trial mode using Supabase auth and database persistence

The current implementation is concentrated primarily in `src/App.jsx`, which contains UI state, role handling, month filters, persistence wiring, and reporting calculations.

## Frontend Structure
- `src/main.jsx` bootstraps the React app.
- `src/App.jsx` contains the main application shell, workspace sections, role-aware rendering, plan creation, execution logging, reporting, calendar views, invite management, and client directory workflows.
- `src/index.css` provides the visual styling layer.
- `src/browser-app.jsx` exists as a browser-hosted variant / companion entry for static runtime usage.

## State Management And Data Flow
The app currently uses React local component state rather than an external state library.

Main state domains include:
- current user and session mode
- planned content records
- status / execution records
- status drafts
- client directory
- active month filters and dashboard view state
- invite management state

Persistence paths:
- local demo mode stores plans, status records, session, drafts, and client directory in `localStorage`
- shared mode loads and writes the same business data through Supabase tables and auth-backed session state

## Auth Flow
Shared mode is enabled when runtime config and the Supabase browser client are available.

High-level flow:
1. user enters invited email
2. app sends a magic link through Supabase Auth
3. Supabase auth user is created on first sign-in
4. database trigger provisions or syncs `public.profiles` from `public.access_invites`
5. app calls `ensure_my_profile()` and reads the user's role and client scope
6. UI renders the correct workspace or client view based on that resolved profile

Local demo mode bypasses Supabase and uses seeded demo identities and local browser storage.

## Role Access Flow
Application roles are:
- `admin`
- `manager`
- `client`

Current behavior:
- admins and managers can create, update, and delete planning, status, and client directory records
- clients are read-only and restricted to assigned client brands
- admin controls the invite list in shared mode
- admin and manager can access broader internal workspaces and can switch into client-facing views for validation

Enforcement happens in two layers:
- frontend view logic and edit guards in `src/App.jsx`
- Supabase row-level security policies in `supabase/schema.sql`

## Client / Brand Scoping
Client scoping uses the profile `client_name` field, which may contain one or more brand scopes.

Current pattern:
- client scopes are parsed into a list in the frontend
- client users only see records matching assigned brands
- Supabase RLS uses `has_client_scope()` to enforce row access by `client_name`
- client directory entries are intended to be the canonical brand list used by planning, invites, and reporting

## Planning Flow
Planned items are created with client, campaign, date, platform, format, time, topic, and notes.

These records are stored in:
- `localStorage` keys in demo mode
- `public.plans` in shared mode

Planned items feed both calendar displays and downstream execution logging.

## Logged Update / Execution Flow
Logged status records are tied to plans by `plan_id`.

A status record captures:
- posting status
- post link
- execution notes
- qualitative notes
- metrics fields

These records are stored in:
- `localStorage` in demo mode
- `public.status_records` in shared mode

Existing link and metric editing should be treated as critical because reporting depends on those saved records remaining intact across refreshes and later edits.

## Reporting And Metrics Flow
Reporting calculations are done in the frontend from the filtered status record set.

Metrics currently include:
- reach
- impressions
- likes
- comments
- shares
- clicks

Reporting views derive:
- monthly totals
- top posts
- platform comparisons
- campaign comparisons
- qualitative highlights
- client-friendly summary text

Reporting accuracy depends on:
- correct `Posted` status usage
- month filter correctness
- client scope correctness
- persistence of saved metrics and qualitative notes

## Database And Security Layer
`supabase/schema.sql` defines:
- `profiles`
- `access_invites`
- `client_directory`
- `plans`
- `status_records`
- provisioning and sync functions
- updated-at triggers
- row-level security policies

Key security model:
- profile and invite provisioning is driven by invited emails
- admins manage invite records
- admins and managers can write business records
- clients can only read rows within their assigned scope

## Deployment Structure
- source hosted in GitHub: `digitallydone/social-media-tracker`
- build system: Vite
- deployment target: Vercel
- output directory: `dist`
- SPA rewrite handled by `vercel.json` routing all paths to `index.html`
- runtime config loaded from `public/config.js`

## Architectural Risks To Respect
- `src/App.jsx` is a high-concentration file, so cross-cutting edits carry regression risk.
- auth, role logic, and reporting all intersect with month and client filters.
- shared mode and local demo mode can drift if changes are only tested in one mode.
- client-scoped access must stay aligned between frontend logic and Supabase RLS.
