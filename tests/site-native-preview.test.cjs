'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const home = read('index.html'), commands = read('commands/index.html');
const svg = read('assets/omsc-dashboard-v050-preview.svg');
for (const [name, page] of [['home', home], ['commands', commands]]) {
  assert.doesNotMatch(page, /Streamer[.]bot|streamerbot-symbol|streamer[.]bot[/]downloads/i, name + ' has a visible legacy integration reference');
}
assert.match(home, /<h3>Native Twitch chat and commands<\/h3>/);
assert.match(home, /href="\/commands\/">Explore chat commands/);
assert.match(home, /src="assets\/omsc-dashboard-v050-preview[.]svg"/);
assert.match(home, /href="assets\/omsc-dashboard-v050-preview[.]svg"/);
assert.doesNotMatch(home, /omsc-dashboard-source-aligned-preview[.]png/);
assert.doesNotMatch(home, /No external bot service/i);
assert.match(svg, /viewBox="0 0 1440 900"/);
for (const word of ['SPOTIFY', 'COMMUNITY PLAYLIST', 'APPLICATION', 'Connected', 'Enabled', 'Online', 'Now Playing', 'Song Request Queue', 'Never Gonna Give You Up']) assert.ok(svg.includes(word), word);
assert.doesNotMatch(svg, /Streamer[.]bot|Disconnected|Unavailable|Offline/);
assert.match(commands, /Some event-driven commands still await native migration/);
console.log('PASS: public website native integration, current dashboard preview and commands copy.');
