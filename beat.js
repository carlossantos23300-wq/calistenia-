(function(root){
'use strict';
// A small beat made in the browser: driving while working, slow and soft while resting.
let ctx=null,master=null,timer=null,next=0,step=0,mode='work',noise=null;
const patterns={work:{bpm:124,kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0],snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],hat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1],bass:[45,0,45,0,0,45,0,48,43,0,43,0,0,43,0,47]},rest:{bpm:78,kick:[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],snare:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],hat:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],bass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],pad:[[57,60,64],[55,59,62]]}};
const freq=n=>440*2**((n-69)/12);
function setup(){if(ctx)return true;try{ctx=new (root.AudioContext||root.webkitAudioContext)();master=ctx.createGain();master.gain.value=.22;master.connect(ctx.destination);const len=ctx.sampleRate*.5,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;noise=buf;return true}catch{return false}}
function env(node,t,peak,decay){node.gain.setValueAtTime(.0001,t);node.gain.exponentialRampToValueAtTime(peak,t+.005);node.gain.exponentialRampToValueAtTime(.0001,t+decay)}
function kick(t){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);env(g,t,1,.32);o.connect(g).connect(master);o.start(t);o.stop(t+.35)}
function hiss(t,type,f,peak,decay){const s=ctx.createBufferSource(),flt=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;flt.type=type;flt.frequency.value=f;env(g,t,peak,decay);s.connect(flt).connect(g).connect(master);s.start(t);s.stop(t+decay+.02)}
function tone(t,note,len,type,peak,cutoff){const o=ctx.createOscillator(),flt=ctx.createBiquadFilter(),g=ctx.createGain();o.type=type;o.frequency.value=freq(note);flt.type='lowpass';flt.frequency.value=cutoff;env(g,t,peak,len);o.connect(flt).connect(g).connect(master);o.start(t);o.stop(t+len+.05)}
function schedule(){const p=patterns[mode],sixteenth=60/p.bpm/4;while(next<ctx.currentTime+.12){const i=step%16;if(p.kick[i])kick(next);if(p.snare[i])hiss(next,'bandpass',1800,.5,.18);if(p.hat[i])hiss(next,'highpass',7000,.18,.05);if(p.bass[i])tone(next,p.bass[i],sixteenth*1.6,'sawtooth',.32,600);if(p.pad&&i%8===0)for(const n of p.pad[(step>>3)%2])tone(next,n,sixteenth*7.5,'sine',.07,1800);next+=sixteenth;step++}}
const Beat={get playing(){return !!timer},start(m){if(!setup())return false;if(m)mode=m;ctx.resume().catch(()=>{});if(timer)return true;next=ctx.currentTime+.05;step=0;timer=setInterval(schedule,25);schedule();return true},stop(){clearInterval(timer);timer=null},mode(m){if(patterns[m])mode=m},toggle(m){if(timer){this.stop();return false}return this.start(m)}};
root.Beat=Beat;
})(window);
