"use client";

import { MapPin, RotateCcw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getRegion, REGIONS } from "@/lib/data/regions";
import { currencySymbol } from "@/lib/calc";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { NumberField } from "./NumberField";

export function RegionSettings() {
	const settings = useAppStore((s) => s.settings);
	const setRegion = useAppStore((s) => s.setRegion);
	const updateSettings = useAppStore((s) => s.updateSettings);

	const region = getRegion(settings.regionId);
	const symbol = currencySymbol(region.currency, region.locale);
	const customised =
		settings.pricePerKwh !== region.price ||
		settings.intensity !== region.intensity;

	return (
		<section
			aria-labelledby="region-heading"
			className="rounded-2xl border bg-card p-5 sm:p-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3
						id="region-heading"
						className="flex items-center gap-2 text-lg font-semibold">
						<MapPin className="size-5 text-primary" aria-hidden />
						Where you live
					</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Sets your electricity price and how clean your grid is.
					</p>
				</div>
				{customised && (
					<button
						type="button"
						onClick={() => setRegion(region.id)}
						className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
						<RotateCcw className="size-3.5" aria-hidden />
						Reset to {region.name}
					</button>
				)}
			</div>

			<div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[1.4fr_1fr_1fr]">
				<div className="flex flex-col gap-1 min-w-0">
					<span className="text-xs font-medium text-muted-foreground">
						Country or region
					</span>
					<Select value={region.id} onValueChange={setRegion}>
						<SelectTrigger
							className="!h-10 w-full bg-background"
							aria-label="Country or region">
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="max-h-80">
							{REGIONS.map((r) => (
								<SelectItem key={r.id} value={r.id}>
									{r.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<NumberField
					label="Your price per kWh"
					unit={symbol}
					value={settings.pricePerKwh}
					step={0.01}
					max={100_000}
					onChange={(pricePerKwh) => updateSettings({ pricePerKwh })}
				/>
				<NumberField
					label="Grid carbon intensity"
					unit="kg/kWh"
					value={settings.intensity}
					step={0.01}
					max={2}
					onChange={(intensity) => updateSettings({ intensity })}
				/>
			</div>
			<p className="mt-3 text-xs text-muted-foreground">
				Prices are typical figures and change often. For an accurate result,
				use the price per kWh (unit rate) printed on your electricity bill.
			</p>
		</section>
	);
}
