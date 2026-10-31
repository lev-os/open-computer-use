# Action parity: product execution and real fixture proof

## Current vs Ideal
The product follow-up now uses live stable geometry and completed endpoint receipts. Standalone `OpenComputerUse` executes its linked code and performs a real app-local drag. The original timing goal remains partial because printable-key latency exceeds 1.5x of Codex. Signed app-contained acceptance remains pending.

Previous product follow-up baseline (three samples per engine):

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

## Fresh-session follow-up
- [x] Observe AX geometry before and after the screenshot before each drag. Reject moving layouts and mismatched image aspect ratios.
- [x] Verify native mouse-down, final drag and mouse-up through a fresh process/window-bound receipt. Reject absent, stale, incomplete and mismatched receipts. Apps without the protocol fail before input.
- [x] Three separate optimized product sessions verify all nine requested drags: 851, 824 and 814 ms session medians.
- [x] Hostile receipt shifts the final drag endpoint by 12 points; the product returns `drag endpoints mismatch` (819 ms).
- [x] Profile thirty keys on each engine. Retain stage timing and explain the measured limit. A 1 ms polling trial did not establish an improvement and was reverted.

## Remaining work
Validate the optimized signed development app through its app-agent path when JP grants the required identity and permissions. Revisit the original key latency target in a separate bounded investigation if it persists. Cross-app drag/drop, window moves, Calculator/TextEdit and broad provider compatibility remain outside this fixture result.

## Printable-key latency investigation
The identical reset/key/read profile verifies 30/30 keys on each engine. The retained 5 ms polling baseline has a 9 ms action median versus Codex at 5 ms. The first OCU key takes 55 ms and the first Codex key takes 54 ms. Cold samples remain included. This larger profile does not override the original full-action workload or establish consistent parity.

The OCU baseline records a 1.0 ms median to prepare focus, value and selection; 0.3 ms to post events; 6.65 ms in the complete value-verification block; and 8.7 ms in the native call. Within verification, summed focus/window/session revalidation takes a 3.65 ms median and value reads take 0.1 ms. These are separate medians and do not sum to one representative call.

A 1 ms key-only polling trial verifies all 30 keys but measures 14 ms median. Its revalidation median is 6.8 ms, event posting 0.4 ms and full reads 249 ms versus the baseline 160 ms. Shared desktop scheduling varied, so the trial does not prove either a speed improvement or a causal regression. Restore the established 5 ms interval. Keep the 200 ms timeout and all pre/post focus, window, session and exact-value checks.

The remaining cost is in observed AX round trips and asynchronous event consumption. Removing those checks would change correctness. The bounded task stops at the retained implementation with raw timings rather than claiming the latency target from selected warm samples. Profiling stays opt-in through `OPEN_COMPUTER_USE_DEBUG_TIMING=1`; `OCU_CHECK_MODE=key-profile` performs ten verified keys per requested run.

## Final retained build
With profiling disabled and the 5 ms poll restored, three independent product sessions verify 9/9 of every benchmark action. Drag session medians are 922, 861 and 960 ms. Product key session medians are 44, 12 and 36 ms, so the explicit 10 ms target is not met. All samples remain included.

| Action | OCU median ms (9 samples) | Codex median ms (3 samples) | OCU verified |
| --- | ---: | ---: | --- |
| clearValue | 36 | 490 | 9/9 |
| click | 26 | 105 | 9/9 |
| pressKey | 36 | 23 | 9/9 |
| typeText | 26 | 35 | 9/9 |
| setValue | 34 | 67 | 9/9 |
| clickCounter | 122 | 150 | 9/9 |
| scroll | 125 | 1179 | 9/9 |
| drag | 922 | 768 | 9/9 |

The full-workload key aggregate is 36 ms versus Codex 23 ms (1.565x). The separate thirty-key profile is 9 ms versus 5 ms (1.8x). Neither establishes consistent 1.5x parity. Action latency includes bounded verification; explicit full reads remain separate.

The final release build and desktop-session Swift suite pass: 412 tests, 8 skipped, zero failures. All six Node parser/geometry tests and the documentation check pass. The external lane report preserves raw sessions, the rejected trial, source/binary hashes and the negative receipt test. No parent-workstream write is made because the brief prohibits edits to that checkout.

The final hostile endpoint receipt is also rejected with action read-back disabled. The isolated fixture is closed after verification.
