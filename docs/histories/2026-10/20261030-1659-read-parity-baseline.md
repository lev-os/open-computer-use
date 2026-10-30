## [2026-10-30 16:59] | Task: Improve accessibility read parity

### 🤖 Execution Context
* **Agent ID**: Codex read lane
* **Base Model**: GPT-6 family; exact model not exposed
* **Runtime**: Codex on macOS; final GUI checks use the operator's desktop-session relay

### 📥 User Query
> Execute the read parity lane. Measure first, preserve information and valid action indexes, add optional diff output, keep local commits and report each step. Continue through a direct Swift tool and desktop relay while signed-app acceptance waits for the operator.

### 🛠 Changes Overview
**Scope:** macOS read rendering, JS read output, development packaging and verification tools.

**Key Actions:**
- **Read cache**: Batch AX attributes and keep values, action names and settable checks within one renderer walk. Preserve transient fallback, fresh rewalks, session guards and backend element records. Cache-on/off full text matched byte for byte.
- **Output**: Omit redundant named-target geometry and add optional revisioned diffs. Full text remains default. Six real snapshots and 200 changing test snapshots reconstructed exactly; unchanged diff packets contain 85 characters.
- **Packaging**: Include the codec in both adapter layouts and the plugin installer; reject missing adapter dependencies. Optimized builds can retain the dev identity. Dev builds preserve neighboring release bundles and skip automatic Locked Use embedding.
- **Verification**: Final direct relay median-of-medians: Discord 499.93 ms versus 479 ms; Brave 104.41 ms versus 121 ms. All three pairs meet the latency gate. Swift build and 403 Swift tests passed (8 skipped); all 55 Node tests and package-copy imports passed.

### 🧠 Design Intent (Why)

Remote AX round trips dominated the baseline, so reduce repeated reads before changing which nodes appear. Keep cache lifetime separate from action reads. Use exact reconstruction and revision-gap rejection to prevent silent diff data loss.

Full text remains larger: 46029 versus 39563 characters on Discord, and 12606 versus 10340 on Brave. The full-size gate is unmet. Direct-tool results do not establish signed-app acceptance. Initial Developer ID signing waited on a private-key operation and did not finish; no permission request or installed-runtime replacement followed.

### 📁 Files Modified
- `packages/OpenComputerUseKit/Sources/OpenComputerUseKit/AccessibilitySnapshot.swift` and `AXSnapshotReadCache.swift`
- `scripts/node-repl/ax-state-diff.mjs`, `open-computer-use-repl.mjs`, CLI checks and tests
- `experiments/parity/` and `docs/exec-plans/active/20261030-read-parity.md`
- `scripts/build-open-computer-use-app.sh`, `scripts/npm/build-packages.mjs`, `scripts/install-codex-plugin.sh` and architecture documentation
