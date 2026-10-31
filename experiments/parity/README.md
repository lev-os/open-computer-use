# Computer-use parity experiments

`bench.mjs` measures full reads. `act-bench.mjs` runs the same fixture action sequence inside each engine session. Both use the shared directory lock. Preparation and cleanup also take that lock. Never remove a live owner's lock.

## Action benchmark

These commands assume an unlocked desktop terminal. For an agent pane in another audit session, use the relay below.

```sh
swift build -c release --product OpenComputerUse
.build/release/OpenComputerUse doctor --json
node experiments/parity/act-fixture.mjs
node experiments/parity/act-bench.mjs codex 3 > .build/codex-actions.json
OCU_BIN=.build/release/OpenComputerUse \
  node experiments/parity/act-bench.mjs ocu 3 > .build/ocu-actions.json
node experiments/parity/act-fixture.mjs close
```

The preparation script builds the checkout fixture and packages it as `.build/ActionParityFixture.app`. Its distinct display and executable names bypass OCU's name-based synthetic command bridge. The benchmark verifies the exported PID belongs to that exact checkout executable before acting. It retains the fixture's own exported state before and after each sequence.

Each run clears the field, clicks it, presses `x`, inserts a token, sets a replacement value, increments the counter, scrolls and drags inside the pad. It resolves element IDs after reads and scales window-point drag coordinates to PNG/JPEG screenshot pixels. Empty-field rendering is handled explicitly. Text assertions preserve whitespace and punctuation. The same value parser is injected into both engines. Unknown screenshot formats reject the coordinate probe.

Each row records in-session action time, separate full-read time, errors, state text and observed effect. A fast error is not a successful action. Native explicit reads include the default screenshot; Codex `getAXState` is an AX read. Keep these times separate. Codex is called only through the installed `cu.mjs` skill session. Each Codex benchmark resets that session while holding the shared lock.

## GUI-session relay

The operator supplies `OCU_RELAY`. All GUI operations must run in the desktop login's audit session. Accessibility trust alone does not establish that context.

```sh
node "$OCU_RELAY" --cwd "$PWD" -- "$PWD/.build/release/OpenComputerUse" doctor --json
node "$OCU_RELAY" --cwd "$PWD" -- node "$PWD/experiments/parity/act-fixture.mjs"
node "$OCU_RELAY" --cwd "$PWD" \
  --env "OCU_BIN=$PWD/.build/release/OpenComputerUse" --timeout 180000 \
  -- node "$PWD/experiments/parity/act-bench.mjs" ocu 3
node experiments/parity/act-bench.mjs codex 3
node "$OCU_RELAY" --cwd "$PWD" -- node "$PWD/experiments/parity/act-fixture.mjs" close
```

Require `sessionState=unlocked` in the probe doctor. The probe runs the production MCP server and tool service directly, without the app-agent proxy or a session-guard override. Label these measurements as **direct tool through GUI relay**. Signed-app acceptance is a separate gate.

## Action results and verification

`OCU_ACTION_READ_BACK=default` leaves the native setting unset. The native default returns bounded state from at most twelve cached targets plus current focus/selection. Known value writes and printable keys return the verified target value. Scroll and drag include the cached properties that changed. Values in bounded feedback are limited to 200 characters. These paths do not walk the tree or capture a screenshot. Request `get_app_state` for new elements or changed layout.

Use `OCU_ACTION_READ_BACK=1` for the legacy full-tree/screenshot result or `0` for state-output-off diagnostics. Effect verification still runs with state output off. The JS adapter forces the flag off, so this benchmark uses native MCP directly. `OCU_BIN` accepts a native executable or the npm launcher. Visual cursor defaults are retained; global pointer fallbacks are disabled by the benchmark.

Real value writes verify exact UTF-16 text or the numeric value and check the captured app/window before and after writing. Scroll and drag require a change in cached AX values or window geometry. An unobserved effect returns an error. A successful visual-only drag can therefore return an unverified-effect error. Unsupported page-scroll actions fall back to targeted wheel input for the remaining page budget.

Lowercase ASCII letters and digits in readable text controls use exact value verification instead of a fixed keyboard settle delay. Other keys keep the established delay. Keyboard and typing actions read live focus, so sequential typing works without intervening full snapshots. Cursor travel and pulse rendering use cancellable main-loop timers; input does not wait for animation completion. The existing path, spring and idle-pose calculations are retained.

## Hostile checks

Close the own fixture before changing its mode. The normal mode uses an unmodified native text field.

| Fixture mode | Benchmark setting | Required outcome |
| --- | --- | --- |
| `act-fixture.mjs ignore-wheel` | `OCU_CHECK_MODE=ignore-wheel` | Explicit unverified-scroll error |
| `act-fixture.mjs reject-values` | `OCU_CHECK_MODE=reject-values` | Ignored AX setter returns verification error |
| normal fixture | `OCU_CHECK_MODE=standard` | Read-only value, invalid scroll target and zero drag rejected |
| normal fixture | `OCU_CHECK_MODE=chain` | Exact chained text with no intervening reads |

`OCU_CHECK_MODE=cursor-reset` resets while motion is active. An observation-file probe verifies `moving -> hidden` while the process remains alive. A separate idle probe verifies arrival at the anchored resting point and hidden cleanup on session close. Expected error rows have `verified=true`; they are not successful action timings.

## Swift and parser checks

Run `node experiments/parity/swift-check.mjs build` and `node experiments/parity/swift-check.mjs test` through the GUI relay. The helper accepts only those commands and fixes its working directory to this checkout. Cursor-following tests wait for rendered endpoints and retain one-pixel accuracy. Run the parser falsifiers with `node --test experiments/parity/act-value.test.mjs`.

## Optimized development app

`OPEN_COMPUTER_USE_APP_VARIANT=dev` keeps the dev identity with release optimization:

```sh
OPEN_COMPUTER_USE_APP_VARIANT=dev \
OPEN_COMPUTER_USE_APP_OUTPUT_DIR="$PWD/.build/parity-dev" \
OPEN_COMPUTER_USE_INCLUDE_LOCKED_USE=0 \
./scripts/build-open-computer-use-app.sh release
```

The override accepts only `dev`. It keeps `com.ifuryst.opencomputeruse.dev` and the `(Dev)` name. Automatic Locked Use packaging remains limited to the release app identity. This lane checked unsigned packaging in an isolated build directory. Before app-agent acceptance, verify stable Developer ID signing, grant the two permissions and rerun the benchmark with that app's binary.

## 2026-10-30 product result

Standalone `OpenComputerUse` through the GUI relay, runtime code `171d4be36314`. Three runs per engine with the same fixture script:

| Action | Product median ms | Codex median ms | Product verified |
| --- | ---: | ---: | ---: |
| click | 10 | 67 | 3/3 |
| pressKey | 13 | 6 | 3/3 |
| typeText | 6 | 25 | 3/3 |
| setValue | 30 | 18 | 3/3 |
| scroll | 108 | 1144 | 3/3 |
| drag | 790 | 729 | 3/3 |

All listed effects are verified. Click, typing and scroll meet the original 1.5x limit; printable-key latency remains above it. Drag now works through the product, using window-addressed events and a 20 ms per-event gap. The fixture reports real callbacks and the benchmark checks varying start/end points within one point.

The original product discrepancy was installed-app delegation: the unchanged product binary proxied into an older npm app, while the probe ran its own linked library. The proxy-disable control made that unchanged product use the local fixes. A standalone product now runs its own code by default; an executable inside an OCU app bundle retains its own app-agent path.

The direct product is ad-hoc signed and has no Developer ID team. The working drag is therefore not blocked by Developer ID app signing. The GUI Swift suite passes: 408 tests, 8 skipped, 0 failures. Packaged app-agent acceptance and broader app compatibility remain separate. The external report retains routing metadata, both drag cadence series, exact endpoint/effect checks and binary hashes.

## Product executable routing

A standalone `.build/.../OpenComputerUse` runs the service linked into that binary. An executable inside an OCU `.app` retains app-agent routing for its own bundle. Installed-app discovery supports onboarding and permissions; it does not replace a standalone build's automation code. `OPEN_COMPUTER_USE_DEBUG_ROUTING=1` prints the selected route and executable on stderr. The separate probe remains useful for diagnostics, but product acceptance uses `OCU_BIN` pointing at `OpenComputerUse`.

`agent-info.mjs` reads app-agent path/build metadata without a GUI tool call. Diagnostic agents use a lane-owned socket namespace. Its termination option accepts only that diagnostic namespace prefix.

Targeted drag events now carry the captured window ID, window-local coordinates, per-step deltas and a shared gesture identity. Every event checks the GUI session and window ownership. App-local drags can work through the standalone product with the relay's permissions. Global pointer fallbacks remain disabled in the benchmark. Cross-app drag/drop and window moves remain separate cases.

The fixture records the real mouse-drag callback count. Start and end points vary per run, and the benchmark checks both endpoints within one point. This detects a dropped mouse-down or a callback from the wrong region and makes repeated gestures observable.
