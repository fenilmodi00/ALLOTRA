# ADR-002: API Resilience and Sensitive Log Redaction

- Status: Accepted
- Date: 2026-02-20

## Context

The app depends on network calls that can fail transiently (timeouts, 5xx, rate limits). Development logs are useful for diagnosis but may accidentally print sensitive data such as PAN values.

## Decision

We will improve API safety and reliability with two baseline controls:

- Add bounded retry with backoff for transient failures in `apiClient`.
- Add log redaction for sensitive patterns (including PAN-like values) before console output.

Retries will remain bounded and conservative to avoid runaway request amplification.

## Consequences

- Positive: Better resilience to transient backend/network issues.
- Positive: Reduced risk of sensitive data appearing in logs.
- Negative: Slightly more API client complexity and testing effort.
