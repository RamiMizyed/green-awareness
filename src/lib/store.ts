// src/lib/store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { APPLIANCE_DATA } from "@/lib/appliances";

// --- UPDATED TYPES ---
type ApplianceKey = keyof typeof APPLIANCE_DATA | "custom";

export interface CartItem {
	id: string;
	key: ApplianceKey;
	name: string;
	wattage: number;
	usageValue: number; // Replaces hoursPerDay
	usageFrequency: "daily" | "weekly"; // NEW: for flexible time input
	qty: number;
}

export interface Settings {
	pricePerKwh: number;
	currency: string;
	emissionFactor: number; // in kg CO₂e per kWh
	regionPreset: string;
}

interface AppState {
	cart: CartItem[];
	settings: Settings;
	error: string | null;
}

interface AppActions {
	addItemToCart: (key: ApplianceKey) => void;
	updateCartItem: (id: string, patch: Partial<Omit<CartItem, "id">>) => void;
	removeCartItem: (id: string) => void;
	clearCart: () => void;
	updateSettings: (patch: Partial<Settings>) => void;
	setError: (message: string | null) => void;
	reset: () => void;
	exportCsv: () => void;
	getTotals: () => {
		kwh: { day: number; month: number; year: number };
		cost: { day: number; month: number; year: number };
		co2: { day: number; month: number; year: number };
	};
}

// --- DEFAULTS ---
const DEFAULT_SETTINGS: Settings = {
	pricePerKwh: 0.17,
	currency: "$",
	emissionFactor: 0.417,
	regionPreset: "US Average (0.417)",
};

const INITIAL_STATE: AppState = {
	cart: [
		{
			id: uuidv4(),
			key: "refrigerator",
			name: APPLIANCE_DATA.refrigerator.name,
			wattage: APPLIANCE_DATA.refrigerator.wattage,
			usageValue: 24, // Refrigerators run 24/7
			usageFrequency: "daily",
			qty: 1,
		},
	],
	settings: DEFAULT_SETTINGS,
	error: null,
};

// --- STORE CREATION ---
export const useAppStore = create<AppState & AppActions>()(
	persist(
		(set, get) => ({
			...INITIAL_STATE,

			// --- ACTIONS ---
			setError: (message) => set({ error: message }),

			addItemToCart: (key) => {
				get().setError(null);
				if (!key) {
					get().setError("Please select an appliance to add.");
					return;
				}

				let newItem: CartItem;
				const baseItem = {
					id: uuidv4(),
					usageValue: 1,
					usageFrequency: "daily" as const,
					qty: 1,
				};

				if (key === "custom") {
					newItem = {
						...baseItem,
						key: "custom",
						name: "Custom Appliance",
						wattage: 100,
					};
				} else {
					const appliance = APPLIANCE_DATA[key];
					newItem = {
						...baseItem,
						key,
						name: appliance.name,
						wattage: appliance.wattage,
						// Set specific defaults for certain appliances
						usageFrequency: appliance.defaultFrequency || "daily",
						usageValue: appliance.defaultValue || 1,
					};
				}

				set((state) => ({ cart: [...state.cart, newItem] }));
			},

			updateCartItem: (id, patch) => {
				set((state) => ({
					cart: state.cart.map((item) =>
						item.id === id ? { ...item, ...patch } : item
					),
				}));
			},

			removeCartItem: (id) => {
				set((state) => ({ cart: state.cart.filter((item) => item.id !== id) }));
			},

			clearCart: () => set({ cart: [] }),

			updateSettings: (patch) => {
				set((state) => ({ settings: { ...state.settings, ...patch } }));
			},

			reset: () => {
				set(INITIAL_STATE);
			},

			// --- GETTERS ---
			getTotals: () => {
				const { cart, settings } = get();
				const totalKwhPerDay = cart.reduce((acc, it) => {
					// Calculate kWh for the item's period (day or week)
					let kwh = (it.wattage * it.usageValue * it.qty) / 1000;
					// If usage is weekly, average it out to a daily value
					if (it.usageFrequency === "weekly") {
						kwh /= 7;
					}
					return acc + kwh;
				}, 0);

				const totalCostPerDay = totalKwhPerDay * settings.pricePerKwh;
				const totalCo2PerDay = totalKwhPerDay * settings.emissionFactor;

				return {
					kwh: {
						day: totalKwhPerDay,
						month: totalKwhPerDay * 30,
						year: totalKwhPerDay * 365,
					},
					cost: {
						day: totalCostPerDay,
						month: totalCostPerDay * 30,
						year: totalCostPerDay * 365,
					},
					co2: {
						day: totalCo2PerDay,
						month: totalCo2PerDay * 30,
						year: totalCo2PerDay * 365,
					},
				};
			},

			exportCsv: () => {
				const { cart, settings, getTotals } = get();
				const totals = getTotals();
				const header = [
					"name",
					"wattage_w",
					"usage_value",
					"usage_frequency",
					"quantity",
					"avg_kwh_per_day",
					"avg_cost_per_day",
				];
				const rows = cart.map((it) => {
					let kwh = (it.wattage * it.usageValue * it.qty) / 1000;
					if (it.usageFrequency === "weekly") kwh /= 7;
					const cost = kwh * settings.pricePerKwh;
					return [
						it.name,
						it.wattage,
						it.usageValue,
						it.usageFrequency,
						it.qty,
						kwh.toFixed(3),
						cost.toFixed(3),
					].join(",");
				});

				const summary = [
					`total_kwh_day,${totals.kwh.day.toFixed(3)}`,
					`total_cost_day,${totals.cost.day.toFixed(2)}`,
					`co2_kg_day,${totals.co2.day.toFixed(3)}`,
				];

				const csv = [header.join(","), ...rows, "", "SUMMARY", ...summary].join(
					"\n"
				);
				const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `green-awareness-export-${
					new Date().toISOString().split("T")[0]
				}.csv`;
				a.click();
				URL.revokeObjectURL(url);
				a.remove();
			},
		}),
		{
			name: "green-awareness-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ cart: state.cart, settings: state.settings }),
		}
	)
);
