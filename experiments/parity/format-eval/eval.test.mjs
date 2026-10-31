import test from 'node:test';import assert from 'node:assert/strict';
import {parseTree,answer} from './tree.mjs';import {extractAnswers,score} from './score.mjs';
const logical=[
 {index:0,depth:0,body:'standard window Fixture'},
 {index:1,depth:1,body:'group'},
 {index:2,depth:2,body:'list Items'},
 {index:3,depth:3,body:'group'},
 {index:4,depth:4,body:'button (disabled) Back'},
 {index:5,depth:4,body:'text field (w:str) Editor = literal=Value: kept, Placeholder: Type'},
 {index:6,depth:3,body:'button Next'},
 {index:7,depth:1,body:'button Close'},
];
const render=format=>(format==='tab4'?'[tab=4 w=settable]\n':'[w=settable]\n')+logical.map(n=>{
 const indent=format==='tab4'?'\t'.repeat(Math.floor(n.depth/4))+' '.repeat(n.depth%4):'\t'.repeat(n.depth);
 return indent+n.index+' '+(format==='codex'?n.body.replace('group','container').replace('(w:str)','(settable)').replace(' = ', ', Value: '):n.body);
}).join('\n');
for(const format of ['tab4','level','codex'])test(`${format}: explicit independent hierarchy and metadata oracle`,()=>{
 const ns=parseTree(render(format),format);
 assert.deepEqual(ns.map(n=>[n.index,n.depth,n.parent,n.children]),[[0,0,null,[1,7]],[1,1,0,[2]],[2,2,1,[3,6]],[3,3,2,[4,5]],[4,4,3,[]],[5,4,3,[]],[6,3,2,[]],[7,1,0,[]]]);
 const q=(selector,property)=>answer(ns,{selector,property});
 assert.equal(q({role:'button',name:'Back'},'disabled'),true);
 assert.equal(q({role:'text field'},'settable'),true);
 assert.equal(q({role:'text field'},'value'),'literal=Value: kept');
 assert.equal(q({role:'list'},'children'),2);
 assert.equal(q({role:'list'},'descendants'),4);
 assert.equal(q({role:'list'},'afterSubtree'),7);
 assert.equal(q({role:'button',order:'deepest'},'grandparent'),2);
});
test('scorer rejects stringified numbers, missing answers and malformed JSON',()=>{
 const questions=[{id:'q1',text:'index?',property:'index'},{id:'q2',text:'flag?',property:'disabled'}];
 assert.equal(score(questions,{q1:4,q2:false},extractAnswers('{"q1":4,"q2":false}')).correct,2);
 assert.equal(score(questions,{q1:4,q2:false},{q1:'4'}).correct,0);
 assert.throws(()=>extractAnswers('not JSON'));
});
test('parser rejects wrong indentation, missing legend and duplicate indexes',()=>{
 assert.throws(()=>parseTree('0 group\n   1 button Wrong','level'));
 assert.throws(()=>parseTree('0 group','tab4'));
 assert.throws(()=>parseTree('0 group\n\t0 button Same','level'));
});
