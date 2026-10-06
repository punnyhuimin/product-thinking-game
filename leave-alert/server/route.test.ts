import { test } from "node:test";
import assert from "node:assert/strict";
import { decodePolyline, thin } from "./polyline.ts";
import { firstTransit, toRoute, type Place } from "./route.ts";
import { staticMapUrl } from "./staticMap.ts";

const from: Place = { label: "Kings Ville", address: "", postal: "266439", lat: 1.3197, lng: 103.8064 };
const to: Place = { label: "Hwa Chong Institution", address: "", postal: "269734", lat: 1.3268, lng: 103.8037 };

test("decodes Google's reference polyline", () => {
  assert.deepEqual(decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@"), [[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]]);
});

test("thin keeps ends and caps count", () => {
  const pts = Array.from({ length: 100 }, (_, k): [number, number] => [k, k]);
  const out = thin(pts, 5);
  assert.equal(out.length, 5);
  assert.deepEqual([out[0], out[4]], [[0, 0], [99, 99]]);
});

const raw = {
  duration: 1500, walkTime: 480, transitTime: 780, waitingTime: 240,
  legs: [
    { mode: "WALK", from: { name: "Origin" }, to: { name: "OPP KINGS VILLE", stopCode: "41041" }, duration: 300, legGeometry: { points: "_p~iF~ps|U_ulLnnqC" } },
    { mode: "BUS", route: "61", from: { name: "OPP KINGS VILLE", stopCode: "41041" }, to: { name: "HWA CHONG INST" }, duration: 780 },
    { mode: "WALK", from: { name: "HWA CHONG INST" }, to: { name: "Destination" }, duration: 180 },
  ],
};

test("maps an itinerary to legs with the user's place names", () => {
  const r = toRoute(raw, from, to);
  assert.deepEqual([r.totalMin, r.walkMin, r.transitMin, r.waitMin], [25, 8, 13, 4]);
  assert.equal(r.legs[0].fromName, "Kings Ville");
  assert.equal(r.legs[2].toName, "Hwa Chong Institution");
  assert.equal(r.legs[1].service, "61");
  assert.equal(r.legs[1].fromStopCode, "41041");
  assert.equal(r.legs[0].path.length, 2);
  assert.equal(firstTransit(r)?.service, "61");
});

test("static map url has pins and stays a sane length", () => {
  const url = staticMapUrl(toRoute(raw, from, to), from, to);
  assert.match(url, /getStaticImage\?layerchosen=default/);
  assert.match(url, /points=/);
  assert.ok(url.length < 8000, `url length ${url.length}`);
});
