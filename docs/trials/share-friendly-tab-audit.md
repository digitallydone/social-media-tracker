# Share-Friendly Tab — Audit Report

**Date:** 2026-05-30
**Auditor:** Claude Code
**Scope:** Pre-pilot client readiness review

---

## Executive Summary

There is no "Share-Friendly" tab. The label is a **static badge element** inside the `ClientViewBanner` component. It has no panel, no content, no interactivity, no data dependency, and no documentation. It appears in the UI as a small pill reading "Share-Friendly" in the top-right corner of the Client View banner.

**Recommendation: Remove the badge for the first-client pilot.** It adds visual noise without meaning, has no defined purpose in any docs or onboarding material, and risks prompting client questions that have no good answer.

---

## 1. Where It Is Defined

| File | Component | Line |
|------|-----------|------|
| `src/App.jsx` | `ClientViewBanner` | ~1404 |
| `src/browser-app.jsx` | `ClientViewBanner` | ~1158 |

Both files contain a `ClientViewBanner` component. The badge is a plain `<span>` in the right-hand cluster of that banner:

```jsx
<span className="rounded-full border border-[#ddd4f5] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#7855c8]">
  Share-Friendly
</span>
```

The `ClientViewBanner` itself is conditionally rendered only when `isClientView === true`, so the badge is invisible to admin users unless they toggle Client View mode.

---

## 2. Is It Currently Functional?

No. The badge is inert:

- No `onClick` handler
- No link or route
- No associated panel or drawer
- No state it reads or writes
- No data it fetches or displays

It is cosmetic only.

---

## 3. Is It Intentionally Disabled?

There is no evidence of intentional disabling — no feature flag, no commented-out code, no `TODO`, no gating condition. It renders unconditionally whenever the parent banner renders. This suggests it was added as a placeholder label or a UI affordance that was never backed by functionality.

---

## 4. Original Purpose

Unknown — not documented anywhere. The most plausible interpretation: it was added as a reassuring label for clients, indicating that the view they're seeing is safe to share (e.g., with a supervisor, a partner, or via screenshot). It may have been intended as:

- A tooltip or explainer badge ("this view is designed to be shared")
- A future entry point to a share/export feature
- A purely decorative trust signal

No code, docs, or commit context confirms any of these.

---

## 5. Routes, Components, or Data Flows That Depend on It

None. A full-codebase search for `Share-Friendly`, `ShareFriendly`, and `share-friendly` returns only the two badge `<span>` elements. No route, no state variable, no API call, and no other component references the badge or depends on it.

The broader `sharedMode` and `sharedModeReady` state that exists throughout the app refers to the Supabase-backed shared workspace — it is unrelated to this badge.

---

## 6. References in Docs or Onboarding

None found. Searched:

- `README.md`
- `README-REMOTE-TRIAL.md`
- `docs/architecture.md`
- `docs/project-overview.md`
- `CLAUDE.md`
- All files under `docs/trials/`, `docs/qa/`, `docs/audits/`

The phrase "Share-Friendly" does not appear in any of them.

---

## Recommendation

**Remove the badge for the first-client pilot.**

### Rationale

- It conveys nothing actionable to a client.
- It has no backing feature, docs, or defined meaning.
- A client who asks "What does Share-Friendly mean?" has no good answer from the app or from any onboarding material.
- Removing it requires a two-line change in each file — zero risk, zero breakage.

### Smallest Safe Removal

Delete the `<span>` in both files:

**`src/App.jsx` ~line 1404** — remove:
```jsx
<span className="rounded-full border border-[#ddd4f5] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#7855c8]">
  Share-Friendly
</span>
```

**`src/browser-app.jsx` ~line 1158** — remove the same span.

No other code changes are needed. No routes, state, or components depend on this element.

### If You Want to Keep the Concept

Defer it. When a real share/export feature is built (PDF export, shareable link, screenshot mode), the badge — or a proper button — can be reintroduced with actual meaning. For now it adds confusion, not value.

---

## Status

- [x] Code change approved
- [x] Removed from `src/App.jsx` (line 1403–1405)
- [x] Removed from `src/browser-app.jsx` (line 1157–1159)
- [x] `npm run build` passed — no errors, no remaining references in `src/` or `dist/`
- [ ] Verified in Client View before deploy
