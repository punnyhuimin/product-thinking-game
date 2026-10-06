const BASE = "https://datamall2.mytransport.sg/ltaodataservice";

type NextBus = { EstimatedArrival: string };
type Service = { ServiceNo: string; NextBus: NextBus; NextBus2: NextBus };

// Minutes until the next bus of a service at a stop, or null if none is reported.
export async function busWaitMin(
  accountKey: string,
  stopCode: string,
  serviceNo: string,
  now = new Date(),
): Promise<number | null> {
  const res = await fetch(`${BASE}/v3/BusArrival?BusStopCode=${stopCode}&ServiceNo=${serviceNo}`, {
    headers: { AccountKey: accountKey, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`LTA BusArrival ${res.status}`);
  const data = (await res.json()) as { Services: Service[] };
  const eta = data.Services[0]?.NextBus.EstimatedArrival;
  if (!eta) return null;
  return Math.max(0, Math.round((new Date(eta).getTime() - now.getTime()) / 60_000));
}
