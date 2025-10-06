import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { APPLIANCE_DATA } from "@/lib/appliances";

// --- TYPES ---
type ApplianceKey = keyof typeof APPLIANCE_DATA | "custom";

export interface CartItem {
	id: string;
	key: ApplianceKey;
	name: string;
	wattage: number;
	hoursPerDay: number;
	qty: number;
}

export interface Settings {
	pricePerKwh: number;
	currency: string;
	emissionFactor: number;
	regionPreset: string;
}

// The AppState is now simpler without the 'form' object
interface AppState {
	cart: CartItem[];
	settings: Settings;
	error: string | null;
}

// AppActions are updated to reflect the new logic
interface AppActions {
	// Cart Actions
	addItemToCart: (key: ApplianceKey) => void; // Now accepts a key
	updateCartItem: (id: string, patch: Partial<Omit<CartItem, "id">>) => void;
	removeCartItem: (id: string) => void;
	clearCart: () => void;

	// Settings Actions
	updateSettings: (patch: Partial<Settings>) => void;

	// Form Actions are removed: setFormField, resetForm

	// General Actions
	setError: (message: string | null) => void;
	reset: () => void;
	exportCsv: () => void;

	// Getters
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
	regionPreset: "0.417",
};

// The initial state no longer needs a 'form' property
const INITIAL_STATE: AppState = {
	cart: [
		{
			id: uuidv4(),
			key: "television",
			name: APPLIANCE_DATA.television.name,
			wattage: APPLIANCE_DATA.television.wattage,
			hoursPerDay: 4,
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

			// addItemToCart is now much simpler
			addItemToCart: (key) => {
				get().setError(null);
				if (!key) {
					get().setError("Please select an appliance to add.");
					return;
				}

				let newItem: CartItem;

				if (key === "custom") {
					newItem = {
						id: uuidv4(),
						key: "custom",
						name: "Custom Appliance",
						wattage: 100, // Default wattage, user can edit
						hoursPerDay: 1, // Default hours
						qty: 1, // Default quantity
					};
				} else {
					const appliance = APPLIANCE_DATA[key];
					newItem = {
						id: uuidv4(),
						key,
						name: appliance.name,
						wattage: appliance.wattage,
						hoursPerDay: 1, // Default hours
						qty: 1, // Default quantity
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
				const totalKwhPerDay = cart.reduce(
					(acc, it) => acc + (it.wattage * it.hoursPerDay * it.qty) / 1000,
					0
				);
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
					"hours_per_day",
					"quantity",
					"kwh_per_day",
					"cost_per_day",
				];
				const rows = cart.map((it) => {
					const kwh = (it.wattage * it.hoursPerDay * it.qty) / 1000;
					const cost = kwh * settings.pricePerKwh;
					return [
						it.name,
						it.wattage,
						it.hoursPerDay,
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
			name: "green-awareness-storage", // local storage key
			storage: createJSONStorage(() => localStorage),
			// Only persist the cart and settings, not the form or API state
			partialize: (state) => ({ cart: state.cart, settings: state.settings }),
		}
	)
);
