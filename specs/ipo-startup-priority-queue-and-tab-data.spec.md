# Feature Spec: IPO Startup Priority Queue and Robust Tab Data Mapping

## 1) Overview and User Value

Home screen currently waits on a broad IPO feed and tab mapping can show wrong data (e.g., Upcoming leaking into Ongoing, UNKNOWN/TBA visibility inconsistencies). This feature introduces a startup fetch queue and deterministic tab mapping using V2 status endpoints.

Primary user value:
- Faster first usable paint on Home without waiting for all IPO categories.
- Correct tab semantics (Ongoing, Upcoming, Allotted, Listed) at startup and after refresh.
- Stable UX for TBA/UNKNOWN IPOs by placing them in Upcoming (bottom placement).

Stakeholder choices captured:
- Startup strict priority: `ACTIVE -> CLOSED -> UPCOMING -> LISTED`
- UNKNOWN/TBA placement: bottom of Upcoming
- Failure policy: show cache and continue queue
- Performance target: Home usable in `< 1.5s`

## 2) Functional Requirements (EARS)

### FR-1: Startup Priority Queue
When the Home screen initializes, the system shall enqueue IPO feed requests in strict order: `ACTIVE`, then `CLOSED`, then `UPCOMING`, then `LISTED`.

### FR-2: First Paint Data Gate
When `ACTIVE` data is available from network or cache, the system shall render the Ongoing tab immediately without waiting for remaining queue items.

### FR-3: Queue Continuation on Failure
If any queued request fails, the system shall keep existing cached data for that category, log the failure in development diagnostics, and continue processing remaining queue items.

### FR-4: Endpoint Binding by Tab
When a tab dataset is refreshed, the system shall use the category-specific endpoint source:
- Ongoing: `/api/v2/ipos/feed?status=ACTIVE`
- Allotted: `/api/v2/ipos/feed?status=CLOSED`
- Upcoming: `/api/v2/ipos/feed?status=UPCOMING` plus UNKNOWN/TBA merge source
- Listed: `/api/v2/ipos/feed?status=LISTED`

### FR-5: UNKNOWN/TBA Upcoming Inclusion
When IPO records are identified as `UNKNOWN` or have TBA-like missing timeline fields, the system shall include them in Upcoming and place them after date-qualified Upcoming IPOs.

### FR-6: No Upcoming Leakage Into Ongoing
When an IPO is classified as Upcoming, the system shall not include that IPO in Ongoing.

### FR-7: Closed-Before-Allotment Visibility
When an IPO has closed but allotment date has not been reached, the system shall keep it in Ongoing until allotment transition rules move it to Allotted.

### FR-8: Deterministic Tab Selection at Startup
When Home first loads, the system shall open `ongoing` as the active tab and show content that matches the active tab dataset.

### FR-9: Concurrency and Backpressure
While startup queue mode is active, the system shall process one prioritized request at a time to avoid UI stalls and burst pressure on API rate limits.

### FR-10: Re-entry and Refresh Safety
When user revisits Home or triggers refresh while queue is in progress, the system shall avoid duplicate in-flight requests per status key.

## 3) Non-Functional Requirements

- Performance: Home usable with Ongoing data within `1.5s` on normal Wi-Fi/4G using cache-first fallback.
- Reliability: A failed status request must not block Home or freeze tab interactions.
- Consistency: Tab counts and content must be derived from the same resolved dataset snapshot per status.
- Security/Privacy: No sensitive user data is sent for feed requests; avoid verbose production logging of full payloads.
- Maintainability: Queue orchestration logic should be centralized (single service/hook) and status-to-tab mapping should be declared in one constant map.

## 4) Acceptance Criteria (Given/When/Then)

### AC-1: Startup Priority Rendering
Given Home opens on a cold start
When startup fetch begins
Then `ACTIVE` is requested first
And Ongoing content is rendered as soon as ACTIVE network/cache data is available
And remaining statuses continue in order `CLOSED -> UPCOMING -> LISTED`.

### AC-2: Failure Does Not Block Queue
Given `CLOSED` endpoint fails during startup
When queue execution reaches CLOSED
Then the app keeps cached CLOSED data (if present)
And continues to request UPCOMING and LISTED
And Home remains interactive.

### AC-3: Upcoming Isolation
Given an IPO with status `UPCOMING`
When tab datasets are computed
Then the IPO appears in Upcoming
And does not appear in Ongoing.

### AC-4: UNKNOWN/TBA in Upcoming Bottom
Given IPOs with UNKNOWN/TBA timeline data exist
When Upcoming dataset is rendered
Then those IPOs are included in Upcoming
And sorted after date-qualified Upcoming IPOs.

### AC-5: Closed-to-Allotted Transition
Given an IPO has passed close date and allotment date is still in future
When datasets are computed
Then the IPO remains in Ongoing.

Given the same IPO reaches allotment date
When datasets are recomputed
Then the IPO appears in Allotted.

### AC-6: Startup Tab Stability
Given app starts on Home
When data is loading progressively
Then the active tab remains Ongoing by default
And displayed content matches active tab without cross-tab mismatch.

## 5) Error Handling Table

| Scenario | Detection | System Behavior | User Impact |
|---|---|---|---|
| ACTIVE request timeout | request exceeds timeout | Load cached ACTIVE; continue queue | Ongoing visible, may be slightly stale |
| CLOSED/UPCOMING/LISTED 5xx | HTTP 5xx / network error | Keep cache for failed category; continue next item | Partial freshness, no startup block |
| Malformed status payload | missing/invalid `status` | Classify to UNKNOWN/TBA branch and place in Upcoming bottom | Data still visible, predictable tab |
| Duplicate queue trigger | in-flight status key exists | Deduplicate and reuse current promise/result | No request storm or jitter |
| Empty dataset | response `data=[]` | Render empty-state per tab with retry on refresh | Clear state, no crash |

## 6) Implementation TODO Checklist

- [ ] Add startup queue orchestrator in data layer (status-keyed sequential execution).
- [ ] Implement cache-first seed for ACTIVE before network completion.
- [ ] Add status endpoint map for `ACTIVE`, `CLOSED`, `UPCOMING`, `LISTED`.
- [ ] Add UNKNOWN/TBA merge rule for Upcoming and bottom-placement sort rule.
- [ ] Enforce single-source classification to prevent Upcoming items entering Ongoing.
- [ ] Add in-flight request dedupe per status key.
- [ ] Add resilient error path: cache fallback + continue queue.
- [ ] Add telemetry/dev logs: queue stage start/end, duration, fallback usage.
- [ ] Add unit tests for classification and sort (dated upcoming first, TBA bottom).
- [ ] Add integration test scenario for startup order and non-blocking failures.
- [ ] Add manual QA script for cold start, offline/slow network, endpoint failure, and refresh re-entry.

## 7) Scope and Defaults Used

- Scope is limited to Home IPO feed loading and tab dataset construction.
- Existing UI design language remains unchanged; this is data orchestration and robustness work.
- API parameter uses uppercase values as provided by stakeholder examples; implementation should keep an adapter to lowercase (`live/upcoming/closed/listed`) if backend contract requires it at runtime.
