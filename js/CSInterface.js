/* Minimal CSInterface (subset of Adobe CEP API) */
function CSInterface(){}
CSInterface.prototype.evalScript=function(s,cb){if(window.__adobe_cep__){window.__adobe_cep__.evalScript(s,cb||function(){});}else if(cb){cb("NO_HOST");}};
CSInterface.prototype.isInHost=function(){return !!window.__adobe_cep__;};
CSInterface.prototype.registerKeyEventsInterest=function(keyEventsInterest){if(window.__adobe_cep__&&window.__adobe_cep__.registerKeyEventsInterest){window.__adobe_cep__.registerKeyEventsInterest(keyEventsInterest);}};
