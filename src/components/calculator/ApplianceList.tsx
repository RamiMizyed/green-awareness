"use client";

import { useEffect, useState } from "react";
import { Home, Plus, Trash2, Undo2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { TEMPLATES } from "@/lib/data/appliances";
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
import { PERIOD_LABEL, useResults } from "./useResults";

export function ApplianceList() {
	const { rows, region, divisor, period } = useResults();
	const items = useAppStore((s) => s.items);
	const clearItems = useAppStore((s) => s.clearItems);
	// Keep the order people added things in, so rows don't jump while typing.
	const byId = new Map(rows.map((r) => [r.item.id, r]));
	const ordered = items.map((it) => byId.get(it.id)!).filter(Boolean);
	const topId = rows.length > 1 ? rows[0].item.id : null;

	return (
		<section
			aria-labelledby="appliances-heading"
			className="rounded-2xl border bg-card p-5 sm:p-6">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h3 id="appliances-heading" className="text-lg font-semibold">
						Your appliances
					</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						{rows.length === 0
							? "Start from a typical home or add your own."
							: `${rows.length} ${rows.length === 1 ? "item" : "items"}. Your biggest user is highlighted.`}
					</p>
				</div>
				{rows.length > 0 && (
					<div className="flex gap-2">
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="ghost" size="sm" className="text-muted-foreground">
									<Trash2 aria-hidden /> Clear
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Clear your list?</AlertDialogTitle>
									<AlertDialogDescription>
										This removes all {rows.length} appliances and your savings
										plan. Your country and price settings are kept.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction onClick={clearItems}>
										Clear list
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
						<AppliancePicker
							trigger={
								<Button size="sm">
									<Plus aria-hidden /> Add appliances
								</Button>
							}
						/>
					</div>
				)}
			</div>

			{rows.length === 0 ? (
				<EmptyState />
			) : (
				<ul className="mt-5 flex flex-col gap-3">
					{ordered.map((r) => (
						<ApplianceRow
							key={r.item.id}
							result={r}
							region={region}
							divisor={divisor}
							periodLabel={PERIOD_LABEL[period]}
							isTop={r.item.id === topId}
						/>
					))}
				</ul>
			)}

			<UndoToast />
		</section>
	);
}

function EmptyState() {
	const loadTemplate = useAppStore((s) => s.loadTemplate);
	return (
		<div className="mt-5">
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{TEMPLATES.map((t) => (
					<button
						key={t.id}
						type="button"
						onClick={() => loadTemplate(t.id)}
						className="flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors hover:border-primary/60 hover:bg-primary/5">
						<Home className="size-5 text-primary" aria-hidden />
						<span className="font-medium">{t.label}</span>
						<span className="text-xs text-muted-foreground">
							{t.description} · {t.items.length} appliances
						</span>
					</button>
				))}
			</div>
			<div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center">
				<p className="text-sm text-muted-foreground">
					Or build your list from scratch.
				</p>
				<AppliancePicker
					trigger={
						<Button>
							<Plus aria-hidden /> Add appliances
						</Button>
					}
				/>
			</div>
		</div>
	);
}

function UndoToast() {
	const lastRemoved = useAppStore((s) => s.lastRemoved);
	const undoRemove = useAppStore((s) => s.undoRemove);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!lastRemoved) return setVisible(false);
		setVisible(true);
		const t = setTimeout(() => setVisible(false), 6000);
		return () => clearTimeout(t);
	}, [lastRemoved]);

	if (!visible || !lastRemoved) return null;
	return (
		<div
			role="status"
			className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-xl border bg-popover px-4 py-3 text-sm shadow-lg">
			<span className="truncate">
				Removed {lastRemoved.item.name || "appliance"}
			</span>
			<Button
				size="sm"
				variant="outline"
				onClick={() => {
					undoRemove();
					setVisible(false);
				}}>
				<Undo2 aria-hidden /> Undo
			</Button>
		</div>
	);
}
