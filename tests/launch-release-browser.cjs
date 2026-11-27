'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),target=Date.parse('2026-11-27T19:34:09Z');
const repo='https://github.com/DeeJai1/OldMan-Stream-Companion-Public';
const endpoint='https://api.github.com/repos/DeeJai1/OldMan-Stream-Companion-Public/releases/latest';
const release=()=>({draft:false,prerelease:false,published_at:new Date(target-1800000).toISOString(),tag_name:'v1.0.0',html_url:repo+'/releases/tag/v1.0.0',assets:[{name:'OldManStreamCompanion-Setup-1.0.0.exe',size:123456,state:'uploaded',browser_download_url:repo+'/releases/download/v1.0.0/OldManStreamCompanion-Setup-1.0.0.exe'}]});
(async()=>{
 const csp=fs.readFileSync(path.join(root,'_headers'),'utf8').split('\n').find(l=>l.trim().startsWith('Content-Security-Policy:')).trim().slice('Content-Security-Policy:'.length).trim();
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/\/$/,'/index.html'));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return;}
  const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream';
  res.writeHead(200,{'content-type':type,'content-security-policy':csp});fs.createReadStream(file).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const contexts=[];
 async function scenario(data,now=target+1000,status=200,mirror={status:'pending'},routePath='/'){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});contexts.push(context);const page=await context.newPage();let requests=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:new Date(now)});
  await page.route('https://omsc-public-downloads.mattshoemark.workers.dev/latest.json',route=>route.fulfill({json:mirror,headers:{'access-control-allow-origin':'*'}}));
  await page.route(endpoint,route=>{requests++;return route.fulfill({status,json:data});});
  await page.route(endpoint.replace(/latest$/, 'tags/*'),route=>route.fulfill({json:release()}));
  await page.goto(origin+routePath);await page.locator(routePath==='/'?'#hero-title':'h1').waitFor();
  // Wait for the script's async API check to settle without advancing its retry timer.
  await page.waitForFunction(()=>document.readyState==='complete');
  return {page,context,errors,requests:()=>requests};
 }
 try{
  const before=await scenario(release(),target-1000);assert.equal(before.requests(),0);assert(await before.page.locator('#public-launch-banner').isHidden());
  await before.page.clock.runFor(1000);await before.page.locator('#public-launch-banner').waitFor({state:'visible'});
  assert.equal(before.requests(),1);
  assert.equal(await before.page.locator('.launch-sparks i').first().evaluate(e=>getComputedStyle(e).animationIterationCount),'infinite');
  await before.page.getByRole('button',{name:'Pause confetti',exact:true}).click();
  assert.equal(await before.page.locator('.launch-sparks i').first().evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
  await before.page.getByRole('button',{name:'Resume confetti',exact:true}).click();
  assert.equal(await before.page.locator('.launch-sparks i').first().evaluate(e=>getComputedStyle(e).animationPlayState),'running');assert.equal(await before.page.locator('[data-public-installer]').first().getAttribute('href'),release().assets[0].browser_download_url);
  assert.equal(await before.page.locator('[data-public-nav]').first().textContent(),'Download OMSC');
  assert.match(await before.page.locator('[data-public-download-title]').textContent(),/1.0.0 is out now/);
  assert(await before.page.locator('[data-launch-pending]').first().isHidden());
  await before.page.clock.runFor(60000);assert.equal(await before.page.locator('.nav-download .launch-countdown-value').textContent(),'');
  assert.equal(await before.page.locator('.nav-download').getAttribute('aria-label'),null);
  for(const width of [1440,1024,768,390,320]){
   await before.page.setViewportSize({width,height:1000});assert(await before.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow at '+width);
   await before.page.screenshot({path:'/tmp/omsc-release-banner-'+width+'.png',fullPage:false});
  }
  assert(await before.page.locator('#public-launch-status').evaluate(e=>e.getBoundingClientRect().width<=1),'live announcement is visually hidden');
  assert.deepEqual(before.errors,[]);
  // Neither the date alone nor a beta, draft or incomplete/foreign installer may launch.
  const variants=[null,{...release(),prerelease:true},{...release(),draft:true},{...release(),tag_name:'v1.0.0-rc.7.8'},{...release(),tag_name:'v0.4.52'},{...release(),assets:[]},{...release(),assets:[{...release().assets[0],browser_download_url:'https://evil.example/setup.exe'}]}];
  for(const data of variants){const f=await scenario(data,target+1000,data?200:404);await f.page.clock.runFor(1000);assert(await f.page.locator('#public-launch-banner').isHidden());assert.match(await f.page.locator('.nav-download .launch-countdown-value').textContent(),/Awaiting public release/);assert.equal(await f.page.locator('[data-launch-live]').first().isHidden(),true);await f.context.close();}
  const later=await scenario(null,target+1000,404);await later.page.clock.runFor(1000);assert(await later.page.locator('#public-launch-banner').isHidden());
  await later.page.unroute(endpoint);await later.page.route(endpoint,route=>route.fulfill({json:release()}));await later.page.clock.runFor(300000);await later.page.locator('#public-launch-banner').waitFor({state:'visible'});
  await later.page.emulateMedia({reducedMotion:'reduce'});assert.equal(await later.page.locator('.launch-sparks').evaluate(e=>getComputedStyle(e).display),'none');
  await later.page.clock.runFor(300000);assert.equal(await later.page.locator('#public-launch-banner').count(),1);assert.deepEqual(later.errors,[]);
  // Retire on the exact boundary, including tabs left open or resumed from sleep.
  await before.page.clock.setFixedTime(new Date(target+7*86400000-1));
  await before.page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  assert(await before.page.locator('#public-launch-banner').isVisible());
  await before.page.clock.setFixedTime(new Date(target+7*86400000));
  await before.page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  assert(await before.page.locator('#public-launch-banner').isHidden());
  assert(await before.page.locator('[data-launch-live]').first().isVisible());
  const expired=await scenario(release(),target+8*86400000);
  await expired.page.waitForFunction(()=>document.documentElement.dataset.publicReleased==='true');
  assert(await expired.page.locator('#public-launch-banner').isHidden());
  assert(await expired.page.locator('[data-launch-live]').first().isVisible());
  const patchRelease=JSON.parse(JSON.stringify(release()).replaceAll('1.0.0','1.0.1'));
  patchRelease.published_at=new Date(target+6*86400000).toISOString();
  const patch=await scenario(patchRelease,target+8*86400000);
  await patch.page.waitForFunction(()=>document.documentElement.dataset.publicReleased==='true');
  assert(await patch.page.locator('#public-launch-banner').isHidden(),'a later patch never restarts launch week');
  const delayedRelease=release();delayedRelease.published_at=new Date(target+86400000).toISOString();
  const delayed=await scenario(delayedRelease,target+7*86400000);
  await delayed.page.locator('#public-launch-banner').waitFor({state:'visible'});
  const mirrorOrigin='https://omsc-public-downloads.mattshoemark.workers.dev',installer=release().assets[0];
  const mirror={schemaVersion:1,status:'available',version:'1.0.0',publishedAt:release().published_at,firstPublishedAt:release().published_at,releaseUrl:release().html_url,
    installer:{name:installer.name,size:installer.size,sha256:'a'.repeat(64),url:installer.browser_download_url,mirrorUrl:mirrorOrigin+'/releases/1.0.0/'+installer.name,mirrorChecksumUrl:mirrorOrigin+'/releases/1.0.0/'+installer.name+'.sha256'},
    scan:{result:'no-threats-detected',completedAt:release().published_at,scanner:{name:'Microsoft Defender Antivirus',engineVersion:'1',signatureVersion:'2'},
      reportUrl:mirrorOrigin+'/releases/1.0.0/OldManStreamCompanion-Security-Scan-v1.0.0.json',readableReportUrl:mirrorOrigin+'/releases/1.0.0/OldManStreamCompanion-Security-Scan-v1.0.0.md'}};
  const blocked=await scenario(null,target+1000,403,mirror);
  await blocked.page.locator('[data-public-mirror]').waitFor({state:'visible'});
  assert.equal(blocked.requests(),0,'GitHub access is unnecessary when the verified mirror is available');
  assert.equal(await blocked.page.locator('[data-public-installer]').last().getAttribute('href'),installer.browser_download_url);
  assert.equal(await blocked.page.locator('[data-public-mirror]').getAttribute('href'),mirror.installer.mirrorUrl);
  await blocked.page.locator('#release-security-details code').waitFor();
  assert.equal(await blocked.page.locator('#release-security-details code').textContent(),mirror.installer.sha256);
  const scanButton=blocked.page.getByRole('button',{name:'Read scan result',exact:true});
  await scanButton.click();const scanDialog=blocked.page.getByRole('dialog');
  assert(await scanDialog.isVisible());assert.match(await scanDialog.textContent(),/No threats detected/);
  assert.match(await scanDialog.textContent(),/not publisher-signed/);
  assert.equal(await scanDialog.locator('code').textContent(),mirror.installer.sha256);
  assert.equal(await scanDialog.getByRole('link',{name:'Download original scan report'}).getAttribute('href'),mirror.scan.readableReportUrl);
  for(const width of [1440,390,320]){await blocked.page.setViewportSize({width,height:700});assert(await scanDialog.evaluate(e=>e.scrollWidth<=e.clientWidth),'scan dialog fits at '+width);}
  await blocked.page.keyboard.press('Escape');assert(await scanDialog.isHidden());assert(await scanButton.evaluate(e=>e===document.activeElement));
  await scanButton.click();
  assert.equal(await scanDialog.evaluate(e=>e.scrollTop),0,'mobile dialog starts at the scan heading');
  assert(await scanDialog.getByRole('heading').evaluate(e=>e===document.activeElement),'initial focus announces the report heading');
  await scanDialog.getByRole('button',{name:'Close scan result'}).click();assert(await scanDialog.isHidden());
  for(const width of [1440,768,390,320]){await blocked.page.setViewportSize({width,height:1000});assert(await blocked.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mirror overflow at '+width);}
  assert.deepEqual(blocked.errors,[]);
  const mirrorBefore=await scenario(null,target-1000,403,mirror);
  assert(await mirrorBefore.page.locator('[data-public-mirror]').isHidden());
  await mirrorBefore.page.clock.runFor(1000);await mirrorBefore.page.locator('[data-public-mirror]').waitFor({state:'visible'});
  const foreign=structuredClone(mirror);foreign.installer.mirrorUrl='https://evil.example/setup.exe';
  const invalidMirror=await scenario(null,target+1000,403,foreign);await invalidMirror.page.clock.runFor(1000);
  assert(await invalidMirror.page.locator('[data-public-mirror]').isHidden());
  const arriving=await scenario(release());await arriving.page.locator('[data-launch-live]').first().waitFor({state:'visible'});
  assert(await arriving.page.locator('[data-public-mirror]').isHidden());
  await arriving.page.unroute(mirrorOrigin+'/latest.json');await arriving.page.route(mirrorOrigin+'/latest.json',route=>route.fulfill({json:mirror,headers:{'access-control-allow-origin':'*'}}));
  await arriving.page.clock.runFor(300000);await arriving.page.locator('[data-public-mirror]').waitFor({state:'visible'});
  for(const routePath of ['/commands/','/beta/']) {
   const pending=await scenario(release(),target-1000,200,{status:'pending'},routePath);
   assert.equal(pending.requests(),0);assert.match(await pending.page.locator('[data-public-nav]').first().textContent(),/Coming Soon/);
   await pending.page.clock.runFor(1000);await pending.page.waitForFunction(()=>document.documentElement.dataset.publicReleased==='true');
   assert.equal(await pending.page.locator('[data-public-nav]').first().textContent(),'Download OMSC');
   assert.equal(await pending.page.locator('.launch-countdown-value').first().textContent(),'');assert.deepEqual(pending.errors,[]);
   const beta=await scenario({...release(),prerelease:true},target+1000,200,{status:'pending'},routePath);
   await beta.page.clock.runFor(1000);assert.notEqual(await beta.page.getAttribute('html','data-public-released'),'true');assert.deepEqual(beta.errors,[]);
  }
  console.log('PASS commands and beta page navigation obeys the same clock/public-release gates without a celebration banner.');
  console.log('PASS GitHub-blocked mirror downloads, same-version hashes/reports, pending/foreign mirrors, late mirror readiness and responsive widths.');
  console.log('PASS loop/pause, exact one-week expiry, persistent downloads, late publication and patch-release anchor.');
  console.log('PASS launch release: both gates, exact countdown transition, stable installer validation, invalid/draft/beta/missing releases, delayed publication retry, no stale copy, five responsive widths and reduced motion.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
