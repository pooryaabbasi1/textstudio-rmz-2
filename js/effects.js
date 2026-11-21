(function(root){
 var api={};
 api.timing=function(s){
  var dur=Math.max(.1,Number(s.dur)||4),speed=Math.max(.25,Number(s.mspd)||1);
  var a=Math.max(0,Number(s.inD)||0)/speed,b=Math.max(0,Number(s.outD)||0)/speed;
  var ratio=a+b>dur?dur/(a+b):1;
  return {dur:dur,inD:a*ratio,outD:b*ratio};
 };
 api.eased=function(k,kind){
  k=Math.max(0,Math.min(1,k));
  if(kind=="linear")return k;
  // Cubic-bezier curves used by CSS, solved for time x.
  var p=kind=="ease-in"?[.42,0,1,1]:kind=="ease-out"?[0,0,.58,1]:[.42,0,.58,1];
  function bez(t,a,b){return 3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t}
  var lo=0,hi=1,t=k;for(var i=0;i<20;i++){t=(lo+hi)/2;if(bez(t,p[0],p[2])<k)lo=t;else hi=t}
  return bez(t,p[1],p[3]);
 };
 api.motion=function(s,tm,from){
  var timing=api.timing(s),rest={o:100,x:0,y:0,s:100,r:0};
  function blend(a,b,k){var v={};for(var key in rest)v[key]=a[key]+(b[key]-a[key])*api.eased(k,s.mease);return v}
  function entrance(kind,k){var f=from[kind]||rest;if(!f.mid)return blend(f,rest,k);
   var mid={};for(var key in rest)mid[key]=key in f.mid?f.mid[key]:rest[key];
   return k<.7?blend(f,mid,k/.7):blend(mid,rest,(k-.7)/.3)}
  if(timing.inD>0&&tm<timing.inD)return entrance(s.inT,Math.max(0,tm/timing.inD));
  if(timing.outD>0&&tm>timing.dur-timing.outD)return entrance(s.outT,Math.max(0,(timing.dur-tm)/timing.outD));
  return rest;
 };
 api.flash=function(s,tm){
  var speed=Math.max(.5,Number(s.fls)||4),strength=Math.max(0,Math.min(1,Number(s.fli)/100)),phase=((tm*speed)%1+1)%1;
  var out={opacity:1,tint:null,amount:0,offset:0};
  if(s.fl=="strobe")out.opacity=phase<.5?1:1-strength;
  if(s.fl=="white"||s.fl=="colors"){out.tint=s.fl=="white"?"#ffffff":phase<.5?s.flc:s.flc2;out.amount=strength*Math.pow(1-(phase% .5)*2,3)}
  if(s.fl=="hit"){out.tint=s.flc;out.amount=strength*Math.max(0,1-tm*speed)}
  if(s.fl=="beat"){out.tint=s.flc;out.amount=strength*Math.pow(Math.max(0,Math.cos(phase*Math.PI*2)),8)}
  if(s.fl=="glitch"){var n=Math.floor(tm*speed*4);out.offset=n%4<2?(n%2?1:-1)*strength*12:0;out.tint=n%2?s.flc:s.flc2;out.amount=out.offset?strength*.7:0}
  return out;
 };
 api.photoFlash=function(t,o){o=o||{};var sp=Math.max(.1,Number(o.speed)||1),per=Math.max(.05,(Number(o.period)||1)/sp),dec=Math.max(.02,(Number(o.decay)||.4)/sp),m=o.mode||"hit";t=Math.max(0,t||0);
  if(m=="off")return 0;
  if(m=="once")return t<dec?Math.pow(1-t/dec,2):0;
  if(m=="hit"){var u=t%per;return u<dec?Math.pow(1-u/dec,2):0}
  if(m=="strobe")return (t%per)<per/2?1:0;
  if(m=="pulse")return .5-.5*Math.cos(2*Math.PI*t/per);
  return 0};
 root.TextStudioEffects=api;
})(typeof window!="undefined"?window:globalThis);