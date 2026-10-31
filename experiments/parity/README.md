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
