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
console.log('PASS: actual dashboard, native commands, nested FAQ indicators and in-app beta access.');
