## [2026-10-30 16:59] | Task: Improve accessibility read parity

### 🤖 Execution Context
* **Agent ID**: Codex read lane
* **Base Model**: GPT-6 family; exact model not exposed
* **Runtime**: Codex on macOS; GUI reads/checks use the operator's desktop-session relay

### 📥 User Query
> Execute the read parity lane. Measure first, retain roles/names/values and valid action indexes, add optional diffs and close the full-tree size gap. Verify semantic fixtures before pruning, benchmark/test and commit each step. Verify actual product JS/MCP gains and compare one-tab-per-level with the other compactions kept. Signed-app acceptance waits for the operator.

### 🛠 Changes Overview
**Scope:** Read rendering, output protocol, dev packaging and local verification.

**Key Actions:**
- **Read cache**: Batch common AX attributes within a renderer walk, with transient fallback and fresh later reads. Session guards and action lookup remain intact.
- **Full text**: Preserve the original node-selection policy. Compact only indentation, canonical group labels, reversible writable/type flags and the value delimiter. A separate legend defines the format. The zero-live-gain pruning experiment was retired.
- **Proof and tooling**: Add semantic AX fixtures with independent logical targets, deep hierarchy, metadata boundaries, repeated names, scalar/literal values and handle freshness. Align direct-probe lifetime/cache scope with production and save optional artifacts only after the final timed sample. Preserve the original preamble and official native tool descriptions.
- **Diffs and packaging**: Add optional revisioned, lossless state diffs; keep full text default. Include required dependencies in both package layouts and installer copies. Optimized app builds retain dev identity and preserve neighboring release bundles.

### 🧠 Design Intent (Why)

AX waits dominated the original read cost. Batching reduces remote calls. Raw metadata then showed that apparently empty groups still expose actions or writable values, so the final size change keeps all original nodes and action records. Compact formatting retains all names, values, states, types, hierarchy and indexes.

Final direct relay median-of-medians: Discord 429.85 ms versus 430 ms, 37710 versus 39561 characters; Brave 79.12 ms versus 99 ms, 10475 versus 10629 characters. All three pairs per app pass latency and size. Current direct reads retain 928/223 records. All 412 Swift tests pass (8 skipped), as do all 56 Node tests. Six real compact snapshots reconstruct exactly through the diff codec; unchanged packets contain 85 characters.

Intermediate load-sensitive timing samples and all before/after steps remain in the private lane report. These results do not establish signed-app acceptance. Developer ID signing previously waited on a private-key operation; optimized candidate packaging is deliberately unsigned. No permission grant, installed-runtime replacement, push or publication occurred.

### Product path and indentation continuation

The real repository JS launcher, Worker and native MCP route is verified against the probe. Both use the production SnapshotBuilder. The JS AX getter defaults to AX-only/full text; explicit capture and native combined-tool defaults remain available. Only the exact separate screenshot-omission note is filtered. The initial selected-product result was 535 ms on Discord. AX-only/full text measured 480 ms against probe 472.74 ms. The larger act-lane gap was not reproduced with the pinned fresh binary; its cause is not asserted.

Final product median-of-medians: Discord 502 ms versus reference 453 ms, with 37718 versus 39569 characters; Brave 107 ms versus 100 ms, with 10475 versus 10629 characters. All three pairs pass latency and default size. Product/probe text matches exactly. Swift build and 413 Swift tests pass (8 skipped), plus 57 Node tests.

Both indentation modes remain available. One tab per level with other compactions kept produces 44801/11345 characters versus reference 39563/10629. Packed output is 37712/10475. Therefore tab4 remains default and level is an explicit environment selection. Semantic fixtures and captured mode-neutral text confirm only indentation/legend differ.

### 📁 Files Modified
- `packages/OpenComputerUseKit/Sources/OpenComputerUseKit/AccessibilitySnapshot.swift`, `AXSnapshotReadCache.swift` and `AXTreeTextFormatting.swift`
- `packages/OpenComputerUseKit/Tests/OpenComputerUseKitTests/AXSemanticRenderingTests.swift` and cache tests
- `scripts/node-repl/`, `experiments/parity/`, architecture docs and the active read parity plan
- `scripts/build-open-computer-use-app.sh`, `scripts/npm/build-packages.mjs` and `scripts/install-codex-plugin.sh`
