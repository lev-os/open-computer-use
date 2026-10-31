import assert from 'node:assert/strict';
export function extractAnswers(text) {
 const clean=text.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');
 const parsed=JSON.parse(clean);
 assert(parsed&&typeof parsed==='object'&&!Array.isArray(parsed),'Expected answer object');
 return parsed;
}
export function score(questions,oracle,responses) {
 const failures=[];
 for(const q of questions) {
  const expected=oracle[q.id],actual=responses[q.id];
  if(JSON.stringify(expected)!==JSON.stringify(actual))failures.push({id:q.id,question:q.text,property:q.property,expected:expected??null,actual:actual??null,missing:actual===undefined});
 }
 const extra=Object.keys(responses).filter(k=>!questions.some(q=>q.id===k));
 return {correct:questions.length-failures.length,total:questions.length,accuracy:(questions.length-failures.length)/questions.length,failures,extra};
}
