// src/lib/appliances.tsx
import React from "react";
import {
	Tv,
	Refrigerator,
	Lightbulb,
	Microwave,
	WashingMachine,
	Wind,
	Flame,
	Laptop,
	Monitor,
	Gamepad,
	Fan,
	Coffee,
	UtensilsCrossed,
} from "lucide-react";

export interface Appliance {
	name: string;
	wattage: number;
	icon: React.ReactElement;
	defaultFrequency?: "daily" | "weekly";
	defaultValue?: number;
}

const iconClass = "w-6 h-6 transition-colors";

// 🎨 Semantic icon color mapping (light + dark mode)
const iconColors = {
	tv: "text-blue-600 dark:text-blue-400",
	refrigerator: "text-cyan-600 dark:text-cyan-400",
	lightbulb: "text-yellow-500 dark:text-yellow-300",
	lightbulb_led: "text-green-600 dark:text-green-400",
	microwave: "text-pink-600 dark:text-pink-400",
	washing_machine: "text-sky-600 dark:text-sky-400",
	laptop: "text-indigo-600 dark:text-indigo-400",
	desktop: "text-purple-600 dark:text-purple-400",
	game_console: "text-rose-600 dark:text-rose-400",
	fan: "text-emerald-600 dark:text-emerald-400",
	ac: "text-blue-500 dark:text-blue-300",
	heater: "text-orange-500 dark:text-orange-400",
	coffee_maker: "text-amber-600 dark:text-amber-400",
	dishwasher: "text-teal-600 dark:text-teal-400",
};

export const APPLIANCE_DATA: Record<string, Appliance> = {
	television: {
		name: "Television (LED, 40-50 inch)",
		wattage: 80,
		icon: <Tv className={`${iconClass} ${iconColors.tv}`} />,
		defaultValue: 4,
	},
	refrigerator: {
		name: "Refrigerator (standard 18-20 cu ft)",
		wattage: 150,
		icon: (
			<Refrigerator className={`${iconClass} ${iconColors.refrigerator}`} />
		),
		defaultValue: 24,
	},
	lightbulb_incandescent: {
		name: "Incandescent Bulb (60W)",
		wattage: 60,
		icon: <Lightbulb className={`${iconClass} ${iconColors.lightbulb}`} />,
		defaultValue: 5,
	},
	lightbulb_led: {
		name: "LED Bulb (equivalent to 60W incandescent)",
		wattage: 9,
		icon: <Lightbulb className={`${iconClass} ${iconColors.lightbulb_led}`} />,
		defaultValue: 5,
	},
	microwave: {
		name: "Microwave Oven",
		wattage: 1000,
		icon: <Microwave className={`${iconClass} ${iconColors.microwave}`} />,
		defaultValue: 0.25,
	},
	washing_machine: {
		name: "Washing Machine",
		wattage: 500,
		icon: (
			<WashingMachine
				className={`${iconClass} ${iconColors.washing_machine}`}
			/>
		),
		defaultFrequency: "weekly",
		defaultValue: 3,
	},
	laptop: {
		name: "Laptop Computer",
		wattage: 60,
		icon: <Laptop className={`${iconClass} ${iconColors.laptop}`} />,
		defaultValue: 8,
	},
	desktop: {
		name: "Desktop Computer",
		wattage: 300,
		icon: <Monitor className={`${iconClass} ${iconColors.desktop}`} />,
		defaultValue: 8,
	},
	game_console: {
		name: "Game Console (e.g., PS5/Xbox)",
		wattage: 150,
		icon: <Gamepad className={`${iconClass} ${iconColors.game_console}`} />,
		defaultValue: 2,
	},
	fan: {
		name: "Ceiling or Box Fan",
		wattage: 75,
		icon: <Fan className={`${iconClass} ${iconColors.fan}`} />,
		defaultValue: 8,
	},
	ac: {
		name: "Air Conditioner (window unit, 8000 BTU)",
		wattage: 1000,
		icon: <Wind className={`${iconClass} ${iconColors.ac}`} />,
		defaultValue: 8,
	},
	heater: {
		name: "Space Heater",
		wattage: 1500,
		icon: <Flame className={`${iconClass} ${iconColors.heater}`} />,
		defaultValue: 4,
	},
	coffee_maker: {
		name: "Coffee Maker",
		wattage: 900,
		icon: <Coffee className={`${iconClass} ${iconColors.coffee_maker}`} />,
		defaultValue: 0.2,
	},
	dishwasher: {
		name: "Dishwasher",
		wattage: 1400,
		icon: (
			<UtensilsCrossed className={`${iconClass} ${iconColors.dishwasher}`} />
		),
		defaultFrequency: "weekly",
		defaultValue: 4,
	},
};
