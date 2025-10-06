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
import React from "react";

export interface Appliance {
	name: string;
	wattage: number;
	icon: React.ReactElement;
}

export const APPLIANCE_DATA: Record<string, Appliance> = {
	television: {
		name: "Television (LED, 40-50 inch)",
		wattage: 80,
		icon: <Tv className="w-6 h-6" />,
	},
	refrigerator: {
		name: "Refrigerator (standard 18-20 cu ft)",
		wattage: 150,
		icon: <Refrigerator className="w-6 h-6" />,
	},
	lightbulb_incandescent: {
		name: "Incandescent Bulb (60W)",
		wattage: 60,
		icon: <Lightbulb className="w-6 h-6" />,
	},
	lightbulb_led: {
		name: "LED Bulb (equivalent to 60W incandescent)",
		wattage: 9,
		icon: <Lightbulb className="w-6 h-6 text-green-400" />,
	},
	microwave: {
		name: "Microwave Oven",
		wattage: 1000,
		icon: <Microwave className="w-6 h-6" />,
	},
	washing_machine: {
		name: "Washing Machine",
		wattage: 500,
		icon: <WashingMachine className="w-6 h-6" />,
	},
	laptop: {
		name: "Laptop Computer",
		wattage: 60,
		icon: <Laptop className="w-6 h-6" />,
	},
	desktop: {
		name: "Desktop Computer",
		wattage: 300,
		icon: <Monitor className="w-6 h-6" />,
	},
	game_console: {
		name: "Game Console (e.g., PS5/Xbox)",
		wattage: 150,
		icon: <Gamepad className="w-6 h-6" />,
	},
	fan: {
		name: "Ceiling or Box Fan",
		wattage: 75,
		icon: <Fan className="w-6 h-6" />,
	},
	ac: {
		name: "Air Conditioner (window unit, 8000 BTU)",
		wattage: 1000,
		icon: <Wind className="w-6 h-6" />,
	},
	heater: {
		name: "Space Heater",
		wattage: 1500,
		icon: <Flame className="w-6 h-6 text-orange-500" />,
	},
	coffee_maker: {
		name: "Coffee Maker",
		wattage: 900,
		icon: <Coffee className="w-6 h-6" />,
	},
	dishwasher: {
		name: "Dishwasher",
		wattage: 1400,
		icon: <UtensilsCrossed className="w-6 h-6" />,
	},
};
