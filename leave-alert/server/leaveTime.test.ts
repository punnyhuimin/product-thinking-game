import { test } from "node:test";
import assert from "node:assert/strict";
import { computeLeaveTime, type TripInputs } from "./leaveTime.ts";

const base: TripInputs = {
  arriveBy: new Date("2026-10-07T08:30:00+08:00"),
  bufferMin: 10,
  walkToStopMin: 5,
  busWaitMin: 6,
  rideMin: 20,
  walkFromStopMin: 5,
  raining: false,
};

test("dry trip: sums legs and buffer", () => {
  const p = computeLeaveTime(base);
  assert.equal(p.totalMin, 46);
  assert.equal(p.leaveAt.toISOString(), new Date("2026-10-07T07:44:00+08:00").toISOString());
  assert.equal(p.umbrella, false);
});

test("rain lengthens walking legs only and flags umbrella", () => {
  const p = computeLeaveTime({ ...base, raining: true });
  assert.equal(p.totalMin, 49); // 10*1.3 + 6 + 20 + 10 = 49
  assert.equal(p.umbrella, true);
});

test("longer bus wait moves leave time earlier", () => {
  const a = computeLeaveTime(base);
  const b = computeLeaveTime({ ...base, busWaitMin: 16 });
  assert.equal(a.leaveAt.getTime() - b.leaveAt.getTime(), 10 * 60_000);
});
