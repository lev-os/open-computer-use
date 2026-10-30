## [2026-10-30 16:59] | Task: Measure accessibility read parity

### 🤖 Execution Context
* **Agent ID**: Codex read lane
* **Base Model**: GPT-6 family; exact model not exposed
* **Runtime**: Codex desktop session on macOS

### 📥 User Query
> Execute the accessibility read parity lane through its acceptance checks. Measure before optimization, keep a step report, preserve the development app identifier, and verify stable Developer ID signing before any permission request.

### 🛠 Changes Overview
**Scope:** Documentation and baseline evidence only.

**Key Actions:**
- **Baseline measurements**: Completed three paired five-read benchmarks for each engine on Discord and Brave. Captured installed-release timing evidence separately from development-source checks. A representative direct-agent read spent 3375.8 of 3522.56 ms in the tree walk; finer AX/text/IPC attribution remains blocked.
- **Build and tests**: `swift build` passed on unchanged source. `swift test` ran 399 tests, skipped 10 and failed the existing `TextSelectionOperationTests.testQueryIndexesValidateSessionBeforeLookingUpTheApp` assertion at line 65.
- **Signing gate**: Explicit Developer ID packaging compiled successfully but did not finish signing within a bounded 90-second wait. The artifact remains ad-hoc, so no permission request was made. Read implementation and action code remain unchanged.

### 🧠 Design Intent (Why)

Performance changes need a stable signed development runtime and a phase breakdown. Stop at the signing gate rather than present untested source edits as measured gains. The external lane report retains raw metrics, signing diagnostics and exact next actions; the active execution plan keeps the repository frontier clear.

### 📁 Files Modified
- `docs/exec-plans/active/20261030-read-parity.md`
- `docs/histories/2026-10/20261030-1659-read-parity-baseline.md`
