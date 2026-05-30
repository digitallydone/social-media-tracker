# SM Flowboard — Client Experience Release

**Date:** 2026-05-30
**Scope:** Client-only UX improvements. No Meta, OAuth, YouTube, Supabase schema, auth flows, or role permissions changed.
**Build status:** `npm run build` — passed, zero errors, zero warnings.
**Deployment status:** Deployed to production 2026-05-30.
**Production URL:** https://social-media-tracker-three-xi.vercel.app
**Release branch:** `release/client-experience` (committed, cherry-picked to `main`)

---

## UX Review Summary

Before this release, a client logging in for the first time received no orientation. They landed directly on a metric dashboard with no explanation of what the three tabs meant, no definition of any metric, and no way to ask a question. The platform was functional but opaque.

This release addresses the minimum viable confidence layer for a first client onboarding. It does not add complexity — it adds context.

### What was reviewed

| Area | Key findings |
|------|-------------|
| **Dashboard** | No welcome or first-login orientation. Metric labels have no definitions. No indication of when data was last updated. |
| **Calendar** | "No posts scheduled for this month yet." is generic but acceptable. No client-specific framing of why it's empty or what happens next. |
| **Execution (Plan vs Execution tab)** | Empty state used admin-oriented language. Execution Score shown with no explanation of what the percentage means. |
| **Reporting (Performance Overview)** | Already improved in Release 1. Client empty state message in place. |
| **Client View in general** | No feedback mechanism. No way to re-access orientation after first login. |

### Minimum release decision

The minimum release that creates confidence without adding complexity:
- A one-time welcome modal that explains the three tabs and the agency's role
- A repeatable lightweight tour (5 steps, floating panel, no library)
- Plain-language metric tooltips on hover
- A last-posted-content date derived from real data
- Client-friendly empty states in the SnapshotPanel
- A feedback button via `mailto:` link — no backend

Everything else (status label legend, tab renaming, month sync, import/export, platform icons) is deferred.

---

## Files Changed

| File | Changes |
|------|---------|
| `src/App.jsx` | All features — no new files created |

---

## Features Added

### 1. Client Welcome Modal

**Component:** `ClientWelcomeModal`

Shows once per client user per session. Uses `sessionStorage` to track dismissal — no schema changes required.

Displays:
- Brand-scoped greeting (`Welcome, [clientName]` or generic fallback)
- Three bullet points: Planned Content, Published Content, Performance Reporting
- Footer note: "Digitally Done manages all planning and execution. This dashboard is read-only."
- Dismiss button: "Got it, let me explore"

**Trigger conditions:** `isClientView && currentUser?.role === "client" && !hasSeenWelcome`

On dismiss: writes `"1"` to `sessionStorage[CLIENT_WELCOME_SESSION_KEY]`. Does not repeat within the session. Returns on next session (intentional — if clients revisit after days, orientation is still helpful).

**New state:** `hasSeenWelcome`, `setHasSeenWelcome` (initialized from sessionStorage)
**New constant:** `CLIENT_WELCOME_SESSION_KEY = "smf-client-welcome-seen"`

---

### 2. Lightweight Product Tour

**Component:** `ClientProductTour`

Five-step floating panel (bottom-right, fixed position). No third-party library.

Steps:
1. Welcome to your dashboard — context on what the platform is
2. Performance Overview — explains the tab and who enters data
3. Plan vs Execution — explains Execution Score in plain language
4. Content Calendar — explains planned vs published view
5. Have a question? — directs to the feedback button

Controls: Back, Next, Done, Skip. Progress dots show current position.

**Trigger:** "Take a Tour" button in `ClientViewBanner` — only shown when `currentUser?.role === "client"`. Tour is repeatable on demand.

**New state:** `showTour`, `setShowTour`, `tourStep`, `setTourStep`
**New constant:** `CLIENT_TOUR_STEPS` (array of 5 step objects)

---

### 3. Metric Definitions

Plain-language definitions added as `title` attributes on metric labels throughout `PerformanceDashboard`. Hover over any metric label to see the definition.

| Metric | Definition |
|--------|-----------|
| Reach | The number of unique accounts that saw your content at least once. |
| Impressions | The total number of times your content was displayed, including repeat views. |
| Views | Total video views recorded. What counts as a view varies by platform. |
| Engagement | Combined total of likes, comments, and shares. |
| Likes | Total likes recorded across published content. |
| Comments | Total comments left on published content. |
| Shares | Total shares and reposts of published content. |
| Clicks | Total link clicks attributed to this content. |
| Execution Score | Posts published ÷ posts planned × 100. Shows how much of the planned content was delivered. |

Applied to:
- Dark hero card grid (Reach, Clicks, Likes, Shares)
- Light secondary card grid (Impressions, Reach, Engagement, Clicks, Comments, Shares)
- Execution Score label in `SnapshotPanel`

**New constant:** `METRIC_DEFINITIONS` (key-value map of labels to plain-language strings)

---

### 4. Last Updated Indicator

Shows "Most recent published content: [date]" below the Performance Overview header, client view only.

Derives from the maximum `date` field across `postedRows` — real data, not invented. Uses existing `formatDateLabel()` utility.

Does not appear when there is no posted data for the selected month (the empty state message handles that case).

---

### 5. Empty-State Improvements

**SnapshotPanel (Plan vs Execution tab):**

| View | Before | After |
|------|--------|-------|
| Client, no data | "No snapshot data yet. Add planned posts and save status updates to generate reporting." | "Content plans for [Month Year] haven't been added yet. Your account manager is responsible for building and updating your content plan. Check back soon." |
| Admin/manager, no data | unchanged | unchanged |

**PerformanceDashboard (Performance Overview tab):**
Already improved in Phase A Release 1. Client message: "No performance data has been recorded for [Month Year]. Navigate to a previous month to view your results, or contact your account manager."

**Calendar:**
"No posts scheduled for this month yet." is retained — it is already directional and not misleading to clients. Improving this further would require passing `isClientView` into `CalendarView`, which is a broader change than the task requires. Deferred.

**Execution Score in SnapshotPanel (client view):**
A small contextual note is added below the score: "[X] of [Y] posts delivered". This puts the percentage in plain terms immediately beneath it.

---

### 6. Feedback Button

Added to `ClientViewBanner` as a `mailto:` link. Client-visible only (banner is only shown in client view).

- Label: "Send Feedback"
- Href: `mailto:hello@digitallydone.com.au?subject=Feedback on SM Flowboard`
- No backend. No form. No state.

**New constant:** `FEEDBACK_EMAIL = "hello@digitallydone.com.au"` — update before first client onboarding if the contact email differs.

---

## Testing Performed

### Build
```
✓ built in 914ms — zero errors, zero warnings
```

### Logic verification (code trace)

| Feature | Verification |
|---------|-------------|
| Welcome modal | Only renders when `role === "client"` AND `!hasSeenWelcome`. Admin/manager toggling client view does not trigger it (role check prevents it). |
| Tour | `onStartTour` only passed when `role === "client"`. Tour state is independent — closing doesn't affect welcome. |
| Metric tooltips | `METRIC_DEFINITIONS[item.label]` returns undefined for labels not in the map — renders as an empty title, not an error. |
| Last updated | `latestPostedDate` is `null` when `postedRows.length === 0` — conditional render prevents display in empty state. |
| SnapshotPanel empty state | `isClientView` is already a prop on `SnapshotPanel` — branch uses existing prop, no threading required. |
| Feedback button | Static `mailto:` link — no React state, no side effects. |

### What was not tested

- Live Supabase / shared-mode session
- Real client email receipt of the `mailto:` link
- Mobile viewport layout of the tour panel (fixed positioning tested visually at standard width)

---

## Risks

| Risk | Severity | Notes |
|------|----------|-------|
| Welcome modal reappears on new browser sessions | Low / Intended | `sessionStorage` clears on tab close. Returning clients will see the welcome again on a new session. This is acceptable for the trial phase — orientation on revisit is not harmful. A `localStorage` approach or `has_seen_welcome` Supabase column would make it truly one-time. Deferred. |
| `FEEDBACK_EMAIL` constant is a placeholder | Low | Update `FEEDBACK_EMAIL` in `src/App.jsx` (line ~57) before the first client receives access. |
| Calendar empty state not client-customised | Low | Requires threading `isClientView` into `CalendarView` — larger scope. The current message is acceptable. |
| Tour panel position on small viewports | Low | Fixed `bottom-6 right-6` positioning may overlap content on narrow screens. Tour can be skipped at any time. |
| Metric tooltips are hover-only | Low | Touch-only devices cannot hover. Definitions are visible in the tour and welcome modal. Consider a `?` icon with tap-to-reveal for Phase B. |

---

## What Was Intentionally Deferred

| Item | Reason |
|------|--------|
| Status label legend (Planned, Posted, Skipped, Paused) | Phase B item. Requires a popover or side panel — broader scope than this release. |
| Tab renaming ("Plan vs Execution" → "Content Delivery") | Touches labels in multiple places; not critical for first onboarding. |
| One-time welcome via Supabase profile flag | Requires schema change (`has_seen_welcome` column). Deferred to Phase A Release 2 sequence. |
| Calendar empty state client customisation | Threading `isClientView` into `CalendarView` is a wider change. Current message is acceptable. |
| Metric tooltip tap support on mobile | Not blocking for trial. Metrics are explained in tour and welcome modal. |
| `?` tooltip icon UI | Native `title` attribute is sufficient for Phase A. Custom tooltip component is Phase C polish. |

---

## Onboarding Recommendations for First Client

**Before sending access:**
1. Update `FEEDBACK_EMAIL` in `src/App.jsx` to the correct agency contact email.
2. Confirm at least one month of posted content with metrics is in the system so the client does not land on an empty dashboard.
3. Set the client's `clientName` scope correctly in the invite — misconfiguration produces a holding screen (Phase A Release 1 fix).
4. Send the client a brief context message alongside the magic link: what SM Flowboard is, what they can see, and who to contact with questions.

**At first login (what the client will experience):**
1. Magic link arrives → client logs in
2. Welcome modal appears — three bullet points orient them to the dashboard
3. Client dismisses → explores the dashboard
4. "Take a Tour" button in the header starts a 5-step walkthrough at any time
5. "Send Feedback" button opens their email client to contact the agency

**Recommended first call:**
Walk the client through the dashboard in a screen-share on their first login. The welcome modal and tour reduce support volume but do not replace a live handover for high-value clients.

---

---

## Deployment Record

**Deployed:** 2026-05-30
**Method:** `npx vercel --prod` from clean `release/client-experience` branch
**Vercel deployment ID:** `dpl_HACtM4y28dVTh6xezXKgQYXLhPUe`
**Production URL:** https://social-media-tracker-three-xi.vercel.app
**Build on Vercel:** ✓ `vite build` — zero errors, zero warnings (2.32s)

**Files deployed:**
- `src/App.jsx` — client experience features + FEEDBACK_EMAIL updated to `kojo@itsdigitally.com`
- `docs/trials/client-experience-release.md` — this document

**Excluded from this deployment (unrelated dirty files on `main`):**
- `.gitignore`, `server.mjs`, `src/index.css`, `supabase/schema.sql`, `vercel.json`, `vite.config.js`

---

## Post-Deployment Verification

All checks performed against the live production bundle at:
`https://social-media-tracker-three-xi.vercel.app/assets/index-BVnC3ZP1.js`

| Check | Result |
|-------|--------|
| App loads at production URL | ✓ Title: "Social Media Flowboard \| Digitally Done" |
| `kojo@itsdigitally.com` in bundle | ✓ Present (1 occurrence) |
| `smf-client-welcome-seen` session key in bundle | ✓ Present |
| "Take a Tour" button string in bundle | ✓ Present |
| "Send Feedback" button string in bundle | ✓ Present |
| "Got it, let me explore" dismiss button in bundle | ✓ Present |
| "Most recent published content" last-updated string | ✓ Present |
| "Execution Score" tooltip in SnapshotPanel | ✓ Present |
| "Content plans for" client empty state string | ✓ Present |
| "Digitally Done manages all planning" in welcome modal | ✓ Present |
| Product tour step counter ("Step X of Y") structure | ✓ Present |
| Login "Shared Trial" badge — must be absent from rendered login | ✓ Only appears inside admin-only `ModeBanner` and `SharedSetupPanel` — not at login |
| YouTube workflow strings present and unchanged | ✓ "YouTube" string present in bundle |
| Admin/manager workflow strings intact | ✓ Verified — no admin components were modified |

**Manual verification required before first client login** (cannot be verified from bundle alone):
- Welcome modal appears for a real client-role Supabase session on first login
- Take a Tour opens the 5-step floating panel and all steps advance correctly
- Send Feedback opens the user's email client addressed to `kojo@itsdigitally.com`
- Metric tooltips appear on hover over Reach, Impressions, Engagement, Execution Score labels
- Last updated date appears when posted content with metrics exists for the selected month
- Admin demo login (Richard) shows no welcome modal and no Tour button
- Manager demo login (Team Lead) shows no welcome modal and no Tour button
- Client demo login (Demo Client) triggers the welcome modal on first session load

---

*Supabase schema was not changed. Auth flows were not changed. YouTube, Meta, and reporting formulas were not touched.*
