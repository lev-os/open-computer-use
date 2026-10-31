## 2026-10-30 17:00 | Task: Improve and verify computer-use actions

### 🤖 Execution Context
* **Agent ID**: `/root`, action lane
* **Base Model**: GPT-6 (Codex)
* **Runtime**: Codex on macOS; optimized Swift probe through a desktop-session relay

### 📥 User Query
> Run the action parity brief to its completion conditions. Measure Codex and OCU, make verified bounded changes, commit locally and update the external report after each step. Use the authorized desktop relay for GUI work. Keep signed-app acceptance separate.

### 🛠 Changes Overview
**Scope:** Native action behavior, bounded observation, cursor scheduling, fixture falsifiers and benchmark tooling.

**Key Actions:**
- Added a shared action script, exact text parser, fixture preparation, direct MCP probe, GUI Swift-check helper and shared-lock discipline. A distinct fixture name bypasses the synthetic command bridge; the benchmark validates the exact executable and PID.
- Added empty-value support, verified editable focus, UTF-16 selection replacement, live focus and value/window validation. Ignored writes and unobserved scroll/drag effects return errors. Page fallback preserves the remaining budget.
- Made action read-back bounded by default, retaining explicit full/off modes. Moved cursor motion and pulses to cancellable main-loop timers while preserving the motion model. Verified idle anchoring, moving-reset cancellation and close cleanup.
- Added hostile fixture modes, strengthened cursor tests for asynchronous endpoints, checked optimized dev bundle identity and retained two final series with raw samples and hashes. All changes remain local.

### 🧠 Design Intent (Why)
Full snapshots and blocking cursor animation dominated action latency. Cached observations keep the default response cheap while reporting actual state. A successful AX return does not prove the app accepted the action, so value and observable-effect checks run even when state output is disabled.

Final review corrected partial page fallback and a whitespace-trimming verifier gap. The first series remains available; all 24 retained text observations also pass the stricter parser. No performance-based sample selection is claimed.

### 📁 Files Modified
- `packages/OpenComputerUseKit/Sources/OpenComputerUseKit/`: action service, dispatcher, input timing, text replacement, verification and cursor overlay.
- `packages/OpenComputerUseKit/Tests/OpenComputerUseKitTests/`: value, selection, page-budget and asynchronous cursor checks.
- `apps/OpenComputerUseFixture/`, `experiments/parity/` and `Package.swift`: real fixture, hostile modes and reproducible probes.
- `scripts/build-open-computer-use-app.sh`, `docs/ARCHITECTURE.md` and the existing action parity plan.

### Verification and limits
The GUI Swift build passes. The suite executes 407 tests with 8 skipped and no failures; 3 parser tests pass. `TextSelectionOperationTests.testQueryIndexesValidateSessionBeforeLookingUpTheApp` failed in the background pane at the accepted base and passes in the proper desktop audit session. Session guards are unchanged.

Final action medians, three runs per engine:

| Action | Before OCU ms | Final OCU ms | Final Codex ms | Within 1.5x |
| --- | ---: | ---: | ---: | --- |
| click | 3838 (unverified effect) | 55 | 73 | yes |
| pressKey | 2045 (unverified effect) | 30 | 7 | no |
| typeText | 1 (error) | 22 | 23 | yes |
| scroll | 580 | 120 | 1171 | yes |

The key timing target remains unmet. Normal native drag has no verified effect and returns an error. Ignored wheel input, ignored AX writes, read-only values, invalid scroll targets and zero drag are rejected. Sequential typing works without intervening reads; explicit full mode and state-output-off checks pass.

The optimized development packaging check uses the dev identity and is unsigned. Signing initially timed out; signed app-agent behavior and broader app compatibility remain unverified. These measurements cover the optimized direct tool on the fixture. Signed app-agent acceptance remains deferred.


### Product executable and working drag follow-up
The product executable was silently delegating to the npm-installed app from October 27. An unchanged-binary proxy-on/off experiment and read-only agent metadata isolated the cause. Both permission checks were granted. Standalone product execution now stays local; packaged executables preserve app-agent routing. Routing diagnostics and a regression test cover that distinction.

The former targeted drag posted generic PID events without captured-window addressing. It now stamps the window, window-local positions, motion deltas and gesture identity. Every event validates session and ownership. The real fixture callback counter and varying endpoints verify fresh mouse-down/drag delivery. Global pointer fallbacks stay disabled.

The product's final three-run medians are:

| Action | Product median ms | Codex median ms | Product verified |
| --- | ---: | ---: | ---: |
| click | 10 | 67 | 3/3 |
| pressKey | 13 | 6 | 3/3 |
| typeText | 6 | 25 | 3/3 |
| setValue | 30 | 18 | 3/3 |
| scroll | 108 | 1144 | 3/3 |
| drag | 790 | 729 | 3/3 |

The 20 ms cadence series verifies 3/3 drags at 790 ms median, versus Codex at 729 ms. The slower verified 30 ms series is retained. The rebuilt probe and state-output-off product also drag successfully. Final GUI tests execute 408 tests with 8 skipped and zero failures. The direct product is ad-hoc signed without a Developer ID team; app-contained signed acceptance remains a separate gate.

Affected files also include product entry-point/proxy selection, permission diagnostics, shared mouse-event stamping, tool descriptions, the fixture callback counter and the repository skill's drag guidance. No installed executable was replaced.

### Follow-up: stable geometry and delivered endpoints
The benchmark now reads live AX metadata on both sides of its screenshot before every drag. It rejects changing layouts and incompatible image geometry. This removes the stale fixture-export coordinates that had shifted the requested path by 20 points horizontally and 6 vertically.

Native macOS drag now requires a fresh completed endpoint receipt tied to the captured process, window and bounds. The fixture records mouse-down, final drag and mouse-up callbacks in window-top-left points. All endpoints must match within one point. Missing receipts fail before input; stale, incomplete or mismatched receipts fail closed. General apps without the receipt protocol are explicitly unsupported by this verification path. Synthetic fixture bridge behavior is unchanged.

Three separate optimized product sessions verified all nine drags. Session medians were 851, 824 and 814 ms. The endpoint validator tests cover mismatched down/drag/up, missing mouse-up, stale sequences, malformed geometry and read failure. Swift build and 412 tests pass, with 8 skipped. Raw benchmark artifacts are saved directly before the relay returns, because large relay stdout writes can be truncated.

The hostile integration case shifts the final drag receipt by 12 points while preserving mouse-down and mouse-up. The product rejects it with `drag endpoints mismatch` in 819 ms. All six Node parser/geometry tests pass.
