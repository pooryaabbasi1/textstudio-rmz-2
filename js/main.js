(function(){
var cs=new CSInterface(),$=function(i){return document.getElementById(i)};
try{var vl=$("verLabel");if(vl){var match=location.pathname.match(/TextStudio[\/\\]?/);var vPath=decodeURIComponent(location.pathname).replace(/[^\/\\]*$/,"")+"version.json";fetch(vPath+"?t="+Date.now()).then(function(r){return r.json()}).then(function(v){vl.textContent="v"+v.version}).catch(function(){})}}catch(e){}
var MOTIONS={none:"بدون",fade:"محو",slideUp:"از پایین",slideDown:"از بالا",slideLeft:"از راست",slideRight:"از چپ",zoom:"زوم",pop:"پاپ",spin:"چرخش",drop:"سقوط",blurZoom:"زوم دور"};
// state at hidden end of entrance: {o opacity 0-100, x,y offset as frame fraction, s scale %, r rotation deg, mid: optional overshoot}
var FROM={none:{o:100,x:0,y:0,s:100,r:0},fade:{o:0,x:0,y:0,s:100,r:0},slideUp:{o:0,x:0,y:.25,s:100,r:0},slideDown:{o:0,x:0,y:-.25,s:100,r:0},
slideLeft:{o:0,x:.4,y:0,s:100,r:0},slideRight:{o:0,x:-.4,y:0,s:100,r:0},zoom:{o:0,x:0,y:0,s:40,r:0},pop:{o:0,x:0,y:0,s:0,r:0,mid:{s:115}},
spin:{o:0,x:0,y:0,s:50,r:-180},drop:{o:0,x:0,y:-.6,s:100,r:0,mid:{y:.03}},blurZoom:{o:0,x:0,y:0,s:220,r:0}};
var FX={plain:["ساده",{c1:"#ffffff",gs:0,sw2:0,bg:false,sh:0,fillType:"solid"}],neon:["نئون",{c1:"#ffffff",gc:"#00d0ff",gs:4,gr:30,sw2:0,bg:false,fillType:"solid"}],
pink:["نئون صورتی",{c1:"#ffe6f5",gc:"#ff2fa0",gs:5,gr:35,bg:false,fillType:"solid"}],gold:["طلایی",{fillType:"grad",c1:"#fff3b0",c2:"#d08a00",ga:90,gc:"#ffb000",gs:2,gr:20,bg:false}],
box:["باکس",{c1:"#ffffff",gs:0,bg:true,bgc:"#111111",bgo:75,bgr:18}],yellowBox:["زیرنویس زرد",{c1:"#111111",gs:0,bg:true,bgc:"#ffd400",bgo:100,bgr:8}],
outline:["دورخط",{c1:"#ffffff",sc:"#000000",sw2:8,gs:0,bg:false}],fire:["آتش",{fillType:"grad",c1:"#ffe000",c2:"#ff3000",ga:90,gc:"#ff4000",gs:4,gr:40,bg:false}],shadow:["سایه",{c1:"#ffffff",sh:25,gs:0,bg:false,ch:false}],chase:["نور چرخان",{c1:"#ffffff",gs:0,bg:true,bgc:"#0a0a14",bgo:85,bgr:22,ch:true,chc:"#00e5ff",chc2:"#ff2fa0",chn:"2"}]};
var ids=["text","font","size","weight","lh","ls","align","italic","fillType","c1","c2","ga","sc","sw2","gc","gs","gr","sh","bg","bgc","bgo","bgr","px","py","inT","inD","outT","outD","dur","posY","ch","chc","chc2","chs","chw","chg","chl","chn","chd","fps","tl","tlc","tlc2","tls","tlw","tlg","cnt","cf","ct","cd","cdec","ce","cpre","csuf","csep","cfa"];
var OFF={ch:false,tl:"none",cnt:"none",fl:"none"};
var E=window.TextStudioEffects,bgImage=null,bgURL=null,bgLoad=0;
ids=ids.concat(["mspd","mease","bgt","bgc2","bgb","bgbc","fl","fls","flc","flc2","fli"]);
function S(){var o={};ids.forEach(function(i){var e=$(i);o[i]=e.type=="checkbox"?e.checked:(e.type=="number"||e.type=="range")?parseFloat(e.value)||0:e.value});var t=E.timing(o);o.dur=t.dur;return o}
function setVals(v){for(var k in v){var e=$(k);if(!e)continue;if(e.type=="checkbox")e.checked=v[k];else e.value=v[k]}}
function hexA(h,a){var n=parseInt(h.slice(1),16);return"rgba("+(n>>16)+","+(n>>8&255)+","+(n&255)+","+a+")"}
var FA="۰۱۲۳۴۵۶۷۸۹";function fmt(s,v){var t=v.toFixed(Math.max(0,Math.min(3,s.cdec|0)));if(s.csep){var p=t.split(".");p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");t=p.join(".")}t=s.cpre+t+s.csuf;if(s.cfa)t=t.replace(/\d/g,function(d){return FA[d]});return t}
function ease(s,k){return s.ce=="lin"?k:s.ce=="inout"?(k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2):1-Math.pow(1-k,3)}
function dyn(s,tm){var k=Math.max(0,Math.min(1,(tm-E.timing(s).inD)/Math.max(.05,s.cd))),e=ease(s,k);
 if(s.cnt=="count")return fmt(s,s.cf+(s.ct-s.cf)*e);
 if(s.cnt=="clock"){var v=Math.round(s.cf+(s.ct-s.cf)*e),neg=v<0;v=Math.abs(v);var t=(neg?"-":"")+("0"+Math.floor(v/60)).slice(-2)+":"+("0"+v%60).slice(-2);return s.cfa?t.replace(/\d/g,function(d){return FA[d]}):t}
 var full=s.text,n=Math.round(full.length*e);if(s.cnt=="type")return full.slice(0,n);
 if(s.cnt=="scramble"){var ch="ابپتثجچحخدذرزسشصطعغفقکگلمنوهی0123456789#$%&",o="";for(var i=0;i<full.length;i++)o+=i<n||full[i]==" "||full[i]=="\n"?full[i]:ch[Math.floor(Math.abs(Math.sin(i*99+Math.floor(tm*20)))*ch.length)];return o}return full}
function fullText(s){if(s.cnt=="count"){var a=fmt(s,s.cf),b=fmt(s,s.ct);return a.length>b.length?a:b}if(s.cnt=="clock")return s.cfa?"۰۰:۰۰":"00:00";return s.text}
function render(cv,s,scale,tm){scale=scale||1;tm=tm||0;var c=cv.getContext("2d"),mlines=fullText(s).split("\n"),lines=s.cnt!="none"?dyn(s,tm).split("\n"):mlines,fs=s.size*scale;
 var f=(s.italic?"italic ":"")+s.weight+" "+fs+"px \""+s.font+"\", Tahoma, sans-serif";c.font=f;
 var lsz=s.ls*scale,w=0;mlines.forEach(function(l){w=Math.max(w,c.measureText(l).width+lsz*l.length)});
 var lh=fs*s.lh,h=lh*mlines.length,px=s.bg?s.px*scale:0,py=s.bg?s.py*scale:0,m=(s.gs?s.gr*2:0)+s.sw2*scale+s.sh*scale*2+10+(s.ch?(s.chw+s.chg*1.5)*scale+(s.bg?0:12*scale):0)+(s.tl!="none"?(s.tlw+s.tlg)*scale+4:0)+Math.max(0,s.bgb||0)*scale+((s.fl&&s.fl!="none")?16*scale:0);
 cv.width=Math.ceil(w+px*2+m*2);cv.height=Math.ceil(h+py*2+m*2);c=cv.getContext("2d");c.font=f;c.textBaseline="middle";c.direction="rtl";
 try{c.letterSpacing=lsz+"px"}catch(e){}
 if(s.bg){c.fillStyle=hexA(s.bgc,s.bgo/100);var x=m,y=m,W=w+px*2,H=h+py*2,r=Math.min(s.bgr*scale,H/2,W/2);
  c.beginPath();c.moveTo(x+r,y);c.arcTo(x+W,y,x+W,y+H,r);c.arcTo(x+W,y+H,x,y+H,r);c.arcTo(x,y+H,x,y,r);c.arcTo(x,y,x+W,y,r);c.closePath();c.save();c.globalAlpha=s.bgo/100;c.clip();
   if(s.bgt=="img"&&bgImage){var fit=Math.max(W/bgImage.width,H/bgImage.height),iw=bgImage.width*fit,ih=bgImage.height*fit;c.drawImage(bgImage,x+(W-iw)/2,y+(H-ih)/2,iw,ih)}
   else{if(s.bgt=="grad"){var bgGrad=c.createLinearGradient(x,y,x+W,y+H);bgGrad.addColorStop(0,s.bgc);bgGrad.addColorStop(1,s.bgc2);c.fillStyle=bgGrad}else c.fillStyle=s.bgc;c.fillRect(x,y,W,H)}
   c.restore();if(s.bgb>0){c.save();c.globalAlpha=s.bgo/100;c.lineWidth=s.bgb*scale;c.strokeStyle=s.bgbc;c.stroke();c.restore()}}
 if(s.ch){var gp=s.bg?0:12*scale,X=m-gp,Y=m-gp,W2=w+px*2+gp*2,H2=h+py*2+gp*2,R=Math.min((s.bg?s.bgr:16)*scale,H2/2,W2/2);
  var ang=(tm*s.chs*s.chd*2*Math.PI)%(2*Math.PI),cg;try{cg=c.createConicGradient(ang,X+W2/2,Y+H2/2)}catch(e){cg=null}
  if(cg){var n=parseInt(s.chn)||1,L=s.chl/100/n;for(var q=0;q<n;q++){var b0=q/n,col=q%2?s.chc2:s.chc;cg.addColorStop(b0,hexA(col,0));cg.addColorStop(b0+L*.85,hexA(col,1));cg.addColorStop(Math.min(b0+L,1),hexA(col,0));}
   c.save();c.beginPath();c.moveTo(X+R,Y);c.arcTo(X+W2,Y,X+W2,Y+H2,R);c.arcTo(X+W2,Y+H2,X,Y+H2,R);c.arcTo(X,Y+H2,X,Y,R);c.arcTo(X,Y,X+W2,Y,R);c.closePath();
   c.lineWidth=s.chw*scale;c.strokeStyle=cg;c.shadowColor=s.chc;c.shadowBlur=s.chg*scale;c.stroke();if(s.chg)c.stroke();c.restore()}}
 var fill=s.c1;if(s.fillType=="grad"){var a=s.ga*Math.PI/180,cx=cv.width/2,cy=cv.height/2,dx=Math.sin(a)*h/2,dy=-Math.cos(a)*h/2;
  fill=c.createLinearGradient(cx-dx,cy+dy,cx+dx,cy-dy);fill.addColorStop(0,s.c1);fill.addColorStop(1,s.c2);fill=s.ga==90?(function(){var g=c.createLinearGradient(0,m+py,0,m+py+h);g.addColorStop(0,s.c1);g.addColorStop(1,s.c2);return g})():fill}
 c.textAlign=s.align;var ax=s.align=="center"?cv.width/2:s.align=="right"?cv.width-m-px:m+px;
 function each(fn){lines.forEach(function(l,i){fn(l,ax,m+py+lh*i+lh/2)})}
 var flash=E.flash(s,tm);c.save();c.globalAlpha=flash.opacity;c.translate(flash.offset*scale,0);
 if(s.sh){c.save();c.shadowColor="rgba(0,0,0,.8)";c.shadowBlur=s.sh*scale;c.shadowOffsetY=s.sh*scale/3;c.fillStyle=fill;each(function(l,x,y){c.fillText(l,x,y)});c.restore()}
 for(var g=0;g<s.gs;g++){c.save();c.shadowColor=s.gc;c.shadowBlur=s.gr*scale*(g+1)/s.gs*1.5;c.fillStyle=s.gc;each(function(l,x,y){c.fillText(l,x,y)});c.restore()}
 if(s.sw2){c.lineJoin="round";c.lineWidth=s.sw2*scale*2;c.strokeStyle=s.sc;each(function(l,x,y){c.strokeText(l,x,y)})}
 c.fillStyle=fill;each(function(l,x,y){c.fillText(l,x,y)});
 if(s.tl&&s.tl!="none")textLight(c,cv,s,scale,tm,each,f,lsz,lh,h,m,py);
  if(flash.tint&&flash.amount){var mask=document.createElement("canvas");mask.width=cv.width;mask.height=cv.height;var mc=mask.getContext("2d");mc.font=f;mc.direction="rtl";mc.textAlign=s.align;mc.textBaseline="middle";try{mc.letterSpacing=lsz+"px"}catch(e){}mc.fillStyle=flash.tint;each(function(l,x,y){mc.fillText(l,x,y)});c.globalAlpha=flash.amount*flash.opacity;c.drawImage(mask,0,0)}c.restore()}
function textLight(c,cv,s,scale,tm,each,f,lsz,lh,h,m,py){var W=cv.width,H=cv.height,sp=s.tls,T=tm*sp;
 var o=document.createElement("canvas");o.width=W;o.height=H;var x=o.getContext("2d");x.font=f;x.textBaseline="middle";x.direction="rtl";x.textAlign=s.align;try{x.letterSpacing=lsz+"px"}catch(e){}
 var lw=s.tlw*scale,stroke=s.tl=="contour"||s.tl=="dash";
 x.lineJoin="round";x.lineWidth=lw;x.fillStyle="#fff";x.strokeStyle="#fff";
 if(s.tl=="dash"){x.setLineDash([lw*4,lw*3]);x.lineDashOffset=-T*lw*40}
 each(function(l,X,Y){stroke?x.strokeText(l,X,Y):x.fillText(l,X,Y)});
 x.globalCompositeOperation="source-in";var p,alpha=1,blur=s.tlg*scale;
 if(s.tl=="contour"){try{p=x.createConicGradient(T*2*Math.PI,W/2,H/2);p.addColorStop(0,s.tlc);p.addColorStop(.18,"rgba(0,0,0,0)");p.addColorStop(.5,s.tlc2);p.addColorStop(.68,"rgba(0,0,0,0)");p.addColorStop(1,s.tlc)}catch(e){p=s.tlc}}
 else if(s.tl=="dash")p=s.tlc;
 else if(s.tl=="sweep"){var bx=((T%1.4)-.2)*W;p=x.createLinearGradient(bx-W*.15,0,bx+W*.15,H*.3);p.addColorStop(0,"rgba(255,255,255,0)");p.addColorStop(.5,"rgba(255,255,255,.95)");p.addColorStop(1,"rgba(255,255,255,0)");blur=blur*.4}
 else if(s.tl=="scan"){var by=H-((T%1.3)*H*1.1);p=x.createLinearGradient(0,by-H*.12,0,by+H*.12);p.addColorStop(0,hexA(s.tlc,0));p.addColorStop(.5,hexA(s.tlc,1));p.addColorStop(1,hexA(s.tlc,0))}
 else if(s.tl=="rainbow"){p=x.createLinearGradient(0,0,W,0);for(var i=0;i<=6;i++)p.addColorStop(i/6,"hsl("+((i*60+T*360)%360)+",100%,60%)");alpha=.85}
 else if(s.tl=="pulse"){p=s.tlc;alpha=.35+.65*(.5+.5*Math.sin(T*2*Math.PI));blur=blur*(.4+alpha)}
 else if(s.tl=="flicker"){var fr=Math.floor(T*14),r=Math.abs(Math.sin(fr*12.9898)*43758.5)%1;p=s.tlc;alpha=r<.18?.08:r<.3?.5:1}
 x.fillStyle=p;x.fillRect(0,0,W,H);
 c.save();c.globalAlpha=alpha;c.shadowColor=s.tl=="rainbow"||s.tl=="sweep"?"rgba(255,255,255,.6)":s.tlc;c.shadowBlur=blur;c.drawImage(o,0,0);if(blur)c.drawImage(o,0,0);c.restore()}
function animated(s){return s.ch||s.tl!="none"||s.cnt!="none"||(s.fl&&s.fl!="none")}
function css(st,fw){return{opacity:st.o/100,transform:"translate("+(st.x*fw)+"px,"+(st.y*fw*.5625)+"px) scale("+st.s/100+") rotate("+st.r+"deg)"}}
var REST={o:100,x:0,y:0,s:100,r:0};
function mix(a,b){var o={};for(var k in REST)o[k]=k in b?b[k]:a[k];return o}
function inFrames(t,fw){var f=FROM[t],k=[css(f,fw)];if(f.mid)k.push(Object.assign(css(mix(REST,f.mid),fw),{offset:.7}));k.push(css(REST,fw));return k}
function animEl(el,fw,s,loop){var kf=[],base=el.id=="cv"?"translate(-50%,-50%) ":"",duration=E.timing(s).dur;
 for(var i=0;i<=120;i++){var st=css(E.motion(s,duration*i/120,FROM),fw);kf.push({opacity:st.opacity,transform:base+st.transform,offset:i/120})}
 return el.animate(kf,{duration:duration*1000,easing:"linear",iterations:loop?Infinity:1})}
var cv=$("cv"),stage=$("stage");
var t0=performance.now();function upd(){var s=S();var sc=stage.clientWidth/1920;render(cv,s,sc,((performance.now()-t0)/1000)%Math.max(.5,s.dur));cv.style.top=s.posY+"%"}
(function loop(){if(animated(S()))upd();requestAnimationFrame(loop)})();
// font manager
var LS=window.localStorage,ld=function(k,d){try{return JSON.parse(LS.getItem(k))||d}catch(e){return d}},sv=function(k,v){try{LS.setItem(k,JSON.stringify(v))}catch(e){}};
var BASE=["Tahoma","Arial","Vazirmatn","B Nazanin","B Titr","B Yekan","IRANSans","Segoe UI","Times New Roman","Georgia","Impact","Verdana","Courier New"];
var favs=ld("ts_fav",[]),hidden=ld("ts_hide",[]),custom=ld("ts_custom",[]),sysL=[];
function allFonts(){var seen={},out=[];BASE.concat(custom.map(function(c){return c.n}),sysL).forEach(function(n){n=(n||"").trim();var k=n.toLowerCase();if(!n||seen[k]||hidden.indexOf(n)>=0)return;seen[k]=1;out.push(n)});return out}
function drawList(){var q=$("fq").value.toLowerCase(),fo=$("favOnly").checked,L=$("fontList"),cur=$("font").value,dl=$("fonts");L.innerHTML="";dl.innerHTML="";
 var a=allFonts();a.forEach(function(n){var o=document.createElement("option");o.value=n;dl.appendChild(o)});
 a=a.filter(function(n){return(!q||n.toLowerCase().indexOf(q)>=0)&&(!fo||favs.indexOf(n)>=0)}).sort(function(x,y){return(favs.indexOf(y)>=0)-(favs.indexOf(x)>=0)});
 a.slice(0,400).forEach(function(n){var r=document.createElement("div");r.className="fi"+(n==cur?" on":"");var f=favs.indexOf(n)>=0;
  r.innerHTML='<b class="'+(f?"fav":"")+'" title="علاقه‌مندی">'+(f?"★":"☆")+'</b><span class="n"></span><i title="حذف از لیست">✕</i>';var sn=r.querySelector(".n");sn.textContent=n+"  —  متن";sn.style.fontFamily='"'+n+'",Tahoma';
  r.onclick=function(){$("font").value=n;upd();drawFx();drawList()};
  r.querySelector("b").onclick=function(e){e.stopPropagation();var i=favs.indexOf(n);i>=0?favs.splice(i,1):favs.push(n);sv("ts_fav",favs);drawList()};
  r.querySelector("i").onclick=function(e){e.stopPropagation();hidden.push(n);custom=custom.filter(function(c){return c.n!=n});sv("ts_custom",custom);sv("ts_hide",hidden);drawList()};
  L.appendChild(r)});if(!a.length)L.innerHTML='<div class="fi muted">فونتی پیدا نشد</div>'}
function nodeReq(m){try{return typeof require=="function"?require(m):null}catch(e){return null}}
function scanSys(cb){var fsm=nodeReq("fs");if(fsm){var os=require("os"),path=require("path"),dirs=process.platform=="win32"?["C:\\Windows\\Fonts",path.join(process.env.LOCALAPPDATA||"","Microsoft\\Windows\\Fonts")]:["/Library/Fonts","/System/Library/Fonts",path.join(os.homedir(),"Library/Fonts")],out=[];
  dirs.forEach(function(d){try{fsm.readdirSync(d).forEach(function(f){if(/\.(ttf|otf|ttc)$/i.test(f))out.push(f.replace(/\.(ttf|otf|ttc)$/i,"").replace(/[-_ ]?(regular|bold|italic|light|medium|black|thin|semibold|extrabold|bd|bi|i|b)$/i,"").replace(/[-_]/g," "))})}catch(e){}});sysL=out;cb(out.length);return}
 if(window.queryLocalFonts){window.queryLocalFonts().then(function(fs){sysL=fs.map(function(f){return f.family});cb(sysL.length)}).catch(function(){cb(-1)})}else cb(-1)}
function regFont(n,buf){try{var ff=new FontFace(n,buf);return ff.load().then(function(x){document.fonts.add(x);return n})}catch(e){return Promise.reject(e)}}
function b64(buf){var s="",u=new Uint8Array(buf);for(var i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)}
function unb64(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer}
function addFiles(files){var st=$("status"),list=[].filter.call(files,function(f){return/\.(ttf|otf|woff2?)$/i.test(f.name)}),done=0,last="";
 if(!list.length){st.textContent="فایل فونتی (ttf/otf/woff) پیدا نشد";return}st.textContent="در حال بارگذاری "+list.length+" فونت...";
 list.forEach(function(f){f.arrayBuffer().then(function(buf){var n=f.name.replace(/\.(ttf|otf|woff2?)$/i,"").replace(/[-_]/g," ");
  return regFont(n,buf).then(function(){last=n;var rec={n:n};if(f.path)rec.p=f.path;else if(buf.byteLength<1500000)rec.d=b64(buf);
   custom=custom.filter(function(c){return c.n!=n});custom.push(rec);var hi=hidden.indexOf(n);if(hi>=0)hidden.splice(hi,1);sv("ts_custom",custom);sv("ts_hide",hidden)})}).catch(function(){}).then(function(){
   if(++done==list.length){if(last)$("font").value=last;st.textContent="✓ "+done+" فونت اضافه شد";drawList();upd();drawFx()}})})}
custom.forEach(function(c){var fsm=nodeReq("fs");try{if(c.p&&fsm)regFont(c.n,fsm.readFileSync(c.p).buffer).then(drawList);else if(c.d)regFont(c.n,unb64(c.d)).then(drawList)}catch(e){}});
$("sysF").onclick=function(){$("status").textContent="در حال خواندن فونت‌های سیستم...";scanSys(function(n){$("status").textContent=n>=0?"✓ "+n+" فونت سیستم":"مرورگر اجازه دسترسی نداد؛ از دکمه فایل یا پوشه استفاده کنید";drawList()})};
$("fileF").onclick=function(){$("fileIn").click()};$("dirF").onclick=function(){$("dirIn").click()};
$("fileIn").onchange=function(){addFiles(this.files);this.value=""};$("dirIn").onchange=function(){addFiles(this.files);this.value=""};
$("fq").oninput=drawList;$("favOnly").onchange=drawList;$("font").addEventListener("change",drawList);
if(nodeReq("fs"))scanSys(drawList);drawList();
// motion cards
function cards(box,sel,kind){Object.keys(MOTIONS).forEach(function(k){var o=document.createElement("option");o.value=k;o.textContent=MOTIONS[k];$(sel).appendChild(o);
 var c=document.createElement("div");c.className="card";c.innerHTML='<div class="mini"><span>متن</span></div><div class="nm">'+MOTIONS[k]+'</div>';
 var sp=c.querySelector("span"),an=null;
 function go(){if(an)an.cancel();var s=S(),d={dur:2.2,inD:.6,outD:.5,inT:kind=="in"?k:"none",outT:kind=="out"?k:"none",mspd:s.mspd,mease:s.mease};an=animEl(sp,100,d,true)}
 c.onmouseenter=go;c.onmouseleave=function(){if(an)an.cancel();an=null};
 c.onclick=function(){$(sel).value=k;box.querySelectorAll(".card").forEach(function(x){x.classList.remove("on")});c.classList.add("on");upd();play()};
 box.appendChild(c)})}
cards($("inCards"),"inT","in");cards($("outCards"),"outT","out");
$("inT").value="fade";$("outT").value="fade";
[["inCards","inT"],["outCards","outT"]].forEach(function(p){var i=Object.keys(MOTIONS).indexOf($(p[1]).value);$(p[0]).children[i].classList.add("on")});
// style preset cards with live mini renders
Object.keys(FX).forEach(function(k){var c=document.createElement("div");c.className="card";c.innerHTML='<div class="mini"><canvas></canvas></div><div class="nm">'+FX[k][0]+'</div>';
 var mc=c.querySelector("canvas"),pulse=null;
 function draw(){var s=Object.assign(S(),OFF,{bgt:"solid",bgb:0},FX[k][1],{text:"متن",size:60,px:30,py:12});render(mc,s,.5);mc.style.maxHeight="40px"}
 var raf=0;function spin(){var s=Object.assign(S(),OFF,{bgt:"solid",bgb:0},FX[k][1],{text:"متن",size:60,px:30,py:12});render(mc,s,.5,performance.now()/1000);raf=requestAnimationFrame(spin)}
 c.onmouseenter=function(){if(FX[k][1].ch){spin();return}pulse=mc.animate([{transform:"scale(1)"},{transform:"scale(1.25)"},{transform:"scale(1)"}],{duration:900,iterations:Infinity})};
 c.onmouseleave=function(){if(pulse)pulse.cancel();cancelAnimationFrame(raf);draw()};
 c.onclick=function(){setVals(Object.assign({},OFF,{bgt:"solid",bgb:0},FX[k][1]));upd();play()};c._draw=draw;$("fxCards").appendChild(c)});
function liveCard(box,name,over,onpick){var c=document.createElement("div");c.className="card";c.innerHTML='<div class="mini"><canvas></canvas></div><div class="nm">'+name+'</div>';
 var mc=c.querySelector("canvas"),raf=0,st=0;function sp(){return Object.assign(S(),OFF,{text:"متن",size:60,px:30,py:12,gs:0,inD:0},over)}
 function draw(t){render(mc,sp(),.5,t||1.2);mc.style.maxHeight="40px"}
 function run(){render(mc,sp(),.5,(performance.now()-st)/1000%3.5);mc.style.maxHeight="40px";raf=requestAnimationFrame(run)}
 c.onmouseenter=function(){st=performance.now();run()};c.onmouseleave=function(){cancelAnimationFrame(raf);draw()};
 c.onclick=function(){box.querySelectorAll(".card").forEach(function(x){x.classList.remove("on")});c.classList.add("on");onpick();upd();play()};c._draw=draw;box.appendChild(c)}
var FLS={strobe:"استروب",white:"فلش سفید",colors:"فلش رنگی",hit:"ضربه ورود",glitch:"گلیچ",beat:"ضرب‌آهنگ"};
Object.keys(FLS).forEach(function(k){liveCard($("flCards"),FLS[k],{fl:k},function(){$("fl").value=k})});
var TLS={contour:["نئون چرخشی"],dash:["خط‌چین روان"],sweep:["پرتو عبوری"],pulse:["تپش نئون"],flicker:["نئون خراب"],rainbow:["رنگین‌کمان"],scan:["اسکن نور"]};
Object.keys(TLS).forEach(function(k){liveCard($("tlCards"),TLS[k][0],{tl:k,c1:k=="sweep"||k=="rainbow"?"#ffffff":"#1a1a2a",text:"نئون"},function(){$("tl").value=k;$("ch").checked=false})});
var CNT=[["۰ تا ۱۰۰٪",{cnt:"count",cf:0,ct:100,csuf:"%",cpre:"",cdec:0}],["شمارش معکوس",{cnt:"count",cf:100,ct:0,csuf:"",cpre:"",cdec:0}],["۱ میلیون",{cnt:"count",cf:0,ct:1000000,csuf:"+",cpre:"",cdec:0,csep:true}],["قیمت $",{cnt:"count",cf:0,ct:99.99,cpre:"$",csuf:"",cdec:2}],["تایمر ساعت",{cnt:"clock",cf:90,ct:0}],["تایپ",{cnt:"type"}],["درهم‌ریختن",{cnt:"scramble"}]];
CNT.forEach(function(p){var ov=Object.assign({},p[1]);if(p[1].cnt=="type"||p[1].cnt=="scramble")ov.text="سلام";liveCard($("cntCards"),p[0],Object.assign(ov,{cd:2,size:p[1].cnt=="count"&&p[1].ct>1000?36:60}),function(){setVals(p[1])})});
var DEF=null;setTimeout(function(){DEF=S()},0);
$("reset").onclick=function(){if(!DEF)return;setVals(DEF);clearBgImage();document.querySelectorAll("#tlCards .card,#cntCards .card,#flCards .card,#inCards .card,#outCards .card").forEach(function(x){x.classList.remove("on")});syncMotionCards();speedLabel();$("status").textContent="تنظیمات ریست شد";upd();drawFx();drawList();play()};
function drawFx(){[].forEach.call(document.querySelectorAll("#fxCards .card,#tlCards .card,#cntCards .card,#flCards .card"),function(c){c._draw()})}
var sw=["#ffffff","#000000","#ffd400","#ff3b3b","#ff2fa0","#9b5cff","#2d8cff","#00d0ff","#1ed760","#ff8a00"];
sw.forEach(function(h){var e=document.createElement("span");e.style.background=h;e.title=h;e.onclick=function(){$("c1").value=h;upd()};$("sw").appendChild(e)});
function syncMotionCards(){[["inCards","inT"],["outCards","outT"]].forEach(function(p){var n=Object.keys(MOTIONS).indexOf($(p[1]).value);[].forEach.call($(p[0]).children,function(c,i){c.classList.toggle("on",i==n)})})}
function speedLabel(){var n=parseFloat($("mspd").value);$("mspdV").textContent=(n<1?"آهسته":n>1?"سریع":"عادی")+" ×"+n}
function clearBgImage(){bgLoad++;bgImage=null;if(bgURL)URL.revokeObjectURL(bgURL);bgURL=null;$("bgImgIn").value="";$("bgImgN").textContent="تصویری انتخاب نشده"}
$("bgImgB").onclick=function(){$("bgImgIn").click()};
$("bgImgX").onclick=function(){clearBgImage();$("bgt").value="solid";upd();drawFx()};
$("bgImgIn").onchange=function(){var file=this.files[0];if(!file)return;clearBgImage();var token=bgLoad;bgURL=URL.createObjectURL(file);var image=new Image();image.onload=function(){if(token!=bgLoad)return;bgImage=image;$("bg").checked=true;$("bgt").value="img";$("bgImgN").textContent=file.name;upd();drawFx()};image.onerror=function(){if(token!=bgLoad)return;clearBgImage();$("status").textContent="تصویر باز نشد؛ فایل PNG یا JPG انتخاب کنید"};image.src=bgURL};
var cur=null;function play(){if(cur)cur.cancel();t0=performance.now();upd();cur=animEl(cv,stage.clientWidth,S(),false)}
ids.forEach(function(i){$(i).addEventListener("input",function(){upd();if(i=="font")drawFx();if(i=="mspd"||i=="mease"||i=="inD"||i=="outD"||i=="dur"){speedLabel();play()}})});
$("play").onclick=play;window.addEventListener("resize",upd);
// apply to Premiere
function keys(s){var out=[],t=E.timing(s),times=[0,t.inD,t.dur-t.outD,t.dur];
 function section(start,len){if(!len)return;for(var i=0;i<=24;i++)times.push(start+len*i/24)}
 section(0,t.inD);section(t.dur-t.outD,t.outD);times.sort(function(a,b){return a-b});
 var last=-1;times.forEach(function(tm){tm=+tm.toFixed(5);if(tm==last)return;last=tm;var st=E.motion(s,tm,FROM);out.push({t:tm,o:st.o,x:.5+st.x,y:s.posY/100+st.y,s:st.s,r:st.r})});return out}
function exportOne(s,at,cb){var big=document.createElement("canvas");
 var fs=require("fs"),path=require("path"),os=require("os"),id="text_"+Date.now()+"_"+Math.floor(Math.random()*1e4),dir=path.join(os.homedir(),"Documents","TextStudio");
 var an=animated(s);if(an)dir=path.join(dir,id);try{fs.mkdirSync(dir,{recursive:true})}catch(e){}
 var save=function(f){fs.writeFileSync(f,Buffer.from(big.toDataURL("image/png").split(",")[1],"base64"))},file,seq=0;
 if(an){var fps=parseInt(s.fps),N=Math.ceil(s.dur*fps);for(var i=0;i<N;i++){render(big,s,1,i/fps);save(path.join(dir,id+"_"+("0000"+i).slice(-5)+".png"))}file=path.join(dir,id+"_00000.png");seq=1}
 else{render(big,s,1);file=path.join(dir,id+".png");save(file)}
 var d={dur:s.dur,keys:keys(s),seq:seq,id:id};if(typeof at=="number")d.at=at;
 cs.evalScript("TS_insert("+JSON.stringify(file)+","+JSON.stringify(JSON.stringify(d))+")",cb)}
$("apply").onclick=function(){var s=S(),st=$("status");
 if(!cs.isInHost()){st.textContent="حالت تست مرورگر: در پریمیر، متن به تایم‌لاین اضافه می‌شود.";play();return}
 st.textContent="در حال افزودن...";exportOne(s,null,function(r){st.textContent=r=="OK"?"✓ اضافه شد":"خطا: "+r})};
// motion only on selected Premiere clips (keeps their own text/style)
function relKeys(s){return keys(Object.assign({},s,{posY:50})).map(function(k){return {t:k.t,o:k.o,x:k.x-.5,y:k.y-.5,s:k.s,r:k.r}})}
$("applySel").onclick=function(){var st=$("status");
 if(!cs.isInHost()){st.textContent="حالت تست مرورگر: در پریمیر، موشن روی لایه انتخاب‌شده اعمال می‌شود.";play();return}
 st.textContent="در حال خواندن لایه‌های انتخاب‌شده...";
 cs.evalScript("TS_selInfo()",function(r){var list;try{list=JSON.parse(r)}catch(e){st.textContent="خطا: "+r;return}
  if(!list.length){st.textContent="ابتدا لایه متن را در تایم‌لاین انتخاب کنید";return}
  var jobs=list.map(function(c){var s=S();s.dur=c.dur;return {i:c.i,keys:relKeys(s)}});
  cs.evalScript("TS_motionSel("+JSON.stringify(JSON.stringify(jobs))+")",function(x){st.textContent=x=="OK"?"✓ موشن روی "+list.length+" لایه اعمال شد":"خطا: "+x})})};
// ---- subtitles (offline, free) ----
var SB=window.TextStudioSubs,cues=[];
function subItems(){var n=parseInt($("subN").value)||2;return $("subMode").value=="word"?cues.reduce(function(a,c){return a.concat(SB.groups(c,n))},[]):cues.slice()}
function subStyle(it){var s=Object.assign(S(),{text:it.text,cnt:"none"}),len=Math.max(.2,it.end-it.start);
 if($("subShort").checked){var k=Math.min(1,len*.6/Math.max(.01,s.inD+s.outD));s.inD=+(s.inD*k).toFixed(3);s.outD=+(s.outD*k).toFixed(3);s.mspd=1}
 s.dur=len;var t=E.timing(s);s.dur=len;return s}
function drawSubs(){var L=$("subList");L.innerHTML="";cues.forEach(function(c,i){var r=document.createElement("div");r.className="frow";r.style.gap="6px";
 var tm=document.createElement("span");tm.className="muted";tm.style.minWidth="78px";tm.textContent=SB.fmtTime(c.start)+"–"+SB.fmtTime(c.end);
 var ip=document.createElement("input");ip.value=c.text;ip.style.flex="1";ip.oninput=function(){c.text=ip.value;$("text").value=ip.value;upd()};
 ip.onfocus=r.onclick=function(){$("text").value=c.text;upd();play()};
 var x=document.createElement("button");x.textContent="✕";x.onclick=function(e){e.stopPropagation();cues.splice(i,1);drawSubs()};
 r.appendChild(tm);r.appendChild(ip);r.appendChild(x);L.appendChild(r)});
 $("subInfo").textContent=cues.length?cues.length+" خط زیرنویس · "+subItems().length+" کلیپ ساخته می‌شود":"هنوز فایلی بارگذاری نشده"}
function loadSubText(txt,name){cues=SB.parse(txt);drawSubs();$("status").textContent=cues.length?"✓ "+name+" بارگذاری شد":"فایل زیرنویس معتبر نیست";if(cues[0]){$("text").value=cues[0].text;upd()}}
function readSub(f){if(!f)return;var r=new FileReader();r.onload=function(){loadSubText(r.result,f.name)};r.readAsText(f,"utf-8")}
$("subB").onclick=function(){$("subIn").click()};$("subIn").onchange=function(){readSub(this.files[0]);this.value=""};
$("subX").onclick=function(){cues=[];drawSubs()};$("subMode").onchange=$("subN").oninput=drawSubs;
var dz=$("subDrop");dz.ondragover=function(e){e.preventDefault();dz.style.borderColor="#0cf"};dz.ondragleave=function(){dz.style.borderColor="#555"};
dz.ondrop=function(e){e.preventDefault();dz.style.borderColor="#555";readSub(e.dataTransfer.files[0])};
$("subApply").onclick=function(){var st=$("status"),items=subItems();if(!items.length){st.textContent="ابتدا فایل زیرنویس را انتخاب کنید";return}
 if(!cs.isInHost()){st.textContent="حالت تست مرورگر: "+items.length+" کلیپ زیرنویس در پریمیر ساخته می‌شود.";$("text").value=items[0].text;play();return}
 var i=0,err=0;(function next(){if(i>=items.length){st.textContent=err?"پایان با "+err+" خطا":"✓ "+items.length+" زیرنویس اضافه شد";return}
  var it=items[i++];st.textContent="در حال افزودن "+i+" از "+items.length+"...";
  setTimeout(function(){exportOne(subStyle(it),it.start,function(r){if(r!="OK")err++;next()})},10)})()};
drawSubs();
// ---- one-click updater ----
var UPD="https://raw.githubusercontent.com/pooryaabbasi1/textstudio-rmz-2/main/";
$("updB").onclick=function(){var st=$("status");if(!cs.isInHost()){st.textContent="بروزرسانی فقط داخل پریمیر کار می‌کند";return}
 var fs=require("fs"),path=require("path"),root=decodeURIComponent(location.pathname).replace(/^\/([A-Za-z]:)/,"$1").replace(/[\\\/]index\.html$/,"");
 var local={};try{local=JSON.parse(fs.readFileSync(path.join(root,"version.json"),"utf8"))}catch(e){}
 st.textContent="در حال بررسی نسخه جدید...";
 fetch(UPD+"version.json?t="+Date.now()).then(function(r){return r.json()}).then(function(v){
  if(v.version==local.version){st.textContent="✓ آخرین نسخه نصب است ("+v.version+")";return}
  return Promise.all(v.files.map(function(f){return fetch(UPD+f+"?t="+Date.now()).then(function(r){if(!r.ok)throw new Error(f);return r.arrayBuffer()}).then(function(b){return [f,b]})})).then(function(all){
   all.forEach(function(x){var p=path.join(root,x[0]);try{fs.mkdirSync(path.dirname(p),{recursive:true})}catch(e){}fs.writeFileSync(p,Buffer.from(x[1]))});
   fs.writeFileSync(path.join(root,"version.json"),JSON.stringify(v));st.textContent="✓ به نسخه "+v.version+" بروز شد، در حال بارگذاری مجدد...";setTimeout(function(){location.reload()},800)})
 }).catch(function(e){st.textContent="بروزرسانی ناموفق: اینترنت را بررسی کنید"})};
setTimeout(function(){upd();drawFx();play()},50);
if(document.fonts)document.fonts.ready.then(function(){upd();drawFx()});
// ---- accordion + hamburger ----
(function(){
 var menuBtn=document.getElementById("menuBtn"),drawer=document.getElementById("menuDrawer");
 var details=Array.prototype.slice.call(document.querySelectorAll(".panel details"));
 var fxCardMap={plain:"sec-color",neon:"sec-color",pink:"sec-color",gold:"sec-color",box:"sec-color",yellowBox:"sec-color",outline:"sec-color",fire:"sec-color",shadow:"sec-color",chase:"sec-chase"};
 var tlCardMap={contour:"sec-tl",dash:"sec-tl",sweep:"sec-tl",pulse:"sec-tl",flicker:"sec-tl",rainbow:"sec-tl",scan:"sec-tl"};
 function closeAll(except){details.forEach(function(d){if(d!==except)d.open=false})}
 function openSec(id){var target=document.getElementById(id);if(!target)return;closeAll(target);target.open=true;if(menuBtn)menuBtn.textContent="\u2630";if(drawer)drawer.classList.add("hidden")}
 menuBtn.onclick=function(e){e.stopPropagation();var willOpen=drawer.classList.contains("hidden");if(willOpen){drawer.classList.remove("hidden");menuBtn.textContent="\u2715"}else{drawer.classList.add("hidden");menuBtn.textContent="\u2630"}};
 drawer.querySelectorAll(".drawer-item").forEach(function(item){item.onclick=function(e){e.stopPropagation();openSec(item.getAttribute("data-target"))}});
 document.addEventListener("click",function(e){if(!drawer.contains(e.target)&&e.target!==menuBtn){drawer.classList.add("hidden");menuBtn.textContent="\u2630"}});
 details.forEach(function(d){d.addEventListener("toggle",function(){if(d.open)closeAll(d)})});
 // intercept style card clicks to open corresponding section
 function bindCardOpen(containerId,cardMap){var box=document.getElementById(containerId);if(!box)return;box.addEventListener("click",function(e){var card=e.target.closest(".card");if(!card)return;var nm=card.querySelector(".nm");if(!nm)return;var name=nm.textContent;var idx=-1;Object.keys(cardMap).forEach(function(k,i){if(FX[k]&&FX[k][0]===name)idx=FX[k]?Object.keys(FX).indexOf(k):-1});var key=Object.keys(cardMap).find(function(k){return(FX[k]&&FX[k][0]===name)||(TLS[k]&&TLS[k][0]===name)});if(key){setTimeout(function(){openSec(cardMap[key])},50)}})}
 bindCardOpen("fxCards",fxCardMap);
 bindCardOpen("tlCards",tlCardMap);
})();
})();
