import type { UsageMode } from "@/lib/data/appliances";

export interface ApplianceItem {
	id: string;
	/** Preset id from the catalog, or "custom". */
	specId: string;
	name: string;
	mode: UsageMode;
	watts: number;
	hoursPerDay: number;
	daysPerWeek: number;
	kwhPerCycle: number;
	cyclesPerWeek: number;
	monthsPerYear: number;
	standbyWatts: number;
	qty: number;
}

export interface Settings {
	regionId: string;
	pricePerKwh: number;
	/** kg CO2e per kWh */
	intensity: number;
}

export type Period = "day" | "month" | "year";

export const WEEKS_PER_YEAR = 365 / 7;
const HOURS_PER_WEEK = 24 * 7;

export const PERIOD_DIVISOR: Record<Period, number> = {
	day: 365,
	month: 12,
	year: 1,
};

const clampNum = (n: number, min: number, max: number) =>
	Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

/** Hours per week the device is actively in use. */
export function activeHoursPerWeek(item: ApplianceItem) {
	if (item.mode === "cycles") return 0;
	return (
		clampNum(item.hoursPerDay, 0, 24) * clampNum(item.daysPerWeek, 0, 7)
	);
}

/** Active-use energy per year for one item row (all units), in kWh. */
export function activeKwhPerYear(item: ApplianceItem) {
	const season = clampNum(item.monthsPerYear, 0, 12) / 12;
	const qty = clampNum(item.qty, 0, 10_000);
	const weekly =
		item.mode === "cycles"
			? clampNum(item.kwhPerCycle, 0, 1_000) *
				clampNum(item.cyclesPerWeek, 0, 1_000)
			: (clampNum(item.watts, 0, 100_000) * activeHoursPerWeek(item)) / 1000;
	return weekly * WEEKS_PER_YEAR * season * qty;
}

/** Standby ("phantom") energy per year, drawn whenever the device is idle. */
export function standbyKwhPerYear(item: ApplianceItem) {
	const idleHours = HOURS_PER_WEEK - activeHoursPerWeek(item);
	const qty = clampNum(item.qty, 0, 10_000);
	return (
		(clampNum(item.standbyWatts, 0, 1_000) * idleHours * WEEKS_PER_YEAR * qty) /
		1000
	);
}

export function kwhPerYear(item: ApplianceItem) {
	return activeKwhPerYear(item) + standbyKwhPerYear(item);
}

export interface ItemResult {
	item: ApplianceItem;
	kwh: number;
	standbyKwh: number;
	cost: number;
	co2: number;
	share: number;
}

export interface Totals {
	kwh: number;
	cost: number;
	co2: number;
	standbyKwh: number;
}

/** Yearly results for every item, sorted biggest first, plus yearly totals. */
export function computeResults(items: ApplianceItem[], settings: Settings) {
	const rows = items.map((item) => {
		const kwh = kwhPerYear(item);
		return {
			item,
			kwh,
			standbyKwh: standbyKwhPerYear(item),
			cost: kwh * settings.pricePerKwh,
			co2: kwh * settings.intensity,
			share: 0,
		};
	});
	const totals: Totals = rows.reduce(
		(t, r) => ({
			kwh: t.kwh + r.kwh,
			cost: t.cost + r.cost,
			co2: t.co2 + r.co2,
			standbyKwh: t.standbyKwh + r.standbyKwh,
		}),
		{ kwh: 0, cost: 0, co2: 0, standbyKwh: 0 }
	);
	for (const r of rows) r.share = totals.kwh > 0 ? r.kwh / totals.kwh : 0;
	rows.sort((a, b) => b.kwh - a.kwh);
	return { rows: rows as ItemResult[], totals };
}

// --- Everyday equivalents -------------------------------------------------

/** US EPA: average passenger car, ~0.4 kg CO2 per mile (0.25 kg per km). */
export const CAR_KG_PER_KM = 0.251;
/** A growing tree absorbs very roughly 20 kg CO2 a year. */
export const TREE_KG_PER_YEAR = 21;
/** US EPA: ~0.019 kWh to fully charge a smartphone. */
export const PHONE_CHARGE_KWH = 0.019;

// --- Formatting -----------------------------------------------------------

export function formatNumber(n: number, locale = "en-US", maxDigits?: number) {
	const abs = Math.abs(n);
	const digits = maxDigits ?? (abs >= 100 ? 0 : abs >= 10 ? 1 : 2);
	return new Intl.NumberFormat(locale, {
		maximumFractionDigits: digits,
	}).format(n);
}

export function formatMoney(n: number, currency: string, locale = "en-US") {
	const abs = Math.abs(n);
	try {
		return new Intl.NumberFormat(locale, {
			style: "currency",
			currency,
			maximumFractionDigits: abs >= 1000 ? 0 : 2,
			minimumFractionDigits: abs >= 1000 ? 0 : 2,
		}).format(n);
	} catch {
		return `${formatNumber(n, locale)} ${currency}`;
	}
}

/** kg under a tonne, tonnes above. */
export function formatMass(kg: number, locale = "en-US") {
	if (Math.abs(kg) >= 1000) return `${formatNumber(kg / 1000, locale, 2)} t`;
	return `${formatNumber(kg, locale)} kg`;
}

export function currencySymbol(currency: string, locale = "en-US") {
	try {
		return (
			new Intl.NumberFormat(locale, { style: "currency", currency })
				.formatToParts(0)
				.find((p) => p.type === "currency")?.value ?? currency
		);
	} catch {
		return currency;
	}
}
