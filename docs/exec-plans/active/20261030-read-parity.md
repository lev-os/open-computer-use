# Product accessibility read parity

## Goal

Verify the real product JS/native MCP path, keep full-tree latency within 1.5 times the reference, and retain agent information with no larger default text. Measure upstream one-tab-per-level separately and choose the default by the requested size condition. Signed app-agent acceptance remains deferred.

## Current vs Ideal

The final test uses the repository's real JS launcher, Worker and selected optimized OpenComputerUse native MCP executable through the desktop relay. Times are medians of three five-read medians; every paired ratio is below 1.5.

| App | Product ms | Probe ms | Reference ms | Product chars | Reference chars |
| --- | ---: | ---: | ---: | ---: | ---: |
| Discord | 502 | 509.24 | 453 | 37718 | 39569 |
| Brave | 107 | 112.01 | 100 | 10475 | 10629 |

Product/probe output matched byte for byte in all pairs. This verifies the actual bare product JS/MCP route; it does not certify a signed packaged app-agent.

## What top experts in accessibility performance would do

Measure the deployed code route rather than infer it from a microbenchmark. Pin the native binary, distinguish capture/text-limit defaults from tree traversal, and compare exact output for matched windows. Use semantic fixtures for all data/record invariants, then test each indentation format independently.

## Product path findings

The larger reported act-lane gap was not reproduced with this fresh selected product. Its artifact/proxy provenance is not verified. A bare build can forward to a separately packaged app-agent; the relay test disables that forwarding to measure the exact selected executable.

Initial product Discord median was 535 ms with capture/default text limit. Explicit AX-only/full text measured 480 ms versus probe 472.74 ms. The extra 47 product characters were an observation-omission note. The JS AX getter now requests full-text AX without unused capture and removes only that exact separate note. Native combined-tool defaults remain unchanged; explicit capture is still available.

Probe and product now share the complete production SnapshotBuilder, cached TreeRenderer and AppSnapshot formatter. The probe uses read-only recovery and retains the snapshot for the same action-record lifetime. Five timed reads and zero added warmup remain unchanged.

## Indentation decision

All other compactions remain enabled in both modes.

| App | One tab per level | Tab4 | Reference |
| --- | ---: | ---: | ---: |
| Discord | 44801 | 37712 | 39563 |
| Brave | 11345 | 10475 | 10629 |

One tab per level exceeds the reference in both windows, so keep tab4 as default. `OPEN_COMPUTER_USE_AX_INDENTATION=level` selects upstream indentation; `tab4` selects packed indentation. Product/probe captured text matched exactly per mode; cross-mode text differs only in indentation and legend. The semantic fixtures retain identical action records and role/name/value text.

## Standards and boundaries

- `docs/REPO_COLLAB_GUIDE.md` and `docs/design-docs/core-beliefs.md`: scoped working commits, repeatable checks and synchronized documentation.
- `docs/ARCHITECTURE.md`: preserve GUI-session checks, action identity and native combined-tool compatibility.
- `docs/HISTORY_GUIDE.md`, `docs/QUALITY_SCORE.md` and `docs/PLANS_GUIDE.md`: sanitized history, separate acceptance layers and keep this plan active for signed app-agent acceptance.
- Workshop-intake remains authoritative and read-only: the lane forbids Leviathan writes. No installed runtime replacement, permission changes or publication.

## Verification

- Three final product/probe/reference pairs per app pass latency and default full-size gates, with matching AX root titles and exact product/probe text.
- Swift build and all 413 Swift tests pass through the relay (8 skipped). All 57 Node tests pass.
- Semantic fixtures retain all record keys, backing elements, roles/actions, frames, values, metadata and hierarchy. Both indentation modes are covered. Original production node selection stays intact.
- Explicit capture and text-limit overrides remain available; native MCP combined defaults are unchanged. Screenshot-coordinate actions require explicit fresh capture.

## Progress

- [x] Measure the built product via actual JS/Worker/native MCP.
- [x] Unify product/probe snapshot code and align AX getter observation defaults.
- [x] Measure both indentation modes and apply the conditional default decision.
- [x] Run final paired benchmarks and checks; commit each local step.
- [ ] Sign the optimized dev app and verify the packaged native app/adapter path.

## Remaining acceptance

1. Resolve Developer ID private-key access and sign the prepared optimized dev bundle. Verify dev identifier, team and bound Info.plist before any permission grant.
2. Verify Accessibility and Screen Recording for that exact signed bundle, then repeat packaged app-agent/adapter acceptance through the desktop relay.

## Format comprehension continuation

The next brief adds a separate comprehension gate. Use fresh private trees from the same existing windows, 20 or more deterministic questions per window, and independent Claude Opus 5.5 low-effort and default Codex CLI calls with tools disabled. The evaluator, question sets and sanitized findings live under `experiments/parity/format-eval/`.

- [x] Capture both existing windows in tab4, level and Codex formats through the desktop relay. The optional fixture was not running.
- [x] Generate 39 identical questions per window and private per-format answer keys. Native modes decode to identical records. Five independent oracle/scorer tests pass.
- [x] Finish the Codex table and record a provisional level-format recommendation: compact 75/78, level 78/78, Codex 77/78. Compact saves nine aggregate input tokens against level.
- [ ] Finish the Claude table. Two invocations, including one after the stated reset, returned the weekly-limit refusal. Keep its cells unmeasured.
- [x] Prepare sanitized findings and reconcile the lane report. Live app trees, prompts and raw responses stay outside Git.

The existing signed-app work remains deferred. No format or native source change is part of this continuation unless the comparison justifies one. The first full Swift check built successfully but hit an existing cursor-window fixture failure; the private lane report preserves the exact test and evidence.
