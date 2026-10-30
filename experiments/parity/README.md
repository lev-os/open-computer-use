# Computer-use parity experiments

`bench.mjs` measures full reads. `act-bench.mjs` runs the same fixture action sequence inside each engine session. Both use the shared directory lock. Preparation and cleanup also take that lock. Never remove a live owner's lock.

## Action benchmark

These commands assume an unlocked desktop terminal. For an agent pane in another audit session, use the relay below.

```sh
swift build -c release --product OCUActionProbe
.build/release/OCUActionProbe doctor --json
node experiments/parity/act-fixture.mjs
node experiments/parity/act-bench.mjs codex 3 > .build/codex-actions.json
OCU_BIN=.build/release/OCUActionProbe \
  node experiments/parity/act-bench.mjs ocu 3 > .build/ocu-actions.json
node experiments/parity/act-fixture.mjs close
```

The preparation script builds the checkout fixture and packages it as `.build/ActionParityFixture.app`. Its distinct display and executable names bypass OCU's name-based synthetic command bridge. The benchmark verifies the exported PID belongs to that exact checkout executable before acting. It retains the fixture's own exported state before and after each sequence.

Each run clears the field, clicks it, presses `x`, inserts a token, sets a replacement value, increments the counter, scrolls and drags inside the pad. It resolves element IDs after reads and scales window-point drag coordinates to PNG/JPEG screenshot pixels. Empty-field rendering is handled explicitly. Text assertions preserve whitespace and punctuation. The same value parser is injected into both engines. Unknown screenshot formats reject the coordinate probe.

Each row records in-session action time, separate full-read time, errors, state text and observed effect. A fast error is not a successful action. Native explicit reads include the default screenshot; Codex `getAXState` is an AX read. Keep these times separate. Codex is called only through the installed `cu.mjs` skill session. Each Codex benchmark resets that session while holding the shared lock.

## GUI-session relay

The operator supplies `OCU_RELAY`. All GUI operations must run in the desktop login's audit session. Accessibility trust alone does not establish that context.

```sh
node "$OCU_RELAY" --cwd "$PWD" -- "$PWD/.build/release/OCUActionProbe" doctor --json
node "$OCU_RELAY" --cwd "$PWD" -- node "$PWD/experiments/parity/act-fixture.mjs"
node "$OCU_RELAY" --cwd "$PWD" \
  --env "OCU_BIN=$PWD/.build/release/OCUActionProbe" --timeout 180000 \
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

## 2026-10-30 result

Real fixture only. Final action medians from three runs per engine, runtime candidate `10bb3cd532ec`:

| Action | Before OCU ms | Final OCU ms | Final Codex ms | Within 1.5x |
| --- | ---: | ---: | ---: | --- |
| click | 3838 (unverified effect) | 55 | 73 | yes |
| pressKey | 2045 (unverified effect) | 30 | 7 | no |
| typeText | 1 (error) | 22 | 23 | yes |
| scroll | 580 | 120 | 1171 | yes |

Click, typing and scroll meet the timing limit. Keypress remains 30 ms versus 7 ms for Codex. The fixed pause is removed for the verified printable-key path, but delivery/verification remains above the target. An existing private posting path did not improve the measured result and was not retained. Normal native drag remains unverified and returns an error; working drag is not claimed.

The GUI Swift suite passes: 407 tests, 8 skipped, 0 failures. The background-pane query/session failure observed at the accepted base passes in the correct desktop session. The report retains both final series, raw state/effect checks, separate read timings, hostile cases, source/binary hashes and exact signing prerequisites. Calculator, TextEdit and the signed app-agent path were not measured.
