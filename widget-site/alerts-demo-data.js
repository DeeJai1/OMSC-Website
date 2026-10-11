"use strict";
/* Website-only API adapter. The Alerts widget renderer itself is sourced from OMSC,
   and remains intact. The Custom Video sample is bundled silently; the click-to-play Custom Audio WAV is handled by the parent page. */
(() => {
  const nativeFetch = window.fetch.bind(window);
  const sample = new URLSearchParams(window.location.search).get('sample');
  const options = {
    video: {mediaType:'video', mediaUrl:'/assets/alerts/video.webm', name:'Custom Video Alert', chromaKeyEnabled:false, showAlertName:false, entranceAnimation:'Pop'}
  };
  const choice = options[sample] || options.video;
  const sequence = 1000 + (Date.now() % 1000000);
  let finishedAt = null;
  let sequenceNumber = sequence;
  const item = {sequence:sequenceNumber,mediaType:choice.mediaType,mediaUrl:choice.mediaUrl,name:choice.name,
    volumePercent:0,durationSeconds:5,chromaKeyEnabled:choice.chromaKeyEnabled};
  const respond = data => Promise.resolve(new Response(JSON.stringify(data),{
    status:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}
  }));
  window.fetch = (input,init) => {
    const raw = typeof input === 'string' ? input : input.url;
    const url = new URL(raw,window.location.href);
    if (url.origin !== window.location.origin) return nativeFetch(input,init);
    if (url.pathname === '/api/alerts/playback/state') {
      // Replay the selected sample after a short pause until the parent switches tabs.
      if (finishedAt !== null && Date.now() - finishedAt >= 1200) {
        sequenceNumber += 1;
        item.sequence = sequenceNumber;
        finishedAt = null;
      }
      return respond({active:finishedAt === null,current:finishedAt === null ? item : null});
    }
    if (url.pathname === '/api/configuration/') {
      return respond({settings:{alerts:{mediaScalePercent:100,position:'Center',
        entranceAnimation:choice.entranceAnimation,showAlertName:choice.showAlertName,
        captionColour:'#FFFFFF'}}});
    }
    if ((init?.method || 'GET').toUpperCase()==='POST' &&
        url.pathname === '/api/alerts/playback/complete/' + item.sequence) {
      finishedAt=Date.now();
      return respond({success:true});
    }
    return nativeFetch(input,init);
  };
})();
