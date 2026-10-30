## 2026-10-30 | Task: Measure action parity and record the development runtime gate

### 🤖 Execution Context
* **Agent ID**: `/root`, action lane
* **Base Model**: GPT-6 (Codex)
* **Runtime**: Codex on macOS

### 📥 User Query
> Run the action parity brief to its completion conditions. Measure both engines, make bounded verified changes, commit locally, and update the lane report after each step. Keep the development identity separate from release apps.

### 🛠 Changes Overview
**Scope:** Action benchmark and fixture preparation; no action engine source changes.

**Key Actions:**
- Added one shared action sequence for Codex through the installed computer-use skill session and OCU through native MCP. Record in-session action time, explicit read time, tool errors and observed effects separately.
- Added fixture preparation and cleanup. A distinct app name bypasses the synthetic fixture command bridge. Verify the exact checkout executable and exported PID. Scale drag coordinates from window points to screenshot pixels.
- Collected three sequences per engine on the real-input fixture, plus a separate three-sequence OCU read-back-off diagnostic. Preserve raw samples and signing output in the external lane report.
- Stopped development-runtime work at the brief's signing and permission gate. An explicit Developer ID build timed out during signing; stable signing was not established. Permission steps are conditional on a verified signature.

### 🧠 Design Intent (Why)
A successful API return is not evidence that input reached the control. The fixture's values and exported state distinguish effects from silent no-ops. Native MCP preserves the read-back setting, which the JS adapter otherwise forces off. No engine patch is claimed without a testable development runtime.

The installed release failed to focus the input, subsequent typing returned an AX error, and drag produced no observed change. Normal scroll and setValue succeeded in the fixture. These samples do not establish wheel-ignoring scroll, refused-write, or wrong-window guarantees.

### 📁 Files Modified
- `experiments/parity/act-bench.mjs`
- `experiments/parity/act-fixture.mjs`
- `experiments/parity/README.md`
- `docs/exec-plans/active/20261030-action-parity.md`

### Verification and limits
`swift build` passes. The unmodified accepted Swift base has one failing test: `TextSelectionOperationTests.testQueryIndexesValidateSessionBeforeLookingUpTheApp` at line 65. The suite executes 399 tests, skips 10, and reports one failure. Node syntax and repository documentation checks pass.

The action benchmark and preparation scripts were exercised against the checkout fixture. The lane remains blocked until stable development signing and permissions permit an optimized development build, bounded engine fixes, and post-fix acceptance. No runtime speedup, publication, or complete parity is claimed.
