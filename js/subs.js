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
function fmtTime(s){var m=Math.floor(s/60),x=(s%60).toFixed(1);return m+":"+(x<10?"0":"")+x}
g.TextStudioSubs={parse:parse,groups:groups,ts:ts,fmtTime:fmtTime};
})(this);
