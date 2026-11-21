/* Text Studio subtitles: offline SRT/VTT parsing and word grouping (browser-safe, no deps) */
(function(g){
function ts(x){var m=String(x).trim().replace(",",".").match(/^(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?$/);if(!m)return NaN;return (+(m[1]||0))*3600+(+m[2])*60+(+m[3])+(m[4]?+("0."+m[4]):0)}
function parse(src){var out=[],blocks=String(src).replace(/^\uFEFF/,"").replace(/\r/g,"").split(/\n\s*\n/);
 blocks.forEach(function(b){var L=b.split("\n").filter(function(l){return l.trim()!==""});var i=0;while(i<L.length&&L[i].indexOf("-->")<0)i++;if(i>=L.length)return;
  var p=L[i].split("-->"),a=ts(p[0]),e=ts(p[1].trim().split(/\s+/)[0]);if(isNaN(a)||isNaN(e)||e<=a)return;
  var text=L.slice(i+1).join("\n").replace(/<[^>]+>/g,"").replace(/\{\\[^}]*\}/g,"").trim();if(text)out.push({start:a,end:e,text:text})});
 return out.sort(function(x,y){return x.start-y.start})}
function groups(cue,n){n=Math.max(1,n|0);var w=cue.text.split(/\s+/).filter(Boolean);if(!w.length)return[];var total=w.reduce(function(s,x){return s+x.length},0),len=cue.end-cue.start,t=cue.start,out=[];
 for(var i=0;i<w.length;i+=n){var part=w.slice(i,i+n),c=part.reduce(function(s,x){return s+x.length},0),d=len*c/total;out.push({start:+t.toFixed(3),end:+(t+d).toFixed(3),text:part.join(" ")});t+=d}
 out[out.length-1].end=cue.end;return out}
function fromWords(words,opts){opts=opts||{};var max=Math.max(1,opts.maxWords||6),maxDur=opts.maxDur||4.5,gap=opts.gap==null?.6:opts.gap,off=+opts.offset||0,out=[],cur=null;
 words.forEach(function(w,i){var text=String(w.text||"").trim(),start=+w.start;if(!text||!isFinite(start))return;var next=words[i+1],end=+w.end;if(!isFinite(end)||end<=start)end=next&&isFinite(+next.start)&&+next.start>start?+next.start:start+.4;
  var previous=cur&&cur.words[cur.words.length-1],newCue=!cur||cur.words.length>=max||end-cur.start>maxDur||previous&&start-previous.end>gap||previous&&/[.!؟?…]$/.test(previous.text);
  if(newCue){cur={start:start,end:end,words:[{text:text,start:start,end:end}]};out.push(cur)}else{cur.words.push({text:text,start:start,end:end});cur.end=end}});
 return out.map(function(c){return{start:+(c.start+off).toFixed(3),end:+(Math.max(c.start+.1,c.end)+off).toFixed(3),text:c.words.map(function(w){return w.text}).join(" ").replace(/\s+([,.!؟?…])/g,"$1").trim()}})}
function fmtTime(s){var m=Math.floor(s/60),x=(s%60).toFixed(1);return m+":"+(x<10?"0":"")+x}
 g.TextStudioSubs={parse:parse,groups:groups,fromWords:fromWords,ts:ts,fmtTime:fmtTime};
})(this);
