# Architecture Hardening Operational Checklist

1. Run `npm run test:unit`.
2. Run `npx tsc --noEmit`.
3. Start the app with `npm start`.
4. Verify `HomeMain -> IPODetails -> Check` route payload contracts (`ipoId`, `ipoName`).
5. Verify development logs redact PAN-like values.
6. Verify API retries transient failures with bounded backoff.
