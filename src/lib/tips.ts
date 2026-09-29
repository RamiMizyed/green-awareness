import {
	activeKwhPerYear,
	standbyKwhPerYear,
	type ApplianceItem,
} from "@/lib/calc";

export type Effort = "Free" | "Low cost" | "Investment";

/** Wording for each tip lives in the i18n dictionaries under `tips.<id>`. */
export interface Tip {
	id: string;
	effort: Effort;
	/** kWh saved per year. */
	kwhSaved: number;
	/** Catalog id of the appliance this tip is about, for its icon. */
	specId: string | null;
}

interface Rule {
	id: string;
	/** Preset ids this rule applies to. */
	specIds: string[];
	effort: Effort;
	/** Fraction of the matched items' active energy that is saved. */
	fraction: number;
}

const RULES: Rule[] = [
	{ id: "bulbs_to_led", specIds: ["incandescent"], effort: "Low cost", fraction: 0.85 },
	{ id: "cfl_to_led", specIds: ["cfl"], effort: "Low cost", fraction: 0.35 },
	{ id: "line_dry", specIds: ["dryer"], effort: "Free", fraction: 0.5 },
	{ id: "cold_wash", specIds: ["washer"], effort: "Free", fraction: 0.5 },
	{ id: "heater_to_heat_pump", specIds: ["space_heater"], effort: "Investment", fraction: 0.65 },
	{ id: "ac_setpoint", specIds: ["ac_window", "ac_central"], effort: "Free", fraction: 0.12 },
	{ id: "water_heater", specIds: ["water_heater"], effort: "Investment", fraction: 0.6 },
	{ id: "dishwasher_eco", specIds: ["dishwasher"], effort: "Free", fraction: 0.2 },
	{ id: "kettle", specIds: ["kettle"], effort: "Free", fraction: 0.3 },
	{ id: "oven_to_airfryer", specIds: ["oven"], effort: "Low cost", fraction: 0.4 },
	{ id: "pc_sleep", specIds: ["desktop", "gaming_pc"], effort: "Free", fraction: 0.2 },
	{ id: "pool_timer", specIds: ["pool_pump"], effort: "Low cost", fraction: 0.4 },
];

/** Recommendations for this household, biggest savings first. */
export function buildTips(items: ApplianceItem[]): Tip[] {
	const tips: Tip[] = [];

	for (const rule of RULES) {
		const matched = items.filter((it) => rule.specIds.includes(it.specId));
		if (matched.length === 0) continue;
		const base = matched.reduce((s, it) => s + activeKwhPerYear(it), 0);
		const kwhSaved = base * rule.fraction;
		if (kwhSaved < 1) continue;
		tips.push({ id: rule.id, effort: rule.effort, kwhSaved, specId: matched[0].specId });
	}

	const standby = items.reduce((s, it) => s + standbyKwhPerYear(it), 0);
	if (standby >= 5) {
		tips.push({ id: "standby", effort: "Free", kwhSaved: standby * 0.8, specId: null });
	}

	return tips.sort((a, b) => b.kwhSaved - a.kwhSaved);
}
