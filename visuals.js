// (function(root){
// 'use strict';
// const M=typeof module!=='undefined'?require('./model.js'):root.ISO;
// const fractions=[0,.25,.5,.75,1];
// const titles=['Начальное состояние','Первая четверть','Вторая четверть','Третья четверть','Конечное состояние'];
// const fmt=v=>Number(v).toLocaleString('ru-RU',{maximumFractionDigits:4});
// const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// function snapshots(result){return fractions.map((fraction,i)=>({fraction,title:titles[i],time:result.config.T*fraction,values:M.sample(result,result.config.T*fraction)}));}
// function bounds(views){let min=0,max=1;for(const view of views)for(const v of view.values){min=Math.min(min,v);max=Math.max(max,v);}return {min,max};}

// function radarSVG(values,range,targets,{title=''}={}){
//  const W=720,H=650,cx=360,cy=320,R=248,n=M.ids.length;
//  const point=(i,r)=>{const a=-Math.PI/2+2*Math.PI*i/n;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r];};
//  const radius=v=>R*(v-range.min)/(range.max-range.min||1);
//  const xy=p=>p.map(v=>v.toFixed(2)).join(',');
 
//  let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><desc>25 характеристик u. Красная линия — расчётные значения. Пунктир — целевые пороги. Общая шкала ${fmt(range.min)} … ${fmt(range.max)}.</desc><rect width="${W}" height="${H}" fill="white"/><text x="${cx}" y="24" text-anchor="middle" font-family="Arial" font-size="16" fill="#26384a">${esc(title)}</text>`;
 
//  svg+=`<path d="M280,625h22" stroke="#c44343" stroke-width="2"/><text x="308" y="629" font-family="Arial" font-size="12" fill="#26384a">Расчётные u(t)</text>`;
//  svg+=`<path d="M450,625h22" stroke="#e59e37" stroke-width="2" stroke-dasharray="4 4"/><text x="478" y="629" font-family="Arial" font-size="12" fill="#26384a">Целевой порог</text>`;

//  for(let k=0;k<=4;k++){
//   const r=R*k/4,v=range.min+(range.max-range.min)*k/4;
//   svg+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ccd3da"/><text x="${cx+6}" y="${cy-r-5}" font-size="12" fill="#586675">${fmt(v)}</text>`;
//  }

//  M.ids.forEach((id,i)=>{
//    const end=point(i,R),label=point(i,R+26);
//    svg+=`<g data-axis="${id}"><title>u${id} · ${esc(M.names[i])}; t: ${fmt(values[i])}; порог: ${fmt(targets[i])}</title><path d="M${cx},${cy}L${xy(end)}" stroke="#d9dfe5"/><text x="${label[0].toFixed(2)}" y="${label[1].toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="14" fill="#26384a">u<tspan baseline-shift="sub" font-size="10">${id}</tspan></text></g>`;
//  });

//  const targetPoints = targets.map((t, i) => point(i, radius(t)));
//  svg+=`<polygon data-radar-series="threshold" points="${targetPoints.map(p=>xy(p)).join(' ')}" fill="none" stroke="#e59e37" stroke-width="2" stroke-dasharray="5 5"/>`;
//  targets.forEach((t, i) => {
//    const p = point(i, radius(t));
//    svg+=`<circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="3" fill="#e59e37"/>`;
//  });

//  const series = `<polygon data-radar-series="current" points="${values.map((v,i)=>xy(point(i,radius(v)))).join(' ')}" fill="#c44343" fill-opacity=".045" stroke="#c44343" stroke-width="2"/>`;
//  svg+=series;

//  values.forEach((v,i)=>{
//    const p=point(i,radius(v));
//    svg+=`<circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="3.5" fill="#c44343"><title>u${M.ids[i]} · ${esc(M.names[i])}: ${fmt(v)}</title></circle>`;
//  });

//  return svg+'</svg>';
// }

// const lineLayout={width:900,left:68,right:110,top:30,bottom:44};
// function lineBounds(rows,{mode='auto',min,max}={}){
//  if(mode==='manual'){
//   if(!Number.isFinite(min)||!Number.isFinite(max)||!Number.isFinite(max-min)||max<=min)throw Error('Граница Y max должна быть больше Y min; обе границы должны быть конечными числами.');
//   return {min,max};
//  }
//  let lo=Infinity,hi=-Infinity;
//  for(const row of rows)for(const v of row){if(!Number.isFinite(v))throw Error('На графике обнаружено нечисловое значение.');lo=Math.min(lo,v);hi=Math.max(hi,v);}
//  if(!Number.isFinite(lo))return {min:0,max:1};
//  if(mode==='unit')return {min:Math.min(0,lo),max:Math.max(1,hi)};
//  const pad=hi>lo?(hi-lo)*.08:Math.max(.0001,Math.abs(lo)*.01);
//  return {min:lo-pad,max:hi+pad};
// }
// function timeWindow(result,from,to){
//  if(!Number.isFinite(from)||!Number.isFinite(to)||from<0||to>result.config.T||to<=from)throw Error('Задайте интервал 0 ≤ t от < t до ≤ T.');
//  const times=[from],values=[M.sample(result,from)];
//  result.times.forEach((t,i)=>{if(t>from&&t<to){times.push(t);values.push(result.values[i].slice());}});
//  times.push(to);values.push(M.sample(result,to));return {times,values};
// }
// function niceStep(raw){const p=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/p;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p;}
// function niceTicks(lo,hi,target=5){
//  if(!(hi>lo))return {step:1,ticks:[lo]};
//  const step=niceStep((hi-lo)/target),ticks=[];
//  for(let k=Math.ceil(lo/step-1e-9);k*step<=hi+step*1e-9;k++)ticks.push(Number((k*step).toPrecision(12)));
//  return {step,ticks};
// }
// function niceRange(lo,hi,target=5){
//  if(!(hi>lo))return {min:lo,max:hi};
//  const step=niceStep((hi-lo)/target);
//  return {min:Number((Math.floor(lo/step+1e-9)*step).toPrecision(12)),max:Number((Math.ceil(hi/step-1e-9)*step).toPrecision(12))};
// }
// function tickDecimals(step){for(let d=0;d<=10;d++){const q=step*Math.pow(10,d);if(Math.abs(q-Math.round(q))<1e-7)return d;}return 10;}

// function lineChartSVG(series,times,{height=320,width=900,scale='auto',min,max,threshold=null,yLabel='',chartId='main',interactive=false,showLabels=false}={}){
//  const {left:L,right:R,top:TOP,bottom:B}=lineLayout,H=height,W=width;
//  let range=lineBounds(series.map(s=>s.values),{mode:scale,min,max});
//  const yTarget=Math.max(4,Math.round((H-TOP-B)/55));
//  if(scale==='auto'&&range.max>range.min)range=niceRange(range.min,range.max,yTarget);
//  const span=range.max-range.min;
//  const from=times[0],to=times.at(-1);
//  if(!Number.isFinite(from)||!Number.isFinite(to)||to<=from)throw Error('Некорректная ось времени.');
//  const x=t=>L+(W-L-R)*(t-from)/(to-from),y=v=>TOP+(H-TOP-B)*(range.max-v)/span;
//  const yt=niceTicks(range.min,range.max,yTarget),xt=niceTicks(from,to,Math.max(4,Math.round((W-L-R)/110)));
//  const yd=tickDecimals(yt.step),xd=tickDecimals(xt.step);
//  const label=(v,d)=>Number(v).toLocaleString('ru-RU',{minimumFractionDigits:d,maximumFractionDigits:d});
//  const clip='plot-'+String(chartId).replace(/[^a-zA-Z0-9_-]/g,'');
//  let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="aspect-ratio:${W}/${H}" role="img" aria-label="; t от ${from} до ${to}; Y от ${range.min} до ${range.max}"><defs><clipPath id="${clip}"><rect x="${L}" y="${TOP}" width="${W-L-R}" height="${H-TOP-B}"/></clipPath></defs><rect width="${W}" height="${H}" fill="white"/>`;
//  if(yLabel)svg+=`<text x="${L}" y="18" font-size="13" fill="#344b63" font-family="Arial">${esc(yLabel)}</text>`;
//  for(const v of yt.ticks){const yy=y(v);svg+=`<path d="M${L},${yy.toFixed(2)}H${W-R}" stroke="#e2e8ef"/><text x="${L-10}" y="${(yy+4).toFixed(2)}" text-anchor="end" fill="#52667b" font-family="Arial" font-size="12">${label(v,yd)}</text>`;}
//  for(const t of xt.ticks){const xx=x(t);svg+=`<path d="M${xx.toFixed(2)},${TOP}V${H-B}" stroke="#edf1f6"/><path d="M${xx.toFixed(2)},${H-B}v5" stroke="#8a99aa"/><text x="${xx.toFixed(2)}" y="${H-B+19}" text-anchor="middle" fill="#52667b" font-family="Arial" font-size="12">${label(t,xd)}</text>`;}
//  svg+=`<path d="M${L},${TOP}V${H-B}H${W-R}" fill="none" stroke="#8a99aa"/>`;
//  if(threshold!==null&&threshold>=range.min&&threshold<=range.max)svg+=`<path d="M${L},${y(threshold)}H${W-R}" stroke="#b18a38" stroke-dasharray="5 5"/><text x="${W-R}" y="${y(threshold)-5}" text-anchor="end" fill="#856621" font-size="10" font-family="Arial">Порог ${label(threshold,Math.max(2,yd))}</text>`;
//  svg+=`<g clip-path="url(#${clip})">`;
//  const paths=series.map((s,i)=>{
//   if(s.values.length!==times.length)throw Error('Число значений не совпадает с осью времени.');
//   const stride=Math.max(1,Math.ceil(times.length/1500));let d='';
//   for(let k=0;k<times.length;k++){if(k%stride&&k!==times.length-1)continue;d+=(d?'L':'M')+x(times[k]).toFixed(3)+' '+y(s.values[k]).toFixed(3);}
//   return {id:String(s.id ?? i), d, color:s.color, lastValue:s.values[s.values.length-1]};
//  });
//  for(const p of paths)svg+=`<path data-series-id="${esc(p.id)}" d="${p.d}" fill="none" stroke="${esc(p.color)}" stroke-width="${series.length>10?1.8:2.3}" stroke-linecap="round" stroke-linejoin="round"/>`;
//  if(interactive)for(const p of paths)svg+=`<path data-hit="${esc(p.id)}" d="${p.d}" fill="none" stroke="#000" stroke-opacity="0" stroke-width="12" pointer-events="stroke" style="cursor:pointer"/>`;
//  svg+=`</g>`;
//  if(showLabels){
//   const endX=x(to) + 6;
//   const labels = paths.map(p => ({id:p.id, color:p.color, y:y(p.lastValue), lastValue:p.lastValue}));
//   labels.sort((a,b)=>a.y-b.y);
//   const minGap = 16;
//   for(let i=1;i<labels.length;i++){
//     if(labels[i].y - labels[i-1].y < minGap){ labels[i].y = labels[i-1].y + minGap; }
//   }
//   const topLimit = TOP + 10, bottomLimit = H - B - 10;
//   for(let i=0;i<labels.length;i++){
//     if(labels[i].y < topLimit) labels[i].y = topLimit;
//     if(labels[i].y > bottomLimit) labels[i].y = bottomLimit;
//   }
//   for(const l of labels){
//     const labelText = `u${l.id}`;
//     const textW = 14 + labelText.length * 7;
//     svg+=`<line x1="${x(to)}" y1="${y(l.lastValue)}" x2="${endX}" y2="${l.y}" stroke="${esc(l.color)}" stroke-width="1" stroke-dasharray="2 2" opacity="0.6"/>`;
//     svg+=`<rect x="${endX}" y="${l.y-9}" width="${textW}" height="18" fill="white" fill-opacity="0.85" rx="3"/>`;
//     svg+=`<text x="${endX+5}" y="${l.y+4}" font-size="12" fill="${esc(l.color)}" font-family="Arial" font-weight="600">${labelText}</text>`;
//   }
//  }
//  return svg+`<text x="${W/2}" y="${H-5}" text-anchor="middle" fill="#344b63" font-size="12" font-family="Arial">t — время, усл. ед.</text></svg>`;
// }
// const api={snapshots,bounds,radarSVG,lineBounds,timeWindow,lineChartSVG,lineLayout,niceTicks,niceRange};
// if(typeof module!=='undefined')module.exports=api;root.ISOVisuals=api;
// })(typeof globalThis!=='undefined'?globalThis:this);
(function(root){
'use strict';
const M=typeof module!=='undefined'?require('./model.js'):root.ISO;
const fractions=[0,.25,.5,.75,1];
const titles=['Начальное состояние','Первая четверть','Вторая четверть','Третья четверть','Конечное состояние'];
const fmt=v=>Number(v).toLocaleString('ru-RU',{maximumFractionDigits:4});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function snapshots(result){return fractions.map((fraction,i)=>({fraction,title:titles[i],time:result.config.T*fraction,values:M.sample(result,result.config.T*fraction)}));}
function bounds(views){let min=0,max=1;for(const view of views)for(const v of view.values){min=Math.min(min,v);max=Math.max(max,v);}return {min,max};}

function radarSVG(values,range,targets,{title=''}={}){
 const W=720,H=650,cx=360,cy=320,R=248,n=M.ids.length;
 const point=(i,r)=>{const a=-Math.PI/2+2*Math.PI*i/n;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r];};
 const radius=v=>R*(v-range.min)/(range.max-range.min||1);
 const xy=p=>p.map(v=>v.toFixed(2)).join(',');
 
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><desc>25 характеристик u. Красная линия — расчётные значения. Оранжевый пунктир — целевые пороги. Общая шкала ${fmt(range.min)} … ${fmt(range.max)}.</desc><rect width="${W}" height="${H}" fill="white"/><text x="${cx}" y="24" text-anchor="middle" font-family="Arial" font-size="16" fill="#26384a">${esc(title)}</text>`;
 
 svg+=`<path d="M280,625h22" stroke="#c44343" stroke-width="2"/><text x="308" y="629" font-family="Arial" font-size="12" fill="#26384a">Расчётные u(t)</text>`;
 svg+=`<path d="M450,625h22" stroke="#e59e37" stroke-width="2" stroke-dasharray="4 4"/><text x="478" y="629" font-family="Arial" font-size="12" fill="#26384a">Целевой порог</text>`;

 for(let k=0;k<=4;k++){
  const r=R*k/4,v=range.min+(range.max-range.min)*k/4;
  svg+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ccd3da"/><text x="${cx+6}" y="${cy-r-5}" font-size="12" fill="#586675">${fmt(v)}</text>`;
 }

 M.ids.forEach((id,i)=>{
   const end=point(i,R),label=point(i,R+26);
   svg+=`<g data-axis="${id}"><title>u${id} · ${esc(M.names[i])}; t: ${fmt(values[i])}; порог: ${fmt(targets[i])}</title><path d="M${cx},${cy}L${xy(end)}" stroke="#d9dfe5"/><text x="${label[0].toFixed(2)}" y="${label[1].toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="14" fill="#26384a">u<tspan baseline-shift="sub" font-size="10">${id}</tspan></text></g>`;
 });

 // Оранжевая линия (пороги)
 const targetPoints = targets.map((t, i) => point(i, radius(t)));
 svg+=`<polygon data-radar-series="threshold" points="${targetPoints.map(p=>xy(p)).join(' ')}" fill="none" stroke="#e59e37" stroke-width="2" stroke-dasharray="5 5"/>`;
 targets.forEach((t, i) => {
   const p = point(i, radius(t));
   svg+=`<circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="3" fill="#e59e37"/>`;
 });

 // Красная линия (текущие значения)
 const series = `<polygon data-radar-series="current" points="${values.map((v,i)=>xy(point(i,radius(v)))).join(' ')}" fill="#c44343" fill-opacity=".045" stroke="#c44343" stroke-width="2"/>`;
 svg+=series;

 // Точки значений (без зон, просто цветовая индикация)
 values.forEach((v,i)=>{
   const p=point(i,radius(v));
   const isQuality = i < 6;
   // Для качества: хорошо, если значение БОЛЬШЕ порога
   // Для дефектов: хорошо, если значение МЕНЬШЕ порога
   const isPass = isQuality ? (v >= targets[i] - 1e-5) : (v <= targets[i] + 1e-5);
   const color = isPass ? "#c44343" : "#d32f2f"; // если не прошло — делаем цвет более насыщенным
   svg+=`<circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="${isPass ? 3.5 : 5}" fill="${color}"><title>u${M.ids[i]} · ${esc(M.names[i])}: ${fmt(v)} (${isPass ? 'в норме' : 'вне нормы'})</title></circle>`;
 });

 return svg+'</svg>';
}

const lineLayout={width:900,left:68,right:110,top:30,bottom:44};
function lineBounds(rows,{mode='auto',min,max}={}){
 if(mode==='manual'){
  if(!Number.isFinite(min)||!Number.isFinite(max)||!Number.isFinite(max-min)||max<=min)throw Error('Граница Y max должна быть больше Y min; обе границы должны быть конечными числами.');
  return {min,max};
 }
 let lo=Infinity,hi=-Infinity;
 for(const row of rows)for(const v of row){if(!Number.isFinite(v))throw Error('На графике обнаружено нечисловое значение.');lo=Math.min(lo,v);hi=Math.max(hi,v);}
 if(!Number.isFinite(lo))return {min:0,max:1};
 if(mode==='unit')return {min:Math.min(0,lo),max:Math.max(1,hi)};
 const pad=hi>lo?(hi-lo)*.08:Math.max(.0001,Math.abs(lo)*.01);
 return {min:lo-pad,max:hi+pad};
}
function timeWindow(result,from,to){
 if(!Number.isFinite(from)||!Number.isFinite(to)||from<0||to>result.config.T||to<=from)throw Error('Задайте интервал 0 ≤ t от < t до ≤ T.');
 const times=[from],values=[M.sample(result,from)];
 result.times.forEach((t,i)=>{if(t>from&&t<to){times.push(t);values.push(result.values[i].slice());}});
 times.push(to);values.push(M.sample(result,to));return {times,values};
}
function niceStep(raw){const p=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/p;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p;}
function niceTicks(lo,hi,target=5){
 if(!(hi>lo))return {step:1,ticks:[lo]};
 const step=niceStep((hi-lo)/target),ticks=[];
 for(let k=Math.ceil(lo/step-1e-9);k*step<=hi+step*1e-9;k++)ticks.push(Number((k*step).toPrecision(12)));
 return {step,ticks};
}
function niceRange(lo,hi,target=5){
 if(!(hi>lo))return {min:lo,max:hi};
 const step=niceStep((hi-lo)/target);
 return {min:Number((Math.floor(lo/step+1e-9)*step).toPrecision(12)),max:Number((Math.ceil(hi/step-1e-9)*step).toPrecision(12))};
}
function tickDecimals(step){for(let d=0;d<=10;d++){const q=step*Math.pow(10,d);if(Math.abs(q-Math.round(q))<1e-7)return d;}return 10;}

function lineChartSVG(series,times,{height=320,width=900,scale='auto',min,max,threshold=null,yLabel='',chartId='main',interactive=false,showLabels=false}={}){
 const {left:L,right:R,top:TOP,bottom:B}=lineLayout,H=height,W=width;
 let range=lineBounds(series.map(s=>s.values),{mode:scale,min,max});
 const yTarget=Math.max(4,Math.round((H-TOP-B)/55));
 if(scale==='auto'&&range.max>range.min)range=niceRange(range.min,range.max,yTarget);
 const span=range.max-range.min;
 const from=times[0],to=times.at(-1);
 if(!Number.isFinite(from)||!Number.isFinite(to)||to<=from)throw Error('Некорректная ось времени.');
 const x=t=>L+(W-L-R)*(t-from)/(to-from),y=v=>TOP+(H-TOP-B)*(range.max-v)/span;
 const yt=niceTicks(range.min,range.max,yTarget),xt=niceTicks(from,to,Math.max(4,Math.round((W-L-R)/110)));
 const yd=tickDecimals(yt.step),xd=tickDecimals(xt.step);
 const label=(v,d)=>Number(v).toLocaleString('ru-RU',{minimumFractionDigits:d,maximumFractionDigits:d});
 const clip='plot-'+String(chartId).replace(/[^a-zA-Z0-9_-]/g,'');
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="aspect-ratio:${W}/${H}" role="img" aria-label="; t от ${from} до ${to}; Y от ${range.min} до ${range.max}"><defs><clipPath id="${clip}"><rect x="${L}" y="${TOP}" width="${W-L-R}" height="${H-TOP-B}"/></clipPath></defs><rect width="${W}" height="${H}" fill="white"/>`;
 if(yLabel)svg+=`<text x="${L}" y="18" font-size="13" fill="#344b63" font-family="Arial">${esc(yLabel)}</text>`;
 for(const v of yt.ticks){const yy=y(v);svg+=`<path d="M${L},${yy.toFixed(2)}H${W-R}" stroke="#e2e8ef"/><text x="${L-10}" y="${(yy+4).toFixed(2)}" text-anchor="end" fill="#52667b" font-family="Arial" font-size="12">${label(v,yd)}</text>`;}
 for(const t of xt.ticks){const xx=x(t);svg+=`<path d="M${xx.toFixed(2)},${TOP}V${H-B}" stroke="#edf1f6"/><path d="M${xx.toFixed(2)},${H-B}v5" stroke="#8a99aa"/><text x="${xx.toFixed(2)}" y="${H-B+19}" text-anchor="middle" fill="#52667b" font-family="Arial" font-size="12">${label(t,xd)}</text>`;}
 svg+=`<path d="M${L},${TOP}V${H-B}H${W-R}" fill="none" stroke="#8a99aa"/>`;
 if(threshold!==null&&threshold>=range.min&&threshold<=range.max)svg+=`<path d="M${L},${y(threshold)}H${W-R}" stroke="#b18a38" stroke-dasharray="5 5"/><text x="${W-R}" y="${y(threshold)-5}" text-anchor="end" fill="#856621" font-size="10" font-family="Arial">Порог ${label(threshold,Math.max(2,yd))}</text>`;
 svg+=`<g clip-path="url(#${clip})">`;
 const paths=series.map((s,i)=>{
  if(s.values.length!==times.length)throw Error('Число значений не совпадает с осью времени.');
  const stride=Math.max(1,Math.ceil(times.length/1500));let d='';
  for(let k=0;k<times.length;k++){if(k%stride&&k!==times.length-1)continue;d+=(d?'L':'M')+x(times[k]).toFixed(3)+' '+y(s.values[k]).toFixed(3);}
  return {id:String(s.id ?? i), d, color:s.color, lastValue:s.values[s.values.length-1]};
 });
 for(const p of paths)svg+=`<path data-series-id="${esc(p.id)}" d="${p.d}" fill="none" stroke="${esc(p.color)}" stroke-width="${series.length>10?1.8:2.3}" stroke-linecap="round" stroke-linejoin="round"/>`;
 if(interactive)for(const p of paths)svg+=`<path data-hit="${esc(p.id)}" d="${p.d}" fill="none" stroke="#000" stroke-opacity="0" stroke-width="12" pointer-events="stroke" style="cursor:pointer"/>`;
 svg+=`</g>`;
 if(showLabels){
  const endX=x(to) + 6;
  const labels = paths.map(p => ({id:p.id, color:p.color, y:y(p.lastValue), lastValue:p.lastValue}));
  labels.sort((a,b)=>a.y-b.y);
  const minGap = 16;
  for(let i=1;i<labels.length;i++){
    if(labels[i].y - labels[i-1].y < minGap){ labels[i].y = labels[i-1].y + minGap; }
  }
  const topLimit = TOP + 10, bottomLimit = H - B - 10;
  for(let i=0;i<labels.length;i++){
    if(labels[i].y < topLimit) labels[i].y = topLimit;
    if(labels[i].y > bottomLimit) labels[i].y = bottomLimit;
  }
  for(const l of labels){
    const labelText = `u${l.id}`;
    const textW = 14 + labelText.length * 7;
    svg+=`<line x1="${x(to)}" y1="${y(l.lastValue)}" x2="${endX}" y2="${l.y}" stroke="${esc(l.color)}" stroke-width="1" stroke-dasharray="2 2" opacity="0.6"/>`;
    svg+=`<rect x="${endX}" y="${l.y-9}" width="${textW}" height="18" fill="white" fill-opacity="0.85" rx="3"/>`;
    svg+=`<text x="${endX+5}" y="${l.y+4}" font-size="12" fill="${esc(l.color)}" font-family="Arial" font-weight="600">${labelText}</text>`;
  }
 }
 return svg+`<text x="${W/2}" y="${H-5}" text-anchor="middle" fill="#344b63" font-size="12" font-family="Arial">t — время, усл. ед.</text></svg>`;
}
const api={snapshots,bounds,radarSVG,lineBounds,timeWindow,lineChartSVG,lineLayout,niceTicks,niceRange};
if(typeof module!=='undefined')module.exports=api;root.ISOVisuals=api;
})(typeof globalThis!=='undefined'?globalThis:this);