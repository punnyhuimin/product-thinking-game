import { fetchRain, forecastAreas } from "./weather.ts";

// Usage: node --experimental-strip-types server/weatherCheck.ts <area>   (no area lists them)
const area = process.argv.slice(2).join(" ");
if (!area) console.log((await forecastAreas()).join(", "));
else console.log(area, await fetchRain(area));
