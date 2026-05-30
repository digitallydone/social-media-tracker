# Social Platform Auto-Sync Architecture

## 1. System Vision
The goal is to extend Social Media Flowboard from a manual post-tracking tool into a controlled social data hub without destabilizing the existing planning, execution, and reporting workflows.

The foundation should allow the system to:
- connect approved brand-owned social accounts
- understand which brand maps to which external account
- detect the platform for a pasted post link
- retrieve platform metrics through official APIs where possible
- preserve human review before any metrics affect reporting

This phase must leave the current workflow intact:
- planning remains manual
- posting remains manual
- manual metric entry remains available
- reporting continues to read from the current saved execution records

## 2. Why Manual-Link + Auto-Metrics Is Phase 1
Manual link entry plus automatic metric retrieval is the safest first integration layer because it improves data collection without changing publishing behavior or reporting semantics.

Reasons this is the right Phase 1:
- it keeps human confirmation in the loop before metrics are saved
- it avoids hidden background automation while trust is still being built
- it reduces API complexity because the system starts from a known post URL
- it minimizes the risk of creating duplicate or incorrect post records
- it preserves the current status-record workflow that reporting already depends on

This phase should treat external metrics as proposed values until a user explicitly accepts them.

## 3. Supported Platforms Roadmap
### Initial roadmap order
1. Instagram
2. Facebook
3. YouTube
4. LinkedIn
5. TikTok

### Platform notes
- Instagram: likely strongest business value early, but API access and account structure require careful Meta setup.
- Facebook: pairs naturally with Instagram through the Meta platform and can share some auth/account mapping architecture.
- YouTube: generally clean URL structures and mature API support make it a strong early candidate.
- LinkedIn: useful for B2B clients, but permissions and metric availability may be narrower.
- TikTok: high business interest but likely the highest integration volatility because APIs, permissions, and business account requirements can change quickly.

## 4. Authentication Architecture
Authentication should be platform-specific at the provider level but normalized inside the application.

Recommended architecture:
- a platform connection layer owns OAuth initiation, callback handling, token refresh, and connection status
- a normalized `social_accounts` model represents the external account/channel/page/profile
- brand mappings remain internal and separate from raw provider identity
- one brand can map to multiple social accounts
- one provider account may need to expose multiple sub-accounts, pages, or channels for explicit admin selection

Auth responsibilities should be split into:
- provider authentication: proving access to the external platform
- account discovery: listing pages, channels, or profiles accessible with that token
- internal authorization: deciding which app roles can create, refresh, or deactivate a connection

Current app role access should remain unchanged. Integration actions should sit behind existing admin and manager capabilities unless later governance says otherwise.

## 5. OAuth Flow Overview
High-level safe flow:
1. admin or manager clicks `Connect Platform`
2. app sends user to provider OAuth consent screen
3. provider returns authorization code to a dedicated callback route or backend handler
4. backend exchanges code for access token and refresh token where supported
5. backend stores encrypted token material and provider metadata
6. backend fetches accessible social accounts
7. admin or manager maps the discovered account to one or more brands
8. connection status becomes available for manual metric retrieval workflows

Important guardrails:
- never expose long-lived tokens to the browser if avoidable
- keep provider callback handling out of broad frontend state logic
- require explicit account selection when a token grants access to multiple assets

## 6. Token Storage And Security Considerations
Token storage must be designed as a protected backend concern, even if UI entry points remain in the current app shell.

Recommendations:
- store provider tokens in a dedicated table such as `oauth_tokens`
- encrypt token values at rest
- restrict token reads to backend/service-role pathways only
- store token metadata separately from secret material where useful
- track token expiry, refreshability, provider user id, and last successful refresh
- support token revocation and soft deactivation without deleting history

Security principles:
- browser clients should never need raw refresh tokens
- logs must not include access tokens, refresh tokens, auth codes, or full provider payloads
- audit fields should record who connected or disconnected an account and when
- any future background sync system should reuse the same secure token store rather than duplicate credentials

## 7. Brand-To-Social-Account Mapping
Brand mapping should be explicit, reviewable, and reversible.

Recommended model:
- a `social_account` represents the provider-owned destination such as an Instagram business account, Facebook page, LinkedIn page, YouTube channel, or TikTok business account
- a `brand_social_connection` links one internal brand to one external social account
- one brand may connect to many platform accounts
- one social account should normally map to one brand, but the model should allow controlled exceptions if governance requires them later

Operational rules:
- mappings should be created only by admin or manager
- inactive mappings should be preserved historically rather than hard-deleted
- metrics retrieval should only be allowed when a valid mapping exists for the detected post platform

## 8. Metric Snapshot Strategy
Metric retrieval should use a snapshot model instead of overwriting reporting fields invisibly.

Recommended approach:
- fetch raw platform metrics into a `metric_snapshots` table or state structure
- label each snapshot with provider, post identifier, fetched time, and metric values
- mark snapshots as `proposed`, `approved`, `rejected`, or `superseded`
- only approved metrics should be copied into the current saved execution record fields that reporting already reads

Benefits:
- preserves reporting stability
- creates an audit trail for metric changes over time
- allows later trend views without changing current dashboard logic
- supports safe comparison between manual numbers and API-fetched numbers

## 9. Sync Frequency Strategy
Phase 1 should not introduce background sync jobs.

Initial frequency model:
- metrics fetch occurs only on explicit user action such as `Fetch Metrics`
- each fetch creates a point-in-time snapshot
- users decide whether to save that snapshot into the current workflow

Future staged expansion:
1. manual fetch only
2. recommended refresh reminders
3. limited scheduled sync for connected posts
4. selective auto-refresh policies per platform or brand

This staged model avoids hidden changes to client-facing reporting.

## 10. Rate-Limit Considerations
Each platform has its own API quotas, burst limits, and permission constraints. The integration layer should assume limits will be hit eventually.

Architecture considerations:
- centralize provider request wrappers
- store last fetch time per post and per account
- prevent rapid repeated fetches from the UI
- surface clear messages when a provider limit or temporary lockout occurs
- prefer batched reads only when the provider supports them safely

Phase 1 UI should discourage unnecessary repeated requests by showing recent fetch time and connection health.

## 11. Error Handling Strategy
Errors should be visible, classifiable, and non-destructive.

Suggested error categories:
- unsupported URL
- malformed post ID
- provider connection missing
- provider token expired
- account mapping mismatch
- provider permission denied
- provider post not found
- provider metric unavailable
- rate limited
- transient provider failure

Handling rules:
- failed fetches must never overwrite approved metrics
- current manual metric entry must remain available after any failure
- errors should be stored in a normalized `sync_errors` structure for later diagnosis
- the UI should show actionable next steps instead of raw API payloads

## 12. Retry Strategy
Retry behavior should depend on error type.

Recommended policy:
- no silent browser retries for authorization or mapping errors
- limited automatic retry for transient network or provider 5xx failures
- exponential backoff for retryable server-side sync attempts in future phases
- manual retry button for user-initiated fetch failures

In Phase 1, a failed fetch should resolve into one of two outcomes:
- user retries after fixing the issue
- user continues with manual metrics entry

## 13. Manual Override Philosophy
Manual workflows remain the source of operational resilience.

Principles:
- users can still paste a link without a connected account
- users can still enter metrics manually without API retrieval
- users can decline fetched metrics and keep existing manual values
- approved fetched metrics should be traceable, not forced

This keeps the system dependable even when provider APIs change, credentials expire, or a client does not grant access.

## 14. Future AI Opportunities
AI is explicitly out of scope for this phase, but the architecture should avoid blocking future capabilities.

Later opportunities could include:
- anomaly detection on sudden metric swings
- metric reconciliation suggestions when manual and API values differ
- draft client summaries that cite approved snapshots
- alerts for stale posts missing final metrics
- account mapping assistance during onboarding

These should only be considered after the connection, snapshot, and review layers are proven stable.

## 15. Rollback / Fallback Behavior
Every integration path needs a safe exit.

Fallback rules:
- if a provider connection fails, the app falls back to manual link and metric entry
- if platform detection fails, the user can still classify the platform manually
- if fetched metrics are rejected, existing saved metrics remain unchanged
- if a connection is removed, historical snapshots remain for audit purposes

Rollback philosophy:
- disable integration entry points before changing reporting behavior
- never make reporting dependent on live provider availability
- avoid migrations that force immediate data backfills before the integration is validated

## 16. Data Ownership Principles
Internal business records and external platform data should remain clearly separated.

Principles:
- the app owns planning records, status records, approvals, and reporting outputs
- providers own authoritative platform metrics at fetch time
- approved metric copies inside the app become internal reporting snapshots, not live provider mirrors
- users need visibility into when numbers were fetched and approved

This distinction matters because platform metrics can change after posting, while client-facing reports often need stable month-end saved values.

## 17. Risk Analysis
### Highest architectural risks
- introducing API-driven metrics that accidentally overwrite trusted manual reporting fields
- blending provider account identity with internal brand identity too early
- leaking or mishandling OAuth tokens
- building platform-specific logic directly into `src/App.jsx`
- assuming all platforms expose equivalent metrics or URL patterns

### Product risks
- teams may trust fetched values without understanding snapshot timing
- users may expect fully automatic publishing or auto-sync before governance is ready
- platform permission reviews could delay rollout unexpectedly

### Mitigations
- keep approved metrics separate from raw snapshots
- centralize provider logic behind a normalized integration layer
- preserve manual entry as a first-class fallback
- phase rollout per platform instead of launching all at once
- validate each provider against real client account scenarios before broad release

## Recommended Phase 2 Implementation Sequence
1. establish data model and secure token architecture
2. implement URL detection and validation utilities
3. add connection management for the first provider group
4. add metric snapshot storage and approval workflow
5. expose `Fetch Metrics` in the existing manual execution flow
6. validate reporting remains unchanged until approved values are explicitly saved
