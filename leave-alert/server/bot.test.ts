import { test } from "node:test";
import assert from "node:assert/strict";
import { createBot, parseArrive, type Reply } from "./bot.ts";
import type { Place } from "./route.ts";
import type { Trip } from "./trip.ts";

const now = new Date("2026-10-07T09:00:00+08:00");
const place = (label: string): Place => ({ label, address: "", postal: "", lat: 1.3, lng: 103.8 });

test("parses 24h, compact and am/pm times in Singapore", () => {
  assert.equal(parseArrive("18:30", now)?.arriveBy, "2026-10-07T18:30:00+08:00");
  assert.equal(parseArrive("1830", now)?.arriveBy, "2026-10-07T18:30:00+08:00");
  assert.equal(parseArrive("6:30pm", now)?.arriveBy, "2026-10-07T18:30:00+08:00");
  assert.equal(parseArrive("12pm", now)?.arriveBy, "2026-10-07T12:00:00+08:00");
  assert.equal(parseArrive("12:15am", now)?.arriveBy, "2026-10-08T00:15:00+08:00");
});

test("past times roll over to tomorrow", () => {
  const r = parseArrive("08:30", now);
  assert.equal(r?.arriveBy, "2026-10-08T08:30:00+08:00");
  assert.equal(r?.tomorrow, true);
});

test("optional buffer, defaulting to 10", () => {
  assert.equal(parseArrive("18:30", now)?.bufferMin, 10);
  assert.equal(parseArrive("18:30 +15", now)?.bufferMin, 15);
  assert.equal(parseArrive("6pm 5 min", now)?.bufferMin, 5);
});

test("rejects things that aren't times", () => {
  for (const t of ["25:00", "18:75", "13pm", "tomorrow", ""]) assert.equal(parseArrive(t, now), null, t);
});

function harness(results: Place[] = [place("Orchard MRT"), place("Orchard Road")]) {
  const sent: Reply[] = [];
  const saved: Trip[] = [];
  const asked: string[] = []; // which chat each trip call was made for
  const bot = createBot({
    send: async (_id, r) => void sent.push(r),
    search: async () => results,
    saveTrip: async (id, t) => void (saved.push(t), asked.push(`save ${id}`)),
    status: (id) => (asked.push(`status ${id}`), null),
    cancelTrip: (id) => (asked.push(`cancel ${id}`), false),
    webLink: (id) => `https://web.example/?key=${id}.sig`,
    now: () => now,
  });
  const lastPick = () => sent.findLast((r) => r.keyboard)!.keyboard![0][0].callback_data;
  return { bot, sent, saved, asked, lastPick };
}

test("plans a trip from search picks and a time", async () => {
  const { bot, sent, saved, lastPick } = harness();
  await bot.onText(1, "/trip");
  await bot.onText(1, "orchard");
  assert.deepEqual(sent.at(-1)?.keyboard?.map((row) => row[0].text), ["Orchard MRT", "Orchard Road"]);
  assert.equal(await bot.onPick(1, lastPick()), "From: Orchard MRT");
  await bot.onLocation(1, 1.35, 103.94);
  await bot.onText(1, "18:30 +5");
  assert.equal(saved.length, 1);
  assert.equal(saved[0].from.label, "Orchard MRT");
  assert.equal(saved[0].to.label, "Shared location");
  assert.equal(saved[0].arriveBy, "2026-10-07T18:30:00+08:00");
  assert.equal(saved[0].bufferMin, 5);
});

test("buttons from an earlier list are refused", async () => {
  const { bot, sent, lastPick } = harness();
  await bot.onText(1, "/trip");
  await bot.onText(1, "orchard");
  const old = lastPick();
  await bot.onText(1, "orchard again");
  assert.equal(await bot.onPick(1, old), null);
  assert.match(sent.at(-1)!.text, /expired/);
});

test("a bad time asks again without saving", async () => {
  const { bot, sent, saved, lastPick } = harness();
  await bot.onText(1, "/trip");
  await bot.onText(1, "a");
  assert.match(sent.at(-1)!.text, /at least 2/);
  await bot.onText(1, "orchard");
  await bot.onPick(1, lastPick());
  await bot.onText(1, "orchard");
  await bot.onPick(1, lastPick());
  await bot.onText(1, "soon");
  assert.match(sent.at(-1)!.text, /didn't understand/);
  assert.equal(saved.length, 0);
});

test("no matches and no session get helpful replies", async () => {
  const { bot, sent } = harness([]);
  await bot.onText(1, "hello");
  assert.match(sent.at(-1)!.text, /\/trip/);
  await bot.onText(1, "/trip");
  await bot.onText(1, "zzzz");
  assert.match(sent.at(-1)!.text, /No matches/);
  await bot.onText(1, "/cancel");
  assert.match(sent.at(-1)!.text, /Stopped planning/);
});

test("trip commands act on the chat that sent them", async () => {
  const { bot, asked, lastPick } = harness();
  await bot.onText(7, "/trip");
  await bot.onText(7, "orchard");
  await bot.onPick(7, lastPick());
  await bot.onText(7, "orchard");
  await bot.onPick(7, lastPick());
  await bot.onText(7, "18:30");
  await bot.onText(8, "/status");
  await bot.onText(9, "/cancel");
  assert.deepEqual(asked, ["save 7", "status 8", "cancel 9"]);
});

test("/web replies with a link for this chat", async () => {
  const { bot, sent } = harness();
  await bot.onText(42, "/web");
  assert.match(sent.at(-1)!.text, /https:\/\/web\.example\/\?key=42\.sig/);
  await bot.onText(42, "/help");
  assert.match(sent.at(-1)!.text, /\/web/);
});
