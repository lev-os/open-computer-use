# Tree format comprehension results

Status: partial. Codex completed all six measured cells. Claude Opus 5.5 returned its weekly-limit refusal both before and after its stated local reset. Its accuracy and token cells are unmeasured. No alternate model, provider or account was used.

Product source: `004854ee077e19990700e6417e0acb20a14ca142`. The native format and default are unchanged. The optional action-lane fixture was not running.

## Current vs Ideal

Two same-window captures were evaluated with 39 identical questions per window and format-specific program-generated answers. Codex used `gpt-6.1-sol` at `low` effort, with tools disabled and no tool calls or configuration warnings in the accepted runs. The required second model is still unavailable.

| Model | Window | Format | Exact answers | Input tokens | Cached input |
| --- | --- | --- | ---: | ---: | ---: |
| gpt-6.1-sol | discord | tab4 | 39/39 | 25409 | 7552 |
| gpt-6.1-sol | discord | level | 39/39 | 25407 | 7552 |
| gpt-6.1-sol | discord | codex | 38/39 | 23471 | 7552 |
| Claude Opus 5.5 | discord | tab4 | unmeasured | — | — |
| Claude Opus 5.5 | discord | level | unmeasured | — | — |
| Claude Opus 5.5 | discord | codex | unmeasured | — | — |
| gpt-6.1-sol | brave | tab4 | 36/39 | 15805 | 7552 |
| gpt-6.1-sol | brave | level | 39/39 | 15816 | 7552 |
| gpt-6.1-sol | brave | codex | 39/39 | 15409 | 7552 |
| Claude Opus 5.5 | brave | tab4 | unmeasured | — | — |
| Claude Opus 5.5 | brave | level | unmeasured | — | — |
| Claude Opus 5.5 | brave | codex | unmeasured | — | — |

Input tokens are CLI-reported total input, including cached tokens and CLI instructions. These are not tree-only token counts. Compare formats within a model.

| Codex aggregate format | Exact answers | Accuracy | Total input tokens |
| --- | ---: | ---: | ---: |
| tab4 | 75/78 | 96.15% | 41214 |
| level | 78/78 | 100.00% | 41223 |
| codex | 77/78 | 98.72% | 38880 |

## Incorrect answers

- **discord, codex, q37:** For the deepest (break ties by first text occurrence) node with role "group/container": What is its nesting depth, with a root at depth 0? Expected `12`; received `11`.
- **brave, tab4, q05:** For the node with exact role "button" and exact name "Back": Is it marked settable? Expected `true`; received `false`.
- **brave, tab4, q12:** For the node with exact role "button" and exact name "Forward": Is it marked settable? Expected `true`; received `false`.
- **brave, tab4, q26:** For the first node with role "text field": Is it marked settable? Expected `true`; received `false`.

Level had no wrong answers in this run. Claude produced no answers to score.

## Size and recommendation

| Window | Compact characters | Level characters | Codex characters |
| --- | ---: | ---: | ---: |
| discord | 39409 | 46762 | 41493 |
| brave | 11809 | 12997 | 11904 |

Recommend **switching the default to level**, provisionally, because it scored 78/78 while compact scored 75/78. The three compact errors were writable-state interpretations, not parent or element-number errors. Compact saved 15.72% of Discord characters and 9.14% of Brave characters against level, but only 9 input tokens in aggregate (41,214 versus 41,223, about 0.02%). It used more input tokens than Codex format despite fewer characters. Character size alone does not establish a token benefit.

Level would also miss the earlier no-larger-character target on these fresh windows: 46,762 versus 41,493 reference characters for Discord, and 12,997 versus 11,904 for Brave. Its correctness result therefore comes with a measured size tradeoff.

The recommendation is not applied. The required Claude comparison is missing, and one pass per cell cannot establish a general accuracy difference. The initial excluded Codex run scored all answers correctly but emitted an ignored-configuration warning; its raw records remain private and it is not mixed into the accepted table. No source format changed, so there is no new format benchmark claim. Earlier paired speed measurements remain in the read-parity plan.

A possible later compact experiment is an explicit legend for typed write flags (`w:str`, `w:bool`, `w:float`) rather than relying on `w=settable`. That is an untested follow-up, not an accepted fix.

## What top experts in accessibility evaluation would do

Keep the raw captures and program-generated answer keys immutable, separate provider refusals from model mistakes, and complete the missing model on the same captures. Repeat enough independent samples before treating small accuracy differences as a stable format effect. If the default or legend changes, rerun both question sets, paired speed/size benchmarks and Swift checks before accepting it.

## Validation and remaining work

Five independent Node oracle/scorer tests and the documentation check pass. Swift build passes. A full Swift test run executed 413 tests with eight skipped and one failure in the existing `CursorWindowFollowTests.testServiceClickRegistersLiveWindowAndFeedbackMatchesMovedButton`: its current xctest window could not be resolved. No Swift source changed. The failure remains visible; this report does not claim a clean full Swift run.

Resume only the missing Claude cells after account capacity becomes available, using the existing private directory and `--retry-provider=claude`. Then regenerate this report, settle the recommendation with both model tables, and run the conditional format-change gates if any format is changed. Private trees, prompts, expected answers, model responses and complete logs stay outside Git. The owning Workshop intake workstream remains read-only for this lane.
