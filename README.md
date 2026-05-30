# Social Media Flowboard / SM Tracker

Social Media Flowboard is Digitally Done's client-facing social media operations workspace for planning content, logging live updates, storing links and metrics, tracking month-by-month execution, and preparing client-ready reporting.

This is an existing late-trial / pre-launch product. The goal of current work is hardening, stabilization, and launch readiness rather than rebuilding the app.

## Who Uses It
- `Admin`: manages invites, client directory, planning, execution logging, reporting, and client view access.
- `Manager`: manages planning, execution updates, calendar workflows, and reporting across clients.
- `Client`: read-only access to brand-scoped dashboard and calendar views for assigned client brands.

## What The System Does
- plan upcoming social media content by client, campaign, platform, date, and format
- log live status updates for planned content
- save post links, notes, and qualitative observations
- capture performance metrics such as reach, impressions, likes, comments, shares, and clicks
- review month-based calendar and execution views
- generate client-friendly performance reporting summaries
- manage client brands, invited access, and role/client scope rules

## Main Modules
- `Planning workspace`: create and edit planned content items.
- `Execution / Logged For Update`: convert planned content into logged status records with links, notes, and metrics.
- `Performance reporting`: monthly metrics overview, highlights, leaderboard, and qualitative reporting layer.
- `Calendar`: daily, weekly, and monthly views of scheduled work.
- `Client directory and invites`: manage brands and shared-trial access rules.
- `Client dashboard`: scoped, read-only brand view for clients.

## Tech Stack
- React 18
- Vite 5
- Tailwind CSS
- Supabase for shared trial auth and data persistence
- localStorage fallback for local demo mode
- Vercel deployment for the live hosted app

## Project Structure
- `src/App.jsx`: primary application logic, view state, role handling, reporting, and shared/local persistence flow.
- `src/main.jsx`: app bootstrap.
- `src/index.css`: styling.
- `public/config.js`: runtime config for shared Supabase mode.
- `supabase/schema.sql`: database tables, functions, triggers, and RLS policies.
- `supabase/seed-example.sql`: example invite seed data.
- `docs/`: product, architecture, QA, and deployment references.
- `tasks/`: execution-ready task files for ongoing hardening work.

## Local Setup
### Requirements
- Node.js 18+
- npm

### Install
```bash
npm install
```

### Start local development
```bash
npm run dev
```

### Preview production build
```bash
npm run build
npm run preview
```

## Environment And Runtime Configuration
This project uses a browser-side runtime config file rather than a `.env`-driven app bundle.

Required values in `public/config.js`:
- `supabaseUrl`
- `supabaseAnonKey`
- `appUrl`

Example source template:
- `config.example.js`

Notes:
- if `public/config.js` is missing or empty, the app can fall back to local demo behavior depending on runtime path
- the deployed app URL in `appUrl` must match the actual hosted domain used for magic-link redirects

## Development Commands
- `npm run dev`: run the Vite dev server
- `npm run build`: build the production app into `dist/`
- `npm run preview`: locally preview the built app

## Shared Trial / Launch Notes
- The app supports both local demo mode and shared Supabase-backed mode.
- Shared mode uses magic-link authentication plus profile provisioning from `access_invites`.
- Trial hardening should prioritize role access, client scoping, metrics protection, data persistence, and reporting confidence.
- This repo should be treated as a pre-launch hardening project, not a greenfield rebuild.

## Deployment Notes
- Primary deployment target: Vercel
- GitHub repository: `digitallydone/social-media-tracker`
- Vercel is configured via `vercel.json`
- App routing rewrites all paths to `index.html`
- After deployment, perform a hard refresh in the browser to ensure the latest static bundle and runtime config are loaded

See also:
- `docs/project-overview.md`
- `docs/architecture.md`
- `docs/deployment.md`
- `docs/qa/trial-exit-checklist.md`
