# Tree format comprehension results

Status: complete for one pass per cell. Both models answered the same 39 questions per window and format. Claude's six cells ran on 2026-10-30 with `--retry-provider=claude` on the saved captures, after its weekly limit cleared.

Product source of the captures: `004854ee077e19990700e6417e0acb20a14ca142`. Decision: the default indentation is now `level` (one tab per tree level). `OPEN_COMPUTER_USE_AX_INDENTATION=tab4` keeps the packed format.

## Results

Codex used `gpt-6.1-sol` at `low` effort. Claude used `claude-opus-5-5` at low effort. Both ran with tools disabled.

| Model | Window | Format | Exact answers | Input tokens |
| --- | --- | --- | ---: | ---: |
| gpt-6.1-sol | discord | tab4 | 39/39 | 25409 |
| gpt-6.1-sol | discord | level | 39/39 | 25407 |
| gpt-6.1-sol | discord | codex | 38/39 | 23471 |
| gpt-6.1-sol | brave | tab4 | 36/39 | 15805 |
| gpt-6.1-sol | brave | level | 39/39 | 15816 |
| gpt-6.1-sol | brave | codex | 39/39 | 15409 |
| Claude Opus 5.5 | discord | tab4 | 39/39 | 19494 |
| Claude Opus 5.5 | discord | level | 39/39 | 18746 |
| Claude Opus 5.5 | discord | codex | 39/39 | 16507 |
| Claude Opus 5.5 | brave | tab4 | 35/39 | 7234 |
| Claude Opus 5.5 | brave | level | 39/39 | 7052 |
| Claude Opus 5.5 | brave | codex | 35/39 | 6578 |

Input tokens are CLI-reported total input, including cached tokens and CLI instructions. They are not tree-only counts. Compare formats within one model.

| Model | Format | Exact answers | Total input tokens |
| --- | --- | ---: | ---: |
| gpt-6.1-sol | tab4 | 75/78 | 41214 |
| gpt-6.1-sol | level | 78/78 | 41223 |
| gpt-6.1-sol | codex | 77/78 | 38880 |
| Claude Opus 5.5 | tab4 | 74/78 | 26728 |
| Claude Opus 5.5 | level | 78/78 | 25798 |
| Claude Opus 5.5 | codex | 74/78 | 23085 |

## Incorrect answers

Codex:

- **discord, codex, q37:** depth of the deepest group. Expected `12`; received `11`.
- **brave, tab4, q05, q12, q26:** "Is it marked settable?" for Back, Forward and the first text field. Expected `true`; received `false`.

Claude:

- **brave, tab4, q29, q31, q32, q33:** children, last child, subtree size and the element after the subtree of the first group. Claude counted 4 children where there is 1, so all four structure answers were wrong.
- **brave, codex, q29, q31, q32, q33:** the same four structure questions, the same mistake.

Level had no wrong answers for either model.

## Size and decision

| Window | tab4 characters | level characters | codex characters |
| --- | ---: | ---: | ---: |
| discord | 39409 | 46762 | 41493 |
| brave | 11809 | 12997 | 11904 |

Level is the default because it was the only format both models read without error (156/156; tab4 149/156). The tab4 errors were writable-flag misreadings for Codex and tree-structure misreadings for Claude; packing four levels into one tab hides nesting. Level has 9-19% more characters than tab4, but about the same input tokens for Codex (41,223 versus 41,214) and fewer for Claude (25,798 versus 26,728). The earlier "no more characters than Codex's tree" target is dropped: tokens and correct answers are what an agent pays for.

One pass per cell cannot prove a general accuracy difference. Repeat the question sets after any later format change.

## Validation

- Five Node oracle and scorer tests pass (`node --test experiments/parity/format-eval/`).
- After the default change: the full Swift suite and paired read benchmarks run again (see the read-parity plan).
- Private trees, prompts, expected answers, model responses and logs stay outside Git.
