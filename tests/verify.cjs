const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const M=require('../model.js'),V=require('../visuals.js');
const range=V.lineBounds([[.5795,.5799]],{mode:'auto'});
assert.ok(range.max-range.min<.001,'Auto scale must reveal small differences');
assert.ok(range.min<.5795&&range.max>.5799);
const constant=V.lineBounds([[.5,.5]],{mode:'auto'});
assert.ok(constant.min<.5&&constant.max>.5);
assert.deepEqual(V.lineBounds([[.2,.3]],{mode:'unit'}),{min:0,max:1});
assert.throws(()=>V.lineBounds([[.5]],{mode:'manual',min:1,max:0}));
assert.throws(()=>V.lineBounds([[.5]],{mode:'manual',min:NaN,max:1}));
assert.throws(()=>V.lineBounds([[.5]],{mode:'manual',min:-1e308,max:1e308}));
const outside=V.lineBounds([[-.3,1.8]],{mode:'auto'});
assert.ok(outside.min<-.3&&outside.max>1.8);
const expected=[0.550194625520953,0.6490184356985064,0.3995154759829952,0.5873508508294983,0.5936591428177516];
for(let i=0;i<5;i++){
 const r=M.simulate(M.makeConfig(i));
 assert.ok(Math.abs(r.final[0]-expected[i])<1e-12);
 const window=V.timeWindow(r,.113,2.777);
 assert.equal(window.times[0],.113);assert.equal(window.times.at(-1),2.777);
 assert.deepEqual(window.values[0],M.sample(r,.113));
 assert.deepEqual(window.values.at(-1),M.sample(r,2.777));
 assert.throws(()=>V.timeWindow(r,2,1));
 const series=M.ids.map((id,j)=>({id,color:'#2863ae',values:window.values.map(row=>row[j])}));
 const svg=V.lineChartSVG(series,window.times,{scale:'auto',chartId:'test-'+i});
 assert.equal((svg.match(/data-series-id=/g)||[]).length,25);
 assert.ok(svg.includes('clipPath'));
 assert.ok(!/NaN|Infinity/.test(svg));
 assert.ok(svg.includes('uᵢ(t)'));
 assert.equal(V.snapshots(r).length,5);
}
const series=[{id:7,color:'#123456',values:[.5795,.5799]}];
const svg=V.lineChartSVG(series,[0,3],{scale:'manual',min:.5794,max:.58,chartId:'zoom'});
const d=svg.match(/data-series-id="7" d="([^"]+)"/)[1];
const points=Array.from(d.matchAll(/[ML]([\d.-]+) ([\d.-]+)/g),m=>[+m[1],+m[2]]);
assert.ok(Math.abs(points[1][1]-points[0][1])>100,'Manual zoom must visibly separate .0004');
assert.ok(V.lineChartSVG(series,[0,3],{scale:'auto',width:560,height:235,chartId:'small'}).includes('viewBox="0 0 560 235"'));
console.log('PASS: auto/unit/manual Y, small differences, constant series, time window, 25 SVG curves, six-factor matrix dynamics, five radars and six disturbance profiles.');

// Regression checks: all 25 u trajectories are finite, plotted, and remain
// inside [0, 1] for the five demonstration presets. All six factors are used;
// the signed factor matrix contributes a centred direct perturbation.
for(let i=0;i<5;i++){
 const c=M.makeConfig(i), r=M.simulate(c);
 assert.deepEqual(c.factors.map(f=>f.type),Array(6).fill('profile'));
 assert.ok(c.factors.every((f,j)=>[0,0.25,0.5,0.75,1].every(x=>M.factor(f,x*c.T,c.T)>=-1e-9&&M.factor(f,x*c.T,c.T)<=1+1e-9)));
 assert.equal(r.values.length,151,'T=3, h=.02 should give 151 time samples');
 assert.equal(r.final.length,25);
 assert.equal(r.domainExit,null,'documented scenario should stay in [0,1]');
 assert.ok(r.values.every(row=>row.length===25&&row.every(Number.isFinite)));
 const before=r.final.slice();
 for(const j of [3,4,5]) {
  const altered=M.clone(c);altered.factors[j]={type:'constant',base:.9,amplitude:0,period:10,phase:0};
  const changed=M.simulate(altered);
  assert.notDeepEqual(changed.final,before,`Fak${j+1} should affect trajectories where matrix links exist`);
 }
 const all=M.ids.map((id,j)=>({id,color:'#2863ae',values:r.values.map(row=>row[j])}));
 const svg=V.lineChartSVG(all,r.times,{scale:'auto',chartId:'all-u-'+i});
 assert.equal((svg.match(/data-series-id=/g)||[]).length,25,'all 25 u curves must be drawn');
 assert.ok(!/NaN|Infinity/.test(svg));
}

// Function coefficients: every one of the 101 functions is a full cubic ax^3+bx^2+cx+d with four non-zero coefficients.
{
 const c=M.makeConfig(0);
 assert.equal(c.functions.length,101);
 assert.deepEqual(c.functions,M.generateFunctions(M.DEFAULT_SEED),'default set is reproducible');
 assert.notDeepEqual(M.generateFunctions(3),c.functions,'another set number gives other coefficients');
 assert.deepEqual(M.FORMS,['cubic']);
 assert.ok(c.functions.every(f=>f.form==='cubic'),'all functions are cubic');
 for(const f of c.functions){
  for(const k of ['a','b','c'])assert.ok(Math.abs(f[k])>=M.COEF_MIN-1e-12,'coefficient '+k+' must be non-zero (cubic, not linear)');
  assert.ok(f.d>0);
  for(let j=0;j<=20;j++){const v=M.poly(f,j/20);assert.ok(v>=M.FN_RANGE.min-1e-12&&v<=M.FN_RANGE.max+1e-12,'f(x) out of range');}
 }
 const distinct=new Set(c.functions.map(f=>JSON.stringify(f)));
 assert.ok(distinct.size>95,'functions must not share one coefficient set');
 for(let i=1;i<5;i++)assert.deepEqual(M.makeConfig(i).functions,c.functions);
 assert.deepEqual(M.makeConfig(0).stars,M.ids.map((_,i)=>i<6?3:1),'u* = 3 for quality, 1 for defects (report)');
 assert.deepEqual(M.normalizeFunction({form:'linear',a:5,b:6,c:1,d:2}),{form:'cubic',a:5,b:6,c:1,d:2},'old forms are read as cubic with the same coefficients');
 // the example projects shipped with the app use the same non-zero cubic set
 for(let i=1;i<=5;i++){
  const p=M.upgradeConfig(JSON.parse(fs.readFileSync(path.join(__dirname,'..','examples','scenario-'+i+'.json'),'utf8')));
  assert.deepEqual(p.functions,c.functions,'scenario-'+i+'.json must hold the current cubic set');
  assert.ok(p.functions.every(f=>['a','b','c','d'].every(k=>f[k]!==0)));
 }
}
// Trajectories are curved, not straight lines: deviation from the chord is a visible share of the range for every u.
for(let i=0;i<5;i++){
 const r=M.simulate(M.makeConfig(i)),n=r.times.length;
 for(let j=0;j<25;j++){
  const col=r.values.map(v=>v[j]),rg=Math.max(...col)-Math.min(...col);if(rg<1e-9)continue;
  const dev=Math.max(...col.map((y,k)=>Math.abs(y-(col[0]+(col[n-1]-col[0])*k/(n-1)))));
  assert.ok(dev/rg>.04,'u'+M.ids[j]+' in scenario '+(i+1)+' is almost a straight line');
 }
}
// Factor signs, transcribed from the report equations (0.1*((Fak_j-0.5)...)): u41 uses Fak6, u57 uses -Fak2 and -Fak6.
{
 const row=id=>M.factorMatrix[M.ids.indexOf(id)];
 assert.deepEqual(row(41),[1,1,0,0,0,1]);
 assert.deepEqual(row(57),[0,-1,0,0,0,-1]);
 assert.deepEqual(row(40),[0,1,1,0,-1,0]);
 assert.deepEqual(row(52),[1,-1,0,1,0,-1]);
 assert.deepEqual(row(8),[0,0,0,0,0,0]);
}
console.log('PASS: 101 full cubic functions (non-zero coefficients, admissible range, reproducible), curved trajectories and factor matrix match the report.');
