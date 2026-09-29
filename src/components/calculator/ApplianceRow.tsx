"use client";

import { useState } from "react";
import { ChevronDown, Copy, Pencil, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { applianceVisual } from "@/lib/data/appliances";
import { formatMoney, formatNumber, type ItemResult } from "@/lib/calc";
import type { Region } from "@/lib/data/regions";
import { cn } from "@/lib/utils";
import { fill, formatPercent, itemName, rich, specHint, useLang, useT } from "@/lib/i18n";
import { IconTile, Segmented, Stepper } from "./ui";

interface ApplianceRowProps {
	result: ItemResult;
	region: Region;
	divisor: number;
	perPeriod: string;
	isTop: boolean;
}

/** Bigger steps for bigger numbers, so + and − always feel useful. */
const wattStep = (w: number) => (w >= 1000 ? 100 : w >= 100 ? 10 : 1);
const hourStep = (h: number) => (h < 1 ? 0.25 : h < 4 ? 0.5 : 1);

export function ApplianceRow({
	result,
	region,
	divisor,
	perPeriod,
	isTop,
}: ApplianceRowProps) {
	const t = useT();
	const lang = useLang();
	const { item } = result;
	const updateItem = useAppStore((s) => s.updateItem);
	const removeItem = useAppStore((s) => s.removeItem);
	const duplicateItem = useAppStore((s) => s.duplicateItem);
	const [expanded, setExpanded] = useState(false);

	const visual = applianceVisual(item.specId);
	const hint = specHint(t, item.specId);
	const name = itemName(t, item);
	const set = (patch: Parameters<typeof updateItem>[1]) => updateItem(item.id, patch);
	const moreId = `more-${item.id}`;
	const nameId = `name-${item.id}`;
	const pct = Math.round(result.share * 100);
	const pctText = formatPercent(lang, pct / 100);

	return (
		<li
			className={cn(
				"rounded-3xl border bg-card p-4 shadow-sm sm:p-5",
				isTop && "ring-2 ring-amber-400/70"
			)}>
			{/* Header: icon, name, cost */}
			<div className="flex items-start gap-4">
				<IconTile icon={visual.icon} tone={visual.tone} />
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-sm font-medium text-muted-foreground">
							{item.specId === "custom" ? t.row.custom : t.categories[visual.category]}
						</span>
						{isTop && (
							<span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
								{t.row.biggest}
							</span>
						)}
					</div>
					<label htmlFor={nameId} className="sr-only">
						{t.row.nameLabel}
					</label>
					<div className="group relative">
						<input
							id={nameId}
							value={name}
							onChange={(e) => set({ name: e.target.value })}
							placeholder={t.row.namePlaceholder}
							className="-ms-1.5 w-full rounded-lg bg-transparent px-1.5 py-0.5 pe-8 text-lg font-semibold outline-none placeholder:text-muted-foreground/70 hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40 sm:text-xl"
						/>
						<Pencil
							className="pointer-events-none absolute end-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-0"
							aria-hidden
						/>
					</div>
				</div>
				<div className="shrink-0 text-end">
					<div className="text-xl font-bold tabular-nums sm:text-2xl">
						{formatMoney(result.cost / divisor, region.currency, region.locale)}
					</div>
					<div className="text-sm text-muted-foreground">{perPeriod}</div>
				</div>
			</div>

			{/* Main controls */}
			<div className="mt-5 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
				{item.mode === "hours" ? (
					<>
						<Stepper
							label={t.row.power}
							unit="W"
							value={item.watts}
							step={wattStep(item.watts)}
							max={100_000}
							onChange={(watts) => set({ watts })}
						/>
						<Stepper
							label={t.row.hoursPerDay}
							unit={t.units.hours}
							value={item.hoursPerDay}
							step={hourStep(item.hoursPerDay)}
							max={24}
							onChange={(hoursPerDay) => set({ hoursPerDay })}
						/>
						<Stepper
							label={t.row.daysPerWeek}
							value={item.daysPerWeek}
							max={7}
							onChange={(daysPerWeek) => set({ daysPerWeek })}
						/>
					</>
				) : (
					<>
						<Stepper
							label={t.row.energyPerUse}
							unit="kWh"
							value={item.kwhPerCycle}
							step={0.1}
							max={1000}
							onChange={(kwhPerCycle) => set({ kwhPerCycle })}
						/>
						<Stepper
							label={t.row.usesPerWeek}
							value={item.cyclesPerWeek}
							max={1000}
							onChange={(cyclesPerWeek) => set({ cyclesPerWeek })}
						/>
					</>
				)}
				<Stepper
					label={t.row.howMany}
					value={item.qty}
					min={1}
					max={1000}
					onChange={(qty) => set({ qty })}
				/>
			</div>

			{/* Share of total */}
			<div className="mt-5 flex items-center gap-3">
				<div
					className="h-3 flex-1 overflow-hidden rounded-full bg-muted"
					role="img"
					aria-label={fill(t.row.shareLabel, { pct: pctText })}>
					<div
						className="h-full rounded-full transition-[width] duration-500"
						style={{
							width: `${Math.max(result.share * 100, result.kwh > 0 ? 1.5 : 0)}%`,
							background: visual.hex,
						}}
					/>
				</div>
				<span className="shrink-0 text-sm text-muted-foreground">
					{rich(t.row.shareOfUse, {
						pct: <strong className="font-semibold text-foreground tabular-nums">{pctText}</strong>,
					})}{" "}
					· <span dir="ltr">{formatNumber(result.kwh / divisor, region.locale)} kWh</span>
				</span>
			</div>

			{/* Actions */}
			<div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
				<RowAction
					aria-expanded={expanded}
					aria-controls={moreId}
					onClick={() => setExpanded((v) => !v)}>
					<ChevronDown
						className={cn("size-4 transition-transform", expanded && "rotate-180")}
						aria-hidden
					/>
					{expanded ? t.row.fewer : t.row.more}
				</RowAction>
				<span className="flex-1" />
				<RowAction onClick={() => duplicateItem(item.id)}>
					<Copy className="size-4" aria-hidden /> {t.row.copy}
				</RowAction>
				<RowAction
					onClick={() => removeItem(item.id)}
					aria-label={fill(t.row.removeLabel, { name: name || t.step2.unnamed })}
					className="hover:bg-destructive/10 hover:text-destructive">
					<Trash2 className="size-4" aria-hidden /> {t.row.remove}
				</RowAction>
			</div>

			{expanded && (
				<div id={moreId} className="mt-3 rounded-2xl bg-muted/60 p-4">
					<div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
						<div className="flex flex-col gap-1.5 min-[480px]:col-span-2">
							<span className="text-sm font-medium text-muted-foreground">
								{t.row.countBy}
							</span>
							<Segmented
								label={t.row.countBy}
								value={item.mode}
								onChange={(mode) => set({ mode })}
								className="w-full bg-card sm:w-auto"
								options={[
									{ id: "hours", label: t.row.byHours },
									{ id: "cycles", label: t.row.byLoads },
								]}
							/>
						</div>
						<Stepper
							label={t.row.monthsPerYear}
							value={item.monthsPerYear}
							max={12}
							onChange={(monthsPerYear) => set({ monthsPerYear })}
						/>
						<Stepper
							label={t.row.standby}
							unit="W"
							value={item.standbyWatts}
							step={0.5}
							max={1000}
							onChange={(standbyWatts) => set({ standbyWatts })}
						/>
					</div>
					<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
						{hint ? `${hint} ` : ""}
						{t.row.help}
						{result.standbyKwh > 0.5 &&
							` ${fill(t.row.standbyCost, {
								money: formatMoney(
									result.standbyKwh * (result.cost / Math.max(result.kwh, 1e-9)),
									region.currency,
									region.locale
								),
							})}`}
					</p>
				</div>
			)}
		</li>
	);
}

function RowAction({ className, ...props }: React.ComponentProps<"button">) {
	return (
		<button
			type="button"
			className={cn(
				"inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
				className
			)}
			{...props}
		/>
	);
}
