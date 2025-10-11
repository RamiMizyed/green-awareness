"use client";
import React from "react";
import { useAppStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// You can move this to a constants file if you prefer
const REGION_PRESETS: { label: string; value: number }[] = [
	{ label: "US average", value: 0.417 },
	{ label: "EU average", value: 0.253 },
	{ label: "Turkey", value: 0.38 },
	{ label: "Global average", value: 0.475 },
];

export function CalculationSettings() {
	const { settings, updateSettings } = useAppStore();

	return (
		<div className="grid grid-cols-1">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="flex flex-col items-start justify-between">
					<Label>Region Preset</Label>
					<Select
						value={String(settings.regionPreset)}
						onValueChange={(val) =>
							updateSettings({
								regionPreset: val,
								emissionFactor: Number(val),
							})
						}>
						<SelectTrigger className="w-full mt-1">
							<SelectValue placeholder="Select a region" />
						</SelectTrigger>
						<SelectContent>
							{REGION_PRESETS.map((p) => (
								<SelectItem key={p.label} value={String(p.value)}>
									{p.label} ({p.value})
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label className="text-xs">Price per kWh ({settings.currency})</Label>
					<Input
						type="number"
						min={0}
						step={0.01}
						value={settings.pricePerKwh}
						onChange={(e) =>
							updateSettings({ pricePerKwh: Number(e.target.value) })
						}
						className="mt-1"
					/>
				</div>

				<div>
					<Label>Manual Factor (kg CO₂e/kWh)</Label>
					<Input
						type="number"
						min={0}
						step={0.001}
						value={settings.emissionFactor}
						onChange={(e) =>
							updateSettings({ emissionFactor: Number(e.target.value) })
						}
						className="mt-1"
					/>
				</div>
			</div>
		</div>
	);
}
