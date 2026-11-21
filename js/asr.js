/* RMZ Studio offline speech recognition. Model weights and WASM runtime ship with the extension. */
(function(g){
var SCRIPT=(document.currentScript&&document.currentScript.src)||new URL("js/asr.js",document.baseURI).href;
var MODULE_URL=new URL("asr/transformers.min.js",SCRIPT).href;
var WASM_URL=new URL("asr/ort-wasm.wasm",SCRIPT).href;
var MODEL_URL=new URL("../models/",SCRIPT).href;
var RAW_BASE="https://raw.githubusercontent.com/pooryaabbasi1/textstudio-rmz-2/main/";
var MODEL_DIR="models/whisper-base/onnx/";
var MODEL_SPECS=[
 {name:"encoder_model_quantized.onnx",size:23200850,parts:[{file:"encoder_model_quantized.onnx.part01",size:18874368},{file:"encoder_model_quantized.onnx.part02",size:4326482}]},
 {name:"decoder_model_merged_quantized.onnx",size:53707539,parts:[{file:"decoder_model_merged_quantized.onnx.part01",size:18874368},{file:"decoder_model_merged_quantized.onnx.part02",size:18874368},{file:"decoder_model_merged_quantized.onnx.part03",size:15958803}]}
];
var pipePromise=null,wasmObjectURL=null;
function req(m){try{return typeof require==="function"?require(m):null}catch(e){return null}}
function isFile(){return location.protocol==="file:"&&!!req("fs")}
function rootPath(){return decodeURIComponent(location.pathname).replace(/^\/([A-Za-z]:)/,"$1").replace(/[\\\/]index\.html$/ ,"")}
function wasmSource(){
 if(!isFile())return Promise.resolve(WASM_URL);
 if(wasmObjectURL)return Promise.resolve(wasmObjectURL);
 try{var b=req("fs").readFileSync(req("path").join(rootPath(),"js","asr","ort-wasm.wasm"));wasmObjectURL=URL.createObjectURL(new Blob([b],{type:"application/wasm"}));return Promise.resolve(wasmObjectURL)}catch(e){return Promise.reject(e)}
}
function ensureLocalModels(){
 if(!isFile())return Promise.resolve();
 var fs=req("fs"),path=req("path"),base=path.join(rootPath(),MODEL_DIR);
 try{
  MODEL_SPECS.forEach(function(spec){
   var dest=path.join(base,spec.name),valid=false;
   try{valid=fs.statSync(dest).size===spec.size}catch(e){}
   if(valid)return;
   var buffers=[];
   spec.parts.forEach(function(part){
    var p=path.join(base,part.file);
    if(!fs.existsSync(p))throw new Error("MODEL_PART_MISSING:"+part.file);
    var b=fs.readFileSync(p);
    if(b.length!==part.size)throw new Error("MODEL_PART_SIZE:"+part.file);
    buffers.push(b);
   });
   var full=Buffer.concat(buffers);
   if(full.length!==spec.size)throw new Error("MODEL_SIZE:"+spec.name);
   var tmp=dest+".tmp";
   fs.writeFileSync(tmp,full);
   try{if(fs.existsSync(dest))fs.unlinkSync(dest)}catch(e){}
   fs.renameSync(tmp,dest);
  });
  MODEL_SPECS.forEach(function(spec){spec.parts.forEach(function(part){try{fs.unlinkSync(path.join(base,part.file))}catch(e){}})});
  return Promise.resolve();
 }catch(e){return Promise.reject(e)}
}
function remoteModelResponse(spec){
 return Promise.all(spec.parts.map(function(part){
  return fetch(RAW_BASE+MODEL_DIR+part.file+"?t="+Date.now()).then(function(r){if(!r.ok)throw new Error("MODEL_DOWNLOAD:"+part.file);return r.arrayBuffer()}).then(function(b){if(b.byteLength!==part.size)throw new Error("MODEL_PART_SIZE:"+part.file);return b});
 })).then(function(parts){
  var all=new Uint8Array(spec.size),offset=0;
  parts.forEach(function(b){all.set(new Uint8Array(b),offset);offset+=b.byteLength});
  if(offset!==spec.size)throw new Error("MODEL_SIZE:"+spec.name);
  return new Response(all,{headers:{"Content-Type":"application/octet-stream"}});
 });
}
function load(progress){
 if(pipePromise)return pipePromise;
 pipePromise=Promise.resolve().then(ensureLocalModels).then(function(){return Promise.all([import(MODULE_URL),wasmSource()])}).then(function(x){
  var T=x[0],env=T.env,fs=req("fs"),path=req("path"),local=isFile();
  env.allowRemoteModels=false;env.allowLocalModels=true;env.useBrowserCache=false;env.useFSCache=false;
  env.useFS=local&&!!fs;env.localModelPath=local?path.join(rootPath(),"models")+path.sep:MODEL_URL;
  env.useCustomCache=!local;env.customCache=local?null:{match:function(request){var key=request&&request.url?request.url:String(request);
   for(var i=0;i<MODEL_SPECS.length;i++)if(key.indexOf(MODEL_SPECS[i].name)>=0)return remoteModelResponse(MODEL_SPECS[i]);return Promise.resolve(undefined)},put:function(){return Promise.resolve()}};
  env.backends.onnx.wasm.numThreads=1;env.backends.onnx.wasm.proxy=false;env.backends.onnx.wasm.simd=false;
  env.backends.onnx.wasm.wasmPaths={"ort-wasm.wasm":x[1]};
  return T.pipeline("automatic-speech-recognition","whisper-base",{quantized:true,local_files_only:true,progress_callback:progress});
 }).catch(function(e){pipePromise=null;throw e});
 return pipePromise;
}
function decode(buf,from,to){
 var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return Promise.reject(new Error("AUDIO_DECODE_UNSUPPORTED"));
 var ctx=new AC();from=Math.max(0,+from||0);to=+to||0;
 return new Promise(function(resolve,reject){ctx.decodeAudioData(buf.slice(0),resolve,reject)}).then(function(b){
  if(ctx.close)ctx.close();var rate=b.sampleRate,start=Math.min(b.duration,from),end=Math.min(b.duration,to>start?to:b.duration),len=Math.max(1,Math.ceil((end-start)*16000));
  if(end<=start)throw new Error("EMPTY_AUDIO_SELECTION");var channels=[],ch;for(ch=0;ch<b.numberOfChannels;ch++)channels.push(b.getChannelData(ch));
  var out=new Float32Array(len),scale=rate/16000;
  for(var i=0;i<len;i++){var pos=(start+i/16000)*rate,lo=Math.floor(pos),hi=Math.min(lo+1,b.length-1),mix=pos-lo,v=0;
   for(ch=0;ch<channels.length;ch++){var data=channels[ch],a=data[Math.min(lo,data.length-1)]||0,c=data[hi]||0;v+=(a+(c-a)*mix)/channels.length}out[i]=v}
  return {samples:out,duration:end-start};
 })
}
function readPath(p){var b=req("fs").readFileSync(p);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)}
function transcribe(audio,opts){
 opts=opts||{};return load(opts.progress).then(function(asr){return asr(audio.samples,{language:opts.language||null,task:"transcribe",return_timestamps:"word",chunk_length_s:30,stride_length_s:5,chunk_callback:opts.chunk}).then(function(r){
  var words=(r.chunks||[]).map(function(c){return{text:String(c.text||"").trim(),start:c.timestamp&&c.timestamp[0],end:c.timestamp&&c.timestamp[1]}}).filter(function(c){return c.text&&typeof c.start==="number"});
  if(!words.length&&r.text)words=[{text:String(r.text).trim(),start:0,end:audio.duration}];return{text:r.text||"",words:words,duration:audio.duration};
 })})
}
g.TextStudioASR={load:load,decode:decode,readPath:readPath,transcribe:transcribe,model:"whisper-base",offline:true};
})(this);
