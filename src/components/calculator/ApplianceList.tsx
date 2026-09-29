"use client";

import { useEffect, useState } from "react";
import { Building2, Home, Plus, PlugZap, Trash2, Undo2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { applianceVisual, TEMPLATES } from "@/lib/data/appliances";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AppliancePicker } from "./AppliancePicker";
import { ApplianceRow } from "./ApplianceRow";
import { IconTile, StepHeader } from "./ui";
import { PERIOD_WORD, useResults } from "./useResults";

const TEMPLATE_ICON = { studio: Building2, family: Home, all_electric: PlugZap } as const;

export function ApplianceList() {
	const { rows, region, divisor, period } = useResults();
	const items = useAppStore((s) => s.items);
	const clearItems = useAppStore((s) => s.clearItems);
	// Keep the order people added things in, so cards don't jump while editing.
	const byId = new Map(rows.map((r) => [r.item.id, r]));
	const ordered = items.map((it) => byId.get(it.id)!).filter(Boolean);
	const topId = rows.length > 1 && rows[0].kwh > 0 ? rows[0].item.id : null;

	return (
		<section aria-labelledby="appliances-heading" className="flex flex-col gap-4">
			<div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
				<StepHeader
					id="appliances-heading"
					step={2}
					title="What do you use?"
					text={
						rows.length === 0
							? "Pick a home like yours to start, then adjust it."
							: `${rows.length} ${rows.length === 1 ? "appliance" : "appliances"} in your home.`
					}
					action={
						rows.length > 0 && (
							<div className="flex gap-2">
								<ClearButton count={rows.length} onConfirm={clearItems} />
								<AppliancePicker
									trigger={
										<Button>
											<Plus aria-hidden /> Add
										</Button>
									}
								/>
							</div>
						)
					}
				/>
				{rows.length === 0 && <EmptyState />}
			</div>

			{rows.length > 0 && (
				<>
					<ul className="flex flex-col gap-4">
						{ordered.map((r) => (
							<ApplianceRow
								key={r.item.id}
								result={r}
								region={region}
								divisor={divisor}
								periodWord={PERIOD_WORD[period]}
								isTop={r.item.id === topId}
							/>
						))}
					</ul>
					<AppliancePicker
						trigger={
							<button
								type="button"
								className="flex h-20 items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary/40 text-lg font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5">
								<span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
									<Plus className="size-6" aria-hidden />
								</span>
								Add another appliance
							</button>
						}
					/>
				</>
			)}

			<UndoToast />
		</section>
	);
}

function EmptyState() {
	const loadTemplate = useAppStore((s) => s.loadTemplate);
	return (
		<div className="mt-6">
			<ul className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
				{TEMPLATES.map((t) => {
					const Icon = TEMPLATE_ICON[t.id as keyof typeof TEMPLATE_ICON] ?? Home;
					return (
						<li key={t.id}>
							<button
								type="button"
								onClick={() => loadTemplate(t.id)}
								className="flex h-full w-full flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-colors hover:border-primary hover:bg-primary/5">
								<IconTile
									icon={Icon}
									tone="bg-primary/10 text-primary"
								/>
								<span>
									<span className="block text-lg font-semibold">{t.label}</span>
									<span className="block text-sm text-muted-foreground">
										{t.description}
									</span>
								</span>
								<span className="flex flex-wrap gap-1.5" aria-hidden>
									{t.items.slice(0, 6).map((it) => {
										const v = applianceVisual(it.id);
										return (
											<IconTile key={it.id} icon={v.icon} tone={v.tone} size="sm" />
										);
									})}
									{t.items.length > 6 && (
										<span className="flex size-10 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-muted-foreground">
											+{t.items.length - 6}
										</span>
									)}
								</span>
								<span className="mt-auto pt-1 text-sm font-semibold text-primary">
									Start with this →
								</span>
							</button>
						</li>
					);
				})}
			</ul>
			<div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-muted/60 p-6 text-center">
				<p className="text-base text-muted-foreground">
					Rather pick everything yourself?
				</p>
				<AppliancePicker
					trigger={
						<Button size="lg">
							<Plus aria-hidden /> Choose appliances
						</Button>
					}
				/>
			</div>
		</div>
	);
}

function ClearButton({ count, onConfirm }: { count: number; onConfirm: () => void }) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="ghost" className="text-muted-foreground">
					<Trash2 aria-hidden /> Clear all
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove all {count} appliances?</AlertDialogTitle>
					<AlertDialogDescription>
						Your savings plan is cleared too. Your country and price stay the
						same.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Keep them</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>Remove all</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function UndoToast() {
	const lastRemoved = useAppStore((s) => s.lastRemoved);
	const undoRemove = useAppStore((s) => s.undoRemove);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!lastRemoved) return setVisible(false);
		setVisible(true);
		const t = setTimeout(() => setVisible(false), 7000);
		return () => clearTimeout(t);
	}, [lastRemoved]);

	if (!visible || !lastRemoved) return null;
	return (
		<div
			role="status"
			className="fixed inset-x-4 bottom-24 z-50 lg:bottom-6 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-foreground px-5 py-3 text-base text-background shadow-xl">
			<span className="truncate">
				Removed {lastRemoved.item.name || "appliance"}
			</span>
			<button
				type="button"
				onClick={() => {
					undoRemove();
					setVisible(false);
				}}
				className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-background/15 px-4 font-semibold hover:bg-background/25">
				<Undo2 className="size-5" aria-hidden /> Undo
			</button>
		</div>
	);
}
