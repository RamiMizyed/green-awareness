// Rebuilds src/lib/data/regions.ts and public/flags from public data:
//   - grid carbon intensity: Ember via Our World in Data (latest year per country)
//   - household electricity prices (USD/kWh): GlobalPetrolPrices
//   - exchange rates to local currency: open.er-api.com
//
// Run with: npm run update-regions
// Review the diff afterwards; the sources occasionally rename countries.

import fs from "node:fs";
import { createRequire } from "node:module";
import iso from "i18n-iso-countries";
import { countries } from "countries-list";

const require = createRequire(import.meta.url);
// The detailed map (shown when zoomed in) includes even very small countries.
const atlas = require("world-atlas/countries-50m.json");
const mapIds = new Set(atlas.objects.countries.geometries.map((g) => String(g.id)));

const UA = { "User-Agent": "Mozilla/5.0 (green-awareness region updater)" };
const get = async (url) => {
	const res = await fetch(url, { headers: UA });
	if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
	return res.text();
};

console.log("Downloading data…");
const [intensityCsv, pricesHtml, fxJson] = await Promise.all([
	get("https://ourworldindata.org/grapher/carbon-intensity-electricity.csv?v=1&csvType=full&useColumnShortNames=true"),
	get("https://www.globalpetrolprices.com/electricity_prices/"),
	get("https://open.er-api.com/v6/latest/USD"),
]);
const fx = JSON.parse(fxJson).rates;

// --- Grid intensity (g/kWh), latest year per ISO3 code and per aggregate ----------
const latest = new Map();
for (const row of intensityCsv.split("\n").slice(1)) {
	const m = row.match(/^("[^"]*"|[^,]*),([^,]*),(\d{4}),([\d.]+)/);
	if (!m) continue;
	const key = m[2] || m[1].replace(/"/g, "");
	const prev = latest.get(key);
	if (!prev || +m[3] > prev.year) latest.set(key, { year: +m[3], value: +m[4] });
}

// --- Household prices -----------------------------------------------------------
const prices = new Map();
const rowRe = /href="\/([^/]+)\/electricity_prices\/"[^>]*>[^<]+<\/a><\/td>\s*<td>([\d.]*)<\/td>/g;
for (const m of pricesHtml.matchAll(rowRe)) {
	if (m[2]) prices.set(m[1].replace(/-/g, " "), +m[2]);
}
if (prices.size < 100) throw new Error(`Only ${prices.size} prices parsed; the page layout may have changed.`);

// Names the ISO library doesn't recognise as written on the price page.
const NAME_FIX = {
	"United Kingdom": "GB", USA: "US", "South Korea": "KR", Russia: "RU", Taiwan: "TW",
	"Czech Republic": "CZ", Vietnam: "VN", Laos: "LA", Iran: "IR", Syria: "SY",
	Moldova: "MD", Bolivia: "BO", Venezuela: "VE", Tanzania: "TZ", "Ivory Coast": "CI",
	"DR Congo": "CD", "Republic of the Congo": "CG", "Cape Verde": "CV", Palestine: "PS",
	Kosovo: "XK", "North Macedonia": "MK", Macedonia: "MK", "Bosnia and Herzegovina": "BA", Brunei: "BN",
	Eswatini: "SZ", Swaziland: "SZ", "Burma Myanmar": "MM", Turkey: "TR", "Hong Kong": "HK",
};

// Hand-picked formatting locales for the original countries.
const KEEP_LOCALE = {
	us: "en-US", ca: "en-CA", mx: "es-MX", br: "pt-BR", gb: "en-GB", ie: "en-IE", de: "de-DE",
	fr: "fr-FR", es: "es-ES", it: "it-IT", nl: "nl-NL", pl: "pl-PL", se: "sv-SE", no: "nb-NO",
	tr: "tr-TR", sa: "en-SA", ae: "en-AE", eg: "en-EG", za: "en-ZA", ng: "en-NG", in: "en-IN",
	cn: "zh-CN", jp: "ja-JP", kr: "ko-KR", id: "id-ID", au: "en-AU", nz: "en-NZ",
};
// Languages that may default to non-Western digits: format those in English.
const NON_LATIN_DIGITS = new Set(["ar", "fa", "ps", "ur", "bn", "ne", "mr", "my", "dz", "hi"]);

const round = (n) =>
	n >= 100 ? Math.round(n / 5) * 5
	: n >= 10 ? Math.round(n * 2) / 2
	: n >= 1 ? Math.round(n * 100) / 100
	: Math.round(n * 1000) / 1000;

const rows = [];
const skipped = [];
for (const [name, usd] of prices) {
	const a2 = NAME_FIX[name] ?? iso.getAlpha2Code(name, "en");
	const a3 = a2 && iso.alpha2ToAlpha3(a2);
	const ci = a3 && latest.get(a3);
	const info = a2 && countries[a2];
	const currency = info?.currency?.[0];
	if (!a2 || !ci || !info || !currency || !fx[currency]) {
		skipped.push(name);
		continue;
	}
	if (ci.year < 2021) {
		skipped.push(`${name} (carbon data only to ${ci.year})`);
		continue;
	}
	const id = a2.toLowerCase();
	const lang = info.languages?.[0] ?? "en";
	const num = iso.alpha2ToNumeric(a2);
	rows.push({
		id,
		name: info.name,
		currency,
		locale: KEEP_LOCALE[id] ?? (NON_LATIN_DIGITS.has(lang) ? `en-${a2}` : `${lang}-${a2}`),
		intensity: Math.round(ci.value) / 1000,
		price: round(usd * fx[currency]),
		distance: ["US", "GB", "LR", "MM"].includes(a2) ? "mi" : "km",
		iso: num && mapIds.has(num) ? num : undefined,
	});
}
rows.sort((a, b) => a.name.localeCompare(b.name));

const world = latest.get("OWID_WRL");
const eu = latest.get("OWID_EU27");
if (!world || !eu) throw new Error("World or EU aggregate missing from the carbon data.");

// --- Write regions.ts -------------------------------------------------------------
const file = "src/lib/data/regions.ts";
const current = fs.readFileSync(file, "utf8");
const tail = current.slice(current.indexOf("export const DEFAULT_REGION_ID"));
const q = JSON.stringify;
const line = (r) =>
	`\t{ id: ${q(r.id)}, name: ${q(r.name)}, currency: ${q(r.currency)}, locale: ${q(r.locale)}, intensity: ${r.intensity}, price: ${r.price}, distance: ${q(r.distance)}${r.iso ? `, iso: ${q(r.iso)}` : ""} },`;

fs.writeFileSync(
	file,
	`/**
 * Country presets. Generated by scripts/update-regions.mjs; edit that, not this list.
 *
 * - \`intensity\`: lifecycle carbon intensity of grid electricity in kg CO2e/kWh,
 *   latest year available from Ember via Our World in Data.
 * - \`price\`: typical household tariff in local currency per kWh, from
 *   GlobalPetrolPrices, converted at exchange rates of ${new Date().toISOString().slice(0, 10)}.
 *   Tariffs change often and vary by supplier, so the UI always asks people
 *   to check their own bill.
 */
export interface Region {
	id: string;
	name: string;
	currency: string;
	locale: string;
	intensity: number;
	price: number;
	distance: "km" | "mi";
	/** ISO 3166 numeric code, as used by the world map data. Some small
	 *  countries only appear on the detailed map shown when zoomed in. */
	iso?: string;
}

export const REGIONS: Region[] = [
	{ id: "world", name: "World average", currency: "USD", locale: "en-US", intensity: ${Math.round(world.value) / 1000}, price: 0.17, distance: "km" },
	{ id: "eu", name: "European Union average", currency: "EUR", locale: "en-IE", intensity: ${Math.round(eu.value) / 1000}, price: 0.29, distance: "km" },
${rows.map(line).join("\n")}
];

${tail}`
);

// --- Flags ------------------------------------------------------------------------
fs.mkdirSync("public/flags", { recursive: true });
for (const id of [...rows.map((r) => r.id), "eu"]) {
	fs.copyFileSync(`node_modules/country-flag-icons/3x2/${id.toUpperCase()}.svg`, `public/flags/${id}.svg`);
}

console.log(`Wrote ${rows.length} countries to ${file} and refreshed public/flags.`);
if (skipped.length) console.log(`Skipped (no data or no match): ${skipped.join(", ")}`);
