"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
	APPLIANCES,
	CATEGORIES,
	CUSTOM_ICON,
	type Category,
} from "@/lib/data/appliances";
import { formatNumber, kwhPerYear, type ApplianceItem } from "@/lib/calc";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Typical monthly use of a preset, shown on each tile. */
const typicalMonthlyKwh = (spec: (typeof APPLIANCES)[number]) =>
	kwhPerYear({ ...spec, specId: spec.id } as ApplianceItem) / 12;

export function AppliancePicker({ trigger }: { trigger: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState<Category | "all">("all");
	const items = useAppStore((s) => s.items);
	const addPreset = useAppStore((s) => s.addPreset);
	const addCustom = useAppStore((s) => s.addCustom);

	const counts = useMemo(() => {
		const m = new Map<string, number>();
		for (const it of items) m.set(it.specId, (m.get(it.specId) ?? 0) + 1);
		return m;
	}, [items]);

	const q = query.trim().toLowerCase();
	const visible = APPLIANCES.filter(
		(a) =>
			(category === "all" || a.category === category) &&
			(!q || a.name.toLowerCase().includes(q))
	);

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				setOpen(o);
				if (!o) setQuery("");
			}}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="flex max-h-[min(720px,90svh)] flex-col gap-0 p-0 sm:max-w-3xl">
				<DialogHeader className="border-b p-5 pb-4 text-left">
					<DialogTitle>Add appliances</DialogTitle>
					<DialogDescription>
						Tap everything you have. You can fine-tune the numbers afterwards.
					</DialogDescription>
					<div className="relative mt-3">
						<Search
							className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
							aria-hidden
						/>
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search, e.g. fridge, heater, TV"
							aria-label="Search appliances"
							className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
						/>
					</div>
					<div
						className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1"
						role="tablist"
						aria-label="Categories">
						{[{ id: "all" as const, label: "All" }, ...CATEGORIES].map((c) => (
							<button
								key={c.id}
								type="button"
								role="tab"
								aria-selected={category === c.id}
								onClick={() => setCategory(c.id)}
								className={cn(
									"shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
									category === c.id
										? "border-primary bg-primary text-white"
										: "hover:bg-muted"
								)}>
								{c.label}
							</button>
						))}
					</div>
				</DialogHeader>

				<div className="min-h-0 flex-1 overflow-y-auto p-5">
					{visible.length === 0 ? (
						<p className="py-10 text-center text-sm text-muted-foreground">
							Nothing matches &ldquo;{query}&rdquo;. Add it as a custom
							appliance below.
						</p>
					) : (
						<ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
							{visible.map((a) => {
								const Icon = a.icon;
								const n = counts.get(a.id) ?? 0;
								return (
									<li key={a.id}>
										<button
											type="button"
											onClick={() => addPreset(a.id)}
											className={cn(
												"group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-primary/60 hover:bg-primary/5",
												n > 0 && "border-primary/50 bg-primary/5"
											)}>
											<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/80">
												<Icon className="size-5" aria-hidden />
											</span>
											<span className="min-w-0 flex-1">
												<span className="block truncate text-sm font-medium">
													{a.name}
												</span>
												<span className="block text-xs text-muted-foreground">
													~{formatNumber(typicalMonthlyKwh(a), "en-US", 0)} kWh a
													month
												</span>
											</span>
											<span
												className={cn(
													"flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
													n > 0
														? "bg-primary text-white"
														: "text-muted-foreground group-hover:text-primary"
												)}
												aria-label={n > 0 ? `${n} added` : "Add"}>
												{n > 0 ? (
													n > 1 ? (
														n
													) : (
														<Check className="size-3.5" />
													)
												) : (
													<Plus className="size-4" />
												)}
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</div>

				<div className="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
					<Button
						variant="outline"
						onClick={() => {
							addCustom();
							setOpen(false);
						}}>
						<CUSTOM_ICON aria-hidden /> Something else? Add a custom appliance
					</Button>
					<Button onClick={() => setOpen(false)}>
						Done{items.length > 0 && ` (${items.length} in your list)`}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
