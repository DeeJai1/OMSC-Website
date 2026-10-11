'use strict';

const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.site-nav');
if (menuButton && mainNav) {
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    mainNav.classList.remove('open');
  };
  menuButton.addEventListener('click', () => {
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Close navigation menu' : 'Open navigation menu');
    mainNav.classList.toggle('open', opening);
  });
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => { if (!mainNav.contains(event.target) && !menuButton.contains(event.target)) closeMenu(); });
}

const tabs = Array.from(document.querySelectorAll('[role="tab"][data-panel]'));
const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
function activateTab(tab, focus = false) {
  tabs.forEach(t => {
    const selected = t === tab;
    t.classList.toggle('active', selected);
    t.setAttribute('aria-selected', String(selected));
    t.tabIndex = selected ? 0 : -1;
  });
  panels.forEach(p => {
    const selected = p.id === `panel-${tab.dataset.panel}`;
    p.classList.toggle('active', selected);
    p.hidden = !selected;
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    activateTab(tabs[nextIndex], true);
  });
});
const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());


// Site-only controller: switches iframe URLs. The iframes run the original OMSC widget renderers.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const musicLayouts = ['EqualiserTower', 'VinylPlayer', 'SpectrumRing', 'Classic'];
const creditsLayouts = ['PerspectiveCrawl', 'Spotlight', 'RetroArcade', 'Terminal', 'ClassicRoll'];
const creditsLayoutLabels = ['Perspective Crawl', 'Spotlight', 'Retro Arcade', 'Terminal', 'Classic Roll'];
const alertsSamples = ['video', 'audio'];
const alertsSampleLabels = ['Custom Video', 'Custom Audio'];
const MUSIC_ROTATION_MS = 9000;
const CREDITS_ROTATION_MS = 17000; // Allow the real credits renderer to complete a visible sequence.

let selectedMusicIndex = 0;
let selectedCreditsIndex = 0;
let selectedAlertsIndex = 0;
let musicRotationRunning = !prefersReducedMotion;
let creditsRotationRunning = !prefersReducedMotion;
let musicRotationTimer = null;
let creditsRotationTimer = null;
let demosInView = true;

const musicFrame = document.getElementById('music-demo-iframe');
const creditsFrame = document.getElementById('credits-demo-iframe');
const alertsFrame = document.getElementById('alerts-demo-iframe');
const alertsChoices = [...document.querySelectorAll('[data-alert-sample]')];
const alertsReplayVideo = document.getElementById('alerts-replay-video');
const alertsAudioStage = document.getElementById('alerts-audio-stage');
const alertsAudio = document.getElementById('alerts-demo-audio');
const alertsPlayAudio = document.getElementById('alerts-play-audio');
const alertsAudioStatus = document.getElementById('alerts-audio-status');
let alertsVideoReplay = 0;
const alertsLabel = document.getElementById('alerts-demo-label');
const musicChoices = [...document.querySelectorAll('[data-widget-layout]')];
const creditsChoices = [...document.querySelectorAll('[data-credits-layout]')];
const musicRotateButton = document.getElementById('demo-rotate-button');
const creditsRotateButton = document.getElementById('credits-rotate-button');
const creditsLabel = document.getElementById('credits-demo-label');
const demoSection = document.getElementById('preview');

function sizeMusicFrame() {
  if (!musicFrame) return;
  const view = musicFrame.parentElement;
  if (!view) return;
  const width = Math.max(1, view.clientWidth);
  const height = Math.max(1, view.clientHeight);
  const scale = Math.max(.01, Math.min(1, (width - 12) / 580, (height - 12) / 200));
  musicFrame.style.width = '580px';
  musicFrame.style.height = '200px';
  musicFrame.style.position = 'absolute';
  musicFrame.style.left = Math.max(0, (width - 580 * scale) / 2) + 'px';
  musicFrame.style.top = Math.max(0, (height - 200 * scale) / 2) + 'px';
  musicFrame.style.transformOrigin = 'top left';
  musicFrame.style.transform = 'scale(' + scale + ')';
}
function setDemoFrame(frame, src) {
  if (frame && frame.getAttribute('src') !== src) frame.setAttribute('src', src);
}
function updateChoices(choices, dataKey, layout) {
  choices.forEach(button => {
    const selected = button.dataset[dataKey] === layout;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
function demoActive(panelId) {
  const panel = document.getElementById(panelId);
  return Boolean(panel && !panel.hidden && demosInView && !document.hidden);
}
function showMusicLayout(index) {
  selectedMusicIndex = (index + musicLayouts.length) % musicLayouts.length;
  const layout = musicLayouts[selectedMusicIndex];
  updateChoices(musicChoices, 'widgetLayout', layout);
  if (demoActive('panel-music')) {
    setDemoFrame(musicFrame, '/widget/now-playing/index.html?preview=1&layout=' + encodeURIComponent(layout));
  }
}
function showCreditsLayout(index) {
  selectedCreditsIndex = (index + creditsLayouts.length) % creditsLayouts.length;
  const layout = creditsLayouts[selectedCreditsIndex];
  updateChoices(creditsChoices, 'creditsLayout', layout);
  if (creditsLabel) creditsLabel.textContent = creditsLayoutLabels[selectedCreditsIndex] + ' · Sample supporters';
  if (demoActive('panel-credits')) {
    setDemoFrame(creditsFrame, '/widget/credits/index.html?preview=1&layout=' + encodeURIComponent(layout));
  }
}
function stopAlertsSampleAudio() {
  if (!alertsAudio) return;
  alertsAudio.pause();
  try { alertsAudio.currentTime = 0; } catch { /* no seekable data yet */ }
  if (alertsPlayAudio) alertsPlayAudio.disabled = false;
  if (alertsAudioStatus) alertsAudioStatus.textContent = 'Sound plays only when you press the button.';
}
function showAlertsSample(index) {
  const nextIndex = (index + alertsSamples.length) % alertsSamples.length;
  if (nextIndex !== selectedAlertsIndex) stopAlertsSampleAudio();
  selectedAlertsIndex = nextIndex;
  const sample = alertsSamples[selectedAlertsIndex];
  updateChoices(alertsChoices, 'alertSample', sample);
  if (alertsLabel) alertsLabel.textContent = sample === 'audio'
    ? 'Custom Audio · Click Play to hear an example'
    : 'Custom Video · Silent sample alert';
  if (alertsReplayVideo) alertsReplayVideo.hidden = sample !== 'video';
  if (alertsAudioStage) alertsAudioStage.hidden = sample !== 'audio' || !demoActive('panel-alerts');
  if (alertsFrame) alertsFrame.hidden = sample === 'audio';
  if (demoActive('panel-alerts') && sample === 'video') {
    setDemoFrame(alertsFrame, '/widget/alerts/index.html?demo=1&sample=video&replay=' + alertsVideoReplay);
  } else {
    setDemoFrame(alertsFrame, 'about:blank');
  }
}
function syncRotateButton(button, running, labelPrefix) {
  if (!button) return;
  button.textContent = running ? 'Pause rotation' : 'Resume rotation';
  button.setAttribute('aria-pressed', String(running));
  button.setAttribute('aria-label', (running ? 'Pause ' : 'Resume ') + labelPrefix + ' rotation');
}
function refreshLiveDemos() {
  const musicActive = demoActive('panel-music');
  const creditsActive = demoActive('panel-credits');
  const alertsActive = demoActive('panel-alerts');
  if (musicActive) { sizeMusicFrame(); showMusicLayout(selectedMusicIndex); }
  else setDemoFrame(musicFrame, 'about:blank');
  if (creditsActive) showCreditsLayout(selectedCreditsIndex);
  else setDemoFrame(creditsFrame, 'about:blank');
  if (alertsActive) showAlertsSample(selectedAlertsIndex);
  else {
    setDemoFrame(alertsFrame, 'about:blank');
    if (alertsAudioStage) alertsAudioStage.hidden = true;
    stopAlertsSampleAudio();
  }

  // Never leave background widgets and timers running when their tab or browser is hidden.
  if (musicRotationTimer !== null) window.clearInterval(musicRotationTimer);
  if (creditsRotationTimer !== null) window.clearInterval(creditsRotationTimer);
  musicRotationTimer = null;
  creditsRotationTimer = null;
  if (musicActive && musicRotationRunning) {
    musicRotationTimer = window.setInterval(() => showMusicLayout(selectedMusicIndex + 1), MUSIC_ROTATION_MS);
  }
  if (creditsActive && creditsRotationRunning) {
    creditsRotationTimer = window.setInterval(() => showCreditsLayout(selectedCreditsIndex + 1), CREDITS_ROTATION_MS);
  }
}

musicChoices.forEach((button, index) => button.addEventListener('click', () => {
  showMusicLayout(index);
  refreshLiveDemos();
}));
alertsChoices.forEach((button, index) => button.addEventListener('click', () => {
  showAlertsSample(index);
  refreshLiveDemos();
}));
creditsChoices.forEach((button, index) => button.addEventListener('click', () => {
  showCreditsLayout(index);
  refreshLiveDemos();
}));
if (musicRotateButton) musicRotateButton.addEventListener('click', () => {
  musicRotationRunning = !musicRotationRunning;
  syncRotateButton(musicRotateButton, musicRotationRunning, 'Spotify widget');
  refreshLiveDemos();
});
if (alertsReplayVideo) alertsReplayVideo.addEventListener('click', () => {
  if (selectedAlertsIndex !== 0 || !demoActive('panel-alerts')) return;
  alertsVideoReplay += 1;
  showAlertsSample(0);
});
if (alertsPlayAudio && alertsAudio) alertsPlayAudio.addEventListener('click', () => {
  if (!demoActive('panel-alerts') || alertsSamples[selectedAlertsIndex] !== 'audio') return;
  alertsAudio.pause();
  try { alertsAudio.currentTime = 0; } catch { /* audio is not loaded yet */ }
  // Crucially, play() occurs synchronously inside a real user click, not after
  // an iframe navigation, poll, timeout or async API call. Never autoplay audio.
  const attempt = alertsAudio.play();
  alertsPlayAudio.disabled = true;
  if (alertsAudioStatus) alertsAudioStatus.textContent = 'Playing sample alert…';
  if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {
    alertsPlayAudio.disabled = false;
    if (alertsAudioStatus) alertsAudioStatus.textContent = 'Your browser could not play the sample. Please try again.';
  });
});
if (alertsAudio) {
  alertsAudio.addEventListener('ended', () => {
    if (alertsPlayAudio) alertsPlayAudio.disabled = false;
    if (alertsAudioStatus) alertsAudioStatus.textContent = 'Sample complete. Play it again whenever you like.';
  });
  alertsAudio.addEventListener('error', () => {
    if (alertsPlayAudio) alertsPlayAudio.disabled = false;
    if (alertsAudioStatus) alertsAudioStatus.textContent = 'Audio could not load. Check that the full website package was extracted.';
  });
}
if (creditsRotateButton) creditsRotateButton.addEventListener('click', () => {
  creditsRotationRunning = !creditsRotationRunning;
  syncRotateButton(creditsRotateButton, creditsRotationRunning, 'Stream Credits');
  refreshLiveDemos();
});
syncRotateButton(musicRotateButton, musicRotationRunning, 'Spotify widget');
syncRotateButton(creditsRotateButton, creditsRotationRunning, 'Stream Credits');

tabs.forEach(tab => tab.addEventListener('click', refreshLiveDemos));
if (demoSection && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(([entry]) => {
    demosInView = entry.isIntersecting;
    refreshLiveDemos();
  }, {rootMargin:'100px'});
  observer.observe(demoSection);
}
document.addEventListener('visibilitychange', refreshLiveDemos);
window.addEventListener('resize', sizeMusicFrame);
refreshLiveDemos();
sizeMusicFrame();
