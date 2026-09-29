import {
	activeKwhPerYear,
	standbyKwhPerYear,
	type ApplianceItem,
} from "@/lib/calc";

export type Effort = "Free" | "Low cost" | "Investment";

export interface Tip {
	id: string;
	title: string;
	detail: string;
	effort: Effort;
	/** kWh saved per year. */
	kwhSaved: number;
	/** Catalog id of the appliance this tip is about, for its icon. */
	specId: string | null;
}

interface Rule {
	id: string;
	/** Which items this rule applies to. */
	match: (item: ApplianceItem) => boolean;
	effort: Effort;
	/** Fraction of the matched items' active energy that is saved. */
	fraction: number;
	title: (count: number) => string;
	detail: string;
}

const is =
	(...ids: string[]) =>
	(item: ApplianceItem) =>
		ids.includes(item.specId);

const RULES: Rule[] = [
	{
		id: "bulbs_to_led",
		match: is("incandescent"),
		effort: "Low cost",
		fraction: 0.85,
		title: () => "Swap incandescent bulbs for LEDs",
		detail:
			"An LED gives the same light for about 15% of the power and lasts 15 to 25 times longer. Start with the lights you use most.",
	},
	{
		id: "cfl_to_led",
		match: is("cfl"),
		effort: "Low cost",
		fraction: 0.35,
		title: () => "Replace CFL bulbs with LEDs as they fail",
		detail: "LEDs use about a third less than CFLs and contain no mercury.",
	},
	{
		id: "line_dry",
		match: is("dryer"),
		effort: "Free",
		fraction: 0.5,
		title: () => "Air-dry half your laundry",
		detail:
			"The dryer is one of the hungriest appliances in a home. A drying rack or line for even half the loads makes a big dent.",
	},
	{
		id: "cold_wash",
		match: is("washer"),
		effort: "Free",
		fraction: 0.5,
		title: () => "Wash at 30°C or cold",
		detail:
			"Most of a washing machine's energy goes into heating water. Modern detergents clean well at low temperatures.",
	},
	{
		id: "heater_to_heat_pump",
		match: is("space_heater"),
		effort: "Investment",
		fraction: 0.65,
		title: () => "Heat with a heat pump instead of resistive heaters",
		detail:
			"A heat pump moves heat rather than making it, delivering around 3 units of heat per unit of electricity.",
	},
	{
		id: "ac_setpoint",
		match: is("ac_window", "ac_central"),
		effort: "Free",
		fraction: 0.12,
		title: () => "Set the AC 2°C warmer and use a fan",
		detail:
			"Each degree warmer saves roughly 6% of cooling energy. A fan makes the room feel about 3°C cooler for a fraction of the power.",
	},
	{
		id: "water_heater",
		match: is("water_heater"),
		effort: "Investment",
		fraction: 0.6,
		title: () => "Switch to a heat pump water heater",
		detail:
			"Uses around 60% less electricity than a standard tank. Meanwhile, set the tank to 50 to 55°C and fix dripping hot taps.",
	},
	{
		id: "dishwasher_eco",
		match: is("dishwasher"),
		effort: "Free",
		fraction: 0.2,
		title: () => "Run the dishwasher full, on eco mode",
		detail:
			"Eco programs run longer but heat less water. Skip pre-rinsing under a hot tap.",
	},
	{
		id: "kettle",
		match: is("kettle"),
		effort: "Free",
		fraction: 0.3,
		title: () => "Only boil the water you need",
		detail: "Most people boil about twice what they pour.",
	},
	{
		id: "oven_to_airfryer",
		match: is("oven"),
		effort: "Low cost",
		fraction: 0.4,
		title: () => "Use a microwave or air fryer for small meals",
		detail:
			"Heating a whole oven for one tray wastes most of the energy. Smaller appliances heat the food, not the box.",
	},
	{
		id: "pc_sleep",
		match: is("desktop", "gaming_pc"),
		effort: "Free",
		fraction: 0.2,
		title: () => "Turn on sleep mode for your computer",
		detail:
			"Set the PC to sleep after 10 to 15 minutes idle and the display after 5.",
	},
	{
		id: "pool_timer",
		match: is("pool_pump"),
		effort: "Low cost",
		fraction: 0.4,
		title: () => "Run the pool pump fewer hours, or go variable-speed",
		detail:
			"Most pools only need a few hours of filtering a day, and a variable-speed pump uses far less power at low speed.",
	},
];

/** Recommendations for this household, biggest savings first. */
export function buildTips(items: ApplianceItem[]): Tip[] {
	const tips: Tip[] = [];

	for (const rule of RULES) {
		const matched = items.filter(rule.match);
		if (matched.length === 0) continue;
		const base = matched.reduce((s, it) => s + activeKwhPerYear(it), 0);
		const kwhSaved = base * rule.fraction;
		if (kwhSaved < 1) continue;
		tips.push({
			id: rule.id,
			title: rule.title(matched.length),
			detail: rule.detail,
			effort: rule.effort,
			kwhSaved,
			specId: matched[0].specId,
		});
	}

	const standby = items.reduce((s, it) => s + standbyKwhPerYear(it), 0);
	if (standby >= 5) {
		tips.push({
			id: "standby",
			title: "Cut standby power",
			detail:
				"Devices you aren't using still draw power. Switch them off at the wall, use a smart power strip, and turn off \"instant-on\" on consoles and TVs.",
			effort: "Free",
			kwhSaved: standby * 0.8,
			specId: null,
		});
	}

	return tips.sort((a, b) => b.kwhSaved - a.kwhSaved);
}
