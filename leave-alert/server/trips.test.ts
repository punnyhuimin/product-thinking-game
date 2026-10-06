import { test } from "node:test";
import assert from "node:assert/strict";
import { createTrips } from "./trips.ts";
import type { ActiveTrip, Snapshot } from "./trip.ts";

const min = 60_000;
const now = Date.parse("2026-10-07T07:30:00+08:00");
const ALICE = 111;
const BOB = 222;

const place = (label: string) => ({ label, address: "", postal: "", lat: 1.35, lng: 103.84 });
const tripTo = (label: string, arriveInMin = 60): ActiveTrip => ({
  from: place("Home"),
  to: place(label),
  arriveBy: new Date(now + arriveInMin * min).toISOString(),
  bufferMin: 10,
  route: { totalMin: 20, walkMin: 5, transitMin: 15, waitMin: 0, legs: [] },
});

// Each destination's leave time, in minutes from now; tests move these to drive alerts.
function harness(leaveIn: Record<string, number>) {
  const sent: { chatId: number; text: string }[] = [];
  const failing = new Set<string>();
  const held = new Map<string, Promise<void>>(); // checks for these destinations wait until released
  const hold = (label: string) => {
    let release!: () => void;
    held.set(label, new Promise((r) => (release = r)));
    return release;
  };
  const trips = createTrips({
    check: async (t: ActiveTrip): Promise<Snapshot> => {
      await held.get(t.to.label);
      if (failing.has(t.to.label)) throw new Error(`LTA down for ${t.to.label}`);
      const leaveAt = now + leaveIn[t.to.label] * min;
      return {
        plan: { leaveAt: new Date(leaveAt), totalMin: 20, umbrella: false },
        context: {
          toLabel: t.to.label,
          serviceNo: "157",
          busWaitMin: 3,
          forecast: "Fair",
          forecastAt: leaveAt,
          forecastArea: null,
          forecastSource: "test",
          umbrella: false,
          mapsUrl: "https://maps.example",
        },
        checkedAt: now,
      };
    },
    send: async (chatId, text) => void sent.push({ chatId, text }),
    now: () => now,
  });
  const to = (chatId: number) => sent.filter((m) => m.chatId === chatId).map((m) => m.text);
  return { trips, sent, failing, hold, to };
}

test("each user gets alerts for their own trip only", async () => {
  const { trips, to } = harness({ Office: 8, Gym: 5 });
  await trips.start(ALICE, tripTo("Office"));
  await trips.start(BOB, tripTo("Gym"));
  await trips.tick();
  assert.equal(to(ALICE).length, 1);
  assert.match(to(ALICE)[0], /Leave in 8 min .* for Office/);
  assert.equal(to(BOB).length, 1);
  assert.match(to(BOB)[0], /Leave in 5 min .* for Gym/);
});

test("one user's failed check doesn't stop the others", async () => {
  const { trips, failing, to } = harness({ Office: 8, Gym: 5 });
  await trips.start(ALICE, tripTo("Office"));
  await trips.start(BOB, tripTo("Gym"));
  failing.add("Office");
  await trips.tick();
  assert.deepEqual(to(ALICE), []);
  assert.equal(to(BOB).length, 1);
  assert.equal(trips.view(ALICE).error, "LTA down for Office");
  assert.equal(trips.view(ALICE).trip?.to.label, "Office");
  assert.equal(trips.view(BOB).error, null);
  failing.clear();
  await trips.tick();
  assert.equal(to(ALICE).length, 1);
  assert.equal(trips.view(ALICE).error, null);
});

test("a trip is dropped after its go alert, or once its arrival time has passed", async () => {
  const { trips, to } = harness({ Office: 0, Gym: 30 });
  await trips.start(ALICE, tripTo("Office"));
  await trips.start(BOB, tripTo("Gym", -1));
  await trips.tick();
  assert.match(to(ALICE)[0], /Leave now for Office/);
  assert.equal(trips.view(ALICE).trip, null);
  assert.equal(trips.view(BOB).trip, null);
  await trips.tick();
  assert.equal(to(ALICE).length, 1);
});

test("cancelling only stops that user's trip", async () => {
  const { trips } = harness({ Office: 30, Gym: 30 });
  await trips.start(ALICE, tripTo("Office"));
  await trips.start(BOB, tripTo("Gym"));
  assert.equal(trips.cancel(ALICE), true);
  assert.equal(trips.cancel(ALICE), false);
  assert.equal(trips.view(ALICE).trip, null);
  assert.equal(trips.view(BOB).trip?.to.label, "Gym");
});

test("a trip set while the old one is being checked replaces it cleanly", async () => {
  const { trips, hold, to } = harness({ Office: 0, Gym: 30 });
  await trips.start(ALICE, tripTo("Office"));
  const release = hold("Office");
  const ticking = trips.tick(); // Office's check is in flight and will say "go"
  await trips.start(ALICE, tripTo("Gym"));
  release();
  await ticking;
  assert.deepEqual(to(ALICE), []);
  assert.equal(trips.view(ALICE).trip?.to.label, "Gym");
});

test("ticking one chat checks only that chat's trip", async () => {
  const { trips, to } = harness({ Office: 8, Gym: 5 });
  await trips.start(ALICE, tripTo("Office"));
  await trips.start(BOB, tripTo("Gym"));
  await trips.tick(BOB);
  assert.deepEqual(to(ALICE), []);
  assert.equal(to(BOB).length, 1);
});
