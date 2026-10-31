#!/usr/bin/env node
// Read app-agent routing metadata without sending a GUI tool call.
import net from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
const namespace = process.env.OPEN_COMPUTER_USE_AGENT_SOCKET_NAMESPACE?.trim();
const terminate = process.argv[2] === '--terminate-owned';
if (terminate && !namespace?.startsWith('ocu-act-product-')) throw Error('Only a lane-owned diagnostic namespace can be terminated');
const name = namespace ? 'open-computer-use-agent-' + crypto.createHash('sha256').update(namespace).digest('hex').slice(0,16) + '.sock' : 'open-computer-use-agent.sock';
const socketPath = path.join(os.tmpdir(), name);
const socket = net.connect(socketPath);
let buffer = '';
const timer = setTimeout(() => { socket.destroy(); throw Error('agentInfo timed out'); }, 5000);
socket.on('error', error => { clearTimeout(timer); console.error(error.message); process.exitCode=1; });
socket.on('connect', () => socket.write(JSON.stringify({kind:'agentInfo'})+'\n'));
socket.on('data', chunk => {
  buffer += chunk;
  const end = buffer.indexOf('\n'); if (end < 0) return;
  const info = JSON.parse(buffer.slice(0,end)); buffer=buffer.slice(end+1);
  clearTimeout(timer);
  if (info.executableURL && fs.existsSync(info.executableURL)) {
    info.executable_sha256 = crypto.createHash('sha256').update(fs.readFileSync(info.executableURL)).digest('hex');
    info.executable_modified = fs.statSync(info.executableURL).mtime.toISOString();
  }
  console.log(JSON.stringify({socket:socketPath,namespace:namespace||null,agent:info}));
  if (terminate) socket.end(JSON.stringify({kind:'terminate'})+'\n'); else socket.end();
  socket.removeAllListeners('data'); socket.resume();
});
