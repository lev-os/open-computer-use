#!/usr/bin/env node
// Run the repository's real ocu js launcher with the selected built native product.
import path from "node:path";
import { main } from "../../scripts/node-repl/open-computer-use-cli.mjs";
const root = path.resolve(import.meta.dirname, "../..");
const binary = process.env.OCU_BIN;
if (!binary || !path.isAbsolute(binary)) throw new Error("OCU_BIN must name the absolute built native product");
const relative = path.relative(root, binary);
if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("native product must be inside this checkout");
process.exitCode = await main({ packageRoot: root,
  platformPackages: { [`${process.platform}-${process.arch}`]: { executablePath: relative.split(path.sep) } },
  argv: process.argv.slice(2), env: { ...process.env, OPEN_COMPUTER_USE_DISABLE_APP_AGENT_PROXY: "1" } });
