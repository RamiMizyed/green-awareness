/**
 * Country presets.
 *
 * - `intensity`: lifecycle carbon intensity of grid electricity in kg CO2e/kWh,
 *   rounded from Ember / Our World in Data (2023 data).
 * - `price`: rough typical household tariff in local currency per kWh.
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
	/** ISO 3166 numeric code, as used by the world map data. */
	iso?: string;
}

export const REGIONS: Region[] = [
	{ id: "world", name: "World average", currency: "USD", locale: "en-US", intensity: 0.48, price: 0.17, distance: "km" },
	{ id: "us", name: "United States", iso: "840", currency: "USD", locale: "en-US", intensity: 0.37, price: 0.17, distance: "mi" },
	{ id: "ca", name: "Canada", iso: "124", currency: "CAD", locale: "en-CA", intensity: 0.17, price: 0.18, distance: "km" },
	{ id: "mx", name: "Mexico", iso: "484", currency: "MXN", locale: "es-MX", intensity: 0.42, price: 1.2, distance: "km" },
	{ id: "br", name: "Brazil", iso: "076", currency: "BRL", locale: "pt-BR", intensity: 0.1, price: 0.85, distance: "km" },
	{ id: "gb", name: "United Kingdom", iso: "826", currency: "GBP", locale: "en-GB", intensity: 0.24, price: 0.25, distance: "mi" },
	{ id: "ie", name: "Ireland", iso: "372", currency: "EUR", locale: "en-IE", intensity: 0.28, price: 0.35, distance: "km" },
	{ id: "eu", name: "European Union average", currency: "EUR", locale: "en-IE", intensity: 0.24, price: 0.29, distance: "km" },
	{ id: "de", name: "Germany", iso: "276", currency: "EUR", locale: "de-DE", intensity: 0.38, price: 0.4, distance: "km" },
	{ id: "fr", name: "France", iso: "250", currency: "EUR", locale: "fr-FR", intensity: 0.06, price: 0.25, distance: "km" },
	{ id: "es", name: "Spain", iso: "724", currency: "EUR", locale: "es-ES", intensity: 0.17, price: 0.24, distance: "km" },
	{ id: "it", name: "Italy", iso: "380", currency: "EUR", locale: "it-IT", intensity: 0.29, price: 0.3, distance: "km" },
	{ id: "nl", name: "Netherlands", iso: "528", currency: "EUR", locale: "nl-NL", intensity: 0.27, price: 0.3, distance: "km" },
	{ id: "pl", name: "Poland", iso: "616", currency: "PLN", locale: "pl-PL", intensity: 0.66, price: 1.0, distance: "km" },
	{ id: "se", name: "Sweden", iso: "752", currency: "SEK", locale: "sv-SE", intensity: 0.04, price: 2.0, distance: "km" },
	{ id: "no", name: "Norway", iso: "578", currency: "NOK", locale: "nb-NO", intensity: 0.03, price: 1.5, distance: "km" },
	{ id: "tr", name: "Türkiye", iso: "792", currency: "TRY", locale: "tr-TR", intensity: 0.46, price: 3.0, distance: "km" },
	{ id: "sa", name: "Saudi Arabia", iso: "682", currency: "SAR", locale: "en-SA", intensity: 0.7, price: 0.18, distance: "km" },
	{ id: "ae", name: "United Arab Emirates", iso: "784", currency: "AED", locale: "en-AE", intensity: 0.49, price: 0.35, distance: "km" },
	{ id: "eg", name: "Egypt", iso: "818", currency: "EGP", locale: "en-EG", intensity: 0.57, price: 1.5, distance: "km" },
	{ id: "za", name: "South Africa", iso: "710", currency: "ZAR", locale: "en-ZA", intensity: 0.71, price: 3.5, distance: "km" },
	{ id: "ng", name: "Nigeria", iso: "566", currency: "NGN", locale: "en-NG", intensity: 0.52, price: 100, distance: "km" },
	{ id: "in", name: "India", iso: "356", currency: "INR", locale: "en-IN", intensity: 0.71, price: 7, distance: "km" },
	{ id: "cn", name: "China", iso: "156", currency: "CNY", locale: "zh-CN", intensity: 0.58, price: 0.55, distance: "km" },
	{ id: "jp", name: "Japan", iso: "392", currency: "JPY", locale: "ja-JP", intensity: 0.49, price: 31, distance: "km" },
	{ id: "kr", name: "South Korea", iso: "410", currency: "KRW", locale: "ko-KR", intensity: 0.43, price: 150, distance: "km" },
	{ id: "id", name: "Indonesia", iso: "360", currency: "IDR", locale: "id-ID", intensity: 0.68, price: 1450, distance: "km" },
	{ id: "au", name: "Australia", iso: "036", currency: "AUD", locale: "en-AU", intensity: 0.55, price: 0.33, distance: "km" },
	{ id: "nz", name: "New Zealand", iso: "554", currency: "NZD", locale: "en-NZ", intensity: 0.11, price: 0.33, distance: "km" },
];

export const DEFAULT_REGION_ID = "us";

/** EU member states (ISO numeric), highlighted when "European Union average" is picked. */
export const EU_MEMBERS = new Set([
	"040", "056", "100", "191", "196", "203", "208", "233", "246", "250", "276", "300", "348",
	"372", "380", "428", "440", "442", "470", "528", "616", "620", "642", "703", "705", "724", "752",
]);

const BY_ID = new Map(REGIONS.map((r) => [r.id, r]));

export const getRegion = (id: string): Region =>
	BY_ID.get(id) ?? BY_ID.get(DEFAULT_REGION_ID)!;

/** Best guess at the visitor's country from the browser locale, e.g. "en-GB" -> "gb". */
export function guessRegionId(): string {
	if (typeof navigator === "undefined") return DEFAULT_REGION_ID;
	for (const tag of navigator.languages ?? [navigator.language]) {
		const country = tag.split("-")[1]?.toLowerCase();
		if (country && BY_ID.has(country)) return country;
	}
	return DEFAULT_REGION_ID;
}
