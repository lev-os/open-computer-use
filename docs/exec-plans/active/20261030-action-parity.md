# Action parity: product execution and real fixture proof

## Current vs Ideal
The product follow-up is complete. Standalone `OpenComputerUse` executes its linked code and performs a real app-local drag. The original timing goal remains partial because printable-key latency exceeds 1.5x of Codex. Signed app-contained acceptance remains pending.

| Action | Product ms | Codex ms | Verified |
| --- | ---: | ---: | --- |
| click | 10 | 67 | 3/3 |
| pressKey | 13 | 6 | 3/3 |
| typeText | 6 | 25 | 3/3 |
| scroll | 108 | 1144 | 3/3 |
| drag | 790 | 729 | 3/3 |

## What top experts in macOS automation would do
Trace the actual loaded executable before interpreting timings. Start from native API calls, real widget callbacks and raw post-action state. Separate returned status, observed effect and eventual full reads.

Pin the product and benchmark hashes. Use one script on both engines, vary drag endpoints, exercise ignored writes and wheel input, and retain every final series. Use the fixture's exported values, callback counts, strict value parser, live cursor observations and GUI-session Swift suite as evidence.

## Completed implementation
- [x] Native action fixes, bounded default state and nonblocking cursor lifecycle. Keep explicit full/off modes and mandatory effect checks.
- [x] Product routing A/B: the unchanged binary selected the npm-installed October 27 app; proxy-disabled control ran local fixes. Both permission checks were granted.
- [x] Standalone product now runs locally; app-contained executables preserve own app-agent identity. Bare permission diagnostics read actual runtime grants.
- [x] Window-addressed PID drags include local position, deltas and gesture identity. Every event checks the session and captured window owner; global pointer fallback stays off.

## Completed verification
- [x] Three final product/Codex runs verify every action, including varying drag starts and ends. Working drag is established without Developer ID app signing.
- [x] 20 ms cadence: 790 ms median versus Codex 729 ms, with 3/3 endpoint/callback checks. Retain the slower verified 30 ms series.
- [x] GUI Swift tests: 408 total, 8 skipped, zero failures. Product build, probe sanity, chains and state-output-off falsifiers pass.
- [ ] Signed app-agent acceptance, owned by JP after stable signing and permissions.

## Standards and boundaries
`docs/REPO_COLLAB_GUIDE.md` requires local focused commits and synchronized documentation. `docs/HISTORY_GUIDE.md` requires the existing sanitized history. `docs/ARCHITECTURE.md` owns routing and observation boundaries. The lane leaves tree reading and session guards unchanged.

The workshop-intake owner is in another checkout; the brief prohibits edits there. The external lane report holds progress, results, hashes and exact signing prerequisites. No installed binary is replaced. Source changes stay on parity-act.

## Remaining work
Validate the optimized signed development app through its app-agent path when JP grants the required identity and permissions. Revisit the original key latency target in a separate bounded investigation if it persists. Cross-app drag/drop, window moves, Calculator/TextEdit and broad provider compatibility remain outside this fixture result.
