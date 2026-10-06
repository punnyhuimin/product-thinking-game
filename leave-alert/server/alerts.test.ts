import { test } from "node:test";
import assert from "node:assert/strict";
import { formatAlert, nextAlert, record } from "./alerts.ts";

const min = 60_000;
const now = Date.parse("2026-10-07T07:30:00+08:00");

test("quiet while more than 10 min away", () => {
  assert.equal(nextAlert({}, now + 25 * min, now), null);
});

test("heads-up once inside 10 min, then quiet if plan holds", () => {
  const leaveAt = now + 8 * min;
  assert.equal(nextAlert({}, leaveAt, now), "headsUp");
  const sent = record({}, "headsUp", leaveAt);
  assert.equal(nextAlert(sent, leaveAt + 1 * min, now), null);
});

test("update when leave time shifts 3+ min after heads-up", () => {
  const sent = record({}, "headsUp", now + 8 * min);
  assert.equal(nextAlert(sent, now + 4 * min, now), "update");
});

test("go at leave time, then nothing more", () => {
  assert.equal(nextAlert({}, now - 1 * min, now), "go");
  assert.equal(nextAlert(record({}, "go", now), now - 1 * min, now), null);
});

test("message mentions bus, umbrella and destination", () => {
  const text = formatAlert("headsUp", now + 8 * min, now, {
    toLabel: "School", serviceNo: "15", busWaitMin: 6, forecast: "Showers", umbrella: true,
  });
  assert.match(text, /Leave in 8 min \(07:38\) for School/);
  assert.match(text, /Bus 15 in 6 min/);
  assert.match(text, /umbrella/);
});
