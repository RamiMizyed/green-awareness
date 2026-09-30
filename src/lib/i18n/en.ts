import type { Period } from "@/lib/calc";

/**
 * English, the source of truth. Other languages are typed as `Dict`, so a
 * missing or misspelled key fails the build.
 *
 * Placeholders like {money} are filled by `rich()` / `fill()`, which lets each
 * language put them wherever its word order needs.
 */
const en = {
	meta: {
		dir: "ltr" as "ltr" | "rtl",
		name: "English",
		title: "Green Awareness | Home Energy & Carbon Footprint Calculator",
	},

	nav: {
		calculator: "Calculator",
		save: "Save money",
		how: "How it works",
		github: "GitHub repository",
		toLight: "Switch to light mode",
		toDark: "Switch to dark mode",
		language: "Language",
	},

	intro: {
		title: "What does your electricity cost you, and the planet?",
		points: ["About 2 minutes", "29 countries", "Your list stays on your device"],
		download: "Download my results",
	},

	period: {
		label: "Show results per",
		name: { day: "Day", month: "Month", year: "Year" } as Record<Period, string>,
		/** "a month", used after a price. */
		per: { day: "a day", month: "a month", year: "a year" } as Record<Period, string>,
		/** "per month", used inside sentences. */
		inSentence: { day: "per day", month: "per month", year: "per year" } as Record<Period, string>,
	},

	units: {
		hours: "h",
		km: "km",
		miles: "miles",
		kg: "kg",
	},

	step1: {
		title: "Where do you live?",
		text: "This sets your electricity price and how clean your power is.",
		country: "Country or region",
		price: "Price per kWh",
		co2: "Grid CO₂ per kWh",
		tip: "Prices here are typical. For the most accurate result, copy the price per kWh from your electricity bill.",
		useDefaults: "Use {name} defaults",
		world: "World average",
		eu: "European Union average",
	},

	map: {
		hint: "Tap your country on the map, or pick it from the list.",
		mapLabel: "World map of how much CO₂ each country's electricity produces",
		cleaner: "Cleaner grid",
		dirtier: "More CO₂",
		price: "Electricity price",
		co2: "CO₂ per kWh",
		perKwh: "per kWh",
		rank: "Cleaner than {n} of the {total} countries listed",
	},

	assistant: {
		title: "Just tell us what you have",
		text: "Type your appliances in your own words and we'll add them for you.",
		label: "Describe your appliances",
		placeholder: "e.g. LG TV, washing machine, 2 fridges",
		send: "Add",
		examples: [
			"TV, fridge and washing machine",
			"2 air conditioners and a gaming PC",
			"Electric car, heat pump, dishwasher",
		],
		thinking: "Working it out…",
		added: (n: number) => `Added ${n} ${n === 1 ? "appliance" : "appliances"}`,
		undo: "Undo",
		undone: "Removed them again.",
		nothing: "I couldn't spot any appliances there. Try something like “fridge, TV, 2 fans”.",
		offline: "Our AI helper is offline right now, so I matched what I could myself.",
		limit: "You've sent a lot of messages. Please wait a few minutes and try again.",
		error: "Something went wrong. Please try again.",
		privacy: "What you type here is sent to our AI helper (Claude, by Anthropic) so it can understand it. Your list itself stays on your device.",
		you: "You",
		ai: "Helper",
		manual: "Or add them yourself",
	},

	step2: {
		title: "What do you use?",
		emptyText: "Pick a home like yours to start, then adjust it.",
		count: (n: number) => `${n} ${n === 1 ? "appliance" : "appliances"} in your home.`,
		add: "Add",
		addAnother: "Add another appliance",
		startWith: "Start with this →",
		orPick: "Rather pick everything yourself?",
		choose: "Choose appliances",
		clearAll: "Clear all",
		clearTitle: (n: number) => `Remove all ${n} appliances?`,
		clearText: "Your savings plan is cleared too. Your country and price stay the same.",
		keep: "Keep them",
		confirmClear: "Remove all",
		removed: "Removed {name}",
		undo: "Undo",
		unnamed: "Unnamed appliance",
		templates: {
			studio: { label: "Studio apartment", description: "1 person, the basics" },
			family: { label: "Family home", description: "4 people, typical appliances" },
			all_electric: {
				label: "All-electric home",
				description: "Electric heating, hot water and car",
			},
		},
	},

	row: {
		biggest: "Biggest user",
		nameLabel: "Appliance name",
		namePlaceholder: "Name this appliance",
		power: "Power",
		hoursPerDay: "Hours a day",
		daysPerWeek: "Days a week",
		energyPerUse: "Energy per use",
		usesPerWeek: "Uses a week",
		howMany: "How many",
		monthsPerYear: "Months a year",
		standby: "Standby power",
		countBy: "Count usage by",
		byHours: "Hours of use",
		byLoads: "Loads or charges",
		more: "More settings",
		fewer: "Fewer settings",
		copy: "Copy",
		remove: "Remove",
		removeLabel: "Remove {name}",
		less: "Less: {label}",
		moreOf: "More: {label}",
		shareOfUse: "{pct} of your use",
		shareLabel: "{pct} of your electricity use",
		help: "Not sure of the power? It's on the label on the back or underneath. Standby is what it draws when it's off but still plugged in.",
		standbyCost: "Here, standby alone costs {money} a year.",
		custom: "Custom",
	},

	picker: {
		title: "Add appliances",
		text: "Tap everything you have. Tap again to add another.",
		search: "Search: fridge, heater, TV…",
		searchLabel: "Search appliances",
		categories: "Categories",
		everything: "Everything",
		noMatch: "No match for “{query}”.",
		addAsOwn: "Add “{query}” as your own",
		somethingElse: "Something else",
		other: "Other",
		done: "Done",
		inHome: (n: number) => `· ${n} in your home`,
		typical: "~{kwh} kWh a month",
		addLabel: "Add {name}",
		added: (n: number) => `${n} added`,
	},

	categories: {
		kitchen: "Kitchen",
		climate: "Heating & cooling",
		laundry: "Laundry",
		entertainment: "Entertainment",
		office: "Work & devices",
		lighting: "Lighting",
		other: "Other",
	},

	results: {
		heading: "Your results",
		costs: "Your electricity costs",
		energy: "Energy used",
		carbon: "Carbon (CO₂e)",
		empty: "Add your appliances in step 2 and your results appear here straight away.",
		sameAs: "Your carbon {period} is about the same as",
		driven: "{value} driven in a petrol car",
		phones: "{value} phone charges (in energy)",
		trees: (n: number, formatted: string) => `${formatted} ${n === 1 ? "tree" : "trees"}`,
		treesText: "{value} needed to absorb a year of it",
		standby: "Devices on standby cost you {money} a year while doing nothing.",
		planSaves: "Your plan saves {money} {period} ({pct} less). See your plan",
		cutTitle: "See how to cut this",
		cutText: "Tips picked for your home",
		mobileButton: "Results",
	},

	breakdown: {
		heading: "Where your money goes",
		biggest: "Your biggest users",
		top3: "Your top 3 are {pct} of your bill. Changes there make the biggest difference.",
		shownPer: "Amounts shown {period}.",
	},

	save: {
		title: "Your savings plan",
		text: "The changes that make the biggest difference in your home. Tick the ones you'll do and watch your savings add up.",
		empty: "Add your appliances above and we'll show the changes that save you the most.",
		noTips: "Nice, there are no obvious quick wins in your list. The ideas below can take you further.",
		couldSave: "You could save up to",
		couldSaveSub: "a year · {pct} of your use",
		planSaves: "Your plan saves",
		planHint: "Tick the changes below",
		planCount: (n: number) => `a year · ${n} ${n === 1 ? "change" : "changes"}`,
		avoided: "Carbon you avoid",
		avoidedSub: "CO₂e a year",
		perYear: "a year",
		willDo: "I'll do this",
		inPlan: "In my plan",
		further: "Going further",
		effort: { Free: "Free", "Low cost": "Low cost", Investment: "Investment" },
		beyond: [
			{
				title: "Switch to a renewable tariff",
				detail:
					"Choose a supplier or plan backed by wind and solar. It cuts the CO₂ from your electricity without changing how you live.",
			},
			{
				title: "Look into solar",
				detail:
					"If you own your roof, panels can cover much of your daytime use. Renters can often join a community solar scheme.",
			},
			{
				title: "Use power when it's cheap",
				detail:
					"If your tariff has cheaper night or weekend rates, run the dishwasher, laundry and car charging then.",
			},
		],
	},

	tips: {
		bulbs_to_led: {
			title: "Swap incandescent bulbs for LEDs",
			detail:
				"An LED gives the same light for about 15% of the power and lasts 15 to 25 times longer. Start with the lights you use most.",
		},
		cfl_to_led: {
			title: "Replace CFL bulbs with LEDs as they fail",
			detail: "LEDs use about a third less than CFLs and contain no mercury.",
		},
		line_dry: {
			title: "Air-dry half your laundry",
			detail:
				"The dryer is one of the hungriest appliances in a home. A drying rack or line for even half the loads makes a big dent.",
		},
		cold_wash: {
			title: "Wash at 30°C or cold",
			detail:
				"Most of a washing machine's energy goes into heating water. Modern detergents clean well at low temperatures.",
		},
		heater_to_heat_pump: {
			title: "Heat with a heat pump instead of resistive heaters",
			detail:
				"A heat pump moves heat rather than making it, delivering around 3 units of heat per unit of electricity.",
		},
		ac_setpoint: {
			title: "Set the AC 2°C warmer and use a fan",
			detail:
				"Each degree warmer saves roughly 6% of cooling energy. A fan makes the room feel about 3°C cooler for a fraction of the power.",
		},
		water_heater: {
			title: "Switch to a heat pump water heater",
			detail:
				"Uses around 60% less electricity than a standard tank. Meanwhile, set the tank to 50 to 55°C and fix dripping hot taps.",
		},
		dishwasher_eco: {
			title: "Run the dishwasher full, on eco mode",
			detail: "Eco programs run longer but heat less water. Skip pre-rinsing under a hot tap.",
		},
		kettle: {
			title: "Only boil the water you need",
			detail: "Most people boil about twice what they pour.",
		},
		oven_to_airfryer: {
			title: "Use a microwave or air fryer for small meals",
			detail:
				"Heating a whole oven for one tray wastes most of the energy. Smaller appliances heat the food, not the box.",
		},
		pc_sleep: {
			title: "Turn on sleep mode for your computer",
			detail: "Set the PC to sleep after 10 to 15 minutes idle and the display after 5.",
		},
		pool_timer: {
			title: "Run the pool pump fewer hours, or go variable-speed",
			detail:
				"Most pools only need a few hours of filtering a day, and a variable-speed pump uses far less power at low speed.",
		},
		standby: {
			title: "Cut standby power",
			detail:
				"Devices you aren't using still draw power. Switch them off at the wall, use a smart power strip, and turn off \"instant-on\" on consoles and TVs.",
		},
	},

	how: {
		title: "How it works",
		text: "The maths, where the data comes from, and what the numbers can and can't tell you.",
		items: [
			{
				q: "How is energy use calculated?",
				a: "For things you use by the hour: power (W) × hours a day × days a week, averaged over the year and scaled by the months you use it. For things counted per load or charge, like a washing machine or an electric car: energy per use × uses a week. Standby power is added for every hour a device isn't in use.",
			},
			{
				q: "Where do the carbon figures come from?",
				a: "Each country's grid carbon intensity is the average lifecycle emissions per kWh of electricity generated in 2023, rounded from Ember and Our World in Data. Your real footprint depends on your supplier and the time of day. If you're on a certified renewable tariff, enter a lower figure.",
			},
			{
				q: "How accurate are the appliance defaults?",
				a: "They're typical figures for common models, meant as a sensible starting point. Your appliance may differ a lot, especially older fridges, heaters and anything with a big motor. The label on the device, or a plug-in energy meter, gives you the real number.",
			},
			{
				q: "What isn't included?",
				a: "Only electricity is counted. Gas or oil heating, gas cooking, transport fuel, food and shopping aren't included, and together they usually make up most of a household's footprint.",
			},
			{
				q: "What about the equivalents?",
				a: "Car distance uses the US EPA figure of about 0.25 kg CO₂ per km (0.4 kg per mile) for an average petrol car. A growing tree is taken to absorb about 21 kg of CO₂ a year, and a full phone charge to use about 0.019 kWh. They're there to give a sense of scale, not as exact conversions.",
			},
			{
				q: "Is my data stored anywhere?",
				a: "Your appliance list stays in your browser's local storage on this device and is never uploaded. If you use the AI helper, only the words you type there are sent to Claude (by Anthropic) to work out which appliances you mean. You can clear your list at any time.",
			},
		],
	},

	footer: {
		note: "Estimates only; check your bill for exact figures.",
		contribute: "Contribute on GitHub",
		madeBy: "Made by Rami Mizyed",
	},

	appliances: {
		fridge: {
			name: "Fridge-freezer",
			hint: "Average draw. The compressor switches on and off, so it uses far less than its label rating.",
		},
		freezer: { name: "Chest freezer", hint: "Average draw over a day." },
		oven: { name: "Electric oven" },
		hob: { name: "Electric stove / hob" },
		microwave: { name: "Microwave" },
		kettle: { name: "Electric kettle", hint: "About 3 minutes per boil, three boils a day." },
		coffee: { name: "Coffee maker" },
		airfryer: { name: "Air fryer" },
		dishwasher: { name: "Dishwasher" },
		ac_window: { name: "Air conditioner (room unit)" },
		ac_central: { name: "Central air conditioning" },
		space_heater: { name: "Electric space heater" },
		heat_pump: {
			name: "Heat pump (mini-split)",
			hint: "Average draw while heating. Delivers about 3 kWh of heat per kWh of electricity.",
		},
		water_heater: {
			name: "Electric water heater (tank)",
			hint: "Time the element is actually heating, not time you use hot water.",
		},
		fan: { name: "Ceiling or standing fan" },
		dehumidifier: { name: "Dehumidifier" },
		washer: {
			name: "Washing machine",
			hint: "Around 0.8 kWh for a 40°C wash, 0.3 kWh for a cold wash.",
		},
		dryer: { name: "Tumble dryer", hint: "Around 3 kWh per load for a vented or condenser dryer." },
		iron: { name: "Iron" },
		tv: { name: "TV (50-inch LED)" },
		console: { name: "Game console", hint: "\"Instant-on\" rest mode draws around 10 W all day." },
		router: { name: "Wi-Fi router" },
		laptop: { name: "Laptop" },
		desktop: { name: "Desktop PC" },
		gaming_pc: { name: "Gaming PC" },
		monitor: { name: "Computer monitor" },
		phone: { name: "Phone charger" },
		led: { name: "LED bulbs" },
		cfl: { name: "CFL bulbs" },
		incandescent: { name: "Incandescent / halogen bulbs" },
		ev: {
			name: "Electric car (home charging)",
			hint: "12 kWh adds roughly 70 km (45 miles) of range.",
		},
		pool_pump: { name: "Pool pump" },
		hair_dryer: { name: "Hair dryer" },
		vacuum: { name: "Vacuum cleaner" },
	},
};

export type Dict = typeof en;
export default en;
