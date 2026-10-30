#!/usr/bin/env node
// Replay consecutive real read snapshots through the same diff codec used by getAXState.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { AXStateDiff, applyAXStateDiff } from "../../scripts/node-repl/ax-state-diff.mjs";

const output = process.env.OCU_PARITY_OUTPUT;
if (!output || !path.isAbsolute(output)) throw new Error("OCU_PARITY_OUTPUT must be a private absolute directory");
const lock = "/tmp/ocu-parity.lock";
for (let attempt = 0;; attempt++) {
  try { fs.mkdirSync(lock); break; } catch {
    if (attempt >= 600) throw new Error("shared benchmark lock deadline; preserved");
    execFileSync("sleep", ["1"]);
  }
}
const rows = [];
try {
  for (const [app, bundle] of [["Discord", "com.hnc.Discord"], ["Brave Browser", "com.brave.Browser"]]) {
    const pid = execFileSync("pgrep", ["-x", app], { encoding: "utf8" }).trim();
    if (!/^\d+$/u.test(pid)) throw new Error("expected one app PID");
    const tracker = new AXStateDiff();
    let state;
    for (let read = 0; read < 3; read++) {
      const file = path.join(output, `diff-live-${app.split(" ")[0].toLowerCase()}-${read}.txt`);
      const result = JSON.parse(execFileSync("node", ["/tmp/ocu-gui-relay/run.mjs", "--cwd", process.cwd(), "--timeout", "120000", "--",
        path.resolve(".build/release/OCUReadBench"), pid, app, bundle, "1", file], { encoding: "utf8", timeout: 130000 }));
      const text = fs.readFileSync(file, "utf8");
      const start = performance.now();
      const encoded = tracker.observe(text);
      const diff_ms = performance.now() - start;
      const packet = JSON.parse(encoded);
      state = applyAXStateDiff(state, packet);
      if (state.text !== text) throw new Error("live snapshot reconstruction failed");
      rows.push({ app, read, source: "direct tool through desktop relay", ax_read_ms: result.median_ms,
        full_chars: text.length, packet_chars: encoded.length, type: packet.type, diff_ms,
        added: packet.added?.length, changed: packet.changed?.length, removed: packet.removed?.length,
        reconstructed_exactly: true, indexes_valid: result.breakdown[0].indexes_valid });
    }
  }
} finally { fs.rmSync(lock, { recursive: true }); }
console.log(JSON.stringify(rows));
