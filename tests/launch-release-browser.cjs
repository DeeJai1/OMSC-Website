'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),target=Date.parse('2026-11-27T23:30:00Z');
const repo='https://github.com/DeeJai1/OldMan-Stream-Companion-Public';
const endpoint='https://api.github.com/repos/DeeJai1/OldMan-Stream-Companion-Public/releases/latest';
const release=()=>({draft:false,prerelease:false,published_at:'2026-11-27T23:00:00Z',tag_name:'v1.0.0',html_url:repo+'/releases/tag/v1.0.0',assets:[{name:'OldManStreamCompanion-Setup-1.0.0.exe',size:123456,state:'uploaded',browser_download_url:repo+'/releases/download/v1.0.0/OldManStreamCompanion-Setup-1.0.0.exe'}]});
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
 async function scenario(data,now=target+1000,status=200){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});contexts.push(context);const page=await context.newPage();let requests=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:new Date(now)});
  await page.route(endpoint,route=>{requests++;return route.fulfill({status,json:data});});
  await page.goto(origin);await page.locator('#hero-title').waitFor();
  // Wait for the script's async API check to settle without advancing its retry timer.
  await page.waitForFunction(()=>document.readyState==='complete');
  return {page,context,errors,requests:()=>requests};
 }
 try{
  const before=await scenario(release(),target-1000);assert.equal(before.requests(),0);assert(await before.page.locator('#public-launch-banner').isHidden());
  await before.page.clock.runFor(1000);await before.page.locator('#public-launch-banner').waitFor({state:'visible'});
  assert.equal(before.requests(),1);assert.equal(await before.page.locator('[data-public-installer]').first().getAttribute('href'),release().assets[0].browser_download_url);
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
  console.log('PASS launch release: both gates, exact countdown transition, stable installer validation, invalid/draft/beta/missing releases, delayed publication retry, no stale copy, five responsive widths and reduced motion.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
