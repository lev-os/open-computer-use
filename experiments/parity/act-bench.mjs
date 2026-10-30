#!/usr/bin/env node
// node experiments/parity/act-bench.mjs <codex|ocu> [runs=3]
// OCU_BIN: native executable (or npm ocu launcher); default: ocu.
// OCU_ACTION_READ_BACK: default (bounded), 1 (full) or 0. Codex keeps its default.
// Uses only the running checkout fixture. Never points at an arbitrary app.
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { fixtureInputValue } from './act-value.mjs';

const [engine, runArg = '3'] = process.argv.slice(2);
const runs = Number(runArg);
if (!['codex', 'ocu'].includes(engine) || !Number.isInteger(runs) || runs < 1 || runs > 3) {
  console.error('usage: node act-bench.mjs <codex|ocu> [runs=1..3]'); process.exit(2);
}
const app = 'dev.opencodex.opencomputeruse.fixture.act';
const expectedExecutable = fileURLToPath(new URL('../../.build/ActionParityFixture.app/Contents/MacOS/ActionParityFixture', import.meta.url));
const fixtureState = path.join(os.tmpdir(), 'open-computer-use-fixture/state.json');
const lock = '/tmp/ocu-parity.lock';
let native;
// Compatible with bench.mjs's mkdir lock. Wait in this supervisor, never steal it.
const lockDeadline = Date.now() + 600000;
for (;;) {
  try { fs.mkdirSync(lock); break; } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    if (Date.now() >= lockDeadline) throw new Error(`Benchmark lock held for ten minutes: ${lock}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
try {
  fs.writeFileSync(path.join(lock, 'owner.json'), JSON.stringify({ pid: process.pid, engine, started: new Date().toISOString() }));

  let fixture;
  for (let deadline = Date.now() + 5000;;) {
    try {
      fixture = JSON.parse(fs.readFileSync(fixtureState, 'utf8'));
      process.kill(fixture.processIdentifier, 0);
      const executable = execFileSync('ps', ['-p', String(fixture.processIdentifier), '-o', 'comm='], { encoding: 'utf8' }).trim();
      if (executable !== expectedExecutable) throw new Error('Fixture is not the isolated real-input bundle');
      break;
    } catch (error) {
      if (Date.now() >= deadline) throw error;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  const dragPad = fixture.elements.find(e => e.identifier === 'fixture-drag-pad').frame;
  const drag = [[dragPad.x + 20, dragPad.y + 30], [dragPad.x + 100, dragPad.y + 40]];
  // This exact sequence executes in each engine session. Startup is outside timers.
  async function sequence(a, count, points, windowWidth, checkMode, inputValue) {
    var rows = [];
    var state = String(await a.getAXState({ emit: false, disableDiffing: true }));
    // Coordinate actions use screenshot pixels, fixture frames use window points.
    var image = await a.getScreenshot({ emit: false });
    var width;
    if (image[0] === 137 && image[1] === 80) {
      width = ((image[16] << 24) | (image[17] << 16) | (image[18] << 8) | image[19]) >>> 0;
    }
    if (image[0] === 255 && image[1] === 216) {
      for (var offset = 2; offset + 9 < image.length;) {
        if (image[offset] !== 255) { offset++; continue; }
        var marker = image[offset + 1];
        if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {
          width = image[offset + 7] * 256 + image[offset + 8]; break;
        }
        if (marker === 218 || marker === 217) break;
        offset += 2 + image[offset + 2] * 256 + image[offset + 3];
      }
    }
    var coordinateError = !width ? 'Cannot verify screenshot pixel scale; drag skipped' : null;
    var scale = width ? width / windowWidth : 1;
    function find(id) {
      var line = state.split('\n').find(l => l.includes(id));
      var match = line?.match(/^\s*(\d+)\s/);
      if (!match) throw new Error('Fixture element missing: ' + id);
      return Number(match[1]);
    }
    async function step(run, name, action, skipRead = false) {
      var previousState = state;
      var t = Date.now(), error = null, returned;
      try { returned = await action(); } catch (e) { error = String(e.message || e); }
      var actionMs = Date.now() - t;
      t = Date.now();
      var readError = null;
      try { if (!skipRead) state = String(await a.getAXState({ emit: false, disableDiffing: true })); }
      catch (e) { readError = String(e.message || e); }
      var verified = null;
      if (!error && !readError && !skipRead) {
        if (name === 'chainText') verified = inputValue(state) === 'xchain!';
        if (name === 'clearValue') verified = inputValue(state) === '';
        if (name === 'click') verified = /focused UI element[^\n]*fixture-input/.test(state);
        if (name === 'pressKey') verified = inputValue(state) === 'x';
        if (name === 'typeText') verified = inputValue(state) === 'xparity-' + run;
        if (name === 'setValue') verified = inputValue(state) === 'verified-' + run;
        if (name === 'clickCounter') verified = Number(state.match(/Counter: (\d+)/)?.[1]) === Number(previousState.match(/Counter: (\d+)/)?.[1]) + 1;
        if (name === 'scroll') {
          var beforeOffset = previousState.match(/Scroll offset: ([-\d]+)/)?.[1];
          var afterOffset = state.match(/Scroll offset: ([-\d]+)/)?.[1];
          verified = beforeOffset !== undefined && afterOffset !== undefined && beforeOffset !== afterOffset;
        }
        if (name === 'drag') verified = /Last drag: from/.test(state) && state.match(/Last drag:[^\n]*/)?.[0] !== previousState.match(/Last drag:[^\n]*/)?.[0];
      }
      if (name.startsWith('reject')) verified = Boolean(error) && !readError;
      rows.push({ run, action: name, action_ms: actionMs, read_ms: Date.now() - t, verified, screenshot_width: width || null,
        error, read_error: readError, result: typeof returned === 'string' ? returned.slice(0, 200) : typeof returned,
        state });
    }
    if (checkMode === 'chain') {
      var input = find('fixture-input');
      await step(0, 'chainText', async () => {
        await a.setValue(input, '');
        await a.click(input);
        await a.pressKey('x');
        await a.typeText('chain');
        await a.typeText('!');
      });
      return rows;
    }
    if (checkMode === 'cursor-reset') {
      await step(0, 'click', () => a.click(find('fixture-input')), true);
      await step(0, 'resetCursor', () => a.endTurn(), true);
      await new Promise(resolve => setTimeout(resolve, 250));
      return rows;
    }
    if (checkMode === 'reject-values') {
      await step(0, 'rejectIgnoredValue', () => a.setValue(find('fixture-input'), 'must-not-apply'));
      return rows;
    }
    if (checkMode === 'ignore-wheel') {
      await step(0, 'rejectWheelScroll', () => a.scroll(find('fixture-scroll-view'), 'up', 0.5));
      return rows;
    }
    for (var i = 0; i < count; i++) {
      await step(i, 'clearValue', () => a.setValue(find('fixture-input'), ''));
      await step(i, 'click', () => a.click(find('fixture-input')));
      await step(i, 'pressKey', () => a.pressKey('x'));
      await step(i, 'typeText', () => a.typeText('parity-' + i));
      await step(i, 'setValue', () => a.setValue(find('fixture-input'), 'verified-' + i));
      await step(i, 'clickCounter', () => a.click(find('fixture-increment')));
      await step(i, 'scroll', () => a.scroll(find('fixture-scroll-view'), Number(state.match(/Scroll offset: ([-\d]+)/)?.[1]) > 0 ? 'down' : 'up', 1));
      await step(i, 'drag', () => {
        if (coordinateError) throw new Error(coordinateError);
        return a.drag(points[0].map(v => v * scale), [(points[1][0] + i * 5) * scale, points[1][1] * scale]);
      });
    }
    if (checkMode === 'standard') {
      await step(count, 'rejectReadonlyValue', () => a.setValue(find('fixture-counter-label'), 'must-not-apply'));
      await step(count, 'rejectInvalidScroll', () => a.scroll(find('fixture-input'), 'down', 0.5));
      await step(count, 'rejectZeroDrag', () => a.drag(points[0], points[0]));
    }
    return rows;
  }

  class NativeSession {
    constructor() {
      this.id = 0; this.pending = new Map();
      const nativeEnv = { ...process.env, OPEN_COMPUTER_USE_ALLOW_GLOBAL_POINTER_FALLBACKS: '0' };
      if (!process.env.OCU_ACTION_READ_BACK || process.env.OCU_ACTION_READ_BACK === 'default') delete nativeEnv.OPEN_COMPUTER_USE_ACTION_READ_BACK;
      else nativeEnv.OPEN_COMPUTER_USE_ACTION_READ_BACK = process.env.OCU_ACTION_READ_BACK;
      this.child = spawn(process.env.OCU_BIN || 'ocu', ['mcp'], { stdio: ['pipe', 'pipe', 'pipe'], env: nativeEnv });
      this.stderr = '';
      this.child.stderr.on('data', d => { this.stderr = (this.stderr + d).slice(-4000); });
      const fail = e => { for (const p of this.pending.values()) { clearTimeout(p.timer); p.reject(e); } this.pending.clear(); };
      this.child.on('error', fail);
      this.child.on('exit', code => fail(new Error(`OCU exited ${code}: ${this.stderr}`)));
      readline.createInterface({ input: this.child.stdout }).on('line', line => {
        let m; try { m = JSON.parse(line); } catch { return; }
        const p = this.pending.get(m.id); if (!p) return;
        clearTimeout(p.timer); this.pending.delete(m.id);
        if (m.error) p.reject(new Error(JSON.stringify(m.error))); else p.resolve(m.result);
      });
    }
    rpc(method, params) {
      const id = ++this.id;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`${method} timed out`)); }, 30000);
        this.pending.set(id, { resolve, reject, timer });
        this.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
      });
    }
    async call(name, args = {}) {
      const r = await this.rpc('tools/call', { name, arguments: { app, ...args } });
      this.image = (r.content || []).find(c => c.type === 'image');
      const text = (r.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
      if (r.isError) throw new Error(text);
      return text;
    }
    facade() {
      return {
        endTurn: async () => {
          const file = process.env.OPEN_COMPUTER_USE_VISUAL_CURSOR_OBSERVATION_FILE;
          const before = file && fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
          this.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/turn-ended' }) + '\n');
          await this.rpc('ping', {});
          return before;
        },
        getAXState: () => this.call('get_app_state'),
        getScreenshot: () => { if (process.env.ACT_BENCH_CAPTURE && this.image) fs.writeFileSync('.build/act-fixture-ocu.image', Buffer.from(this.image.data, 'base64')); if (!this.image) throw new Error('OCU returned no screenshot'); return Uint8Array.from(Buffer.from(this.image.data, 'base64')); },
        click: i => this.call('click', { element_index: String(i) }),
        pressKey: key => this.call('press_key', { key }),
        typeText: text => this.call('type_text', { text }),
        setValue: (i, value) => this.call('set_value', { element_index: String(i), value }),
        scroll: (i, direction, pages) => this.call('scroll', { element_index: String(i), direction, pages }),
        drag: (from, to) => this.call('drag', { from_x: from[0], from_y: from[1], to_x: to[0], to_y: to[1] }),
      };
    }
    async close() {
      if (this.child.exitCode !== null) return;
      await new Promise(resolve => {
        const timer = setTimeout(() => { this.child.kill(); resolve(); }, 1000);
        this.child.once('exit', () => { clearTimeout(timer); resolve(); });
        this.child.stdin.end();
      });
    }
  }

  let rows;
  if (engine === 'codex') {
    const cu = path.join(os.homedir(), '.agents/skills/tools/references/computer-use/scripts/cu.mjs');
    const code = `var actFixture = await cua.getApp(${JSON.stringify(app)});\n${process.env.ACT_BENCH_CAPTURE ? 'await shot(actFixture, "act-fixture-current");' : ''}\nvar actionRows = await (${sequence.toString()})(actFixture, ${runs}, ${JSON.stringify(drag)}, ${fixture.windowBounds.width}, ${JSON.stringify(process.env.OCU_CHECK_MODE || '')}, ${fixtureInputValue.toString()});\nnodeRepl.write('ACT_BENCH ' + JSON.stringify(actionRows));`;
    execFileSync('node', [cu, 'reset'], { encoding: 'utf8', env: { ...process.env, CU_ENGINE: 'codex' }, timeout: 30000 });
    let output = execFileSync('node', [cu, 'js', code], { encoding: 'utf8', env: { ...process.env, CU_ENGINE: 'codex' }, timeout: 180000, maxBuffer: 8 * 1024 * 1024 });
    const spilled = output.match(/full text in (\S+?\.txt)/);
    if (spilled) output = fs.readFileSync(spilled[1], 'utf8');
    const result = output.split('\n').find(l => l.startsWith('ACT_BENCH '));
    if (!result) throw new Error('No Codex benchmark result: ' + output.slice(0, 2000));
    rows = JSON.parse(result.slice(10));
  } else {
    native = new NativeSession();
    await native.rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'act-bench', version: '1' } });
    rows = await sequence(native.facade(), runs, drag, fixture.windowBounds.width, process.env.OCU_CHECK_MODE || '', fixtureInputValue);
  }
  const idle = Math.min(5000, Math.max(0, Number(process.env.ACT_BENCH_IDLE_MS || 0)));
  if (idle) await new Promise(resolve => setTimeout(resolve, idle));
  const observationPath = process.env.OPEN_COMPUTER_USE_VISUAL_CURSOR_OBSERVATION_FILE;
  const cursorObservation = observationPath && fs.existsSync(observationPath) ? JSON.parse(fs.readFileSync(observationPath, 'utf8')) : null;
  const finalState = JSON.parse(fs.readFileSync(fixtureState, 'utf8'));
  if (finalState.processIdentifier !== fixture.processIdentifier) throw new Error('Fixture oracle changed process during the benchmark');
  const summary = Object.fromEntries([...new Set(rows.map(r => r.action))].map(action => {
    const samples = rows.filter(r => r.action === action);
    const median = field => [...samples].sort((a, b) => a[field] - b[field])[Math.floor(samples.length / 2)][field];
    return [action, { action_ms: samples.map(r => r.action_ms), median_action_ms: median('action_ms'), read_ms: samples.map(r => r.read_ms), median_read_ms: median('read_ms'), errors: samples.filter(r => r.error || r.read_error).length, verified_effects: samples.filter(r => r.verified === true).length, unchanged_or_unverified_effects: samples.filter(r => r.verified === false).length }];
  }));
  console.log(JSON.stringify({ engine, app, runs, ocu_bin: engine === 'ocu' ? process.env.OCU_BIN || 'ocu' : null,
    action_read_back: engine === 'ocu' ? process.env.OCU_ACTION_READ_BACK || 'native default' : 'engine default',
    visual_cursor: process.env.OPEN_COMPUTER_USE_VISUAL_CURSOR || 'engine default',
    global_pointer_fallbacks: engine === 'ocu' ? 'disabled by benchmark' : 'engine default',
    before_fixture: fixture, after_fixture: finalState, cursor_observation: cursorObservation, native_timing: process.env.OPEN_COMPUTER_USE_DEBUG_TIMING || process.env.OPEN_COMPUTER_USE_DEBUG_ROUTING ? native?.stderr : undefined, summary, rows }));
} finally {
  await native?.close();
  fs.rmSync(lock, { recursive: true });
}
