# Accessibility read parity

## Goal

Reduce full accessibility reads to within 1.5 times the reference engine on Discord and Brave. Keep agent information and valid element numbers. Add an optional diff mode.

## Scope

- Read snapshots, renderer, JS read adapter, development packaging and tests.
- Exclude action changes, installed release replacement, permissions, global input, and upstream publication.

## Context

The read lane starts at `d2d7779` on `parity-read`. The external lane brief owns acceptance and its external YAML report owns measured results. The existing workshop-intake workstream remains authoritative and is read-only in this lane.

## Current vs Ideal

The initial installed Discord read median is 3116 ms and 44019 characters. The target is a measured full read within 1.5 times the reference with no larger output.

## What top experts in accessibility performance would do

Start from per-call AX timings, complete snapshot text and IPC frames. Measure AX calls, traversal, rendering and transport separately. Use paired benchmark runs, reconstructable diff tests and unchanged element lookup to verify gains. Compare only externally visible reference output and timing.

## Risks

- Development permission refusal: record the exact settings steps and stop dev runtime work as the brief requires.
- Incomplete information: preserve full mode by default and verify diff reconstruction.
- Concurrent lane: use distinct dev socket namespaces and serialize benchmark runs with the shared lock.

## Standards

- `docs/REPO_COLLAB_GUIDE.md`: small changes, synchronized docs, scoped commits and repeatable validation.
- `docs/ARCHITECTURE.md`: preserve app-agent permission identity and snapshot/action record association.
- `docs/design-docs/core-beliefs.md`: make checks reproducible and retain evidence.
- `docs/HISTORY_GUIDE.md`: final change history uses the repository template and excludes raw private logs.
- `docs/QUALITY_SCORE.md`: ordinary-app runtime evidence is separate from fixture tests.

## Milestones

1. Measure baseline and phase breakdown before optimization.
2. Make one change per working commit and benchmark both engines after each.
3. Add opt-in diff and test reconstruction, replacement, removal and unchanged reads.
4. Run three final paired benchmarks per app, swift build and swift test. Record target results and remaining costs.

## Verification

Use `experiments/parity/bench.mjs`, `OPEN_COMPUTER_USE_DEBUG_TIMING`, isolated signed dev builds, Swift checks and focused Node adapter tests. Keep runtime evidence outside the repository.

## Progress

- [x] Read brief and rules; verify host, branch and clean baseline.
- [x] Measure installed Discord baseline.
- [ ] Measure unchanged dev build and phase timings. Blocked: Developer ID signing did not complete; the early permission check ran before signing and is provisional.
- [ ] Optimize and verify.
- [ ] Complete final checks and commits.

## Decisions

- 2026-10-30: Keep the read implementation unchanged until stable development signing and runtime permissions can be verified. The explicit Developer ID rebuild timed out while signing; the current app is ad-hoc and must not receive a permission request.
- 2026-10-30: No edits to Leviathan workstream state because the lane explicitly forbids Leviathan edits. The external report records reconciliation.

## Baseline results

Three paired five-read benchmark runs used the installed release, with no performance edits. Discord median-of-medians: 2393 ms open engine, 435 ms reference (5.50 times); 44019 versus 38045 characters. Brave: 452 ms versus 99 ms (4.57 times); 10738 versus 8328 characters. These are baseline results, not development-candidate acceptance.

`swift build` passed. `swift test` on unchanged baseline source ran 399 tests, skipped 10 and failed one: `TextSelectionOperationTests.testQueryIndexesValidateSessionBeforeLookingUpTheApp`, at line 65. The failure is outside this read lane; it was not changed.

## Signing gate

The rebuild used explicit identity mode and the requested Developer ID. Compilation passed, but codesign did not complete within 90 seconds. The bounded supervisor terminated only that build process group. The first signer stack waited in a Security Server private-key signing operation; it did not emit a keychain error. The artifact still has an ad-hoc signature, no TeamIdentifier and an unbound Info.plist. Its bundle plist retains the development identifier. No permission request is appropriate until signing is verified.

## Installed-release phase evidence

A separate isolated, background app-agent probe used buffered Unix-socket requests and full text. One representative Discord read took 3522.56 ms: tree walk 3375.8 ms (95.83 percent), window resolution/capture 38.0 ms and unclassified work 108.76 ms. Client JSON decode took a further 4.72 ms. AX calls, traversal and text construction are combined in the installed timer; CLI proxy, server JSON, menu rendering and screenshot encoding need further instrumentation. These later direct-agent timings do not replace the paired benchmark medians.

The installed release still returned an image when screenshot omission was requested. No screenshot-free gain is claimed. Earlier provisional profiling results used an incorrect text limit and unbuffered client reads; exclude their total latency from conclusions.

## Remaining acceptance

1. Resolve Developer ID signing and verify the development code identifier and team.
2. Verify runtime permissions only for the stable signed app; follow the brief stop condition if denied.
3. Package an optimized build with the dev identity and add per-phase timers before read optimization.
4. Add and verify optional diff reconstruction, make measured changes one at a time, and complete final development-candidate benchmarks and Swift checks.
