# Accessibility read parity

## Goal

Read full accessibility trees within 1.5 times the reference engine, with no larger text and no loss of agent information. Add optional diff output. The direct-tool lane is locally verified; full-size parity and signed-app acceptance remain open.

## Scope

- Snapshot rendering, scoped attribute caching, optional JS diffs, benchmark tools and dev packaging.
- Read existing Discord and Brave windows only. Preserve production session guards and action records. No installed runtime replacement, permission changes or publication.

## Current vs Ideal

The original installed Discord median was 3116 ms versus 641 ms in the first paired baseline. An instrumented pane-local direct baseline then made 68351 attribute reads for 928 elements; those pane-local timings are provisional because the audit session differs from the console.

Final results use the guarded, optimized direct tool through the operator's desktop relay. Each cell below is the median of three five-read medians. All three individual paired ratios are within 1.5.

| App | Direct ms | Reference ms | Ratio | Direct chars | Reference chars |
| --- | ---: | ---: | ---: | ---: | ---: |
| Discord | 499.93 | 479 | 1.044 | 46029 | 39563 |
| Brave | 104.41 | 121 | 0.863 | 12606 | 10340 |

Latency passes in this direct-tool scope. Full text remains 16.34 percent larger on Discord and 21.91 percent larger on Brave. Optional unchanged diff packets contain 85 characters. Signed native app/adapter acceptance is pending.

## What top experts in accessibility performance would do

Start from live AX calls, exact tree text and transport frames. Count and time remote calls before changing the renderer. Compare cache-on/off output byte for byte, then compare paired reads of the same window. Use original text as the reconstruction oracle for diffs, including revision gaps, reordered nodes, focus and selection.

Further full-size changes need semantic fixtures for the extra containers and anonymous action targets. Current output retains 77 anonymous target frames on Discord. The full-size gate remains unmet; the measured result is retained under the brief's best-result stop rule.

## Standards and boundaries

- `docs/REPO_COLLAB_GUIDE.md` and `docs/design-docs/core-beliefs.md`: small working commits, repeatable checks and synchronized documentation.
- `docs/ARCHITECTURE.md`: keep app permission identity, session validation and numeric action lookup intact.
- `docs/HISTORY_GUIDE.md` and `docs/QUALITY_SCORE.md`: retain sanitized change history and distinguish fixture, direct runtime and signed-app proof.
- `docs/PLANS_GUIDE.md`: keep this plan active while the acceptance gates below remain open. The existing workshop-intake workstream stays authoritative and read-only for this lane.

## Implementation

1. Added experimental `OCUReadBench` SPI that uses the production TreeRenderer, validates the GUI session and AX trust, and reads an existing window without activation or capture.
2. Batched common attributes and cached supported/unsupported values, actions and settable checks for one renderer walk. Transient errors fall back; rewalks get fresh storage. Cache-on/off full text matched byte for byte on both apps.
3. Removed frame text only when another semantic field identifies the target. Anonymous geometry and every backend ElementRecord frame remain.
4. Added opt-in revisioned `getAXState` diffs, package dependency closure and `OPEN_COMPUTER_USE_DEV_APP=1` for optimized dev-identity bundles. Full output remains default.

## Verification

- Three final paired five-read runs per app and engine completed through `experiments/parity/bench.mjs`. Exact AX root window titles match for every pair. Reference display headers trim browser branding.
- `swift build` and `swift test` passed in the desktop relay: 403 tests, 8 skipped, zero failures. The earlier pane-only selection test failure disappears in the correct session; action code was not changed.
- All 55 Node tests passed. Two packaged adapter layouts imported successfully. Diff tests cover 200 changing snapshots; six real relay snapshots reconstructed exactly.
- Optimized dev packaging passed with the dev identifier and variant. It was deliberately unsigned and was not used for signed-app acceptance. Shell syntax and diff checks passed.

## Timing limits

A representative final Discord read took 499.93 ms: 403.06 ms in AX calls and 96.87 ms in other work. Brave took 104.41 ms: 88.46 ms in AX calls and 15.96 ms in other work. Tree time includes AX time; line formatting can also contain AX reads. Direct reads have no app-agent IPC or capture. Process startup and final report JSON encoding are outside the read timer. The external lane report preserves every sample and the earlier installed-release profile.

## Progress

- [x] Measure before optimization and retain raw, private evidence outside the checkout.
- [x] Make and locally commit working read-cache, frame and diff changes.
- [x] Complete direct relay benchmarks, reconstruction checks, Swift and Node checks.
- [ ] Meet the full-size target with semantic-equivalence evidence.
- [ ] Verify the signed dev app and rerun native app/adapter acceptance.

## Remaining acceptance

1. Resolve Developer ID private-key access, sign the optimized dev bundle, and verify the dev code identifier, team identifier and bound Info.plist before any permission request.
2. Verify Accessibility and Screen Recording for that exact signed app; run three paired native app/adapter benchmarks per app through the desktop relay.
3. Map and verify further full-tree simplification if full-size parity remains required. No new node-pruning claim is accepted here.

## Decisions

- 2026-10-30: The operator authorized direct-tool measurements and then supplied the desktop relay. The probe now uses the production session validator; it refuses in the pane and reports unlocked in console audit 130147.
- 2026-10-30: Keep diffs off by default. They reduce returned text while the native tree still receives a full read.
- 2026-10-30: Keep the dev bundle ID with release optimization. Explicit dev builds preserve neighboring release bundles and do not automatically embed Locked Use components.
- 2026-10-30: Do not modify Leviathan state: this lane explicitly forbids it. The external report records reconciliation and exact remaining signing steps.
