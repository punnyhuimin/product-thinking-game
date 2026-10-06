import { test } from "node:test";
import assert from "node:assert/strict";
import { googleMapsUrl } from "./googleMaps.ts";

test("transit directions between the two coordinates", () => {
  const from = { label: "Home", address: "", postal: "", lat: 1.3521, lng: 103.8198 };
  const to = { label: "School", address: "", postal: "", lat: 1.3048, lng: 103.8318 };
  const url = new URL(googleMapsUrl(from, to));
  assert.equal(url.origin + url.pathname, "https://www.google.com/maps/dir/");
  assert.equal(url.searchParams.get("api"), "1");
  assert.equal(url.searchParams.get("origin"), "1.3521,103.8198");
  assert.equal(url.searchParams.get("destination"), "1.3048,103.8318");
  assert.equal(url.searchParams.get("travelmode"), "transit");
});
