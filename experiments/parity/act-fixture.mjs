#!/usr/bin/env node
// Build and launch the checkout fixture with a distinct app name. OCU normally
// recognizes OpenComputerUseFixture by name and uses its synthetic command bridge.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const contents = path.join(root, '.build/ActionParityFixture.app/Contents');
const executable = path.join(contents, 'MacOS/ActionParityFixture');
const statePath = path.join(os.tmpdir(), 'open-computer-use-fixture/state.json');
const mode = process.argv[2];
const close = mode === 'close';
if (process.argv.length > 3 || (mode && !['close', 'ignore-wheel', 'reject-values'].includes(mode))) throw new Error('usage: node act-fixture.mjs [close|ignore-wheel|reject-values]');
const lock = '/tmp/ocu-parity.lock';
// Serialize preparation/cleanup with reads and actions without stealing a lock.
for (const deadline = Date.now() + 600000;;) {
  try { fs.mkdirSync(lock); break; } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    if (Date.now() >= deadline) throw new Error('Fixture lock held for ten minutes');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
try {
  fs.writeFileSync(path.join(lock, 'owner.json'), JSON.stringify({ pid: process.pid, task: close ? 'close fixture' : 'prepare fixture' }));
  let running;
  try {
    const candidate = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    const command = execFileSync('ps', ['-p', String(candidate.processIdentifier), '-o', 'comm='], { encoding: 'utf8' }).trim();
    if (command === executable) running = candidate.processIdentifier;
    else throw new Error('Exported fixture belongs to another process; leave it alone');
  } catch (error) {
    if (error.message.includes('belongs to another')) throw error;
    // A missing file or a dead exported PID is expected after closing a fixture.
    if (error.code !== 'ENOENT' && error.status !== 1) throw error;
  }
  if (close) {
    if (running) {
      process.kill(running, 'SIGTERM');
      for (const deadline = Date.now() + 5000;;) {
        try { process.kill(running, 0); } catch (error) {
          if (error.code === 'ESRCH') break;
          throw error;
        }
        if (Date.now() >= deadline) throw new Error('Own fixture did not exit within five seconds');
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    console.log(running ? 'Closed own fixture' : 'Own fixture is not running');
  } else if (running) {
    if (mode) throw new Error('Close own fixture before selecting a test mode');
    console.log('Own fixture already running: ' + running);
  } else {
    execFileSync('swift', ['build', '--product', 'OpenComputerUseFixture'], { cwd: root, stdio: 'inherit' });
    const bin = execFileSync('swift', ['build', '--show-bin-path'], { cwd: root, encoding: 'utf8' }).trim();
    fs.mkdirSync(path.dirname(executable), { recursive: true });
    fs.copyFileSync(path.join(bin, 'OpenComputerUseFixture'), executable);
    fs.chmodSync(executable, 0o755);
    fs.writeFileSync(path.join(contents, 'Info.plist'), `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleIdentifier</key><string>dev.opencodex.opencomputeruse.fixture.act</string>
<key>CFBundleName</key><string>ActionParityFixture</string>
<key>CFBundleDisplayName</key><string>ActionParityFixture</string>
<key>CFBundleExecutable</key><string>ActionParityFixture</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>NSHighResolutionCapable</key><true/>
</dict></plist>\n`);
    execFileSync('open', [path.dirname(contents), '--args', ...(mode ? ['--' + mode] : [])]);
    console.log('Launched own fixture: ' + path.dirname(contents));
  }
} finally {
  fs.rmSync(lock, { recursive: true });
}
