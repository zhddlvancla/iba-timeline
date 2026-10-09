/*
 * DENDRO · 기록보관소 오디오 엔진
 * ─────────────────────────────────────────────────────────────
 * 전 음향을 Web Audio API로 실시간 합성한다. 음원 파일이 없으므로
 * 저작권 대상이 아니며 네트워크 요청과 번들 용량이 발생하지 않는다.
 *
 * 사용법
 *   HTML에서 script 태그로 불러오거나, 파일 내용을 그대로 인라인한다.
 *   DENDRO_AUDIO.sfx('click');            // 효과음 1회
 *   DENDRO_AUDIO.ambient(true);           // 앰비언트 on/off
 *   DENDRO_AUDIO.music(true);             // 배경음악 on/off
 *   DENDRO_AUDIO.zone(1);                 // 0 기록보관소 · 1 LUMINA
 *   DENDRO_AUDIO.volume('music', 0.62);   // master | ambient | music
 *   DENDRO_AUDIO.density(0.5);            // 앰비언트 사건 밀도 0~1
 *   DENDRO_AUDIO.state();                 // 현재 상태 조회
 *
 * 주의 — 브라우저 자동재생 정책상 최초 1회는 사용자 조작(클릭·키입력)
 * 안에서 호출되어야 한다. 그 전 호출은 무시되고 false를 반환한다.
 */
(function(global){
'use strict';

var AC=null,M=null,V=null,AG=null,MG=null,HPF=null,DG=null;
var ambOn=false,musOn=false,zone=0,den=0.5;
var ambN=[],musN=[],ambT=[],musT=[];
var VOL={master:0.70,ambient:0.55,music:0.62};

function boot(){
  if(AC||AC===false) return;
  var Ctor=global.AudioContext||global.webkitAudioContext;
  if(!Ctor){ AC=false; if(global.console) console.warn('[DENDRO_AUDIO] Web Audio 미지원 환경'); return; }
  try{
  AC=new Ctor();
  M=AC.createGain(); M.gain.value=VOL.master;
  HPF=AC.createBiquadFilter(); HPF.type='highpass'; HPF.frequency.value=110;
  M.connect(HPF); HPF.connect(AC.destination);
  V=AC.createConvolver(); V.buffer=ir(3.4,2.6);
  var vg=AC.createGain(); vg.gain.value=0.5; V.connect(vg); vg.connect(M);
  AG=AC.createGain(); AG.gain.value=VOL.ambient; AG.connect(M);
  MG=AC.createGain(); MG.gain.value=VOL.music; MG.connect(M); MG.connect(V);
  /* 저음 전용 경로 — 주 출력의 110Hz 고역 통과 필터를 거치지 않는다(묵직한 효과음용). 음량은 master를 따른다 */
  DG=AC.createGain(); DG.gain.value=VOL.master;
  var dlp=AC.createBiquadFilter(); dlp.type='lowpass'; dlp.frequency.value=900;
  DG.connect(dlp); dlp.connect(AC.destination);
  }catch(e){ AC=false; if(global.console) console.warn('[DENDRO_AUDIO] 오디오 기동 실패: '+e.message); }
}
function ir(dur,decay){
  var r=AC.sampleRate,n=Math.floor(r*dur),b=AC.createBuffer(2,n,r);
  for(var c=0;c<2;c++){var d=b.getChannelData(c);
    for(var i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,decay);}
  return b;
}
function nb(sec){
  var r=AC.sampleRate,n=Math.max(64,Math.floor(r*sec)),b=AC.createBuffer(1,n,r),d=b.getChannelData(0);
  for(var i=0;i<n;i++) d[i]=Math.random()*2-1;
  return b;
}
function T(f,t,du,ty,pk,ds,q){
  var o=AC.createOscillator(),g=AC.createGain(),lp=AC.createBiquadFilter();
  o.type=ty||'sine'; o.frequency.setValueAtTime(f,t);
  lp.type='lowpass'; lp.frequency.setValueAtTime(q||3000,t);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(pk,t+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001,t+du);
  o.connect(lp); lp.connect(g); g.connect(ds||M);
  o.start(t); o.stop(t+du+0.05);
}
function N(t,du,pk,lo,hi,ds,q){
  var s=AC.createBufferSource(); s.buffer=nb(Math.max(du,0.05));
  var bp=AC.createBiquadFilter(); bp.type='bandpass';
  bp.frequency.setValueAtTime(lo,t); bp.Q.value=q||0.8;
  if(hi) bp.frequency.exponentialRampToValueAtTime(hi,t+du);
  var g=AC.createGain();
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(pk,t+0.004);
  g.gain.exponentialRampToValueAtTime(0.0001,t+du);
  s.connect(bp); bp.connect(g); g.connect(ds||M);
  s.start(t); s.stop(t+du+0.05);
}

/* 주파수가 미끄러지는 음 — f0→f1 (저음 효과음용). att초 동안 차오른 뒤 du까지 사라진다 */
function SW(f0,f1,t,du,pk,ds,lp,att,ty){
  var o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();
  o.type=ty||'sine'; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(f1,t+du);
  f.type='lowpass'; f.frequency.value=lp||400;
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(pk,t+(att||0.02));
  g.gain.exponentialRampToValueAtTime(0.0001,t+du);
  o.connect(f); f.connect(g); g.connect(ds||DG);
  o.start(t); o.stop(t+du+0.05);
}
/* 저역 잡음 — 낮게 깔리는 웅웅거림. 서서히 차올랐다 사라진다 */
function RB(t,du,pk,lp,att){
  var s=AC.createBufferSource(); s.buffer=nb(du+0.1);
  var f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.setValueAtTime(lp||160,t); f.Q.value=0.7;
  var g=AC.createGain();
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(pk,t+(att||du*0.5));
  g.gain.exponentialRampToValueAtTime(0.0001,t+du);
  s.connect(f); f.connect(g); g.connect(DG);
  s.start(t); s.stop(t+du+0.1);
}

/* ── 효과음 ───────────────────────────── */
var SFX={
  /* 기록줄기 불러오기(약 2.6초) — 서고 잠금장치가 풀리는 쿵 소리, 기계가 돌며 차오르는 저음, 톱니 딸깍임, 끝에 멈춤 */
  archiveLoad: function(t){
    SW(92,48,t,0.55,0.34,DG,320,0.008); N(t,0.10,0.11,260,110,M,1.1);
    SW(36,64,t+0.15,2.35,0.20,DG,220,1.4); RB(t+0.1,2.4,0.16,150,1.5);
    for(var i=0;i<7;i++) N(t+0.35+i*0.3,0.045,0.035+i*0.004,520,null,M,2.2);
    SW(78,40,t+2.45,0.6,0.30,DG,260,0.01); N(t+2.45,0.08,0.07,300,140,M,1.0);
  },
  /* 기록줄기가 퍼져 나갈 때(약 2.4초) — 깊게 울리는 붐과 낮은 화음, 위로 번지는 바람 소리 */
  archiveSpread: function(t){
    SW(64,30,t,2.0,0.42,DG,280,0.015); SW(64,30,t,1.4,0.10,V,300,0.015);
    SW(49,47,t+0.05,2.4,0.10,DG,200,0.6); SW(73.5,71,t+0.05,2.3,0.07,DG,240,0.6);
    RB(t,1.8,0.12,180,0.25);
    N(t+0.1,1.7,0.035,180,1400,M,0.6);
  },
  click: function(t){ T(320,t,0.06,'square',0.075,M,1400); T(200,t,0.09,'triangle',0.055,M,900); },
  select: function(t){ T(660,t,0.06,'triangle',0.06,M,3000); T(988,t+0.05,0.10,'triangle',0.05,M,3400); },
  open: function(t){ N(t,0.26,0.055,600,2600,M); T(440,t,0.16,'triangle',0.04,M,2000); },
  close: function(t){ N(t,0.20,0.05,2400,700,M); T(330,t+0.02,0.14,'triangle',0.035,M,1600); },
  /* 관내 방송 차임 — 「딩동댕동」 네 음 상행 (솔·시·레·솔). 종소리처럼 기음 + 옥타브 배음 */
  chime: function(t){ [392.0,493.9,587.3,784.0].forEach(function(f,i){ var tt=t+i*0.36, du=i===3?1.9:1.1;
    T(f,tt,du,'sine',0.10,M,5200); T(f*2,tt,du*0.55,'sine',0.028,V,6000); T(f,tt,du,'sine',0.035,V,4000); }); },
  denied: function(t){ T(294,t,0.14,'square',0.07,M,900); T(277,t+0.17,0.24,'square',0.07,M,800); },
  connect: function(t){ N(t,0.045,0.09,1800,700,M); T(440,t+0.06,0.24,'triangle',0.045,M,2200); T(659,t+0.15,0.45,'sine',0.055,V,3400); },
  redacted: function(t){ N(t,0.13,0.065,3000,1100,M); T(233,t,0.16,'triangle',0.045,M,900); },
  transition: function(t){ N(t,0.45,0.045,900,4200,M); for(var i=0;i<6;i++) T(392+i*66,t+i*0.05,0.09,'triangle',0.026,M,3000); },
  tapeStop: function(t){ N(t,0.28,0.05,2200,420,M); T(196,t+0.05,0.3,'triangle',0.045,M,700); },
  alert: function(t){ for(var i=0;i<3;i++){ T(880,t+i*0.4,0.2,'square',0.06,M,2000); T(659,t+i*0.4+0.19,0.2,'square',0.06,M,1800);} },
  hold: function(t){ T(523,t,0.11,'triangle',0.06,M,2400); T(415,t+0.12,0.28,'triangle',0.06,M,2000); },
  key: function(t){ tKey(t,1); },
  carriageReturn: function(t){ tRet(t); }
};

/* ── 앰비언트 부품 ─────────────────────── */
function tKey(t,vol){
  var v=(vol||1);
  N(t,0.016,0.20*v,2400,null,AG,1.2);
  N(t+0.004,0.055,0.11*v,1100,600,AG,1.6);
  T(2600+Math.random()*500,t,0.022,'square',0.042*v,AG,6000);
}
function tRet(t){
  N(t,0.24,0.12,1400,600,AG,0.9);
  T(1568,t+0.02,0.55,'sine',0.10,V,6000);
  N(t+0.22,0.10,0.085,900,1800,AG,1.1);
}
function burst(){
  var t=AC.currentTime,n=4+Math.floor(Math.random()*9),p=0;
  for(var i=0;i<n;i++){
    p+=0.09+Math.random()*0.13;
    if(Math.random()<0.14) p+=0.3+Math.random()*0.5;
    tKey(t+p,0.7+Math.random()*0.4);
  }
  if(Math.random()<0.55) tRet(t+p+0.35);
}
function paper(){
  var t=AC.currentTime;
  N(t,0.17,0.13,1200,3400,AG,0.7);
  N(t+0.15,0.20,0.10,3000,900,AG,0.7);
}
function write(){
  var t=AC.currentTime,n=6+Math.floor(Math.random()*10),p=0;
  for(var i=0;i<n;i++){
    p+=0.05+Math.random()*0.1;
    N(t+p,0.038+Math.random()*0.03,0.060,1600+Math.random()*1400,null,AG,1.4);
  }
}
function flick(){
  var t=AC.currentTime,n=2+Math.floor(Math.random()*4),p=0;
  for(var i=0;i<n;i++){
    p+=0.05+Math.random()*0.12;
    var o=AC.createOscillator(),g=AC.createGain(),hp=AC.createBiquadFilter();
    o.type='sawtooth'; o.frequency.value=240;
    hp.type='highpass'; hp.frequency.value=1400;
    g.gain.setValueAtTime(0.0001,t+p);
    g.gain.exponentialRampToValueAtTime(0.055,t+p+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t+p+0.07+Math.random()*0.12);
    o.connect(hp); hp.connect(g); g.connect(AG);
    o.start(t+p); o.stop(t+p+0.3);
  }
}
function door(){
  var t=AC.currentTime;
  N(t,0.11,0.10,320,180,V,0.9);
  T(196,t,0.24,'triangle',0.075,V,500);
}
function startAmb(){
  burst();
  sched(burst, 10, 26);
  sched(paper,  9, 24);
  sched(write, 15, 40);
  sched(flick, 26, 70);
  sched(door,  40, 110);
}
function sched(fn,lo,hi){
  (function loop(){
    var f=(1.6-den*1.2);
    ambT.push(setTimeout(function(){
      if(!ambOn) return;
      fn(); loop();
    },(lo+Math.random()*(hi-lo))*1000*f));
    if(ambT.length>200) ambT.splice(0,120);
  })();
}
function stopAmb(){
  ambT.forEach(clearTimeout); ambT=[];
  ambN.forEach(function(n){ try{n.stop();}catch(e){} }); ambN=[];
}

/* ── 배경음악 ─────────────────────────── */
/* ── 배경음악 · 원본 작곡 ─────────────────────────────
   C#단조 72BPM. 오스티나토 + 베이스 + 펄스 + 멜로디 + 미약한 패드.
   4마디 단위로 층을 넣고 빼며 전개한다. 멜로디는 고정 동기(motif)를
   가지되 구간마다 변주되므로 단순 반복으로 들리지 않는다. */
var BPM=72, BEAT=60/BPM, BAR=BEAT*4;

/* 화성 진행 4마디 1주기 — 근음, 화음 구성음, 오스티나토 음형 */
var PROG=[
 /* 기록보관소 : C#m - A - F#m - B */
 [ {b:138.6, ch:[277.2,329.6,415.3], ost:[277.2,415.3,554.4,659.3]},
   {b:220.0, ch:[220.0,329.6,440.0], ost:[220.0,329.6,440.0,659.3]},
   {b:185.0, ch:[277.2,369.9,440.0], ost:[185.0,277.2,369.9,554.4]},
   {b:246.9, ch:[246.9,369.9,493.9], ost:[246.9,369.9,493.9,622.3]} ],
 /* LUMINA : Cm - Ab - Fm - Bb  (반음 아래) */
 [ {b:130.8, ch:[261.6,311.1,392.0], ost:[261.6,392.0,523.3,622.3]},
   {b:207.7, ch:[207.7,311.1,415.3], ost:[207.7,311.1,415.3,622.3]},
   {b:174.6, ch:[261.6,349.2,415.3], ost:[174.6,261.6,349.2,523.3]},
   {b:233.1, ch:[233.1,349.2,466.2], ost:[233.1,349.2,466.2,587.3]} ]
];

/* 멜로디 동기 — [박 위치, 음높이(음계 인덱스), 길이(박)] */
var SCALE=[[554.4,622.3,659.3,740.0,830.6,880.0,987.8,1108.7],
           [523.3,587.3,622.3,698.5,784.0,830.6,932.3,1046.5]];
var MOTIF=[
 [[0,2,1.5],[1.5,1,0.5],[2,0,1],[3,6,1]],
 [[0,4,1],[1,3,1],[2,2,2]],
 [[0.5,5,1],[1.5,4,0.5],[2,2,1],[3,1,1]],
 [[0,0,2],[2,6,1],[3,4,1]]
];

/* 예약된 노드를 채널별 목록에 등록한다. 채널을 끄면 예약분까지 즉시 정지된다. */
function track(list,node){ list.push(node); if(list.length>2400) list.splice(0,1200); }   /* 15초 앞까지 예약한 음도 끌 수 있도록 넉넉히 */

function pluck(f,t,pk,dec,ds){
  var o=AC.createOscillator(),g=AC.createGain(),lp=AC.createBiquadFilter();
  o.type='triangle'; o.frequency.value=f;
  lp.type='lowpass'; lp.frequency.setValueAtTime(2600,t);
  lp.frequency.exponentialRampToValueAtTime(700,t+dec);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(pk,t+0.008);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dec);
  o.connect(lp); lp.connect(g); g.connect(ds||MG);
  o.start(t); o.stop(t+dec+0.05); track(musN,o);
}
function lead(f,t,dur){
  var o=AC.createOscillator(),o2=AC.createOscillator(),g=AC.createGain(),lp=AC.createBiquadFilter();
  o.type='sine'; o.frequency.value=f;
  o2.type='triangle'; o2.frequency.value=f*2.005;
  var g2=AC.createGain(); g2.gain.value=0.22; o2.connect(g2);
  lp.type='lowpass'; lp.frequency.value=4200;
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(0.055,t+0.06);
  g.gain.exponentialRampToValueAtTime(0.020,t+dur*0.6);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur+0.9);
  o.connect(lp); g2.connect(lp); lp.connect(g); g.connect(MG); g.connect(V);
  o.start(t); o2.start(t); o.stop(t+dur+1); o2.stop(t+dur+1);
  track(musN,o); track(musN,o2);
}
function tick(t,pk){
  var s=AC.createBufferSource(); s.buffer=nb(0.03);
  var bp=AC.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=3400; bp.Q.value=2.2;
  var g=AC.createGain();
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(pk,t+0.003);
  g.gain.exponentialRampToValueAtTime(0.0001,t+0.045);
  s.connect(bp); bp.connect(g); g.connect(MG);
  s.start(t); s.stop(t+0.08); track(musN,s);
}
function padChord(ch,t,dur){
  ch.forEach(function(f,i){
    var o=AC.createOscillator(),g=AC.createGain(),lp=AC.createBiquadFilter();
    o.type='triangle'; o.frequency.value=f;
    lp.type='lowpass'; lp.frequency.value=1100;
    var pk=[0.013,0.010,0.008][i]||0.007;
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(pk,t+dur*0.35);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(lp); lp.connect(g); g.connect(MG);
    o.start(t); o.stop(t+dur+0.1);
    track(musN,o);
  });
}

var sec=0;
function playBar(bar,t,layers){
  var P=PROG[zone][bar];
  if(layers.pad) padChord(P.ch,t,BAR);
  if(layers.bass){ pluck(P.b,t,0.075,1.1); pluck(P.b,t+BEAT*2,0.055,0.9); }
  if(layers.ost){
    for(var i=0;i<8;i++){
      var f=P.ost[i%4]*(i>=4?1:1);
      pluck(f,t+i*BEAT*0.5,i%2===0?0.042:0.028,0.55);
    }
  }
  if(layers.tick){
    for(var j=0;j<4;j++) tick(t+j*BEAT+BEAT*0.5,j===1?0.030:0.020);
  }
  if(layers.mel){
    var m=MOTIF[(bar+sec)%4],sc=SCALE[zone];
    m.forEach(function(n){
      var oct=(sec%3===2&&Math.random()<0.35)?0.5:1;
      lead(sc[n[1]]*oct,t+n[0]*BEAT,n[2]*BEAT);
    });
  }
}

function startMus(){
  sec=0;
  /* 직전 정지의 감쇠가 남아 있을 수 있으므로 음량을 즉시 복원한다 */
  if(AC){ try{ MG.gain.cancelScheduledValues(AC.currentTime);
               MG.gain.setValueAtTime(VOL.music,AC.currentTime); }catch(e){} }
  var next=AC.currentTime+0.25;
  /* 15초 앞까지 미리 예약하고 1초마다 확인한다 — 다른 탭으로 넘어가 브라우저가 타이머를 늦춰도 끊기지 않는다.
     오래 멈췄다 깨어나면(밀린 시간이 이미 지났으면) 몰아 틀지 않고 지금부터 이어 간다 */
  var AHEAD=15;
  (function block(){
    if(!musOn) return;
    if(next<AC.currentTime+0.05) next=AC.currentTime+0.1;
    while(next<AC.currentTime+AHEAD){
      var L;
      switch(sec%6){
        case 0: L={pad:1,ost:1,tick:0,bass:0,mel:0}; break;
        case 1: L={pad:1,ost:1,tick:1,bass:1,mel:0}; break;
        case 2: L={pad:1,ost:1,tick:1,bass:1,mel:1}; break;
        case 3: L={pad:1,ost:0,tick:1,bass:1,mel:1}; break;
        case 4: L={pad:1,ost:1,tick:1,bass:1,mel:1}; break;
        default:L={pad:1,ost:0,tick:0,bass:0,mel:0}; break;
      }
      for(var b=0;b<4;b++) playBar(b,next+b*BAR,L);
      next+=BAR*4; sec++;
    }
    musT.push(setTimeout(block,1000));
    if(musT.length>200) musT.splice(0,120);
  })();
  musT.push(setTimeout(function whisper(){
    if(!musOn) return;
    var tt=AC.currentTime,du=1.6+Math.random()*1.6;
    var s=AC.createBufferSource(); s.buffer=nb(du+0.3);
    var f1=AC.createBiquadFilter(); f1.type='bandpass'; f1.frequency.value=520+Math.random()*260; f1.Q.value=7;
    var f2=AC.createBiquadFilter(); f2.type='bandpass'; f2.frequency.value=1400+Math.random()*700; f2.Q.value=9;
    var g=AC.createGain();
    g.gain.setValueAtTime(0.0001,tt);
    g.gain.exponentialRampToValueAtTime(0.026,tt+du*0.4);
    g.gain.exponentialRampToValueAtTime(0.0001,tt+du);
    var lfo=AC.createOscillator(),lfg=AC.createGain();
    lfo.type='sine'; lfo.frequency.value=0.8+Math.random()*1.4; lfg.gain.value=180;
    lfo.connect(lfg); lfg.connect(f1.frequency); lfo.start(tt); lfo.stop(tt+du+0.3);
    s.connect(f1); f1.connect(f2); f2.connect(g); g.connect(V);
    s.start(tt); s.stop(tt+du+0.2);
    musT.push(setTimeout(whisper,(16+Math.random()*22)*1000));
  },14000));
}
function stopMus(){
  musT.forEach(clearTimeout); musT=[];
  if(AC){ var t=AC.currentTime;
    try{ MG.gain.cancelScheduledValues(t);
         MG.gain.setValueAtTime(MG.gain.value,t);
         MG.gain.exponentialRampToValueAtTime(0.0001,t+0.25); }catch(e){}
    var dead=musN; musN=[];
    setTimeout(function(){
      dead.forEach(function(n){ try{n.stop();}catch(e){} });
      try{ MG.gain.setValueAtTime(VOL.music,AC.currentTime); }catch(e){}
    },300);
  } else { musN=[]; }
}


/* 화면 표시용 한국어 명칭 */
var SFX_LABEL={
  click: '확인 · 클릭',
  select: '노드 선택',
  open: '문서 열기',
  close: '문서 닫기',
  chime: '관내 방송 차임',
  denied: '권한 없음',
  connect: '접속 완료',
  redacted: '먹칠 · 판독 불가',
  transition: '구간 전환',
  tapeStop: '테이프 정지',
  alert: '경보 · 왜곡 감지',
  hold: '등재 보류',
  key: '타자기 타건 1회',
  carriageReturn: '캐리지 리턴',
  archiveLoad: '기록줄기 불러오기',
  archiveSpread: '기록줄기 펼침'
};

/* ── 공개 인터페이스 ─────────────────────────────────── */
function ready(){
  boot();
  if(!AC) return false;
  if(AC.state==='suspended') AC.resume();
  return true;
}

var API={
  /* 효과음 1회 재생. 키 목록은 DENDRO_AUDIO.list() 참조 */
  sfx:function(key){
    if(!ready()) return false;
    var f=SFX[key];
    if(!f){ if(global.console) console.warn('[DENDRO_AUDIO] 알 수 없는 효과음: '+key); return false; }
    f(AC.currentTime); return true;
  },
  list:function(){ return Object.keys(SFX); },
  label:function(key){ return SFX_LABEL[key]||key; },

  /* 앰비언트 on/off. 인자 생략 시 토글 */
  ambient:function(on){
    if(!ready()) return false;
    var next=(on===undefined)?!ambOn:!!on;
    if(next===ambOn) return ambOn;
    ambOn=next;
    if(ambOn) startAmb(); else stopAmb();
    return ambOn;
  },

  /* 배경음악 on/off. 인자 생략 시 토글 */
  music:function(on){
    if(!ready()) return false;
    var next=(on===undefined)?!musOn:!!on;
    if(next===musOn) return musOn;
    musOn=next;
    if(musOn) startMus(); else stopMus();
    return musOn;
  },

  /* 구역 전환. 0 기록보관소 · 1 LUMINA. 재생 중이면 즉시 반영 */
  zone:function(z){
    if(z===undefined) return zone;
    zone=(z===1)?1:0;
    if(musOn){ stopMus(); startMus(); }
    return zone;
  },

  /* 음량 조절. ch = master | ambient | music, v = 0~1 */
  volume:function(ch,v){
    if(v===undefined) return VOL[ch];
    v=Math.max(0,Math.min(1,v)); VOL[ch]=v;
    if(!AC) return v;
    var t=AC.currentTime;
    if(ch==='master'){ M.gain.setTargetAtTime(v,t,0.1); if(DG) DG.gain.setTargetAtTime(v,t,0.1); }
    if(ch==='ambient') AG.gain.setTargetAtTime(v,t,0.1);
    if(ch==='music')   MG.gain.setTargetAtTime(v,t,0.1);
    return v;
  },

  /* 앰비언트 사건 밀도 0~1. 높을수록 소리가 자주 발생한다 */
  density:function(d){
    if(d===undefined) return den;
    den=Math.max(0,Math.min(1,d)); return den;
  },

  /* 전체 정지. 페이지 이탈이나 강의 모드 진입 시 호출 */
  stopAll:function(){
    if(ambOn){ ambOn=false; stopAmb(); }
    if(musOn){ musOn=false; stopMus(); }
  },

  state:function(){
    return { started:!!AC, ambient:ambOn, music:musOn, zone:zone,
             density:den, volume:{master:VOL.master,ambient:VOL.ambient,music:VOL.music} };
  }
};

/* 다른 탭·창으로 넘어가거나 최소화해도 켜 둔 소리는 계속 재생한다(사용자 요청 2026-10-08).
   페이지를 닫거나 떠날 때(pagehide·beforeunload)만 즉시 멈춘다.
   브라우저가 숨은 사이에 장치를 멈췄다면 다시 보일 때 켜 둔 채널을 이어서 재생한다. */
if(typeof document!=='undefined'){
  document.addEventListener('visibilitychange',function(){
    if(!AC || document.hidden) return;
    if(AC.state==='suspended' && (ambOn||musOn)) AC.resume();
  });
  var shutdown=function(){ if(AC && AC.state==='running'){ try{ AC.suspend(); }catch(e){} } };
  global.addEventListener('pagehide',shutdown);
  global.addEventListener('beforeunload',shutdown);
  global.addEventListener('pageshow',function(e){ if(e.persisted && AC && !document.hidden && (ambOn||musOn)) AC.resume(); });
}

global.DENDRO_AUDIO=API;   /* DENDRO P4-2 — 구 명칭 IBCA_AUDIO · IBA_AUDIO에서 개명 */

})(typeof window!=='undefined'?window:this);
