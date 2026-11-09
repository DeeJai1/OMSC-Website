'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

const home = read('index.html');
const commands = read('commands/index.html');
const beta = read('beta/index.html');
const css = read('styles.css');

// The homepage shows an actual app screenshot, not the retired SVG mockup.
assert.match(home, /<h3>Native Twitch chat and commands<\/h3>/);
assert.match(home, /href="\/commands\/">Explore chat commands/);
assert.match(home, /src="assets\/Dashboard[.]png(?:\?[^"]*)?"/);
assert.match(home, /href="assets\/Dashboard[.]png(?:\?[^"]*)?"/);
assert.doesNotMatch(home, /src="assets\/omsc-dashboard-v050-preview[.]svg"/);
assert.doesNotMatch(home, /streamerbot-symbol|streamer[.]bot\/downloads/i);

// Historical troubleshooting references to Streamer.bot are legitimate:
// only a claim that OMSC requires it would be misleading.
assert.match(home, /Streamer[.]bot is not required/);
assert.doesNotMatch(commands, /Some event-driven commands still await native migration/);

const commandCss = read('commands/commands.css');
const commandJs = read('commands/commands.js');
assert.equal((commands.match(/<article class="command-card">/g) || []).length, 25);
assert.match(commands, /These are example command names, not guaranteed chat triggers/);
assert.match(commands, /Streamers can change the prefix, rename or disable commands/);
assert.doesNotMatch(commands, /class="command-copy"|data-copy=|>Copy<\/button>/);
assert.doesNotMatch(commandCss, /[.]command-copy/);
assert.doesNotMatch(commandJs, /command-copy|navigator[.]clipboard/);
assert.match(commandCss, /[.]commands-grid\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);

// FAQ categories and questions use nested native details; an opened category
// must not give all of its still-closed questions the minus indicator.
assert.equal((home.match(/<details class="faq-group" name="faq-categories">/g) || []).length, 6);
assert.equal((home.match(/<details><summary>/g) || []).length, 16);
assert.match(css, /[.]faq-list summary::after\{content:"\+"/);
assert.match(css, /[.]faq-list details\[open\] > summary::after\{content:"−"\}/);
assert.doesNotMatch(css, /[.]faq-list details\[open\] summary::after/);

// Beta applications remain in the desktop app, not a website form.
assert.match(beta, /Help → Beta Access/);
assert.doesNotMatch(beta, /<form\b/i);
assert.match(beta, /aria-controls="site-nav"/);
assert.match(beta, /<nav id="site-nav" class="site-nav"/);
assert.match(beta, /src="\/commands\/commands[.]js(?:\?[^\"]*)?"/);
assert.match(read('commands/commands.js'), /nav[.]classList[.]toggle\("open"\)/);
assert.match(beta, /Beta participation requests are made inside OMSC/);
assert.doesNotMatch(beta, /website application form is not yet connected/i);
assert.match(home, /Download coming soon/);
assert.match(home, /Windows download · Coming Soon/);
assert.doesNotMatch(home, /OldManStreamCompanion-Setup-[0-9]/);

// SEO metadata for the three public information pages.
const origin = 'https://www.oldmanstreamcompanion.com';
const sitemap = read('sitemap.xml');
const robots = read('robots.txt');
const publishedPages = [
  {route: '/', file: 'index.html', markup: home},
  {route: '/commands/', file: 'commands/index.html', markup: commands},
  {route: '/beta/', file: 'beta/index.html', markup: beta}
];
for (const page of publishedPages) {
  const canonical = origin + page.route;
  assert.ok(page.markup.includes('<link rel="canonical" href="' + canonical + '">'),
    page.file + ' is missing its canonical URL');
  assert.ok(page.markup.includes('<meta property="og:url" content="' + canonical + '">'),
    page.file + ' is missing its social URL');
  assert.ok(sitemap.includes('<loc>' + canonical + '</loc>'),
    page.file + ' is not in the XML sitemap');
}
assert.match(robots, /Sitemap: https:\/\/www[.]oldmanstreamcompanion[.]com\/sitemap[.]xml/);

// Check internal links, same-site assets and fragment targets without a network.
// Exclude external URLs such as Discord and the example music attribution.
for (const page of publishedPages) {
  for (const match of page.markup.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const link = match[1];
    const url = new URL(link, origin + page.route);
    if (url.origin !== origin) continue;
    const pathname = decodeURIComponent(url.pathname);
    const relativeFile = pathname.endsWith('/')
      ? pathname.slice(1) + 'index.html'
      : pathname.slice(1);
    const destination = path.join(root, relativeFile);
    assert.ok(fs.existsSync(destination), page.file + ' has missing local link: ' + link);
    if (url.hash && relativeFile.endsWith('.html')) {
      const anchor = decodeURIComponent(url.hash.slice(1));
      const targetMarkup = read(relativeFile);
      assert.ok(targetMarkup.includes('id="' + anchor + '"'),
        page.file + ' has missing anchor target: ' + link);
    }
  }
}


// Accessible navigation and previews: keyboard dismisses menus, focus returns
// to the toggle and display-only iframes stay outside the Tab sequence.
const homeScript = read('main.js');
const sharedNavScript = read('commands/commands.js');
for (const [name, markup] of [['home', home], ['commands', commands], ['beta', beta]]) {
  assert.match(markup, /class="menu-toggle"/, name + ' requires a mobile menu control');
  assert.match(markup, /aria-controls="site-nav"/);
  assert.match(markup, /<a class="skip-link" href="#main">/);
  assert.equal((markup.match(/<h1\b/g) || []).length, 1, name + ' needs one main heading');
}
assert.match(homeScript, /event[.]key === 'Escape' && mainNav[.]classList[.]contains\('open'\)/);
assert.match(homeScript, /menuButton[.]focus\(\)/);
assert.match(sharedNavScript, /event[.]key === "Escape" && nav[.]classList[.]contains\("open"\)/);
assert.match(sharedNavScript, /closeMenu\(true\)/);
assert.match(sharedNavScript, /!nav[.]contains\(event[.]target\)/);
assert.equal((home.match(/<iframe\b[^>]*tabindex="-1"[^>]*><\/iframe>/g) || []).length, 3);
assert.match(css, /[.]widget-choice\{min-height:44px/);
assert.match(css, /[.]menu-toggle\{width:44px;height:44px/);
assert.match(css, /[.]demo-controls button\{min-height:44px/);


// Basic HTML accessibility invariants for each public document.
// Keep this fast and dependency-free; real-browser visual testing is separate.
for (const page of publishedPages) {
  const markup = page.markup;
  const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, page.file + ' has duplicate IDs');
  for (const img of markup.match(/<img\b[^>]*>/g) || []) {
    assert.match(img, /\balt="[^"]*"/, page.file + ' has an image without alternative text');
  }
  for (const frame of markup.match(/<iframe\b[^>]*>/g) || []) {
    assert.match(frame, /\btitle="[^"]+"/, page.file + ' has an unnamed iframe');
  }
  for (const ref of markup.matchAll(/\b(?:aria-controls|aria-labelledby)="([^"]+)"/g)) {
    for (const id of ref[1].split(/\s+/)) {
      assert.ok(ids.includes(id), page.file + ' references missing ID ' + id);
    }
  }
  for (const external of markup.match(/<a\b[^>]*target="_blank"[^>]*>/g) || []) {
    assert.match(external, /\brel="[^"]*\bnoopener\b/, page.file + ' has an unprotected new-window link');
  }
}
assert.match(css, /[.]preview-tab span\{color:#afc0e2\}/);

console.log('PASS: website links, accessible mobile navigation, previews, FAQ, sitemap and launch safeguards.');
