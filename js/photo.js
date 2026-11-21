(function(){var E=window.TextStudioEffects,$=function(i){return document.getElementById(i)},img=null,name="",raf=0,t0=0;
function O(){return{mode:$("phMode").value,speed:+$("phSpd").value,period:+$("phPer").value,decay:+$("phDec").value,col:$("phCol").value,gcol:$("phGcol").value,glow:+$("phGlow").value,base:+$("phBase").value,dur:+$("phDur").value,fps:parseInt($("phFps").value)}}
function draw(cv,o,t,maxW){if(!img)return;var sc=maxW?Math.min(1,maxW/img.width):1,w=Math.round(img.width*sc),h=Math.round(img.height*sc),pad=Math.round(o.glow*2*sc+4);
 cv.width=w+pad*2;cv.height=h+pad*2;var c=cv.getContext("2d"),a=E.photoFlash(t,o);c.clearRect(0,0,cv.width,cv.height);
 var sil=document.createElement("canvas");sil.width=w;sil.height=h;var s=sil.getContext("2d");s.drawImage(img,0,0,w,h);s.globalCompositeOperation="source-in";
 var g=Math.max(o.base,a);if(g>0.001&&o.glow>0){s.fillStyle=o.gcol;s.fillRect(0,0,w,h);c.save();c.globalAlpha=g;c.shadowColor=o.gcol;for(var k=0;k<3;k++){c.shadowBlur=o.glow*sc*(k+1)/2;c.drawImage(sil,pad,pad)}c.restore()}
 c.drawImage(img,pad,pad,w,h);
 if(a>0.001){s.globalCompositeOperation="source-over";s.clearRect(0,0,w,h);s.drawImage(img,0,0,w,h);s.globalCompositeOperation="source-in";s.fillStyle=o.col;s.fillRect(0,0,w,h);c.globalAlpha=a;c.drawImage(sil,pad,pad);c.globalAlpha=1}}
function loop(n){if(!t0)t0=n;var o=O(),t=((n-t0)/1000)%Math.max(.1,o.dur);draw($("phCv"),o,t,300);raf=requestAnimationFrame(loop)}
function load(f){if(!f)return;var u=URL.createObjectURL(f),i=new Image();i.onload=function(){img=i;name=f.name;$("phN").textContent=f.name+" ("+i.width+"×"+i.height+")";$("phCv").hidden=false;cancelAnimationFrame(raf);t0=0;raf=requestAnimationFrame(loop)};i.onerror=function(){$("phN").textContent="تصویر باز نشد؛ PNG شفاف انتخاب کنید"};i.src=u}
$("phB").onclick=function(){$("phIn").click()};$("phIn").onchange=function(){load(this.files[0])};
$("phX").onclick=function(){img=null;cancelAnimationFrame(raf);$("phCv").hidden=true;$("phN").textContent="تصویری انتخاب نشده";$("phIn").value=""};
var dz=$("phDrop");dz.ondragover=function(e){e.preventDefault()};dz.ondrop=function(e){e.preventDefault();e.stopPropagation();load(e.dataTransfer.files[0])};
["phSpd","phPer","phDec","phGlow","phBase"].forEach(function(id){var v=$(id+"V");if(v){var f=function(){v.textContent=$(id).value};$(id).addEventListener("input",f);f()}});
[["phPre1",{mode:"once",col:"#ffffff",gcol:"#ffffff"}],["phPre2",{mode:"hit",col:"#ffffff",gcol:"#7fd8ff"}],["phPre3",{mode:"strobe",col:"#ffffff",gcol:"#ffffff"}],["phPre4",{mode:"pulse",col:"#ff3cac",gcol:"#ff3cac"}]].forEach(function(p){$(p[0]).onclick=function(){$("phMode").value=p[1].mode;$("phCol").value=p[1].col;$("phGcol").value=p[1].gcol;t0=0}});
$("phApply").onclick=function(){var st=$("status");if(!img){st.textContent="اول عکس سوژه را انتخاب کنید";return}
 if(typeof require!="function"||!window.__adobe_cep__){st.textContent="افزودن به تایم‌لاین فقط داخل پریمیر کار می‌کند";return}
 st.textContent="در حال ساخت فریم‌ها...";setTimeout(function(){try{var fs=require("fs"),path=require("path"),os=require("os"),o=O(),id="photo_"+Date.now(),dir=path.join(os.homedir(),"Documents","TextStudio",id);fs.mkdirSync(dir,{recursive:true});
  var cv=document.createElement("canvas"),N=Math.ceil(o.dur*o.fps);for(var i=0;i<N;i++){draw(cv,o,i/o.fps,0);fs.writeFileSync(path.join(dir,id+"_"+("0000"+i).slice(-5)+".png"),Buffer.from(cv.toDataURL("image/png").split(",")[1],"base64"))}
  var d={dur:o.dur,keys:[],seq:1,id:id};new CSInterface().evalScript("TS_insert("+JSON.stringify(path.join(dir,id+"_00000.png"))+","+JSON.stringify(JSON.stringify(d))+")",function(r){st.textContent=r=="OK"?"✓ سوژه با افکت اضافه شد":"خطا: "+r})}catch(e){st.textContent="خطا: "+e}},30)};
})();
