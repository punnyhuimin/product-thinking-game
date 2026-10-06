import { busWaitMin } from "./lta.ts";

// Usage: node --env-file=.env --experimental-strip-types server/ltaCheck.ts <stopCode> <serviceNo>
const [stop, service] = process.argv.slice(2);
const key = process.env.LTA_ACCOUNT_KEY;
if (!key || !stop || !service) {
  console.error("Need LTA_ACCOUNT_KEY in .env, plus <stopCode> <serviceNo> args");
  process.exit(1);
}
console.log(`Next bus ${service} at ${stop}:`, await busWaitMin(key, stop, service), "min");
