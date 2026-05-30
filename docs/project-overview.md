# Project Overview

## Purpose
Social Media Flowboard / SM Tracker gives Digitally Done one place to manage planned content, live posting updates, client-specific links and metrics, and client-ready reporting.

It exists to reduce spreadsheet drift, keep execution records in sync with the plan, and give internal teams plus clients a clearer shared view of what was planned, what went live, and how content performed.

## Core Users
- `Admin`: oversees access, clients, planning, execution, and reporting.
- `Manager`: operates day-to-day planning, updates, and reporting across brands.
- `Client`: views only the brands they are assigned to, mainly through dashboard and calendar-style reporting views.

## Core Workflows
### 1. Planning
Admins and managers create planned social posts by client, campaign, date, platform, format, and notes.

### 2. Logged For Update / execution
Planned posts move into the execution workflow, where the team records status, publishing notes, post links, and qualitative notes.

### 3. Metrics and reporting
Once a post is live, the team adds metrics such as reach, impressions, likes, comments, shares, and clicks so the reporting dashboard can summarize results by month, campaign, platform, and top-performing posts.

### 4. Client visibility
Clients get read-only access to the brands assigned to them, so they can review results without being able to change planning or execution data.

## Current Status
- Existing app is already built and deployed.
- Project is in late-trial / pre-launch hardening mode.
- Recent known fixes include protected editing for existing links and metrics, data persistence stability, month-view stability, and restored admin/manager access to client view.

## What Must Remain Stable
- Sign-in and invite provisioning flow
- Role-based access for admin, manager, and client
- Client and brand scoping rules
- Planning records and logged status records
- Existing post link edits and metrics edits
- Calendar month switching and filtering
- Performance reporting totals and summaries
- Data persistence after refresh, logout, and relogin

## Working Assumption
The codebase currently inspected for this operating system is the live source repo at `/Users/Rich/Documents/Done/AI/Codex/SM Tracker`. The separately provided asset-folder path appears to be a document/assets location rather than the deployed application source.
