import { test } from "node:test";
import assert from "node:assert/strict";
import { forecast24At, forecastForLeaveTime, forecastIsWet, nearestArea, nearestRegion, rainReport } from "./weather.ts";

const forecast = (text: string) => ({
  area_metadata: [
    { name: "Bishan", label_location: { latitude: 1.35, longitude: 103.84 } },
    { name: "Changi", label_location: { latitude: 1.357, longitude: 103.987 } },
  ],
  items: [{ forecasts: [{ area: "Bishan", forecast: text }, { area: "Changi", forecast: "Fair" }] }],
});
const rainfall = (bishanMm: number) => ({
  stations: [
    { id: "NEAR", location: { latitude: 1.351, longitude: 103.85 } },
    { id: "FAR", location: { latitude: 1.36, longitude: 103.98 } },
  ],
  readings: [{ data: [{ stationId: "NEAR", value: bishanMm }, { stationId: "FAR", value: 5 }] }],
});

test("wet forecast phrases are detected", () => {
  for (const t of ["Showers", "Light Rain", "Thundery Showers", "Heavy Thundery Showers with Gusty Winds"]) {
    assert.equal(forecastIsWet(t), true, t);
  }
  for (const t of ["Fair & Warm", "Partly Cloudy (Day)", "Cloudy", "Hazy"]) {
    assert.equal(forecastIsWet(t), false, t);
  }
});

test("dry forecast and dry nearest gauge: not raining", () => {
  assert.equal(rainReport("bishan", forecast("Fair & Warm"), rainfall(0)).raining, false);
});

test("wet forecast alone counts as raining", () => {
  assert.equal(rainReport("Bishan", forecast("Showers"), rainfall(0)).raining, true);
});

test("uses the nearest gauge, not a far one", () => {
  const r = rainReport("Bishan", forecast("Cloudy"), rainfall(0.4));
  assert.deepEqual(r, { raining: true, forecast: "Cloudy", rainMm: 0.4 });
});

test("nearestArea picks the closest label point", () => {
  assert.equal(nearestArea(forecast("Fair"), { latitude: 1.36, longitude: 103.97 }), "Changi");
  assert.equal(nearestArea(forecast("Fair"), { latitude: 1.34, longitude: 103.83 }), "Bishan");
});

test("unknown area throws", () => {
  assert.throws(() => rainReport("Atlantis", forecast("Fair"), rainfall(0)), /Unknown forecast area/);
});

const region = (text: string) => ({ text });
const regions = (north: string, south: string) => ({
  north: region(north), south: region(south), east: region("Hazy"), west: region("Hazy"), central: region("Hazy"),
});
const day = {
  records: [{
    periods: [
      { timePeriod: { start: "2026-10-07T06:00:00+08:00", end: "2026-10-07T12:00:00+08:00" }, regions: regions("Fair", "Showers") },
      { timePeriod: { start: "2026-10-07T12:00:00+08:00", end: "2026-10-07T18:00:00+08:00" }, regions: regions("Cloudy", "Cloudy") },
    ],
  }],
};

test("nearestRegion picks the closest region centre", () => {
  assert.equal(nearestRegion({ latitude: 1.43, longitude: 103.81 }), "north");
  assert.equal(nearestRegion({ latitude: 1.26, longitude: 103.83 }), "south");
  assert.equal(nearestRegion({ latitude: 1.33, longitude: 103.97 }), "east");
  assert.equal(nearestRegion({ latitude: 1.34, longitude: 103.69 }), "west");
  assert.equal(nearestRegion({ latitude: 1.35, longitude: 103.82 }), "central");
});

test("24-hour period boundaries: start inclusive, end exclusive", () => {
  const p = { latitude: 1.43, longitude: 103.81 };
  assert.equal(forecast24At(day, Date.parse("2026-10-07T06:00:00+08:00"), p)?.text, "Fair");
  assert.equal(forecast24At(day, Date.parse("2026-10-07T11:59:00+08:00"), p)?.text, "Fair");
  assert.equal(forecast24At(day, Date.parse("2026-10-07T12:00:00+08:00"), p)?.text, "Cloudy");
  assert.equal(forecast24At(day, Date.parse("2026-10-07T18:00:00+08:00"), p), null);
  assert.equal(forecast24At(day, Date.parse("2026-10-07T05:59:00+08:00"), p), null);
});

test("24-hour forecast uses the nearest region's text", () => {
  const south = { latitude: 1.26, longitude: 103.83 };
  assert.deepEqual(forecast24At(day, Date.parse("2026-10-07T08:00:00+08:00"), south), { text: "Showers", region: "south" });
});

test("switches from 24-hour to 2-hour as the leave time enters the window", () => {
  const valid_period = { start: "2026-10-07T07:30:00+08:00", end: "2026-10-07T09:30:00+08:00" };
  const f = forecast("Showers");
  const twoHr = { f: { ...f, items: [{ ...f.items[0], valid_period }] }, r: rainfall(0) };
  const p = { latitude: 1.35, longitude: 103.84 };
  assert.equal(forecastForLeaveTime(Date.parse("2026-10-07T10:00:00+08:00"), p, twoHr, day).source, "24-hour");
  assert.deepEqual(forecastForLeaveTime(Date.parse("2026-10-07T09:29:00+08:00"), p, twoHr, day), {
    forecast: "Showers", wet: true, area: "Bishan", source: "two-hour",
  });
});
