#!/usr/bin/env node
// Parity benchmark: time full accessibility-tree reads of one app on Codex's engine or on open-computer-use.
//   node bench.mjs <codex|ocu|ocu-direct> <App name> [reads=5]
// codex: runs through ~/.agents/skills/tools/references/computer-use/scripts/cu.mjs (Codex's cua_repl).
// ocu:   runs `$OCU_BIN js --json` (default: ocu on PATH). Point OCU_BIN at a dev build to compare.
// Times are measured inside the engine session, so session start-up is not counted.
// Prints one JSON line: engine, app, ms per read, chars per read, median ms.
// A lock dir (/tmp/ocu-parity.lock) keeps two benchmarks from running at once.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [engine, app, readsArg] = process.argv.slice(2);
const reads = Number(readsArg || 5);
if (!["codex", "ocu", "ocu-direct"].includes(engine) || !app) {
  console.error("usage: node bench.mjs <codex|ocu|ocu-direct> <App name> [reads=5]");
  process.exit(2);
}
const code = `var __a = await cua.getApp(${JSON.stringify(app)}, { initialState: false });
var __r = [];
for (let i = 0; i < ${reads}; i++) {
  var __t = Date.now();
  var __s = String(await __a.getAXState({ emit: false, disableDiffing: true }));
  __r.push([Date.now() - __t, __s.length]);
}
nodeRepl.write("BENCH " + JSON.stringify(__r));
${process.env.OCU_CODEX_SNAPSHOT && engine === "codex" ? 'nodeRepl.write("SNAPSHOTJSON " + JSON.stringify(__s));' : ''}`;

const LOCK = "/tmp/ocu-parity.lock";
for (let i = 0; ; i++) {
  try { fs.mkdirSync(LOCK); break; } catch {
    if (i > 600) { console.error("bench: lock held for 10 min: " + LOCK); process.exit(1); }
    execFileSync("sleep", ["1"]);
  }
}
let out = "";
try {
  if (engine === "codex") {
    const cu = path.join(os.homedir(), ".agents/skills/tools/references/computer-use/scripts/cu.mjs");
    out = execFileSync("node", [cu, "js", code], { encoding: "utf8", env: { ...process.env, CU_ENGINE: "codex" }, timeout: 180000 });
    // cu moves output over 20 KB to a file and prints its path; Codex's engine can print the tree on getApp.
    const spilled = out.match(/full text in (\S+?\.txt)/);
    if (spilled) out = fs.readFileSync(spilled[1], "utf8");
  } else if (engine === "ocu-direct") {
    const bundle = { "Discord": "com.hnc.Discord", "Brave Browser": "com.brave.Browser" }[app];
    if (!bundle) throw new Error("direct read benchmark supports Discord and Brave Browser only");
    const pids = execFileSync("pgrep", ["-x", app], { encoding: "utf8" }).trim().split(/\s+/);
    if (pids.length !== 1) throw new Error(`expected one running ${app} process`);
    const args = [pids[0], app, bundle, String(reads)];
    if (process.env.OCU_READ_SNAPSHOT) args.push(process.env.OCU_READ_SNAPSHOT);
    out = execFileSync(process.env.OCU_READ_BIN || ".build/release/OCUReadBench", args,
      { encoding: "utf8", env: process.env, timeout: 180000 });
  } else {
    const f = path.join(os.tmpdir(), `ocu-parity-${process.pid}.mjs`);
    fs.writeFileSync(f, code);
    out = execFileSync(process.env.OCU_BIN || "ocu", ["js", "--json", "--timeout", "120000", "--file", f], {
      encoding: "utf8", env: { OPEN_COMPUTER_USE_ACTION_READ_BACK: "0", ...process.env }, timeout: 180000,
    });
    fs.unlinkSync(f);
  }
} finally {
  fs.rmSync(LOCK, { recursive: true, force: true });
}
if (engine === "codex" && process.env.OCU_CODEX_SNAPSHOT) {
  const snapshot = out.match(/SNAPSHOTJSON ("(?:[^"\\]|\\.)*")/);
  if (!snapshot) throw new Error("benchmark snapshot marker missing");
  fs.writeFileSync(process.env.OCU_CODEX_SNAPSHOT, JSON.parse(snapshot[1]));
}
if (engine === "ocu-direct") {
  const result = JSON.parse(out);
  console.log(JSON.stringify({ ...result, evidence: "direct AX tool; signed dev app acceptance pending" }));
  process.exit(0);
}
const m = out.match(/BENCH (\[\[.*?\]\])/s);
if (!m) { console.error("bench: no result\n" + out.slice(0, 2000)); process.exit(1); }
const r = JSON.parse(m[1]);
const ms = r.map((x) => x[0]), chars = r.map((x) => x[1]);
const median = [...ms].sort((a, b) => a - b)[Math.floor(ms.length / 2)];
console.log(JSON.stringify({ engine, app, ocu_bin: engine === "ocu" ? process.env.OCU_BIN || "ocu" : undefined, ms, chars, median_ms: median }));
