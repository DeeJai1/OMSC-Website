"use strict";
(() => {
  const origin="https://omsc-public-downloads.mattshoemark.workers.dev";
  const repo="https://github.com/DeeJai1/OldMan-Stream-Companion-Public";
  let pending=null,cached=null,expires=0;
  function validate(data){
    if(data?.status!=="available"||data.schemaVersion!==1||!/^[1-9]\d*\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(data.version)||
      !Number.isFinite(Date.parse(data.publishedAt))||!Number.isFinite(Date.parse(data.firstPublishedAt))||
      !Number.isFinite(Date.parse(data.scan?.completedAt))||data.scan?.result!=="no-threats-detected"||
      !["v"+data.version,data.version].some(tag=>data.releaseUrl===repo+"/releases/tag/"+tag))return null;
    const name="OldManStreamCompanion-Setup-"+data.version+".exe",base=origin+"/releases/"+data.version+"/";
    if(data.installer?.name!==name||!Number.isSafeInteger(data.installer.size)||data.installer.size<1||!/^[a-f0-9]{64}$/.test(data.installer.sha256)||
      data.installer.mirrorUrl!==base+name||data.installer.mirrorChecksumUrl!==base+name+".sha256"||
      !["v"+data.version,data.version].some(tag=>data.installer.url===repo+"/releases/download/"+tag+"/"+name)||
      data.scan.reportUrl!==base+"OldManStreamCompanion-Security-Scan-v"+data.version+".json"||
      data.scan.readableReportUrl!==base+"OldManStreamCompanion-Security-Scan-v"+data.version+".md"||
      data.scan.scanner?.name!=="Microsoft Defender Antivirus"||!data.scan.scanner.engineVersion||!data.scan.scanner.signatureVersion)return null;
    return data;
  }
  async function readMirror(){
    if(Date.now()<expires)return cached;
    if(pending)return pending;
    pending=(async()=>{
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),4000);
      try{
        const response=await fetch(origin+"/latest.json",{credentials:"omit",redirect:"error",cache:"no-store",signal:controller.signal});
        cached=response.ok?validate(await response.json()):null;
      }catch{cached=null;}
      finally{clearTimeout(timeout);expires=Date.now()+240000;}
      return cached;
    })();
    try{return await pending;}finally{pending=null;}
  }
  window.OMSCReleaseDownloads={origin,validate,readMirror};
})();
