#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {parseTree,select,answer} from './tree.mjs';
const dest=path.resolve(process.argv[2]);
const manifest=JSON.parse(fs.readFileSync(path.join(dest,'manifest.json')));
const questionsDir=path.join(import.meta.dirname,'questions');fs.mkdirSync(questionsDir,{recursive:true});
const propertyText={index:'What is its element number?',role:'What is its exact displayed role?',parent:'What is its immediate parent element number?',grandparent:'What is its grandparent element number?',depth:'What is its nesting depth, with a root at depth 0?',disabled:'Is it marked disabled?',settable:'Is it marked settable?',value:'What is its explicit Value (Codex) or = value (OCU), excluding later metadata?',children:'How many immediate indexed children does it have?',firstChild:'What is its first immediate child element number?',lastChild:'What is its last immediate child element number?',next:'What is the next indexed element in text order (including children)?',previous:'What is the previous indexed element in text order?',afterSubtree:'What is the first indexed element after its complete subtree?',descendants:'How many indexed descendants are in its complete subtree?'};
const publicNames=['Back','Forward','Reload','Address and search bar','Close','Minimize','Zoom','Search','Inbox','Mute','Deafen','User Settings','Add emoji'];
for(const app of manifest.apps) {
 const trees=Object.fromEntries(app.captures.map(c=>[c.format,parseTree(fs.readFileSync(path.join(dest,c.file),'utf8'),c.format)]));
 const normalized=nodes=>nodes.map(({line,...n})=>n);
 assert.equal(trees.tab4[0].name,trees.codex[0].name,'Different root windows');
 assert.deepEqual(normalized(trees.tab4),normalized(trees.level),'Live native modes differ beyond whitespace');
 const questions=[];
 const add=(selector,properties)=>{for(const property of properties){
  const description=selector.name?`the node with exact role ${JSON.stringify(selector.role)} and exact name ${JSON.stringify(selector.name)}`:`the ${selector.order==='last'?'last':selector.order==='deepest'?'deepest (break ties by first text occurrence)':'first'} node with role ${JSON.stringify(selector.role)}`;
  const q={id:`q${String(questions.length+1).padStart(2,'0')}`,selector,property,text:`For ${description}: ${propertyText[property]}`};
  for(const nodes of Object.values(trees))answer(nodes,q);questions.push(q);
 }};
 const named=publicNames.flatMap(name=>['button','text field','search text field'].flatMap(role=>{
  const s={role,name};return Object.values(trees).every(ns=>ns.filter(n=>n.role===role&&n.name===name).length===1)?[s]:[];
 })).slice(0,2);
 if(!named.length)throw Error('Need at least one common named control');
 for(const s of named)add(s,['index','parent','role','disabled','settable','value','next']);
 add({role:'button'},['index','parent','disabled']);
 add({role:'button',order:'deepest'},['index','parent','grandparent','depth','next','afterSubtree']);
 const textRole=['text field','search text field','text entry area','text area'].find(role=>Object.values(trees).every(ns=>ns.some(n=>n.role===role)));
 if(textRole)add({role:textRole},['index','parent','settable','value']);
 const listRole=['list','outline','table','group/container'].find(role=>Object.values(trees).every(ns=>{try{return select(ns,{role}).children.length>0}catch{return false;}}));
 add({role:listRole},['index','children','firstChild','lastChild','descendants','afterSubtree']);
 add({role:'group/container',order:'deepest'},['index','parent','grandparent','depth','previous','children']);
 assert(questions.length>=20);
 fs.writeFileSync(path.join(questionsDir,`${app.id}.json`),JSON.stringify(questions,null,2)+'\n');
 for(const [format,nodes] of Object.entries(trees)) {
  fs.writeFileSync(path.join(dest,`${app.id}-${format}.oracle.json`),JSON.stringify(Object.fromEntries(questions.map(q=>[q.id,answer(nodes,q)])),null,2),{mode:0o600});
  fs.writeFileSync(path.join(dest,`${app.id}-${format}.parsed.json`),JSON.stringify(nodes,null,2),{mode:0o600});
 }
 console.log(JSON.stringify({app:app.id,questions:questions.length,nodes:Object.fromEntries(Object.entries(trees).map(([k,v])=>[k,v.length])),named:named.map(s=>s.name),nativeModesEqual:true}));
}
