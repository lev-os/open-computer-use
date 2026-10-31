# Accessibility read benchmark

`bench.mjs` serializes runs with the shared temporary benchmark lock. It supports `codex`, installed `ocu`, and `ocu-direct`.

```sh
swift build -c release --product OCUReadBench
node experiments/parity/bench.mjs codex Discord 5
node experiments/parity/bench.mjs ocu-direct Discord 5
node experiments/parity/bench.mjs codex "Brave Browser" 5
node experiments/parity/bench.mjs ocu-direct "Brave Browser" 5
```

The direct executable inherits the launching terminal's Accessibility permission. It reads an existing AX window by process ID and uses OpenComputerUseKit's production TreeRenderer. It does not use NSWorkspace discovery, capture screenshots, launch or raise apps, or perform actions. It uses the production session guard and does not alter the checks on production services. The harness is experimental SPI and is not part of the native MCP tool registry.

Read timing excludes process startup and final report JSON encoding. Counts use UTF-16, matching JavaScript string length. Phase fields separate synchronous AX API waits, tree rendering, line formatting and final text assembly. AX time is nested inside tree time; do not add the two. `indexes_valid` confirms that every displayed element record has the same numeric index and a backing AX element; it does not prove an action against a real app.

Set `OCU_READ_BIN` to override the executable path. Set `OCU_READ_SNAPSHOT` to save the last full tree to a private path outside the checkout. Never commit live app text. Direct-tool results are source/runtime evidence only; signed development-app acceptance requires a separate final run.

The renderer batches commonly used attributes and caches successful/unsupported reads only for one snapshot. Transient errors remain eligible for an individual read. Rewalks use a fresh cache; action tools do not enter the renderer scope. `OPEN_COMPUTER_USE_DISABLE_AX_READ_CACHE=1` provides an output-equivalence diagnostic. It does not change action behavior.

Set `OCU_CODEX_SNAPSHOT` to capture the reference benchmark's last tree to a private file. Capture remains a read through `cu.mjs`; no reference binaries or internals are inspected.

When the terminal audit session differs from the console, run `OCU_READ_RELAY=1 node experiments/parity/bench.mjs ocu-direct Discord 5`. This uses the operator-provided desktop relay and forwards only the cache diagnostic flag. Verify `node /tmp/ocu-gui-relay/run.mjs -- .build/release/OCUReadBench doctor --json` with an absolute binary path; `sessionState` must be `unlocked`. Pane-local historical figures are provisional. The signed app remains a separate acceptance gate.

## Optional diffs

`app.getAXState({ diff: true })` returns JSON. Its first packet is `ax-full` with `revision` and complete `text`. Later `ax-diff` packets contain `baseRevision`, `revision`, and `added` / `changed` element entries (`index`, full line `text`) plus removed indexes. A changed `layout` records the exact order of numeric element references and non-element metadata lines. Indentation, focus, selection and notes are retained. `applyAXStateDiff` in `scripts/node-repl/ax-state-diff.mjs` reconstructs the exact full text and rejects revision gaps. Full text stays the default; `disableDiffing: true` forces it and resets the diff baseline.

Each app binding has its own baseline. Window/header or observation-option changes, native errors, duplicate IDs and screenshot reads reset it. Request a new full baseline after a missed packet. Diffing reduces returned text; the native tree is still read in full, so it does not remove AX traversal time.

`OCU_PARITY_OUTPUT=<private-directory> node experiments/parity/diff-bench.mjs` captures three direct relay snapshots per allowed app and verifies exact reconstruction through the same codec. It performs no actions. Live replay and controlled app-API tests are separate from signed-app acceptance.

## Optimized development app

`OPEN_COMPUTER_USE_DEV_APP=1 ./scripts/build-open-computer-use-app.sh release` keeps `com.ifuryst.opencomputeruse.dev`, the Dev name and variant while using release optimization. An explicit dev build preserves neighboring release/legacy bundles. Use an isolated output directory for lane work. A build with `OPEN_COMPUTER_USE_CODESIGN_MODE=none` is an unsigned packaging check only; do not grant it permissions or count it as signed-app acceptance.

## Compact full-tree text

The real AX renderer retains all nodes and backend records while using compact text. `[tab=4 w=settable]` defines four-column tab stops and the write flag. `w:str`, `w:bool` and `w:float` retain the original native type; other state flags remain literal. `group` is the canonical container role, and `=` introduces a value. Names, values, identifiers, help, placeholders, actions and frames remain intact. The App/Window preamble and official native tool description stay unchanged. Synthetic bridge snapshots keep their existing text.

Semantic AX fixtures run the production renderer with independent logical targets. They verify all record indexes and backing AX elements, control roles, values, raw actions, frames, deep hierarchy, and readable metadata under legacy and compact formatting. The read-only raw diagnostic found ubiquitous context-menu/scroll actions and writable empty groups, so those targets stay. The byte reduction comes from formatting rather than discarding them.

Set `OCU_SWIFT_LOG_DIR` when invoking `verify-swift.mjs` through a relay with bounded stdout. It saves complete build/test logs privately and emits a short summary. This avoids treating clipped test output as a complete test record.

The direct benchmark retains the previous snapshot's element handles until the new read replaces them, matching the production action-record lifetime. Attribute values still use a fresh per-walk cache. App-level focus/window/menu queries remain outside the traversal cache, matching SnapshotBuilder. Optional snapshot capture writes only the last tree after the final timed read, so artifact I/O does not run between timed samples. The timed-read count and warmup policy are unchanged.

## Built product path

`OCU_BIN="$PWD/.build/release/OpenComputerUse" node experiments/parity/bench.mjs ocu Discord 5` uses the repository's actual `ocu js` launcher, Worker API and native MCP process. Run that node script through the desktop relay when the pane is outside the console session. The test runner disables app-agent forwarding so the selected binary is measured rather than a separately packaged agent; signed app-agent acceptance remains separate.

The probe now calls the same production SnapshotBuilder with read-only recovery, full text and AX-only observation. JS `getAXState()` defaults to the same full-text AX-only observation. Explicit `includeScreenshot: true` restores capture; use that or `getAXStateAndScreenshot()` before screenshot-coordinate actions. The native `get_app_state` combined observation and its 500-character default remain unchanged for compatibility. The AX getter removes only the exact separate screenshot-omission note; all UI text and other warnings remain.

## Indentation choice

`OPEN_COMPUTER_USE_AX_INDENTATION=level` selects one tab per tree level while retaining the other compact spellings. Its legend is `[w=settable]`. `tab4` selects four-column tab-stop packing with `[tab=4 w=settable]`. The default remains `tab4`: the measured product level-mode trees were 44801/11345 characters versus reference 39563/10629, while tab4 produced 37712/10475. Unknown values use the default. Set the variable on the product process; app-agent requests forward this prefixed variable as well.

Semantic fixtures verify that these modes differ only in indentation and legend, with identical role/name/value text and numeric action records. Captured real product/probe trees also matched exactly in both modes.

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
