#!/usr/bin/env node
// Run the repository's normal checks in the desktop session supplied by the operator.
import { spawnSync } from "node:child_process";
for (const args of [["build"], ["test"]]) {
  const result = spawnSync("swift", args, { cwd: process.cwd(), encoding: "utf8", timeout: 240000 });
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
