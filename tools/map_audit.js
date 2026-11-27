// 지구본 전수 검사: 지점이 있는 기록마다 기간 동안 그 지점을 포함하는 국경과 표시명을 적는다. 결과는 work/map_audit.txt.
const fs=require('fs'),vm=require('vm'),zlib=require('zlib');
const R=p=>fs.readFileSync(p,'utf8');
const ctx={window:{},console};ctx.window.window=ctx.window;vm.createContext(ctx);
vm.runInContext(R('timeline-content.js').replace(/^/,''),ctx);
vm.runInContext(R('iba-globe-records.js'),ctx);
const W=ctx.window, G=W.IBA_GLOBE_RECORDS;
const load=f=>{const c={document:{currentScript:{}}};vm.createContext(c);vm.runInContext(R(f),c);return c.document.currentScript.ibaMapData;};
const man=load('assets/geography/manifest.js').historical, ko=load('assets/geography/names-ko.js');
const HNP=vm.runInNewContext('('+R('globe.js').match(/const historicalNamePeriods = (\{[\s\S]*?\n  \});/)[1]+')');
const feats=new Map();
for(const c of man.chunks){let d=load('assets/geography/'+c.file);if(typeof d==='string')d=JSON.parse(zlib.gunzipSync(Buffer.from(d,'base64')));for(const f of d.features)feats.set(f.properties.id+'|'+c.file,f);}
const all=[...feats.values()];
function name(p,y){const ag=p.name.startsWith('(')&&p.name.endsWith(')');const s=ag?p.name.slice(1,-1):p.name;const l=HNP[s]?.find(([a,b])=>a<=y&&y<=b)?.[2];const c=l||p.labelKo;if(!c)return ko[p.name]||p.name;return ag?`(${c})`:c;}
const cache=new Map();
function at(pl,y){const k=pl.lat+','+pl.lng+','+y;if(cache.has(k))return cache.get(k);const s=new Set();for(const f of all){const p=f.properties;if(p.start<=y&&y<=p.end&&f.geometry&&G.contains(pl,f.geometry))s.add(name(p,y));}const r=[...s].sort().join('/')||'∅';cache.set(k,r);return r;}
const out=[];
for(const e of W.TIMELINE_DATA.events){if(!W.TIMELINE_DB[e.id])continue;const pls=G.placesForRecord(e.id);if(!pls.length)continue;const b=G.dateBounds(e);if(!b)continue;
 const s=Math.max(b.start,-3400),en=Math.min(b.end,2024);const span=en-s;const step=span<=80?1:Math.ceil(span/80);
 const segs=pls.map(pl=>{const sg=[];for(let y=s;y<=en;y+=step){if(y===0)continue;const v=at(pl,y);if(sg.length&&sg[sg.length-1][0]===v)sg[sg.length-1][2]=y;else sg.push([v,y,y]);}
  if(!(e.year+1>en)){} return pl.label+': '+sg.map(([v,a,z])=>a===z?`${v}@${a}`:`${v}@${a}~${z}`).join(' → ');});
 // nearest year with polygon when initial is empty
 let near='';if(pls.every(pl=>at(pl,e.year)==='∅')){for(let d=1;d<=300;d++){for(const y of [e.year+d,e.year-d]){if(y<-3400||y>2024||y===0)continue;const v=pls.map(pl=>at(pl,y)).filter(v=>v!=='∅');if(v.length){near=` [최근접 ${y}: ${v.join(',')}]`;break;}}if(near)break;}}
 out.push(`${e.id} | ${e.label} | ${e.yearLabel||e.year} | y=${e.year} | ${segs.join(' ; ')}${near}`);}
fs.mkdirSync('work',{recursive:true});fs.writeFileSync('work/map_audit.txt',out.join('\n'));console.log(out.length);
