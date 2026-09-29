import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getSpec, TEMPLATES } from "@/lib/data/appliances";
import { getRegion, guessRegionId } from "@/lib/data/regions";
import type { ApplianceItem, Period, Settings } from "@/lib/calc";

interface AppState {
	items: ApplianceItem[];
	settings: Settings;
	/** False until the visitor picks a country (we guess one on first visit). */
	regionConfirmed: boolean;
	period: Period;
	/** Ids of savings tips the user has committed to. */
	plan: string[];
	/** Last removed item, so a removal can be undone. */
	lastRemoved: { item: ApplianceItem; index: number } | null;
}

interface AppActions {
	addPreset: (specId: string) => void;
	addCustom: () => void;
	updateItem: (id: string, patch: Partial<Omit<ApplianceItem, "id">>) => void;
	removeItem: (id: string) => void;
	undoRemove: () => void;
	duplicateItem: (id: string) => void;
	clearItems: () => void;
	loadTemplate: (templateId: string) => void;
	setRegion: (regionId: string) => void;
	guessRegion: () => void;
	updateSettings: (patch: Partial<Settings>) => void;
	setPeriod: (period: Period) => void;
	togglePlan: (tipId: string) => void;
}

const newId = () =>
	typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: Math.random().toString(36).slice(2);

function itemFromSpec(specId: string, qty?: number): ApplianceItem | null {
	const s = getSpec(specId);
	if (!s) return null;
	return {
		id: newId(),
		specId: s.id,
		name: s.name,
		mode: s.mode,
		watts: s.watts,
		hoursPerDay: s.hoursPerDay,
		daysPerWeek: s.daysPerWeek,
		kwhPerCycle: s.kwhPerCycle,
		cyclesPerWeek: s.cyclesPerWeek,
		monthsPerYear: s.monthsPerYear,
		standbyWatts: s.standbyWatts,
		qty: qty ?? s.qty,
	};
}

const settingsForRegion = (regionId: string): Settings => {
	const r = getRegion(regionId);
	return { regionId: r.id, pricePerKwh: r.price, intensity: r.intensity };
};

const INITIAL_STATE: AppState = {
	items: [],
	settings: settingsForRegion("us"),
	regionConfirmed: false,
	period: "month",
	plan: [],
	lastRemoved: null,
};

export const useAppStore = create<AppState & AppActions>()(
	persist(
		(set, get) => ({
			...INITIAL_STATE,

			addPreset: (specId) => {
				const item = itemFromSpec(specId);
				if (item) set((s) => ({ items: [...s.items, item] }));
			},

			addCustom: () =>
				set((s) => ({
					items: [
						...s.items,
						{
							id: newId(),
							specId: "custom",
							name: "",
							mode: "hours",
							watts: 100,
							hoursPerDay: 1,
							daysPerWeek: 7,
							kwhPerCycle: 1,
							cyclesPerWeek: 3,
							monthsPerYear: 12,
							standbyWatts: 0,
							qty: 1,
						},
					],
				})),

			updateItem: (id, patch) =>
				set((s) => ({
					items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
				})),

			removeItem: (id) =>
				set((s) => {
					const index = s.items.findIndex((it) => it.id === id);
					if (index < 0) return s;
					return {
						items: s.items.filter((it) => it.id !== id),
						lastRemoved: { item: s.items[index], index },
					};
				}),

			undoRemove: () => {
				const { lastRemoved, items } = get();
				if (!lastRemoved) return;
				const next = [...items];
				next.splice(Math.min(lastRemoved.index, next.length), 0, lastRemoved.item);
				set({ items: next, lastRemoved: null });
			},

			duplicateItem: (id) =>
				set((s) => {
					const index = s.items.findIndex((it) => it.id === id);
					if (index < 0) return s;
					const next = [...s.items];
					next.splice(index + 1, 0, { ...s.items[index], id: newId() });
					return { items: next };
				}),

			clearItems: () => set({ items: [], plan: [], lastRemoved: null }),

			loadTemplate: (templateId) => {
				const t = TEMPLATES.find((x) => x.id === templateId);
				if (!t) return;
				const items = t.items
					.map((x) => itemFromSpec(x.id, x.qty))
					.filter((x): x is ApplianceItem => x !== null);
				set({ items, plan: [], lastRemoved: null });
			},

			setRegion: (regionId) =>
				set({ settings: settingsForRegion(regionId), regionConfirmed: true }),

			guessRegion: () => {
				if (get().regionConfirmed) return;
				set({ settings: settingsForRegion(guessRegionId()) });
			},

			updateSettings: (patch) =>
				set((s) => ({ settings: { ...s.settings, ...patch }, regionConfirmed: true })),

			setPeriod: (period) => set({ period }),

			togglePlan: (tipId) =>
				set((s) => ({
					plan: s.plan.includes(tipId)
						? s.plan.filter((x) => x !== tipId)
						: [...s.plan, tipId],
				})),
		}),
		{
			name: "green-awareness-storage",
			version: 2,
			storage: createJSONStorage(() => localStorage),
			partialize: (s) => ({
				items: s.items,
				settings: s.settings,
				regionConfirmed: s.regionConfirmed,
				period: s.period,
				plan: s.plan,
			}),
			migrate: (persisted, version) => {
				if (version >= 2) return persisted as AppState;
				// v0/v1 stored `cart` rows with hours per day or hours per week.
				type OldItem = {
					key?: string;
					name?: string;
					wattage?: number;
					usageValue?: number;
					usageFrequency?: "daily" | "weekly";
					qty?: number;
				};
				const old = (persisted ?? {}) as {
					cart?: OldItem[];
					settings?: { pricePerKwh?: number; emissionFactor?: number };
				};
				const items: ApplianceItem[] = (old.cart ?? []).map((c) => {
					const weekly = c.usageFrequency === "weekly";
					return {
						id: newId(),
						specId: "custom",
						name: c.name ?? "",
						mode: "hours",
						watts: Number(c.wattage) || 0,
						hoursPerDay: weekly ? Number(c.usageValue) || 0 : Math.min(24, Number(c.usageValue) || 0),
						daysPerWeek: weekly ? 1 : 7,
						kwhPerCycle: 1,
						cyclesPerWeek: 3,
						monthsPerYear: 12,
						standbyWatts: 0,
						qty: Number(c.qty) || 1,
					};
				});
				return {
					...INITIAL_STATE,
					items,
					settings: {
						regionId: "us",
						pricePerKwh: old.settings?.pricePerKwh ?? INITIAL_STATE.settings.pricePerKwh,
						intensity: old.settings?.emissionFactor ?? INITIAL_STATE.settings.intensity,
					},
				};
			},
		}
	)
);
