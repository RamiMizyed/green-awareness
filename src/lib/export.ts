import { computeResults, type ApplianceItem, type Settings } from "@/lib/calc";
import { getRegion } from "@/lib/data/regions";

const cell = (v: string | number) => {
	const s = String(v);
	return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function downloadCsv(items: ApplianceItem[], settings: Settings) {
	const region = getRegion(settings.regionId);
	const { rows, totals } = computeResults(items, settings);
	const header = [
		"appliance",
		"usage_type",
		"watts",
		"hours_per_day",
		"days_per_week",
		"kwh_per_use",
		"uses_per_week",
		"months_per_year",
		"standby_watts",
		"quantity",
		"kwh_per_year",
		`cost_per_year_${region.currency}`,
		"kg_co2e_per_year",
	];
	const lines = rows.map(({ item: it, kwh, cost, co2 }) =>
		[
			it.name || "Unnamed appliance",
			it.mode === "hours" ? "hours" : "loads",
			it.mode === "hours" ? it.watts : "",
			it.mode === "hours" ? it.hoursPerDay : "",
			it.mode === "hours" ? it.daysPerWeek : "",
			it.mode === "cycles" ? it.kwhPerCycle : "",
			it.mode === "cycles" ? it.cyclesPerWeek : "",
			it.monthsPerYear,
			it.standbyWatts,
			it.qty,
			kwh.toFixed(1),
			cost.toFixed(2),
			co2.toFixed(1),
		]
			.map(cell)
			.join(",")
	);
	const csv = [
		header.join(","),
		...lines,
		"",
		["TOTAL", "", "", "", "", "", "", "", "", "", totals.kwh.toFixed(1), totals.cost.toFixed(2), totals.co2.toFixed(1)].join(","),
		"",
		`region,${cell(region.name)}`,
		`price_per_kwh,${settings.pricePerKwh}`,
		`kg_co2e_per_kwh,${settings.intensity}`,
	].join("\n");

	const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
	const a = document.createElement("a");
	a.href = url;
	a.download = `green-awareness-${new Date().toISOString().slice(0, 10)}.csv`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 0);
}
