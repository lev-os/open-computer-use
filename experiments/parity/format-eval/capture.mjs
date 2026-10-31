#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'../../..');
const dest=path.resolve(process.argv[2]||path.join(os.homedir(),'.local/state/lev/ocu-parity/ocu-read/format-eval'));
if (dest===root||dest.startsWith(root+path.sep)) throw Error('Private capture directory must be outside checkout');
fs.mkdirSync(dest,{recursive:true,mode:0o700});
const fixture=(()=>{try{return execFileSync('pgrep',['-x','OpenComputerUseFixture'],{encoding:'utf8'}).trim();}catch{return '';}})();
const apps=[['discord','Discord'],['brave','Brave Browser'],...(fixture?[['fixture','OpenComputerUseFixture']]:[])];
const manifest={capturedAt:new Date().toISOString(),fixture:fixture?'already running; read only':'not running; omitted',sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),apps:[]};
for (const [id,app] of apps) {
 const entry={id,app,captures:[]};
 for (const format of ['tab4','level','codex']) {
  const file=path.join(dest,`${id}-${format}.txt`);
  const env={CU_ENGINE:'codex',OCU_BIN:path.join(root,'.build/release/OpenComputerUse'),OPEN_COMPUTER_USE_AX_INDENTATION:format,OCU_BENCH_AX_ONLY:'1',OCU_BENCH_MAX_TEXT:'1',[format==='codex'?'OCU_CODEX_SNAPSHOT':'OCU_PRODUCT_SNAPSHOT']:file};
  const args=['/tmp/ocu-gui-relay/run.mjs','--cwd',root,'--timeout','180000'];
  for(const [k,v] of Object.entries(env))args.push('--env',`${k}=${v}`);
  args.push('--','node',path.join(root,'experiments/parity/bench.mjs'),format==='codex'?'codex':'ocu',app,'1');
  const startedAt=new Date().toISOString();
  const output=execFileSync(process.execPath,args,{encoding:'utf8',timeout:190000,maxBuffer:8*1024*1024});
  fs.writeFileSync(path.join(dest,`${id}-${format}.capture.json`),output,{mode:0o600});
  const tree=fs.readFileSync(file,'utf8');fs.chmodSync(file,0o600);
  entry.captures.push({format,startedAt,finishedAt:new Date().toISOString(),file:path.basename(file),chars:tree.length,sha256:createHash('sha256').update(tree).digest('hex'),benchmark:JSON.parse(output)});
 }
 manifest.apps.push(entry);fs.writeFileSync(path.join(dest,'manifest.json'),JSON.stringify(manifest,null,2),{mode:0o600});
 console.log(JSON.stringify({app,formats:entry.captures.map(x=>({format:x.format,chars:x.chars}))}));
}
