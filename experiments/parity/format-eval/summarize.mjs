#!/usr/bin/env node
// Publish only allowlisted numeric results and the public question text.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {score} from './score.mjs';
const dest=path.resolve(process.argv[2]);
const data=JSON.parse(fs.readFileSync(path.join(dest,'results.json')));
const manifest=JSON.parse(fs.readFileSync(path.join(dest,'manifest.json')));
const rows=[];
for(const app of manifest.apps){
 const qs=JSON.parse(fs.readFileSync(path.join(import.meta.dirname,'questions',app.id+'.json')));
 for(const model of ['codex','claude'])for(const format of ['tab4','level','codex']){
  const r=data.rows.find(r=>r.app===app.id&&r.format===format&&r.model===model);
  if(!r||r.error){rows.push({app:app.id,model,format,status:'unmeasured',failureKind:r?.notRun?'skipped after CLI failure':'CLI failure'});continue;}
  assert.equal(r.toolCalls,0);assert.deepEqual(r.configurationWarnings??[],[],'Do not publish a run with unresolved configuration warnings');
  const oracle=JSON.parse(fs.readFileSync(path.join(dest,`${app.id}-${format}.oracle.json`)));
  const answers=JSON.parse(fs.readFileSync(path.join(dest,`${app.id}-${format}-${model}.answers.json`)));
  const checked=score(qs,oracle,answers);assert.equal(checked.correct,r.correct);
  const peer=data.rows.find(x=>x.app===app.id&&x.format===format&&x.model!==model&&!x.error);
  if(peer)assert.equal(peer.promptSha256,r.promptSha256,'Model prompts differ');
  rows.push({app:app.id,model,format,status:'measured',correct:r.correct,total:r.total,inputTokens:r.inputTokens,cachedInputTokens:r.cachedInputTokens,
   wrong:checked.failures.map(f=>({id:f.id,question:f.question,property:f.property,
    expected:f.property==='value'?'[private value]':f.expected,actual:f.property==='value'?'[private value]':f.actual}))});
 }
}
const formats=['tab4','level','codex'];
const aggregate=formats.map(format=>{
 const rs=rows.filter(r=>r.model==='codex'&&r.format===format&&r.status==='measured');
 return {format,correct:rs.reduce((s,r)=>s+r.correct,0),total:rs.reduce((s,r)=>s+r.total,0),inputTokens:rs.reduce((s,r)=>s+r.inputTokens,0)};
});
const size=manifest.apps.map(app=>({app:app.id,...Object.fromEntries(app.captures.map(c=>[c.format,c.chars]))}));
const summary={sourceCommit:manifest.sourceCommit,codexDefaults:data.codexDefaults,rows,aggregate,size};
fs.writeFileSync(path.join(import.meta.dirname,'measurements.json'),JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(path.join(dest,'public-summary.json'),JSON.stringify(summary,null,2),{mode:0o600});
console.log(JSON.stringify({aggregate,size,wrongQuestions:rows.flatMap(r=>(r.wrong??[]).map(f=>`${r.app}/${r.format}/${f.id}`))}));
