# Accessibility tree comprehension evaluation

## Current vs Ideal

The read lane already measured latency and character size. This evaluation checks whether two models can recover indexes, hierarchy and control metadata from full-tree text. It compares packed indentation (`tab4`), one tab per level (`level`), and the Codex tree for the same existing windows.

A smaller string is useful only if it stays readable. Character count, input tokens and exact-answer accuracy are separate measurements.

## What top experts in accessibility evaluation would do

Start with fresh raw accessibility trees, not a model summary or a previous benchmark table. Capture the same windows back to back, check equivalent native records by program, use independent synthetic hierarchy fixtures, and score exact JSON answers with a deterministic oracle. Keep provider refusals separate from wrong answers. Make recommendations only within the measured windows, models and question set.

The raw material here is six private full-tree captures. `capture.mjs` uses the actual product JS/Worker/native MCP path for both native formats and `cu.mjs` with `CU_ENGINE=codex` and `disableDiffing` for the reference. All GUI reads use the operator's existing relay. An already-running fixture is optional; this lane never starts or drives it. Capture uses the existing benchmark lock.

## Reproduce

Use a private directory outside this checkout. Live trees, prompts, parsed records, expected answers and raw model responses must never enter Git. The scripts reject a capture directory inside the checkout. No third-party packages are needed. The existing lane report uses its established YAML contract through Ruby's standard library; local experiment state uses JSON.

```sh
node experiments/parity/format-eval/capture.mjs "$PRIVATE_DIR"
node experiments/parity/format-eval/prepare.mjs "$PRIVATE_DIR"
node --test experiments/parity/format-eval/eval.test.mjs
node experiments/parity/format-eval/run.mjs "$PRIVATE_DIR"
node experiments/parity/format-eval/summarize.mjs "$PRIVATE_DIR"
```

`summarize.mjs` verifies saved answers again and writes the allowlisted numerical snapshot in `measurements.json`. Update `RESULTS.md` as a human-written interpretation of that snapshot; the generator does not rewrite its conclusions.

`prepare.mjs` writes no private app content to Git. It writes public question sets under `questions/` using generic role selectors and a small allowlist of ordinary control labels. It writes the answers and parsed trees only to the private directory. Every question is identical across the three formats for its window. Actual element numbers and hierarchy differ between engines, so each capture has its own answer key. Native tab4 and level records must match exactly after indentation decoding before evaluation proceeds.

The 39 questions per window mix named controls, role/flag/value extraction, element order, parents, grandparents, depth, immediate children, complete descendants and the next node after a subtree. Root depth is zero. Roles are copied as displayed. `group/container` is an equivalent selector only. Values and flags reflect the rendered tree, not inferred app capabilities. Missing values are `null`. The oracle tests include independent explicit hierarchy answers across a four-level tab boundary, state flags, a literal value containing `Value:`, malformed indentation and exact-type scoring.

`run.mjs` is a single bounded supervisor. It runs fresh independent CLI contexts, writes each completed result, then updates the lane report. Each call has a three-minute deadline and a five-second termination grace. Completed cells are reused on resume. A refused provider is not retried automatically. Other providers continue. An explicit `--retry-provider=claude` resumes failed cells after an external change, preserving excluded attempts. `--rerun-provider=codex` replaces that provider's cells after a verifier correction; raw prior responses and scores remain in the private excluded-attempt ledger. Terminal tabs and background worker duplication are not used.

Claude uses the requested `claude-opus-5-5` at low effort, hooks off, safe mode, an empty built-in tool list, and an empty strict MCP configuration. Codex uses the configured default model and effort, ignores user configuration and rule files for the answering session, disables project instructions, bundled skill instructions, shell, local image, image-generation, sleep, goal and suggestion tools, apps, plugins, memories, hooks, multi-agent tools and web search, and has no configured MCP servers. Both receive the same question prompt and tree bytes for a cell. The supervisor rejects command/tool/file/search events and records no score if a provider or oracle fails. A successful model response with malformed answer JSON scores zero exact matches; it is not a provider outage.

Input tokens come from each CLI's usage response, including cached input. They include the CLI's own instructions and protocol overhead, so compare formats within each model; do not treat them as tree-only tokenizer counts or compare providers as if their tokenizers matched. Cached tokens are reported separately. No tokenizer is estimated from characters.

## Proof limits

These are deterministic questions on two live windows, one sample per model/format/window, with no model tools or UI actions. They are not an action-success test, a general model ranking, signed app-agent acceptance, or statistical proof that every future tree will be read correctly. The source formats expose different node populations and state annotations; format-specific answer keys preserve that distinction. There is no format change unless the resulting recommendation and follow-up measurements explicitly say so.
