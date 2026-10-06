import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { checkTrip, type ActiveTrip } from "./trip.ts";
import { RAIN_WALK_FACTOR } from "./leaveTime.ts";
import { busArrival, installFakeFetch, rainfall, twoHrForecast } from "./fakeFetch.ts";

const now = new Date("2026-10-07T07:30:00+08:00");
const minutesFromNow = (m: number) => new Date(now.getTime() + m * 60_000).toISOString();

const place = (label: string, lat: number, lng: number) => ({ label, address: label, postal: "000000", lat, lng });
const leg = (mode: "WALK" | "BUS", durationMin: number, service: string | null = null) => ({
  mode,
  service,
  fromName: "A",
  toName: "B",
  fromStopCode: mode === "BUS" ? "52009" : null,
  durationMin,
  path: [],
});

// Arrive 08:30 with a 10 min buffer; 5 min walk, 6 min scheduled wait, 20 min ride.
const trip: ActiveTrip = {
  from: place("Home", 1.3508, 103.839),
  to: place("Office", 1.3, 103.8),
  arriveBy: "2026-10-07T08:30:00+08:00",
  bufferMin: 10,
  route: { totalMin: 31, walkMin: 5, transitMin: 20, waitMin: 6, legs: [leg("WALK", 5), leg("BUS", 20, "157")] },
};

const leaveAt = (totalMin: number) => new Date(Date.parse(trip.arriveBy) - totalMin * 60_000).toISOString();

let fake: ReturnType<typeof installFakeFetch> | undefined;
afterEach(() => fake?.restore());

test("dry trip: scheduled wait, no umbrella", async () => {
  fake = installFakeFetch({ lta: "fail" });
  const s = await checkTrip(trip, "key", now);
  assert.equal(s.plan.totalMin, 41); // 5 + 6 + 20 + 10
  assert.equal(s.plan.leaveAt.toISOString(), leaveAt(41));
  assert.equal(s.plan.umbrella, false);
  assert.equal(s.context.umbrella, false);
  assert.equal(s.context.forecast, "Fair & Warm");
  assert.equal(s.checkedAt, now.getTime());
});

test("wet forecast now: umbrella and rain walking time", async () => {
  fake = installFakeFetch({ twoHr: twoHrForecast("Showers"), lta: "fail" });
  const s = await checkTrip(trip, "key", now);
  assert.equal(s.plan.totalMin, Math.ceil(5 * RAIN_WALK_FACTOR + 6 + 20 + 10)); // 43
  assert.equal(s.plan.leaveAt.toISOString(), leaveAt(43));
  assert.equal(s.plan.umbrella, true);
  assert.equal(s.context.umbrella, true);
  assert.equal(s.context.forecast, "Showers");
});

test("rain at the nearest gauge also means umbrella", async () => {
  fake = installFakeFetch({ rainfall: rainfall(0.6), lta: "fail" });
  const s = await checkTrip(trip, "key", now);
  assert.equal(s.plan.umbrella, true);
  assert.equal(s.context.forecast, "Fair & Warm");
});

test("live LTA wait replaces the scheduled first wait", async () => {
  fake = installFakeFetch({ lta: busArrival(minutesFromNow(3)) });
  const s = await checkTrip(trip, "key", now);
  assert.equal(s.context.busWaitMin, 3);
  assert.equal(s.context.serviceNo, "157");
  assert.equal(s.plan.totalMin, 38); // 5 + 3 + 20 + 10
  assert.equal(s.plan.leaveAt.toISOString(), leaveAt(38));
  assert.ok(fake.calls.some((u) => u.includes("BusStopCode=52009") && u.includes("ServiceNo=157")));
});

test("LTA failing: scheduled wait is used", async () => {
  fake = installFakeFetch({ lta: "fail" });
  const s = await checkTrip(trip, "key", now);
  assert.equal(s.context.busWaitMin, null);
  assert.equal(s.plan.totalMin, 41);
});

test("weather fetch failing: Unavailable forecast, no umbrella", async () => {
  fake = installFakeFetch({ twoHr: "fail", lta: "fail" });
  const s = await checkTrip(trip, "key", now);
  assert.equal(s.context.forecast, "Unavailable");
  assert.equal(s.context.umbrella, false);
  assert.equal(s.plan.umbrella, false);
  assert.equal(s.plan.totalMin, 41);
});
