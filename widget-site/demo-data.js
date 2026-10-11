"use strict";
// Website-only demonstration API shim. Renderer code is copied byte-for-byte from OMSC.
// No Spotify requests, no audio, no user data, no external endpoints.
(function () {
  const nativeFetch = window.fetch.bind(window);
  const startedAtMs = Date.now();
  const demoTrackDurationSeconds = 213;
  const nowIso = () => new Date().toISOString();
  const demoTrack = () => ({
    state: "Playing", title: "Never Gonna Give You Up", artist: "Rick Astley",
    album: "Whenever You Need Somebody", durationSeconds: demoTrackDurationSeconds,
    positionSeconds: Math.floor((Date.now()-startedAtMs)/1000) % demoTrackDurationSeconds,
    trackStartedAtUtc: new Date(startedAtMs).toISOString(), updatedAtUtc: nowIso(),
    // Artist photo: Raph_PH, CC BY 2.0 (Wikimedia Commons).
    // Album image: Spotify-hosted official release cover. Not downloaded or bundled.
    artistArtworkUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Rick_Astley_2023.jpg/500px-Rick_Astley_2023.jpg",
    albumArtworkUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02255e131abc1410833be95673"
  });
  const nowPlayingState = () => ({
    enabled: true, moduleEnabled: true, visible: true,
    layout: "Classic", displayDurationSeconds: 0,
    textColor: "#FFFFFF", backgroundColor: "#17132a", backgroundOpacityPercent: 94,
    backgroundStyle: "Solid", progressStyle: "Wave", progressBarColor: "#a98bff",
    artistImagePosition: "Left", nowPlayingLabelPosition: "Top", watermarkStyle: "Embossed",
    showTimeRemaining: true, artistFontSize: 24, trackFontSize: 20,
    vinylPlayer: {sleeveSizePixels:160, vinylExposurePixels:80,rotationRpm:33,accentColor:"#9570f8",panelColor:"#161225",panelOpacityPercent:94,textColor:"#FFFFFF",artistFontSize:18,trackFontSize:20,showAlbum:true,showTimeRemaining:true},
    spectrumRing: {primaryColor:"#9774fb", secondaryColor:"#509aff",panelColor:"#101626",textColor:"#F7F5FF",ringThicknessPixels:8,glowPercent:65,transparent:false},
    visualisers: {equaliserTower:{}, waveformStrip:{}},
    playback:demoTrack()
  });
  const config = {
    settings: {
      streamCredits: {
        enabled:true,
        events:{chattersEnabled:true,firstTimeChattersEnabled:true,moderatorsEnabled:true,bitsEnabled:true,followsEnabled:true,subscribersEnabled:true,resubscribersEnabled:true,giftedSubscriptionsEnabled:true,raidsEnabled:true,watchStreaksEnabled:true},
        appearance:{headingColour:"#ccb5ff",nameColour:"#FFFFFF",headingGlowPercent:18,columnCount:1,profileImages:{chatters:false,firstTimeChatters:false,moderators:false,bits:false,follows:false,subscribers:false,resubscribers:false,giftedSubscriptions:false,raids:false,watchStreaks:false}}
      },
      widgets: {streamCredits:{layout:"PerspectiveCrawl",canvasWidthPixels:960,canvasHeightPixels:540,contentScalePercent:155,scrollSpeedPixelsPerSecond:90,maximumCycles:0,perspectiveStrengthPercent:74}}
    }
  };
  const demoCredits = {entries:[
    {type:"chatter",userName:"pixelpirate",displayName:"PixelPirate"},
    {type:"chatter",userName:"captain_caffeinated",displayName:"CaptainCaffeinated"},
    {type:"chatter",userName:"old_school_gamer",displayName:"OldSchoolGamer"},
    {type:"moderator",userName:"themodfather",displayName:"TheModFather"},
    {type:"follow",userName:"luna_streams",displayName:"LunaStreams"},
    {type:"subscription",userName:"nightowl",displayName:"NightOwl"},
    {type:"bits",userName:"bytebard",displayName:"ByteBard",amount:500},
    {type:"raid",userName:"retro_crew",displayName:"RetroCrew",viewerCount:24}
  ]};
  const responses = {
    "/api/widget/now-playing/state": nowPlayingState,
    "/api/stream-credits": () => demoCredits,
    "/api/configuration/": () => config,
    "/api/widget/credits/state": () => ({hasLogoImage:false,logoImageUrl:""})
  };
  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : input.url;
    const target = new URL(url, window.location.href);
    const handler = (target.origin === window.location.origin) && responses[target.pathname];
    if (handler) {
      return Promise.resolve(new Response(JSON.stringify(handler()), {status:200,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}}));
    }
    return nativeFetch(input, init);
  };
})();
