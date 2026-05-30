# CLAUDE.md

## Purpose
These instructions keep Claude Code sessions focused, low-risk, and context-efficient while working on the existing Social Media Flowboard / SM Tracker application.

## Context Loading Rules
- Load only the files directly relevant to the task.
- Do not read the whole repository unless the task genuinely requires a full-structure audit.
- Use the context map in `docs/context/context-loading.md` to decide what to open first.
- Prefer targeted search, then narrow file reads, then scoped edits.

## Working Style
- Summarize the current implementation before editing.
- Use task files from `tasks/` to anchor work whenever possible.
- Keep changes local to the requested flow or screen.
- Do not alter unrelated screens, labels, or workflows during a focused fix.
- Keep UI and logic stable unless the task explicitly requires change.
- Preserve existing business logic, role rules, and client scoping by default.

## Safe Editing Rules
- Avoid broad rewrites of `src/App.jsx` unless absolutely necessary.
- When touching a cross-cutting area, map the dependent flows first.
- Prefer additive documentation and small edits over structural churn.
- Call out assumptions clearly when the codebase or environment leaves something implicit.

## Before Finishing
- Note what was changed.
- Note what was intentionally left untouched.
- Run the most relevant validation available.
- Flag any fragile or high-risk follow-up areas.
