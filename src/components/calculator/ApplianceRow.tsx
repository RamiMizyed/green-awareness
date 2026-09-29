"use client";

import { useState } from "react";
import { ChevronDown, Copy, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { CUSTOM_ICON, FALLBACK_ICON, getSpec } from "@/lib/data/appliances";
import { formatMoney, formatNumber, type ItemResult } from "@/lib/calc";
import type { Region } from "@/lib/data/regions";
import { cn } from "@/lib/utils";
import { NumberField } from "./NumberField";

interface ApplianceRowProps {
	result: ItemResult;
	region: Region;
	divisor: number;
	periodLabel: string;
	isTop: boolean;
}

export function ApplianceRow({
	result,
	region,
	divisor,
	periodLabel,
	isTop,
}: ApplianceRowProps) {
	const { item } = result;
	const updateItem = useAppStore((s) => s.updateItem);
	const removeItem = useAppStore((s) => s.removeItem);
	const duplicateItem = useAppStore((s) => s.duplicateItem);
	const [expanded, setExpanded] = useState(false);

	const spec = getSpec(item.specId);
	const Icon = item.specId === "custom" ? CUSTOM_ICON : (spec?.icon ?? FALLBACK_ICON);
	const set = (patch: Parameters<typeof updateItem>[1]) => updateItem(item.id, patch);
	const moreId = `more-${item.id}`;

	return (
		<li className="rounded-xl border bg-background/60 p-3 sm:p-4">
			<div className="flex items-center gap-3">
				<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/80">
					<Icon className="size-5" aria-hidden />
				</span>
				<input
					value={item.name}
					onChange={(e) => set({ name: e.target.value })}
					placeholder="Name this appliance"
					aria-label="Appliance name"
					className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-1 text-sm font-medium outline-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/40 sm:text-base"
				/>
				<div className="hidden text-right sm:block">
					<div className="text-sm font-semibold tabular-nums">
						{formatMoney(result.cost / divisor, region.currency, region.locale)}
					</div>
					<div className="text-xs text-muted-foreground tabular-nums">
						{formatNumber(result.kwh / divisor, region.locale)} kWh {periodLabel}
					</div>
				</div>
				<div className="flex shrink-0 items-center">
					<IconButton label="Duplicate" onClick={() => duplicateItem(item.id)}>
						<Copy className="size-4" />
					</IconButton>
					<IconButton
						label={`Remove ${item.name || "appliance"}`}
						onClick={() => removeItem(item.id)}
						className="hover:bg-destructive/10 hover:text-destructive">
						<Trash2 className="size-4" />
					</IconButton>
				</div>
			</div>

			<div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
				{item.mode === "hours" ? (
					<>
						<NumberField
							label="Power"
							unit="W"
							value={item.watts}
							step={10}
							max={100_000}
							onChange={(watts) => set({ watts })}
						/>
						<NumberField
							label="Hours a day"
							unit="h"
							value={item.hoursPerDay}
							step={0.5}
							max={24}
							onChange={(hoursPerDay) => set({ hoursPerDay })}
						/>
						<NumberField
							label="Days a week"
							unit="days"
							value={item.daysPerWeek}
							max={7}
							onChange={(daysPerWeek) => set({ daysPerWeek })}
						/>
					</>
				) : (
					<>
						<NumberField
							label="Energy per use"
							unit="kWh"
							value={item.kwhPerCycle}
							step={0.1}
							max={1000}
							onChange={(kwhPerCycle) => set({ kwhPerCycle })}
						/>
						<NumberField
							label="Uses a week"
							unit="×"
							value={item.cyclesPerWeek}
							max={1000}
							onChange={(cyclesPerWeek) => set({ cyclesPerWeek })}
						/>
					</>
				)}
				<NumberField
					label="How many"
					unit="×"
					value={item.qty}
					max={1000}
					onChange={(qty) => set({ qty })}
					className={cn(item.mode === "cycles" && "col-span-2 sm:col-span-1")}
				/>
			</div>

			{/* Mobile: result under the inputs */}
			<div className="mt-3 flex items-baseline justify-between text-sm sm:hidden">
				<span className="text-muted-foreground tabular-nums">
					{formatNumber(result.kwh / divisor, region.locale)} kWh {periodLabel}
				</span>
				<span className="font-semibold tabular-nums">
					{formatMoney(result.cost / divisor, region.currency, region.locale)}
				</span>
			</div>

			<div className="mt-3 flex items-center gap-3">
				<div
					className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
					role="img"
					aria-label={`${Math.round(result.share * 100)}% of your electricity use`}>
					<div
						className={cn(
							"h-full rounded-full transition-[width] duration-500",
							isTop ? "bg-amber-500" : "bg-primary"
						)}
						style={{ width: `${Math.max(result.share * 100, result.kwh > 0 ? 1 : 0)}%` }}
					/>
				</div>
				<span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
					{Math.round(result.share * 100)}%
				</span>
				<button
					type="button"
					aria-expanded={expanded}
					aria-controls={moreId}
					onClick={() => setExpanded((v) => !v)}
					className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
					More
					<ChevronDown
						className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
						aria-hidden
					/>
				</button>
			</div>

			{expanded && (
				<div id={moreId} className="mt-3 border-t pt-3">
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<div className="col-span-2 flex flex-col gap-1">
							<span className="text-xs font-medium text-muted-foreground">
								Measure usage by
							</span>
							<div className="grid h-10 grid-cols-2 rounded-md border p-0.5 text-sm">
								{(["hours", "cycles"] as const).map((m) => (
									<button
										key={m}
										type="button"
										aria-pressed={item.mode === m}
										onClick={() => set({ mode: m })}
										className={cn(
											"rounded-[5px] transition-colors",
											item.mode === m
												? "bg-primary text-white"
												: "text-muted-foreground hover:bg-muted"
										)}>
										{m === "hours" ? "Hours of use" : "Loads / charges"}
									</button>
								))}
							</div>
						</div>
						<NumberField
							label="Months a year"
							unit="mo"
							value={item.monthsPerYear}
							max={12}
							onChange={(monthsPerYear) => set({ monthsPerYear })}
						/>
						<NumberField
							label="Standby power"
							unit="W"
							value={item.standbyWatts}
							step={0.5}
							max={1000}
							onChange={(standbyWatts) => set({ standbyWatts })}
						/>
					</div>
					<p className="mt-3 text-xs text-muted-foreground">
						{spec?.hint ? `${spec.hint} ` : ""}
						Not sure of the wattage? Check the label on the back or underneath
						the device. Standby is the power it draws when switched off but
						still plugged in.
						{result.standbyKwh > 0 &&
							` Standby alone costs ${formatMoney(
								(result.standbyKwh * result.cost) / Math.max(result.kwh, 1e-9),
								region.currency,
								region.locale
							)} a year here.`}
					</p>
				</div>
			)}
		</li>
	);
}

function IconButton({
	label,
	className,
	...props
}: React.ComponentProps<"button"> & { label: string }) {
	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			className={cn(
				"flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
				className
			)}
			{...props}
		/>
	);
}
