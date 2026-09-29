import type { LucideIcon } from "lucide-react";
import {
	AirVent,
	Bath,
	Car,
	Coffee,
	CookingPot,
	Cpu,
	Droplets,
	Fan,
	Flame,
	Gamepad2,
	Heater,
	Laptop,
	Lightbulb,
	LightbulbOff,
	Microwave,
	Monitor,
	Plug,
	Refrigerator,
	Router,
	Shirt,
	Smartphone,
	Snowflake,
	Sparkles,
	ThermometerSun,
	Tv,
	UtensilsCrossed,
	Waves,
	WashingMachine,
	Wind,
	Zap,
} from "lucide-react";

export type UsageMode = "hours" | "cycles";

export type Category =
	| "kitchen"
	| "climate"
	| "laundry"
	| "entertainment"
	| "office"
	| "lighting"
	| "other";

export const CATEGORIES: { id: Category; label: string }[] = [
	{ id: "kitchen", label: "Kitchen" },
	{ id: "climate", label: "Heating & cooling" },
	{ id: "laundry", label: "Laundry" },
	{ id: "entertainment", label: "Entertainment" },
	{ id: "office", label: "Work & devices" },
	{ id: "lighting", label: "Lighting" },
	{ id: "other", label: "Other" },
];

/**
 * A preset appliance. Values are typical household averages, meant as a
 * starting point the user can adjust.
 *
 * - "hours" mode: `watts` is the average draw while in use.
 * - "cycles" mode: energy is counted per load/charge (`kwhPerCycle`).
 * - `standbyWatts` is drawn for every hour the device is plugged in but idle.
 * - `monthsPerYear` covers seasonal things like AC and space heaters.
 */
export interface ApplianceSpec {
	id: string;
	name: string;
	category: Category;
	icon: LucideIcon;
	mode: UsageMode;
	watts: number;
	hoursPerDay: number;
	daysPerWeek: number;
	kwhPerCycle: number;
	cyclesPerWeek: number;
	monthsPerYear: number;
	standbyWatts: number;
	qty: number;
	hint?: string;
}

type SpecInput = Omit<
	ApplianceSpec,
	| "mode"
	| "watts"
	| "hoursPerDay"
	| "daysPerWeek"
	| "kwhPerCycle"
	| "cyclesPerWeek"
	| "monthsPerYear"
	| "standbyWatts"
	| "qty"
> &
	Partial<ApplianceSpec>;

const spec = (s: SpecInput): ApplianceSpec => ({
	mode: "hours",
	watts: 100,
	hoursPerDay: 1,
	daysPerWeek: 7,
	kwhPerCycle: 1,
	cyclesPerWeek: 3,
	monthsPerYear: 12,
	standbyWatts: 0,
	qty: 1,
	...s,
});

export const APPLIANCES: ApplianceSpec[] = [
	// Kitchen
	spec({
		id: "fridge",
		name: "Fridge-freezer",
		category: "kitchen",
		icon: Refrigerator,
		watts: 45,
		hoursPerDay: 24,
		hint: "Average draw. The compressor switches on and off, so it uses far less than its label rating.",
	}),
	spec({
		id: "freezer",
		name: "Chest freezer",
		category: "kitchen",
		icon: Snowflake,
		watts: 35,
		hoursPerDay: 24,
		hint: "Average draw over a day.",
	}),
	spec({
		id: "oven",
		name: "Electric oven",
		category: "kitchen",
		icon: CookingPot,
		watts: 2000,
		hoursPerDay: 1,
		daysPerWeek: 3,
	}),
	spec({
		id: "hob",
		name: "Electric stove / hob",
		category: "kitchen",
		icon: Flame,
		watts: 1500,
		hoursPerDay: 0.75,
	}),
	spec({
		id: "microwave",
		name: "Microwave",
		category: "kitchen",
		icon: Microwave,
		watts: 1100,
		hoursPerDay: 0.25,
		standbyWatts: 2,
	}),
	spec({
		id: "kettle",
		name: "Electric kettle",
		category: "kitchen",
		icon: Coffee,
		watts: 2200,
		hoursPerDay: 0.15,
		hint: "About 3 minutes per boil, three boils a day.",
	}),
	spec({
		id: "coffee",
		name: "Coffee maker",
		category: "kitchen",
		icon: Coffee,
		watts: 900,
		hoursPerDay: 0.2,
		standbyWatts: 1,
	}),
	spec({
		id: "airfryer",
		name: "Air fryer",
		category: "kitchen",
		icon: CookingPot,
		watts: 1500,
		hoursPerDay: 0.3,
		daysPerWeek: 4,
	}),
	spec({
		id: "dishwasher",
		name: "Dishwasher",
		category: "kitchen",
		icon: UtensilsCrossed,
		mode: "cycles",
		kwhPerCycle: 1.2,
		cyclesPerWeek: 4,
		standbyWatts: 1,
	}),

	// Heating & cooling
	spec({
		id: "ac_window",
		name: "Air conditioner (room unit)",
		category: "climate",
		icon: AirVent,
		watts: 900,
		hoursPerDay: 6,
		monthsPerYear: 4,
		standbyWatts: 1,
	}),
	spec({
		id: "ac_central",
		name: "Central air conditioning",
		category: "climate",
		icon: AirVent,
		watts: 3000,
		hoursPerDay: 6,
		monthsPerYear: 4,
	}),
	spec({
		id: "space_heater",
		name: "Electric space heater",
		category: "climate",
		icon: Heater,
		watts: 1500,
		hoursPerDay: 4,
		monthsPerYear: 4,
	}),
	spec({
		id: "heat_pump",
		name: "Heat pump (mini-split)",
		category: "climate",
		icon: ThermometerSun,
		watts: 800,
		hoursPerDay: 8,
		monthsPerYear: 5,
		standbyWatts: 3,
		hint: "Average draw while heating. Delivers about 3 kWh of heat per kWh of electricity.",
	}),
	spec({
		id: "water_heater",
		name: "Electric water heater (tank)",
		category: "climate",
		icon: Bath,
		watts: 4000,
		hoursPerDay: 2.5,
		hint: "Time the element is actually heating, not time you use hot water.",
	}),
	spec({
		id: "fan",
		name: "Ceiling or standing fan",
		category: "climate",
		icon: Fan,
		watts: 50,
		hoursPerDay: 8,
		monthsPerYear: 5,
	}),
	spec({
		id: "dehumidifier",
		name: "Dehumidifier",
		category: "climate",
		icon: Droplets,
		watts: 300,
		hoursPerDay: 6,
		monthsPerYear: 6,
	}),

	// Laundry
	spec({
		id: "washer",
		name: "Washing machine",
		category: "laundry",
		icon: WashingMachine,
		mode: "cycles",
		kwhPerCycle: 0.8,
		cyclesPerWeek: 4,
		standbyWatts: 1,
		hint: "Around 0.8 kWh for a 40°C wash, 0.3 kWh for a cold wash.",
	}),
	spec({
		id: "dryer",
		name: "Tumble dryer",
		category: "laundry",
		icon: Wind,
		mode: "cycles",
		kwhPerCycle: 3,
		cyclesPerWeek: 3,
		hint: "Around 3 kWh per load for a vented or condenser dryer.",
	}),
	spec({
		id: "iron",
		name: "Iron",
		category: "laundry",
		icon: Shirt,
		watts: 1200,
		hoursPerDay: 0.5,
		daysPerWeek: 2,
	}),

	// Entertainment
	spec({
		id: "tv",
		name: "TV (50-inch LED)",
		category: "entertainment",
		icon: Tv,
		watts: 90,
		hoursPerDay: 4,
		standbyWatts: 1,
	}),
	spec({
		id: "console",
		name: "Game console",
		category: "entertainment",
		icon: Gamepad2,
		watts: 160,
		hoursPerDay: 2,
		standbyWatts: 10,
		hint: "\"Instant-on\" rest mode draws around 10 W all day.",
	}),
	spec({
		id: "router",
		name: "Wi-Fi router",
		category: "entertainment",
		icon: Router,
		watts: 10,
		hoursPerDay: 24,
	}),

	// Work & devices
	spec({
		id: "laptop",
		name: "Laptop",
		category: "office",
		icon: Laptop,
		watts: 50,
		hoursPerDay: 8,
		daysPerWeek: 5,
		standbyWatts: 1,
	}),
	spec({
		id: "desktop",
		name: "Desktop PC",
		category: "office",
		icon: Cpu,
		watts: 200,
		hoursPerDay: 6,
		daysPerWeek: 5,
		standbyWatts: 3,
	}),
	spec({
		id: "gaming_pc",
		name: "Gaming PC",
		category: "office",
		icon: Cpu,
		watts: 450,
		hoursPerDay: 3,
		standbyWatts: 3,
	}),
	spec({
		id: "monitor",
		name: "Computer monitor",
		category: "office",
		icon: Monitor,
		watts: 30,
		hoursPerDay: 8,
		daysPerWeek: 5,
		standbyWatts: 0.5,
	}),
	spec({
		id: "phone",
		name: "Phone charger",
		category: "office",
		icon: Smartphone,
		watts: 10,
		hoursPerDay: 2,
	}),

	// Lighting
	spec({
		id: "led",
		name: "LED bulbs",
		category: "lighting",
		icon: Lightbulb,
		watts: 9,
		hoursPerDay: 5,
		qty: 8,
	}),
	spec({
		id: "cfl",
		name: "CFL bulbs",
		category: "lighting",
		icon: Lightbulb,
		watts: 14,
		hoursPerDay: 5,
		qty: 8,
	}),
	spec({
		id: "incandescent",
		name: "Incandescent / halogen bulbs",
		category: "lighting",
		icon: LightbulbOff,
		watts: 60,
		hoursPerDay: 5,
		qty: 8,
	}),

	// Other
	spec({
		id: "ev",
		name: "Electric car (home charging)",
		category: "other",
		icon: Car,
		mode: "cycles",
		kwhPerCycle: 12,
		cyclesPerWeek: 3,
		hint: "12 kWh adds roughly 70 km (45 miles) of range.",
	}),
	spec({
		id: "pool_pump",
		name: "Pool pump",
		category: "other",
		icon: Waves,
		watts: 1100,
		hoursPerDay: 6,
		monthsPerYear: 5,
	}),
	spec({
		id: "hair_dryer",
		name: "Hair dryer",
		category: "other",
		icon: Wind,
		watts: 1600,
		hoursPerDay: 0.15,
	}),
	spec({
		id: "vacuum",
		name: "Vacuum cleaner",
		category: "other",
		icon: Sparkles,
		watts: 900,
		hoursPerDay: 1,
		daysPerWeek: 1,
	}),
];

export const CUSTOM_ICON: LucideIcon = Plug;
export const FALLBACK_ICON: LucideIcon = Zap;

const BY_ID = new Map(APPLIANCES.map((a) => [a.id, a]));

export const getSpec = (id: string) => BY_ID.get(id);

/** Quick-start households, each a list of preset ids with optional overrides. */
export const TEMPLATES: {
	id: string;
	label: string;
	description: string;
	items: { id: string; qty?: number }[];
}[] = [
	{
		id: "studio",
		label: "Studio apartment",
		description: "1 person, the basics",
		items: [
			{ id: "fridge" },
			{ id: "microwave" },
			{ id: "kettle" },
			{ id: "washer" },
			{ id: "tv" },
			{ id: "laptop" },
			{ id: "router" },
			{ id: "phone" },
			{ id: "led", qty: 6 },
		],
	},
	{
		id: "family",
		label: "Family home",
		description: "4 people, typical appliances",
		items: [
			{ id: "fridge" },
			{ id: "oven" },
			{ id: "hob" },
			{ id: "microwave" },
			{ id: "kettle" },
			{ id: "dishwasher" },
			{ id: "washer" },
			{ id: "dryer" },
			{ id: "tv" },
			{ id: "console" },
			{ id: "laptop", qty: 2 },
			{ id: "router" },
			{ id: "phone", qty: 4 },
			{ id: "led", qty: 15 },
			{ id: "ac_window", qty: 2 },
		],
	},
	{
		id: "all_electric",
		label: "All-electric home",
		description: "Electric heating, hot water and car",
		items: [
			{ id: "fridge" },
			{ id: "oven" },
			{ id: "hob" },
			{ id: "dishwasher" },
			{ id: "washer" },
			{ id: "dryer" },
			{ id: "water_heater" },
			{ id: "heat_pump", qty: 2 },
			{ id: "tv" },
			{ id: "laptop", qty: 2 },
			{ id: "router" },
			{ id: "led", qty: 15 },
			{ id: "ev" },
		],
	},
];
