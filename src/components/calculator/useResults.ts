"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { computeResults, PERIOD_DIVISOR } from "@/lib/calc";
import { getRegion } from "@/lib/data/regions";
import { buildTips } from "@/lib/tips";

/** Everything the results, breakdown and savings sections need, memoised. */
export function useResults() {
	const items = useAppStore((s) => s.items);
	const settings = useAppStore((s) => s.settings);
	const period = useAppStore((s) => s.period);
	const plan = useAppStore((s) => s.plan);

	return useMemo(() => {
		const region = getRegion(settings.regionId);
		const { rows, totals } = computeResults(items, settings);
		const tips = buildTips(items).map((t) => ({
			...t,
			costSaved: t.kwhSaved * settings.pricePerKwh,
			co2Saved: t.kwhSaved * settings.intensity,
		}));
		const planKwh = tips
			.filter((t) => plan.includes(t.id))
			.reduce((s, t) => s + t.kwhSaved, 0);

		return {
			region,
			settings,
			period,
			divisor: PERIOD_DIVISOR[period],
			rows,
			totals,
			tips,
			plan: {
				kwh: planKwh,
				cost: planKwh * settings.pricePerKwh,
				co2: planKwh * settings.intensity,
			},
		};
	}, [items, settings, period, plan]);
}
