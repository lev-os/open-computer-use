# Accessibility read parity

## Goal

Read full accessibility trees within 1.5 times the reference engine, with no larger text and no loss of agent information. The direct-tool gates now pass. Signed native app/adapter acceptance remains pending with the operator.

## Scope

- Read rendering, scoped AX caching, optional diffs, semantic fixtures, benchmark tools and dev packaging.
- Read existing Discord and Brave windows only. Preserve session guards and action records. No installed runtime replacement, permission changes or publication.

## Current vs Ideal

Final optimized direct-tool reads use the operator's desktop relay. Each time is the median of three five-read medians. Every individual pair passes the latency and full-size limits, with matching AX root window titles.

| App | Direct ms | Reference ms | Direct chars | Reference chars |
| --- | ---: | ---: | ---: | ---: |
| Discord | 429.85 | 430 | 37710 | 39561 |
| Brave | 79.12 | 99 | 10475 | 10629 |

The full-size gap is closed: 1851 fewer characters on Discord and 154 fewer on Brave in these paired windows. The final reads retain all 928 Discord and 223 Brave records. The browser changed between earlier captures; its earlier 222/233 counts are historical states, not pruning results.

## What top experts in accessibility performance would do

Start from AX calls and their metadata, exact output and transport evidence. Measure before changing code, then test against independent semantic targets. Keep every action record while checking names, values, state, type, hierarchy and target identity. Distinguish direct-tool evidence from signed-app acceptance.

The raw AX capture found ubiquitous context-menu/scroll actions and writable empty groups. The first inert-group candidate produced zero live size gain. It was retired: final production node selection matches the pre-size-change policy. Formatting provides the size savings.

## Standards and boundaries

- `docs/REPO_COLLAB_GUIDE.md` and `docs/design-docs/core-beliefs.md`: scoped working commits, repeatable checks and synchronized docs.
- `docs/ARCHITECTURE.md`: preserve session validation, permission identity and numeric action lookup.
- `docs/HISTORY_GUIDE.md`, `docs/QUALITY_SCORE.md` and `docs/PLANS_GUIDE.md`: sanitized history, distinct acceptance layers and an active plan for the remaining signed-app gate.
- Workshop-intake remains authoritative and read-only for this lane. Its state is not edited because the brief forbids Leviathan writes.

## Implementation

1. Batch common AX attributes and retain their cache only for a renderer walk. Transient errors can fall back; rewalks and new reads have fresh values.
2. Keep every original node while packing indentation with four-column tab stops, using the canonical group role, reversible writable/type flags and an equals value delimiter. The format legend is separate; official preamble lines and native tool descriptions stay unchanged.
3. Keep optional revisioned diffs off by default. The codec recognizes mixed indentation and preserves exact lines, layout, focus, selection and notes.
4. Match the direct probe to production record lifetime and renderer cache scope. Save the optional snapshot only after the final timed sample. Five timed reads and zero added warmup are unchanged.

## Semantic proof

Synthetic AX fixtures feed the production renderer through scoped read providers. An independent logical-node oracle checks controls and all numeric record targets. Coverage includes 14 metadata/action/focus boundaries, repeated names, 20 nested groups, exact hierarchy, boolean/float/leading-zero values and literal format-like text. Legacy and compact outputs keep identical record keys, backing elements, raw roles/actions, frames and synthetic-record flags. Retaining handles does not retain old values across reads.

## Verification

- Three paired five-read runs per app and engine pass both direct-tool targets. All record indexes are valid and every paired AX root title matches.
- `swift build` and all 412 Swift tests pass through the desktop relay, with 8 skipped. All 56 Node tests pass.
- Six latest compact live snapshots reconstruct exactly through the diff codec. Unchanged packets contain 85 characters.
- Complete build/test logs are saved privately to avoid relay stdout clipping. Intermediate failed compatibility checks were fixed by preserving the original contract; existing goldens were not weakened.

## Timing limits

Mixed-load samples remain in the external report. Host load and artifact I/O varied across those runs, so their deltas are not assigned to formatting alone. The qualified results above come after the probe-fidelity corrections. Direct reads exclude app-agent IPC and image capture; startup/report encoding and final artifact writing are outside timed reads. AX and tree timers overlap as labeled in the report.

## Progress

- [x] Measure and profile before optimization.
- [x] Verify semantic fixtures before considering pruning.
- [x] Close both full-size targets while preserving original node selection.
- [x] Confirm three paired runs, semantic records, diffs, Swift and Node checks; commit all local work.
- [ ] Sign the optimized dev app and verify native app/adapter acceptance.

## Remaining acceptance

1. Resolve Developer ID private-key access. Sign the prepared optimized dev bundle and verify its dev identifier, team and bound Info.plist before any permission request.
2. Verify Accessibility and Screen Recording for that exact signed app, then repeat native app/adapter acceptance through the desktop relay.

## Decisions

- 2026-10-30: The probe uses the production GUI-session validator and refuses pane-local GUI reads. Final measurements run in the operator's desktop relay.
- 2026-10-30: Keep original node selection. Compact only the printed representation and preserve all state/type information with an explicit legend.
- 2026-10-30: Keep diffs off by default; they reduce output while AX still receives a full read.
- 2026-10-30: Keep the dev bundle ID in optimized builds; preserve neighboring bundles and skip automatic Locked Use embedding for dev variants.

## Product and format continuation

The operator requested proof through the built product and an upstream-indentation comparison. A fresh product baseline measured 535 ms on Discord with implicit capture/default text limit; explicit AX-only/full text measured 480 ms versus probe 472.74 ms and reference 459 ms. The native executable had shared cached TreeRenderer code; a separately packaged app-agent and the selected bare binary are different execution artifacts.

The probe now uses the complete production SnapshotBuilder. The JS AX getter requests full text without unused capture by default, retains an explicit capture override, and removes only the known observation-omission note. Native combined-tool defaults remain compatible. Full checks pass (412 Swift, 57 Node). A new real product/Worker/MCP pair measured Discord 629 ms versus reference 488 ms, and Brave 88 ms versus 97 ms, with identical product/probe tree sizes. More paired runs will qualify the final state.
