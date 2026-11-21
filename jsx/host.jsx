// Text Studio - ExtendScript host (Premiere Pro). Uses only native Motion & Opacity keyframes.
if(typeof JSON!=="object"){JSON={parse:function(s){return eval("("+s+")")}};}
function TS_find(bin,name){for(var i=0;i<bin.children.numItems;i++){var c=bin.children[i];if(c.name==name)return c;}return null;}
function TS_prop(clip,comp,prop){for(var i=0;i<clip.components.numItems;i++){var c=clip.components[i];if(c.displayName==comp||c.matchName==comp){for(var j=0;j<c.properties.numItems;j++){var p=c.properties[j];if(p.displayName==prop)return p;}}}return null;}
function TS_insert(file,json){
 try{var d=JSON.parse(json),seq=app.project.activeSequence;if(!seq)return "No active sequence";
  app.project.importFiles([file],true,app.project.rootItem,!!d.seq);
  var nm=file.replace(/^.*[\\\/]/,""),item=TS_find(app.project.rootItem,nm);
  if(!item&&d.seq){for(var z=app.project.rootItem.children.numItems-1;z>=0;z--){var ch=app.project.rootItem.children[z];if(ch.name.indexOf(d.id)==0){item=ch;break;}}}if(!item)return "Import failed";
  var t=(typeof d.at=="number")?d.at:seq.getPlayerPosition().seconds,tracks=seq.videoTracks,track=null;
  for(var i=0;i<tracks.numTracks;i++){var tr=tracks[i],busy=false;for(var k=0;k<tr.clips.numItems;k++){var cc=tr.clips[k];if(cc.start.seconds<t+d.dur&&cc.end.seconds>t){busy=true;break;}}if(!busy&&i>0){track=tr;break;}}
  if(!track)track=tracks[tracks.numTracks-1];
  track.overwriteClip(item,t);
  var clip=null;for(var k=0;k<track.clips.numItems;k++){if(Math.abs(track.clips[k].start.seconds-t)<0.05)clip=track.clips[k];}
  if(!clip)return "Clip not placed";
  var e=new Time();e.seconds=t+d.dur;clip.end=e;
  var pos=TS_prop(clip,"Motion","Position")||TS_prop(clip,"AE.ADBE Motion","Position"),sc=TS_prop(clip,"Motion","Scale"),rot=TS_prop(clip,"Motion","Rotation"),op=TS_prop(clip,"Opacity","Opacity");
  var base=clip.inPoint.seconds,ps=[pos,sc,rot,op];
  for(var q=0;q<ps.length;q++)if(ps[q])ps[q].setTimeVarying(true);
  for(var n=0;n<d.keys.length;n++){var kf=d.keys[n],kt=base+kf.t;
   if(pos){pos.addKey(kt);pos.setValueAtKey(kt,[kf.x,kf.y],1);}
   if(sc){sc.addKey(kt);sc.setValueAtKey(kt,kf.s,1);}
   if(rot){rot.addKey(kt);rot.setValueAtKey(kt,kf.r,1);}
   if(op){op.addKey(kt);op.setValueAtKey(kt,kf.o,1);}}
  return "OK";}catch(err){return String(err);}
}

function TS_sel(){var seq=app.project.activeSequence;if(!seq)return [];var s=seq.getSelection(),out=[];for(var i=0;i<s.length;i++)if(s[i].mediaType!="Audio")out.push(s[i]);return out;}
function TS_selInfo(){try{var s=TS_sel(),a=[];for(var i=0;i<s.length;i++)a.push('{"i":'+i+',"dur":'+(s[i].end.seconds-s[i].start.seconds)+'}');return "["+a.join(",")+"]";}catch(e){return String(e);}}
function TS_motionSel(json){try{var jobs=JSON.parse(json),sel=TS_sel();
 for(var j=0;j<jobs.length;j++){var clip=sel[jobs[j].i];if(!clip)continue;
  var pos=TS_prop(clip,"Motion","Position"),sc=TS_prop(clip,"Motion","Scale"),rot=TS_prop(clip,"Motion","Rotation"),op=TS_prop(clip,"Opacity","Opacity");
  var bp=pos?pos.getValue():[.5,.5],bs=sc?sc.getValue():100,br=rot?rot.getValue():0,bo=op?op.getValue():100,base=clip.inPoint.seconds,ps=[pos,sc,rot,op];
  for(var q=0;q<ps.length;q++)if(ps[q])ps[q].setTimeVarying(true);
  for(var n=0;n<jobs[j].keys.length;n++){var k=jobs[j].keys[n],kt=base+k.t;
   if(pos){pos.addKey(kt);pos.setValueAtKey(kt,[bp[0]+k.x,bp[1]+k.y],1);}
   if(sc){sc.addKey(kt);sc.setValueAtKey(kt,bs*k.s/100,1);}
   if(rot){rot.addKey(kt);rot.setValueAtKey(kt,br+k.r,1);}
   if(op){op.addKey(kt);op.setValueAtKey(kt,bo*k.o/100,1);}}}
 return "OK";}catch(e){return String(e);}}
