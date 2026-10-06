import { test } from "node:test";
import assert from "node:assert/strict";
import { forecastIsWet, nearestArea, rainReport } from "./weather.ts";

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
