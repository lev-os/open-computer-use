# Action parity on the real fixture

## Goal
Reduce native action latency and reject unverified effects. Compare the optimized direct probe with Codex under the shared lock. Keep signed-app acceptance separate.

## Current vs Ideal
The direct-tool run is complete with partial parity. Click, typing and scroll meet the 1.5x limit on the fixture. Printable-key delivery remains 30 ms versus 7 ms for Codex. Native drag returns an explicit error when its effect cannot be verified.

The ideal result meets every timing target and repeats those checks through a signed optimized development app. That app-agent gate remains pending JP's signing and permission steps.

| Action | Before OCU ms | Final OCU ms | Final Codex ms | Within 1.5x |
| --- | ---: | ---: | ---: | --- |
| click | 3838 (unverified effect) | 55 | 73 | yes |
| pressKey | 2045 (unverified effect) | 30 | 7 | no |
| typeText | 1 (error) | 22 | 23 | yes |
| scroll | 580 | 120 | 1171 | yes |

Before timings marked unverified or error do not represent a completed successful action. Final timing medians use three runs; raw distributions and read times are in the external lane report.

## What top experts in macOS automation would do
Start from actual AX calls, event delivery, the fixture's own state and raw post-action reads. A returned success status alone is insufficient evidence.

Pin optimized binaries and the common action script. Separate action time from explicit full-read time. Exercise ignored writes, ignored wheel input, invalid targets and cancellation. Use the fixture's exported values, strict text assertions, live cursor observations and the Swift suite as independent checks.

## Scope and standards
- Action service, verification, cursor scheduling, fixture controls, benchmark and minimal development packaging override.
- `docs/REPO_COLLAB_GUIDE.md`: small local commits, synchronized docs and runnable checks. `docs/ARCHITECTURE.md`: app-agent and observation boundaries.
- `docs/HISTORY_GUIDE.md`: one sanitized history. `docs/QUALITY_SCORE.md`: fixture evidence does not establish broad app compatibility.
- No tree-reader edits, no main/read-worktree changes, no installed app replacement and no publication. Workshop-intake state is read-only under the brief; this lane's external report owns progress.

## Verification and completed milestones
- [x] Baseline on both engines, optimized direct probe and GUI-session routing with guards intact.
- [x] Empty values, verified text focus, UTF-16 selection replacement and live focus between actions.
- [x] Verified values and scroll/drag effects; ignored-input and invalid-target falsifiers, including state-output-off checks.
- [x] Bounded default state, explicit legacy full mode, nonblocking cursor lifecycle and remaining-page fallback.
- [x] Matched frozen baseline and three final runs per engine. Both final series are retained with source and binary hashes.
- [x] GUI Swift build and suite: 407 tests, 8 skipped, 0 failures. Parser falsifiers: 3 passed.
- [x] Release-optimized development bundle identity checked without signing or installation.
- [ ] JP-dependent signed app-agent acceptance.

## Stop decision and remaining work
The brief permits stopping at the best measured result when a target cannot be met. This run stops with the key timing target unmet. The public path and an experimental use of the existing private posting entry point were measured. The experiment did not improve the result and was not retained. Further key-delivery work needs a new bounded investigation that preserves the effect checks.

JP must first produce a stable signed development app and grant its permissions. Then rerun the same three-run benchmark through the app-agent path, including timer cleanup and per-request settings. The direct-tool result does not establish that acceptance.

## Evidence
The external lane report has the raw files, exact signing command and paths, before/after tables and local commits. Runtime candidate: `10bb3cd532ec5c1a4c782a7c9e56dd359502b205`. The initial graph-index attempt failed because an unverified shared generation was active, so source discovery used direct inspection.

## Product-path follow-up
The operator found that the product executable did not reproduce the probe. Read-only app-agent metadata and an unchanged-binary A/B test prove why: the bare product selected the npm-installed October 27 app; disabling that proxy used the local fixes. Both runtime permission checks were granted. This was delegated stale code, not missing dev-app permission or a missing fix in the linked library.

The product now keeps standalone execution local and preserves app-agent behavior for app-contained executables. Product-path benchmarking and routing regression tests precede the drag follow-up. The remaining action is to deliver a real fixture drag through the product while keeping pointer and session safeguards.
