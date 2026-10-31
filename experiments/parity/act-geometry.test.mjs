import test from 'node:test';
import assert from 'node:assert/strict';
import { dragGeometryFromObservation } from './act-geometry.mjs';
function png(w,h) { const b=new Uint8Array(24); b[0]=137;b[1]=80;new DataView(b.buffer).setUint32(16,w);new DataView(b.buffer).setUint32(20,h);return b; }
const value={v:1,pid:1,win:2,bounds:[160,248,640,678],pad:[20,538,320,120],r:null};
const text='Last drag: none OCU_DRAG_V1 '+JSON.stringify(value);
test('reads post-layout geometry and separate axis scales',()=>{
 const g=dragGeometryFromObservation(text,png(1208,1280));assert.deepEqual(g.pad,[20,538,320,120]);
 assert.equal(g.scaleX,1208/640);assert.equal(g.scaleY,1280/678);assert.notEqual(g.scaleX,g.scaleY);
});
test('pre-layout image cannot pair with settled geometry',()=>assert.throws(()=>dragGeometryFromObservation(text,png(1280,1304)),/do not match/));
test('missing or malformed live geometry fails closed',()=>{assert.throws(()=>dragGeometryFromObservation('old exported frame'));assert.throws(()=>dragGeometryFromObservation('OCU_DRAG_V1 {}'));});
