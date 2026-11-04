'use strict';

(function(){
'use strict';
var $=id=>document.getElementById(id);
var F=(x,d=0)=>Number(x).toLocaleString('cs-CZ',{maximumFractionDigits:d,minimumFractionDigits:d});
var money=x=>F(Math.round(x))+' Kč';
var short=x=>Math.abs(x)>=1000000?F(x/1000000,2)+' mil. Kč':Math.abs(x)>=1000?F(x/1000,0)+' tis. Kč':money(x);
var get=(id,min,max)=>{var v=Number($(id).value);return Math.min(max,Math.max(min,Number.isFinite(v)?v:min))};
var years=Array.from({length:21},(_,i)=>2005+i);
var fx=[23.954549,22.585006,20.288965,17.077868,19.050435,19.079506,17.672226,19.538304,19.560478,20.757773,24.592981,24.440600,23.385470,21.729806,22.931128,23.212459,21.682223,23.350573,22.196917,23.221926,21.912496];
var gold=[517.10,635.20,834.90,883.60,1095.20,1421.10,1565.80,1674.80,1201.90,1183.90,1060.30,1150,1306.30,1278.30,1519.50,1895.10,1828.60,1826.20,2071.80,2641.00,4341.10];
var silver=[8.83,12.90,14.76,10.79,16.99,30.63,28.18,29.95,19.50,15.97,13.82,16.24,16.87,15.47,18.05,26.49,23.09,23.95,23.79,28.91,70.13];
var bitcoin=[null,null,null,null,null,null,null,null,null,320.19,430.57,963.74,14156.40,3742.70,7193.60,29001.72,46306.45,16547.50,42265.19,93429.20,87508.83];
var cagr=(a,sy,ey)=>{var i=years.indexOf(sy),j=years.indexOf(ey);return (Math.pow(a[j]*fx[j]/(a[i]*fx[i]),1/(ey-sy))-1)*100};
var hg=cagr(gold,2005,2025),hs=cagr(silver,2005,2025),hb=cagr(bitcoin,2014,2025);
var assets=[
{id:'gold',name:'Zlato',detail:'Investiční, bez DPH',col:'#d6a141',monthly:2500,rate:6.5,hist:hg},
{id:'silver',name:'Stříbro',detail:'Celní sklad',col:'#95aebd',monthly:2500,rate:5.5,hist:hs},
{id:'fund',name:'Permanentní fond',detail:'Golden Gate',col:'#7874e2',monthly:2500,rate:7,hist:null},
{id:'btc',name:'Bitcoin',detail:'Digitální aktivum',col:'#f18b33',monthly:1000,rate:12,hist:hb},
{id:'cash',name:'Hotovost',detail:'Likvidní rezerva',col:'#65aa97',monthly:1500,rate:0,hist:null}];
var last=[];
function donutCircles(assets,total){var r=81,c=2*Math.PI*r,offset=0;var svg='<circle cx="120" cy="120" r="'+r+'" fill="none" stroke="#e9eef2" stroke-width="42"/>';if(!total)return svg;assets.forEach(a=>{var ratio=a.m/total;if(ratio<=0)return;var len=ratio*c;svg+='<circle cx="120" cy="120" r="'+r+'" fill="none" stroke="'+a.col+'" stroke-width="42" stroke-dasharray="'+Math.max(0,len-3).toFixed(3)+' '+c.toFixed(3)+'" stroke-dashoffset="'+(-offset).toFixed(3)+'" transform="rotate(-90 120 120)"/>';offset+=len});return svg}

$('inputs').innerHTML=assets.map(a=>'<div class="asset"><div><span class="sw" style="background:'+a.col+'"></span><b>'+a.name+'</b><small>'+a.detail+'</small></div><input class="field" type="number" min="0" step="100" value="'+a.monthly+'" id="m_'+a.id+'" aria-label="Měsíční vklad '+a.name+'"><input class="field" type="number" min="-90" max="200" step=".1" value="'+a.rate+'" id="r_'+a.id+'" aria-label="Výnos '+a.name+'"></div>').join('');
$('histTable').innerHTML=years.map((y,i)=>'<tr><td>'+y+'</td><td>'+F(fx[i],3)+'</td><td>'+money(gold[i]*fx[i])+'</td><td>'+money(silver[i]*fx[i])+'</td><td>'+(bitcoin[i]?money(bitcoin[i]*fx[i]):'—')+'</td></tr>').reverse().join('');
$('histSummary').innerHTML='<div class="resultline"><span>Zlato, 20 let (CAGR v Kč)</span><b>'+F(hg,2)+' % p. a.</b></div><div class="resultline"><span>Stříbro, 20 let (CAGR v Kč)</span><b>'+F(hs,2)+' % p. a.</b></div><div class="resultline"><span>Bitcoin, 11 let (CAGR v Kč)</span><b>'+F(hb,2)+' % p. a.</b></div>';
function svgChart(id,rows,keys,colors,months){var W=960,H=320,L=77,R=15,T=14,B=40,w=W-L-R,h=H-T-B;var ymax=Math.max(1,...rows.flatMap(o=>keys.map(k=>o[k])))*1.07;var x=m=>L+(m/months)*w;var y=v=>T+h-v/ymax*h;var html='';for(var i=0;i<=4;i++){var v=ymax*i/4,yy=y(v);html+='<line x1="'+L+'" y1="'+yy+'" x2="'+(W-R)+'" y2="'+yy+'" stroke="#e9edf1"/><text x="'+(L-12)+'" y="'+(yy+4)+'" fill="#8292a3" font-size="11" text-anchor="end">'+short(v).replace(' Kč','')+'</text>'}var ycount=months/12;for(var j=0;j<=4;j++){html+='<text x="'+x(Math.round(months*j/4))+'" y="'+(H-9)+'" text-anchor="middle" fill="#8292a3" font-size="11">'+F(ycount*j/4,1)+' let</text>'}keys.forEach((key,i)=>{html+='<path d="'+rows.map((o,j)=>(j?'L':'M')+x(o.m).toFixed(1)+','+y(o[key]).toFixed(1)).join(' ')+'" fill="none" stroke="'+colors[i]+'" stroke-width="3" stroke-linecap="round" '+(i===1?'stroke-dasharray="7 5"':'')+'/>'});$(id).innerHTML=html}
function showKpis(id,items){$(id).innerHTML=items.map((a,i)=>'<div class="kpi"><i style="background:'+['#d6a141','#95aebd','#65aa97','#7874e2'][i]+'"></i><span>'+a[0]+'</span><strong>'+a[1]+'</strong></div>').join('')}
function calculate(){var ps=assets.map(a=>({name:a.name,col:a.col,m:get('m_'+a.id,0,1e9),r:get('r_'+a.id,-90,200)}));var total=ps.reduce((s,a)=>s+a.m,0);
$('heroSum').textContent=money(total);$('donutSum').textContent=money(total);
var donut=donutCircles(ps,total);$('donutSvg').innerHTML=donut;$('reportDonutSvg').innerHTML=donut;$('reportTotal').textContent=money(total);$('reportDate').textContent='Vytvořeno '+new Date().toLocaleDateString('cs-CZ');$('reportLegend').innerHTML=ps.map(a=>'<div class="line"><span><svg width="13" height="13" viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="5.5" fill="'+a.col+'"/></svg>'+a.name+'</span><b>'+F(total?100*a.m/total:0,1)+' %</b></div>').join('');
$('legend').innerHTML=ps.map(a=>'<div class="legenditem"><span><i class="sw" style="background:'+a.col+'"></i>'+a.name+'</span><b>'+F(total?100*a.m/total:0,1)+' %</b></div>').join('');
var len=Math.round(get('years',1,50)*12),infl=get('infl',0,30),fee=get('fee',0,50),mode=$('feeMode').value;
var bal=ps.map(()=>0),feeRemaining=ps.map((a,i)=>i===4?0:a.m*len*fee/100),vkl=0,fees=0,rows=[{m:0,value:0,paid:0,real:0}];
for(var m=1;m<=len;m++){ps.forEach((a,i)=>{var mf=i===4?0:mode==='first'?Math.min(a.m,feeRemaining[i]):a.m*fee/100;if(mode==='first')feeRemaining[i]-=mf;bal[i]=bal[i]*Math.pow(1+a.r/100,1/12)+a.m-mf;vkl+=a.m;fees+=mf});var val=bal.reduce((s,b)=>s+b,0);rows.push({m:m,value:val,paid:vkl,real:val/Math.pow(1+infl/100,m/12)})}
last=rows;var o=rows[rows.length-1];showKpis('pKpis',[['Hodnota portfolia',short(o.value)],['Vlastní vklady',short(o.paid)],['Rozdíl po poplatcích',short(o.value-o.paid)],['Kupní síla v dnešních Kč',short(o.real)]]);
svgChart('pChart',rows,['value','paid','real'],['#d6a141','#95aebd','#7874e2'],len);$('reportChart').innerHTML=$('pChart').innerHTML;$('reportKPIs').innerHTML=$('pKpis').innerHTML;$('reportParams').textContent='Investiční horizont: '+get('years',1,50)+' let • Inflace: '+F(infl,1)+' % ročně • Vstupní poplatek: '+F(fee,1)+' % • Výnosy dle nastavení kalkulačky';
$('breakdown').innerHTML=ps.map((a,i)=>'<div class="resultline"><span><i class="sw" style="background:'+a.col+'"></i>'+a.name+'</span><b>'+short(bal[i])+'</b></div>').join('')+'<div class="resultline"><span>Vstupní poplatky celkem</span><b>'+money(fees)+'</b></div>';if($('capitalSource').value==='portfolio')$('capital').value=Math.round(o.value);calculateRent();
}
function rentSim(cap,r,ir,first,months,indexed){var balance=cap,paid=0,rows=[{m:0,balance:cap,paid:0}],end=months,term=0;var mr=Math.pow(1+r/100,1/12)-1;
for(var m=1;m<=months;m++){balance*=1+mr;var w=first*(indexed?Math.pow(1+ir/100,Math.floor((m-1)/12)):1);if(balance<w-1e-7){paid+=Math.max(0,balance);balance=0;end=m;term=1;rows.push({m:m,balance:0,paid:paid});break}balance-=w;paid+=w;rows.push({m:m,balance:balance,paid:paid})}
return {balance:balance,paid:paid,rows:rows,end:end,term:term}}
function rentLimit(cap,r,inf,months,indexed,floor){
 if(cap<=0)return 0;
 var noRent=rentSim(cap,r,inf,0,months,indexed);
 if(noRent.balance+0.0001<floor)return 0;
 var low=0,high=Math.max(1,cap);
 for(var k=0;k<65;k++){
  var mid=(low+high)/2,o=rentSim(cap,r,inf,mid,months,indexed);
  if(o.term||o.balance+0.00001<floor)high=mid;else low=mid;
 }
 return low;
}
function calculateRent(){
 var cap=get('capital',0,1e12),want=get('renta',0,1e10),r=get('rRate',-90,100),inf=get('rInfl',0,30),ix=$('index').checked;
 var rolling=$('rentMode').value==='rolling';
 $('rTermWrap').style.display=rolling?'none':'block';
 $('rCustomWrap').style.display=(!rolling&&$('rTerm').value==='custom')?'block':'none';
 $('rReviewWrap').style.display=rolling?'block':'none';
 var yrs=rolling?Number($('rReview').value):$('rTerm').value==='custom'?Math.round(get('rYears',1,60)):Number($('rTerm').value);
 var months=yrs*12,out=rentSim(cap,r,inf,want,months,ix),floor=rolling?cap*Math.pow(1+inf/100,yrs):0;
 var limit=rentLimit(cap,r,inf,months,ix,floor);
 if(rolling){
  var base=rentSim(cap,r,inf,0,months,ix);
  showKpis('rKpis',[
   ['Renta při zachování kupní síly kapitálu',money(limit)+'/měs.'],
   ['Kontrola plánu po',yrs+' letech'],
   ['Za období vyplaceno',short(out.paid)],
   ['Zůstatek po období',short(out.balance)]
  ]);
  $('rentModeNote').textContent='Průběžná renta: simulujeme jen dalších '+yrs+' let. Limit ukazuje počáteční rentu, při níž na konci období model zachová kupní sílu původního kapitálu. Potom je potřeba znovu přepočítat další etapu podle skutečného stavu portfolia.';
  $('rStatus').textContent=out.term?'⚠ Při požadované rentě se kapitál vyčerpá již během této etapy: přibližně po '+F(out.end/12,1)+' letech.':base.balance+0.0001<floor?'⚠ Při zadaném výnosu nedokáže portfolio udržet kupní sílu původního kapitálu ani bez výběrů. Orientační renta se zachováním kupní síly je 0 Kč.':out.balance+0.0001<floor?'⚠ Po '+yrs+' letech bude kupní síla zbývajícího kapitálu nižší než na začátku. Pro její zachování vychází modelová počáteční renta nejvýše '+money(limit)+' měsíčně.':'Po '+yrs+' letech model zachovává kupní sílu kapitálu. Před další etapou doporučujeme rentu přepočítat z aktuálního zůstatku.';
 }else{
  showKpis('rKpis',[
   ['Max. počáteční měsíční renta',money(limit)+'/měs.'],
   ['Zvolená doba čerpání',yrs+' let'],
   ['Za období vyplaceno',short(out.paid)],
   ['Zůstatek na konci období',short(out.balance)]
  ]);
  $('rentModeNote').textContent='Na zvolenou dobu: simulujeme výplaty po dobu '+yrs+' let. Maximální renta ukazuje počáteční měsíční částku, při níž lze v modelu celý kapitál během této doby postupně vyčerpat.';
  $('rStatus').textContent=out.term?'⚠ Požadovaná renta je příliš vysoká: kapitál se vyčerpá již přibližně po '+F(out.end/12,1)+' letech, tedy dříve než za '+yrs+' let.':'Při požadované rentě model předpokládá po '+yrs+' letech zbývající kapitál '+money(out.balance)+'. Skutečné výnosy, inflace a poplatky se mohou lišit.';
 }
 svgChart('rChart',out.rows,['balance','paid'],['#d6a141','#65aa97'],months);$('reportRenta').innerHTML=$('rKpis').innerHTML;$('reportRentParams').textContent='Základ renty: '+money(cap)+' • Požadovaná počáteční měsíční renta: '+money(want)+' • Čerpání: '+(rolling?'průběžné, revize po '+yrs+' letech':'po dobu '+yrs+' let')+' • Výnos v čerpání: '+F(r,1)+' % ročně • Inflace: '+F(inf,1)+' % ročně'+(ix?' • Renta roste o inflaci':' • Renta je nominálně fixní');
}
function setMenu(open){
 $('mainMenu').classList.toggle('is-open',open);
 $('menuToggle').setAttribute('aria-expanded',String(open));
 $('menuToggle').setAttribute('aria-label',open?'Zavřít nabídku':'Otevřít nabídku');
}
function showTab(tab){
 document.querySelectorAll('.tabs button[data-to]').forEach(b=>b.classList.toggle('sel',b.dataset.to===tab));
 document.querySelectorAll('.view').forEach(v=>v.classList.toggle('sel',v.id===tab));
 setMenu(false);if(tab==='r')calculateRent();
}
$('menuToggle').onclick=()=>setMenu($('menuToggle').getAttribute('aria-expanded')!=='true');
document.querySelectorAll('.tabs button[data-to]').forEach(b=>b.onclick=()=>showTab(b.dataset.to));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('menuToggle').getAttribute('aria-expanded')==='true'){setMenu(false);$('menuToggle').focus()}});
var entryTab=(window.location&&window.location.hash?window.location.hash.slice(1):'');
if(['p','r','h'].includes(entryTab))showTab(entryTab);

$('model').onclick=()=>preset(false);$('historical').onclick=()=>preset(true);
function preset(hist){assets.forEach(a=>{$('r_'+a.id).value=hist&&a.hist!==null?F(a.hist,3).replace(',','.'):a.rate});$('model').classList.toggle('sel',!hist);$('historical').classList.toggle('sel',hist);$('presetNote').textContent=hist?'⚠ Historický výnos v Kč je pouze matematický CAGR, nikoliv předpověď. Bitcoin má 11letou a fond mnohem kratší historii; u fondu zůstává 7 % modelově.':'Modelové předpoklady po průběžných nákladech jsou upravitelné a nezaručené.';calculate()}
document.querySelectorAll('#p input,#p select').forEach(el=>el.addEventListener('input',calculate));document.querySelectorAll('#r input,#r select').forEach(el=>el.addEventListener('input',calculateRent));
$('capitalSource').onchange=()=>{ $('capital').disabled=$('capitalSource').value==='portfolio';calculate() };
$('capital').disabled=true;
$('reset').onclick=()=>{assets.forEach(a=>{$('m_'+a.id).value=a.monthly});$('years').value=20;$('infl').value=1;$('fee').value=3;$('feeMode').value='monthly';preset(false)};
$('print').onclick=()=>window.print();$('rentPrint').onclick=()=>window.print();
$('csv').onclick=()=>{var rows=['mesic;portfolio_Kc;vklady_Kc;kupni_sila_Kc',...last.map(x=>[x.m,F(x.value,2),F(x.paid,2),F(x.real,2)].join(';'))];var url=URL.createObjectURL(new Blob(['\uFEFF'+rows.join('\r\n')],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='moje-renta-portfolio.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)};
calculate();
})();

