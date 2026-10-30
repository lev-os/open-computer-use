# Accessibility read benchmark

`bench.mjs` serializes runs with the shared temporary benchmark lock. It supports `codex`, installed `ocu`, and `ocu-direct`.

```sh
swift build -c release --product OCUReadBench
node experiments/parity/bench.mjs codex Discord 5
node experiments/parity/bench.mjs ocu-direct Discord 5
node experiments/parity/bench.mjs codex "Brave Browser" 5
node experiments/parity/bench.mjs ocu-direct "Brave Browser" 5
```

The direct executable inherits the launching terminal's Accessibility permission. It reads an existing AX window by process ID and uses OpenComputerUseKit's production TreeRenderer. It does not use NSWorkspace discovery, capture screenshots, launch or raise apps, or perform actions. It does not alter the session checks on production services. The harness is experimental SPI and is not part of the native MCP tool registry.

Read timing excludes process startup and final report JSON encoding. Counts use UTF-16, matching JavaScript string length. Phase fields separate synchronous AX API waits, tree rendering, line formatting and final text assembly. AX time is nested inside tree time; do not add the two. `indexes_valid` confirms that every displayed element record has the same numeric index and a backing AX element; it does not prove an action against a real app.

Set `OCU_READ_BIN` to override the executable path. Set `OCU_READ_SNAPSHOT` to save the last full tree to a private path outside the checkout. Never commit live app text. Direct-tool results are source/runtime evidence only; signed development-app acceptance requires a separate final run.

The renderer batches commonly used attributes and caches successful/unsupported reads only for one snapshot. Transient errors remain eligible for an individual read. Rewalks use a fresh cache; action tools do not enter the renderer scope. `OPEN_COMPUTER_USE_DISABLE_AX_READ_CACHE=1` provides an output-equivalence diagnostic. It does not change action behavior.

Set `OCU_CODEX_SNAPSHOT` to capture the reference benchmark's last tree to a private file. Capture remains a read through `cu.mjs`; no reference binaries or internals are inspected.
