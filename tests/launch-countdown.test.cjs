"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../launch-countdown.js"), "utf8");
const target = Date.parse("2026-11-27T23:30:00Z");

function fixture(zone = "Australia/Adelaide", now = target - 86400000, empty = false) {
  const clock = { now, zone }, events = {}, intervals = [];
  const values = [{ textContent: "" }, { textContent: "" }];
  const badges = values.map(value => ({ attributes: {},
    querySelector: selector => selector === ".launch-countdown-value" ? value : null,
    setAttribute(name, text) { this.attributes[name] = text; }
  }));
  const local = { textContent: "" }, hint = { hidden: true };
  const document = {
    hidden: false,
    querySelectorAll: selector => empty ? [] : ({
      "[data-launch-countdown]": badges, "[data-launch-local]": [local],
      "[data-launch-local-hint]": [hint]
    }[selector] || []),
    addEventListener(name, callback) { events[name] = callback; }
  };
  vm.runInNewContext(source, {
    document, window: { addEventListener(name, callback) { events[name] = callback; } },
    Date: class extends Date { static now() { return clock.now; } },
    Intl: { DateTimeFormat: class extends Intl.DateTimeFormat {
      constructor(locale, options) { super("en-AU", { ...options, timeZone: clock.zone }); }
    } },
    setInterval(callback, delay) { intervals.push({ callback, delay }); }
  });
  return { clock, values, badges, local, hint, document, events, intervals,
    tick() { intervals[0].callback(); } };
}

test("one Adelaide daylight-saving launch moment produces correct local dates worldwide", () => {
  const cases = [
    ["Australia/Adelaide", "Saturday", "28 November 2026", "10:00"],
    ["Australia/Sydney", "Saturday", "28 November 2026", "10:30"],
    ["Australia/Perth", "Saturday", "28 November 2026", "7:30"],
    ["America/New_York", "Friday", "27 November 2026", "6:30"],
    ["Europe/London", "Friday", "27 November 2026", "11:30"],
    ["Asia/Kathmandu", "Saturday", "28 November 2026", "5:15"]
  ];
  for (const [zone, day, date, time] of cases) {
    const f = fixture(zone);
    assert.ok(f.local.textContent.includes(day), zone + " weekday");
    assert.ok(f.local.textContent.includes(date), zone + " date");
    assert.ok(f.local.textContent.includes(time), zone + " time");
    assert.equal(f.local.dateTime, "2026-11-27T23:30:00Z");
    assert.deepEqual(f.values.map(x => x.textContent), ["01d 00h 00m 00s", "01d 00h 00m 00s"]);
    assert.equal(f.hint.hidden, false);
    assert.ok(f.badges[0].attributes["aria-label"].includes(f.local.textContent));
  }
});

test("never finishes early or displays negative time", () => {
  const f = fixture("Australia/Adelaide", target - 1);
  assert.equal(f.values[0].textContent, "00d 00h 00m 01s");
  f.clock.now = target; f.tick();
  assert.equal(f.values[0].textContent, "00d 00h 00m 00s");
  f.clock.now += 86400000; f.tick();
  assert.equal(f.values[0].textContent, "00d 00h 00m 00s");
});

test("uses the current system clock after missed ticks, sleep and clock corrections", () => {
  const f = fixture();
  assert.equal(f.intervals[0].delay, 1000);
  const label = f.badges[0].attributes["aria-label"];
  f.clock.now += 3661000; f.tick();
  assert.equal(f.values[0].textContent, "00d 22h 58m 59s");
  assert.equal(f.badges[0].attributes["aria-label"], label, "ticking seconds do not change the accessible launch label");
  f.clock.now -= 1000; f.tick();
  assert.equal(f.values[0].textContent, "00d 22h 59m 00s");
  f.clock.now = target - 5000; f.events.visibilitychange();
  assert.equal(f.values[0].textContent, "00d 00h 00m 05s");
});

test("refreshes local formatting when the visitor changes time zones and returns", () => {
  const f = fixture();
  f.clock.zone = "America/New_York"; f.events.focus();
  assert.ok(f.local.textContent.includes("Friday"));
  assert.ok(f.local.textContent.includes("6:30"));
  assert.equal(f.values[0].textContent, "01d 00h 00m 00s");
  f.clock.now = target - 123000; f.events.pageshow();
  assert.equal(f.values[0].textContent, "00d 00h 02m 03s");
});

test("does not start a timer on pages without a launch display", () => {
  assert.equal(fixture("Australia/Adelaide", target, true).intervals.length, 0);
});
