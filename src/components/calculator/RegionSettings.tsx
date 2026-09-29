"use client";

import { useMemo } from "react";
import { Info, RotateCcw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getRegion, REGIONS } from "@/lib/data/regions";
import { currencySymbol } from "@/lib/calc";
import { fill, regionName, useLang, useT } from "@/lib/i18n";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { NumberField, StepHeader } from "./ui";

/** Averages first, then countries in alphabetical order for this language. */
const PINNED = ["world", "eu"];

export function RegionSettings() {
	const t = useT();
	const lang = useLang();
	const settings = useAppStore((s) => s.settings);
	const setRegion = useAppStore((s) => s.setRegion);
	const updateSettings = useAppStore((s) => s.updateSettings);

	const region = getRegion(settings.regionId);
	const symbol = currencySymbol(region.currency, region.locale);
	const customised =
		settings.pricePerKwh !== region.price ||
		settings.intensity !== region.intensity;

	const options = useMemo(() => {
		const named = REGIONS.map((r) => ({ id: r.id, name: regionName(t, lang, r.id, r.name) }));
		const pinned = PINNED.map((id) => named.find((r) => r.id === id)!);
		const rest = named
			.filter((r) => !PINNED.includes(r.id))
			.sort((a, b) => a.name.localeCompare(b.name, lang));
		return [...pinned, ...rest];
	}, [t, lang]);

	const currentName = regionName(t, lang, region.id, region.name);

	return (
		<section
			aria-labelledby="region-heading"
			className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
			<StepHeader id="region-heading" step={1} title={t.step1.title} text={t.step1.text} />

			<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr]">
				<div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
					<span className="text-sm font-medium text-muted-foreground">{t.step1.country}</span>
					<Select value={region.id} onValueChange={setRegion}>
						<SelectTrigger
							className="!h-12 w-full rounded-xl bg-card px-4 text-lg font-semibold"
							aria-label={t.step1.country}>
							<SelectValue>{currentName}</SelectValue>
						</SelectTrigger>
						<SelectContent className="max-h-96">
							{options.map((r) => (
								<SelectItem key={r.id} value={r.id} className="py-2.5 text-base">
									{r.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<NumberField
					label={t.step1.price}
					unit={symbol}
					value={settings.pricePerKwh}
					max={100_000}
					onChange={(pricePerKwh) => updateSettings({ pricePerKwh })}
				/>
				<NumberField
					label={t.step1.co2}
					unit={t.units.kg}
					value={settings.intensity}
					max={2}
					onChange={(intensity) => updateSettings({ intensity })}
				/>
			</div>

			<div className="mt-4 flex flex-wrap items-start justify-between gap-3">
				<p className="flex max-w-xl gap-2 text-sm text-muted-foreground">
					<Info className="mt-0.5 size-4 shrink-0" aria-hidden />
					{t.step1.tip}
				</p>
				{customised && (
					<button
						type="button"
						onClick={() => setRegion(region.id)}
						className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
						<RotateCcw className="size-4" aria-hidden />
						{fill(t.step1.useDefaults, { name: currentName })}
					</button>
				)}
			</div>
		</section>
	);
}
