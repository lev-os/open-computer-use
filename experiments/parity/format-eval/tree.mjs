// A deterministic reader for the three captured full-tree text formats.
// It never asks a model to supply expected answers.
const roles = ['standard window','search text field','secure text field','saved tab group button','menu bar item','menu button','pop up button','radio button','check box','scroll area','scroll bar','tab group','text field','text entry area','text area','static text','disclosure triangle','split group','splitter','web area','HTML content','HTML 内容','combo box','menu bar','menu item','progress indicator','image','button','container','group','toolbar','heading','link','text','list','row','table','column','cell','outline','slider','menu','tab','window','dialog','application','unknown'].sort((a,b)=>b.length-a.length);
const metadata = /,? (?:Label|Help|URL|Identifier|Value|Placeholder|Frame|Secondary Actions): /;
export function parseTree(text,format) {
 if(!['tab4','level','codex'].includes(format))throw Error('Unknown format');
 if(format==='tab4'&&!text.includes('[tab=4 w=settable]'))throw Error('Compact legend missing');
 const nodes=[],stack=[],indexes=new Set();
 for(const [lineIndex,line] of text.split('\n').entries()) {
  const m=line.match(/^([\t ]*)(\d+) (.*)$/);if(!m)continue;
  const [,indent,id,body]=m;
  // Menu entries may omit a role. They still participate in hierarchy.
  const role=roles.find(r=>body===r||body.startsWith(r+' ')||body.startsWith(r+','))??'';
  let rest=role?body.slice(role.length):body;
  const trait=rest.match(/^ \(([^)]*)\)/);if(trait)rest=rest.slice(trait[0].length);
  rest=rest.trimStart();
  const valueMatch=rest.match(format==='codex'?/(?:^|,? )Value: (.*)/:/ = (.*)/);
  const value=valueMatch?valueMatch[1].split(metadata)[0]:null;
  const name=rest.split(metadata)[0].split(' = ')[0];
  const tabs=(indent.match(/\t/g)||[]).length,spaces=indent.length-tabs;
  if(format!=='tab4'&&spaces)throw Error(`Unexpected spaces in level indentation at ${lineIndex+1}`);
  if(format==='tab4'&&!/^\t* {0,3}$/.test(indent))throw Error('Invalid packed indentation');
  const depth=tabs*(format==='tab4'?4:1)+spaces;
  while(stack.length&&stack.at(-1).depth>=depth)stack.pop();
  const parent=stack.at(-1)??null;
  if(parent&&depth!==parent.depth+1)throw Error(`Skipped depth at ${lineIndex+1}`);
  const index=Number(id);if(indexes.has(index))throw Error('Duplicate index');indexes.add(index);
  const traits=trait?trait[1].split(', '):[];
  const node={index,depth,role,name,traits,value,parent:parent?.index??null,children:[],line:lineIndex+1,
   disabled:traits.includes('disabled'),settable:traits.some(t=>t==='settable'||t==='w'||t.startsWith('w:'))};
  if(parent)parent.children.push(index);nodes.push(node);stack.push(node);
 }
 if(!nodes.length)throw Error('No tree nodes');
 return nodes;
}
export function select(nodes,s) {
 let found=nodes.filter(n=>(!s.role||(s.role==='group/container'?['group','container'].includes(n.role):n.role===s.role))&&(!s.name||n.name===s.name));
 if(s.order==='deepest')found.sort((a,b)=>b.depth-a.depth);
 const node=s.order==='last'?found.at(-1):found[(s.ordinal??1)-1];
 if(!node)throw Error(`Selector absent: ${JSON.stringify(s)}`);return node;
}
export function answer(nodes,q) {
 const n=select(nodes,q.selector),byIndex=new Map(nodes.map(n=>[n.index,n])),pos=nodes.indexOf(n);
 const parent=byIndex.get(n.parent);
 switch(q.property) {
 case 'index':return n.index;
 case 'role':return n.role;
 case 'parent':return n.parent;
 case 'grandparent':return parent?.parent??null;
 case 'depth':return n.depth;
 case 'disabled':return n.disabled;
 case 'settable':return n.settable;
 case 'value':return n.value;
 case 'children':return n.children.length;
 case 'firstChild':return n.children[0]??null;
 case 'lastChild':return n.children.at(-1)??null;
 case 'next':return nodes[pos+1]?.index??null;
 case 'previous':return nodes[pos-1]?.index??null;
 case 'afterSubtree':return nodes.slice(pos+1).find(x=>x.depth<=n.depth)?.index??null;
 case 'descendants': {let count=0;for(const other of nodes.slice(pos+1)){if(other.depth<=n.depth)break;count++;}return count;}
 default:throw Error('Unknown question property');
 }
}
