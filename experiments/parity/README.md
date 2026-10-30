# Computer-use parity experiments

`bench.mjs` measures full reads. `act-bench.mjs` measures the same action sequence inside each engine session. Both use the shared directory lock. Run one benchmark at a time; do not remove a live owner's lock.

## Action benchmark

```sh
node experiments/parity/act-fixture.mjs
node experiments/parity/act-bench.mjs codex 3 > .build/codex-actions.json
OCU_BIN='dist/Open Computer Use (Dev).app/Contents/MacOS/OpenComputerUse' \
  node experiments/parity/act-bench.mjs ocu 3 > .build/ocu-actions.json
node experiments/parity/act-fixture.mjs close
```

The development app must have a stable Developer ID signature and both Accessibility and Screen Recording permissions. Do not grant permissions to an unfinished or ad-hoc build. Use `OCU_BIN=ocu` to measure the installed release without replacing it. The OCU benchmark calls the native MCP surface directly: the JS adapter forces action read-back off. The native executable path and the npm launcher both accept `mcp`.

`OCU_ACTION_READ_BACK=default` is the benchmark default: it leaves the native setting unset. The new native default returns bounded state from cached handles. Use `1` for legacy full-tree/screenshot read-back or `0` for a separate diagnostic run. Visual cursor behavior stays at the engine default. Each row records the action call, a separate full read, errors, state text and the observed effect. An error response's latency does not count as a successful fast action. Explicit reads use each engine's standard full-state API; native OCU also captures its default screenshot. These costs are reported separately, rather than treated as identical read work.

The preparation script packages the checkout's fixture under `.build/ActionParityFixture.app`. Its distinct display and executable names bypass OCU's name-based synthetic fixture command bridge. The benchmark verifies the exported PID belongs to that exact checkout executable before acting. It captures the fixture's own exported state before and after the sequence. A prior synthetic run is not evidence of real mouse or keyboard delivery.

Actions target only this fixture. Each run clears its input, clicks it, types the printable key `x`, inserts a token, sets a replacement value, increments the counter, scrolls, and drags inside its pad. Text effects must match the exact expected value. The fixture does not handle Select All consistently under either engine, so the benchmark does not use that shortcut. Empty strings are valid `set_value` values for clearing controls. Element IDs are resolved again after reads. Drag coordinates are scaled from fixture window points to screenshot pixels, using PNG or JPEG dimensions. Unknown formats produce an explicit skipped-drag error. The endpoint changes per run so a stale drag label cannot pass as a new effect.

Observed effects and API errors are separate fields. `verified: null` means a step has no effect assertion; the current sequence asserts every expected effect. The counter, scroll offset, text value, focus and drag label provide effect checks. This normal fixture does not prove behavior on a wheel-ignoring scroll area, a refused value write or a second window. Those remain separate acceptance gates.

The Codex path uses the installed `cu.mjs` skill session with `CU_ENGINE=codex`. It requires the user's Codex computer-use installation. It does not inspect or copy the closed engine implementation.

## Initial lane result

Native OCU release 1.1.2 on the real fixture reproduced failed input focus, a subsequent typing error, and a drag call with no effect. Scroll and setValue worked in three samples. Development-runtime changes are blocked until the development bundle can be stably signed and granted permissions. See the lane's external report for raw artifact paths, exact measurements and signing diagnostics. No engine fix or parity improvement is claimed by these benchmark scripts.

## Direct terminal probe

```sh
swift build -c release --product OCUActionProbe
.build/release/OCUActionProbe doctor
node experiments/parity/act-fixture.mjs
OCU_BIN=.build/release/OCUActionProbe \
  node experiments/parity/act-bench.mjs ocu 3 > .build/ocu-direct-actions.json
node experiments/parity/act-fixture.mjs close
```

The probe runs the same `StdioMCPServer`, tool dispatcher and `ComputerUseService` without the app-agent proxy. Its main AppKit loop supports the existing cursor and capture paths. It does not enable Locked Use, replace session validation or alter macOS permissions. Label any resulting measurements as **direct terminal probe**, not signed-app measurements.

`doctor` reports both permissions and session context. Accessibility trust alone is insufficient: the library requires an unlocked console session whose audit ID matches the calling process. In the measured pane, Accessibility and Screen Capture are true, but the process and console audit IDs differ. A second shell started by the actual Herdr host has the same mismatch. The probe therefore fails before app discovery or input. No direct action timings or engine improvements have been established in this context.

Run the probe from a terminal in the active desktop login, and require `sessionState=unlocked` before benchmarking. Signed development app acceptance remains a separate final gate.

## Input verification

Real `set_value` calls validate the captured app/window and read the actual value after the write, including when full action read-back is off. Scroll and drag require a change in cached accessibility values or window geometry; unreadable or unchanged state produces an explicit error. A successful visual-only drag can therefore return an unverified-effect error. Unsupported page-scroll actions fall back to a targeted wheel event, then undergo the same verification. Synthetic fixture paths also reject unverified effects.

`act-fixture.mjs ignore-wheel` starts a fixture that drops wheel input. `act-fixture.mjs reject-values` starts a field whose AX setter ignores writes. Close the own fixture before changing modes. Use `OCU_CHECK_MODE=ignore-wheel` or `reject-values` with `act-bench.mjs ocu 1` for those probes. `OCU_CHECK_MODE=standard` adds non-settable-value, invalid-scroll-target and zero-distance-drag checks after a normal sequence. Expected errors have `verified=true`; they are not successful action timings.

The native default action result reads at most twelve cached targets and live focus/selection state, without a tree walk or screenshot. It reports cached value changes relative to the last explicit snapshot. Call `get_app_state` for new elements or changed layout. Mandatory setValue/scroll/drag verification also runs with full read-back disabled. Explicit `OPEN_COMPUTER_USE_ACTION_READ_BACK=1` retains full snapshots and legacy settle pauses.
