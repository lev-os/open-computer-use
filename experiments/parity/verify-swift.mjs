#!/usr/bin/env node
// Run the repository's normal checks in the desktop session supplied by the operator.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const logDir = process.env.OCU_SWIFT_LOG_DIR;
if (logDir) {
  if (!path.isAbsolute(logDir)) throw new Error("OCU_SWIFT_LOG_DIR must be absolute");
  fs.mkdirSync(logDir, { recursive: true, mode: 0o700 });
}
for (const args of [["build"], ["test"]]) {
  const result = spawnSync("swift", args, { cwd: process.cwd(), encoding: "utf8", timeout: 240000 });
  const output = (result.stdout ?? "") + (result.stderr ?? "");
  if (logDir) {
    const file = path.join(logDir, `swift-${args[0]}.log`);
    fs.writeFileSync(file, output, { mode: 0o600 });
    console.log(`swift ${args[0]} exit=${result.status}; full log: ${file}`);
    const lines = output.split("\n").filter(line => /error:| failed|Executed .*tests|Build complete!/.test(line));
    console.log(lines.slice(-12).join("\n"));
  } else {
    process.stdout.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
  }
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
