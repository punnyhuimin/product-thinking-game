// Test double for the global fetch: answers by URL from sample payloads shaped like the real APIs.
// Usage: const fake = installFakeFetch({ twoHr: twoHrForecast("Showers") }); ... fake.restore() in afterEach.

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// data.gov.sg v2 wraps every payload as { code, data, errorMsg }.
const dgs = <T>(data: T) => ({ code: 0, data, errorMsg: "" });

// data.gov.sg 2-hour forecast; Bishan is the area nearest the sample trips' origin.
export const twoHrForecast = (bishan = "Fair & Warm") =>
  dgs({
    area_metadata: [
      { name: "Bishan", label_location: { latitude: 1.350772, longitude: 103.839 } },
      { name: "Changi", label_location: { latitude: 1.357, longitude: 103.987 } },
    ],
    items: [
      {
        update_timestamp: "2026-10-07T07:30:00+08:00",
        timestamp: "2026-10-07T07:30:00+08:00",
        valid_period: { start: "2026-10-07T07:30:00+08:00", end: "2026-10-07T09:30:00+08:00", text: "7.30 am to 9.30 am" },
        forecasts: [
          { area: "Bishan", forecast: bishan },
          { area: "Changi", forecast: "Fair & Warm" },
        ],
      },
    ],
  });

// data.gov.sg rainfall (mm in the last 5 minutes); gauge S1 is nearest Bishan.
export const rainfall = (nearestMm = 0) =>
  dgs({
    stations: [
      { id: "S1", deviceId: "S1", name: "Bishan Street 11", location: { latitude: 1.351, longitude: 103.85 } },
      { id: "S2", deviceId: "S2", name: "Changi East Close", location: { latitude: 1.3, longitude: 103.98 } },
    ],
    readings: [
      { timestamp: "2026-10-07T07:30:00+08:00", data: [{ stationId: "S1", value: nearestMm }, { stationId: "S2", value: 0 }] },
    ],
    readingType: "TB1 Rainfall 5 minutes total",
    readingUnit: "mm",
  });

const region = (code: string, text: string) => ({ code, text });
const allRegions = (code: string, text: string) => ({
  west: region(code, text),
  east: region(code, text),
  central: region(code, text),
  south: region(code, text),
  north: region(code, text),
});

// data.gov.sg 24-hour forecast. Nothing calls it yet; it's served so the next ticket only adds cases.
export const twentyFourHrForecast = () =>
  dgs({
    records: [
      {
        date: "2026-10-07",
        updatedTimestamp: "2026-10-07T05:30:00+08:00",
        timestamp: "2026-10-07T05:30:00+08:00",
        general: {
          temperature: { low: 25, high: 33, unit: "Degrees Celsius" },
          relativeHumidity: { low: 55, high: 95, unit: "Percentage" },
          forecast: region("TL", "Thundery Showers"),
          validPeriod: { start: "2026-10-07T06:00:00+08:00", end: "2026-10-08T06:00:00+08:00", text: "6 AM 7 Oct to 6 AM 8 Oct" },
          wind: { speed: { low: 10, high: 20 }, direction: "NE" },
        },
        periods: [
          {
            timePeriod: { start: "2026-10-07T06:00:00+08:00", end: "2026-10-07T12:00:00+08:00", text: "6 AM to 12 PM" },
            regions: allRegions("PC", "Partly Cloudy"),
          },
          {
            timePeriod: { start: "2026-10-07T12:00:00+08:00", end: "2026-10-07T18:00:00+08:00", text: "12 PM to 6 PM" },
            regions: allRegions("TL", "Thundery Showers"),
          },
        ],
      },
    ],
  });

// LTA DataMall v3 BusArrival for one service; a null eta means no bus is reported.
export const busArrival = (eta: string | null) => ({
  "odata.metadata": "https://datamall2.mytransport.sg/ltaodataservice/v3/$metadata#BusArrival/@Element",
  BusStopCode: "52009",
  Services: eta
    ? [
        {
          ServiceNo: "157",
          Operator: "SMRT",
          NextBus: {
            OriginCode: "52009",
            DestinationCode: "52009",
            EstimatedArrival: eta,
            Monitored: 1,
            Latitude: "1.35",
            Longitude: "103.84",
            VisitNumber: "1",
            Load: "SEA",
            Feature: "WAB",
            Type: "DD",
          },
          NextBus2: { EstimatedArrival: "", Monitored: 0 },
        },
      ]
    : [],
});

// Each endpoint serves its payload with 200, or "fail" for a 500.
export type FakeRoutes = {
  twoHr: unknown;
  rainfall: unknown;
  twentyFourHr: unknown;
  lta: unknown;
};

export function installFakeFetch(overrides: Partial<FakeRoutes> = {}) {
  const real = globalThis.fetch;
  const routes: FakeRoutes = {
    twoHr: twoHrForecast(),
    rainfall: rainfall(),
    twentyFourHr: twentyFourHrForecast(),
    lta: busArrival(null),
    ...overrides,
  };
  const calls: string[] = [];
  const serve = (body: unknown) => (body === "fail" ? json({ error: "boom" }, 500) : json(body));
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input instanceof Request ? input.url : input);
    calls.push(url);
    if (url.includes("/two-hr-forecast")) return serve(routes.twoHr);
    if (url.includes("/rainfall")) return serve(routes.rainfall);
    if (url.includes("/twenty-four-hr-forecast")) return serve(routes.twentyFourHr);
    if (url.includes("/BusArrival")) return serve(routes.lta);
    throw new Error(`fakeFetch: no sample payload for ${url}`);
  }) as typeof fetch;
  return { calls, restore: () => void (globalThis.fetch = real) };
}
