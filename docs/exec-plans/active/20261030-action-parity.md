# Action parity on the local fixture

## Goal
Measure the same action sequence on Codex and the development OCU build. Reduce default action latency and reject unverified scroll, setValue and drag results. Record three final runs for each engine, with explicit limits where a target cannot be met.

## Scope
Own action dispatch, input delivery, an action benchmark and the minimum packaging change for an optimized development bundle. Keep tree-reading changes with the read lane. Use only the checkout fixture or newly created Calculator/TextEdit windows. Make local commits on parity-act; do not publish.

## Background and standards
- `docs/REPO_COLLAB_GUIDE.md`: small changes, synchronized documentation, runnable verification.
- `docs/ARCHITECTURE.md`: app-agent permission identity and action read-back contracts.
- `docs/design-docs/core-beliefs.md`: traceable evidence and simple abstractions.
- `docs/HISTORY_GUIDE.md`: final sanitized history using the existing template.
- `docs/QUALITY_SCORE.md`: fixture tests supplement actual input-delivery evidence.
- Lane brief is the acceptance contract. Shared workshop-intake state is read-only for this lane.

## Risks
Permission refusal stops development-runtime work. Report the exact manual settings steps and continue only work supported by the installed release. Benchmarks use the shared lock. Synthetic fixture bridge results must be identified separately from real event delivery.

## Milestones
1. Build baseline and fixture, check permissions, measure both engines.
2. Change one action behavior at a time, rerun benchmark, commit each working step.
3. Run three final samples per engine, Swift build/tests, inspect diff, update report and history.

## Verification
Use `experiments/parity/act-bench.mjs`, `swift build`, `swift test`, and fixture-exported state as an independent action oracle. Measure in-session elapsed times and explicit reads separately. No third-party dependencies.

## Progress
- [x] Read brief, checkout rules and workstream state; verified clean parity-act at the accepted base.
- [x] Baseline measurements: three sequences per engine on the real-input fixture. Initial synthetic-bridge and unscaled-coordinate samples are excluded.
- [ ] Bounded action changes and before/after measurements: blocked by Developer ID signing and development permissions.
- [x] Final build, syntax/documentation checks and history for benchmark delivery. Three final sequences per engine are recorded in the external lane report. Engine acceptance remains blocked.

## Decisions
- 2026-10-30: Graph indexing failed because an unverified CBM generation is active. Use direct source inspection; do not restart or replace the shared graph service.

## Current result and stop boundary
The explicit identity build timed out during signing after 60 seconds. The development bundle still has an ad-hoc signature and no team identifier. Do not grant permissions until stable signing is verified. There is no signed development artifact to hand over yet.

Installed-release baseline (three real-input fixture sequences): input click does not focus the field; subsequent typeText returns an AX error; drag returns without an observed effect. Counter clicks, scroll and setValue work in this fixture. No action engine source was changed because the development runtime cannot yet be tested. Full Swift build passes; baseline Swift tests have one failure in `TextSelectionOperationTests.testQueryIndexesValidateSessionBeforeLookingUpTheApp`.

The lane report holds exact signing output, separate action/read timings, read-back-on/off comparison, raw artifact references and remaining gates. Shared workstream state is unchanged because this lane prohibits edits to the owning Leviathan checkout.
