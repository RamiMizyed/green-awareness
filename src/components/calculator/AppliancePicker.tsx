"use client";

import { useMemo, useState } from "react";
import { Check, LayoutGrid, Plus, Search } from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
	APPLIANCES,
	CATEGORIES,
	CATEGORY_THEME,
	CUSTOM_ICON,
	CUSTOM_TILE,
	type ApplianceSpec,
	type Category,
} from "@/lib/data/appliances";
import { formatNumber, kwhPerYear } from "@/lib/calc";
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
import { IconTile } from "./ui";
import { fill, specName, useT } from "@/lib/i18n";
import type { Dict } from "@/lib/i18n/en";

/** Typical monthly use of a preset, shown on each tile. */
const typicalMonthlyKwh = (spec: ApplianceSpec) =>
	kwhPerYear({ ...spec, specId: spec.id }) / 12;

export function AppliancePicker({ trigger }: { trigger: React.ReactNode }) {
	const t = useT();
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

	const q = query.trim().toLocaleLowerCase();
	// Search matches the current language and English, so "fridge" always works.
	const visible = APPLIANCES.filter(
		(a) =>
			(q ? true : category === "all" || a.category === category) &&
			(!q ||
				specName(t, a.id, a.name).toLocaleLowerCase().includes(q) ||
				a.name.toLowerCase().includes(q))
	);

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				setOpen(o);
				if (!o) setQuery("");
			}}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="flex h-[min(820px,92svh)] flex-col gap-0 rounded-3xl p-0 sm:max-w-4xl max-sm:h-svh max-sm:max-w-none max-sm:rounded-none max-sm:border-0">
				<DialogHeader className="border-b p-4 pe-12 text-start sm:p-6">
					<DialogTitle className="text-2xl">{t.picker.title}</DialogTitle>
					<DialogDescription className="text-base max-sm:sr-only">
						{t.picker.text}
					</DialogDescription>
					<div className="relative mt-2 sm:mt-4">
						<Search
							className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
							aria-hidden
						/>
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder={t.picker.search}
							aria-label={t.picker.searchLabel}
							className="h-12 w-full rounded-xl border border-input bg-card ps-12 pe-4 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
						/>
					</div>
				</DialogHeader>

				<div className="flex min-h-0 flex-1 flex-col sm:flex-row">
					{/* Categories: a scrolling row on phones, a sidebar on larger screens */}
					<nav
						aria-label={t.picker.categories}
						className={cn(
							"flex shrink-0 gap-2 overflow-x-auto border-b p-3 sm:w-56 sm:flex-col sm:overflow-y-auto sm:border-b-0 sm:border-e sm:p-4",
							q && "pointer-events-none opacity-40"
						)}>
						{[{ id: "all" as const }, ...CATEGORIES].map((c) => {
							const Icon = c.id === "all" ? LayoutGrid : CATEGORY_THEME[c.id].icon;
							const active = category === c.id;
							return (
								<button
									key={c.id}
									type="button"
									aria-pressed={active}
									onClick={() => setCategory(c.id)}
									className={cn(
										"flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm font-semibold transition-colors",
										active
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:bg-muted hover:text-foreground"
									)}>
									<Icon className="size-5 shrink-0" aria-hidden />
									{c.id === "all" ? t.picker.everything : t.categories[c.id]}
								</button>
							);
						})}
					</nav>

					<div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
						{visible.length === 0 ? (
							<div className="flex flex-col items-center gap-4 py-12 text-center">
								<p className="text-base text-muted-foreground">
									{fill(t.picker.noMatch, { query })}
								</p>
								<Button
									variant="outline"
									onClick={() => {
										addCustom(query.trim());
										setOpen(false);
									}}>
									<Plus aria-hidden /> {fill(t.picker.addAsOwn, { query })}
								</Button>
							</div>
						) : (
							<ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
								{visible.map((a) => (
									<li key={a.id}>
										<Tile t={t} spec={a} count={counts.get(a.id) ?? 0} onAdd={() => addPreset(a.id)} />
									</li>
								))}
							</ul>
						)}
					</div>
				</div>

				<div className="flex items-center justify-between gap-2 border-t p-3 sm:p-4 sm:px-6">
					<Button
						variant="ghost"
						onClick={() => {
							addCustom();
							setOpen(false);
						}}>
						<IconTile icon={CUSTOM_ICON} tone={CUSTOM_TILE} size="sm" className="size-8 [&>svg]:size-4" />
						<span className="max-sm:sr-only">{t.picker.somethingElse}</span>
						<span className="sm:hidden" aria-hidden>
							{t.picker.other}
						</span>
					</Button>
					<Button size="lg" onClick={() => setOpen(false)}>
						<Check aria-hidden />
						{t.picker.done}
						{items.length > 0 && (
							<span className="max-sm:hidden">{t.picker.inHome(items.length)}</span>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function Tile({
	t,
	spec,
	count,
	onAdd,
}: {
	t: Dict;
	spec: ApplianceSpec;
	count: number;
	onAdd: () => void;
}) {
	const theme = CATEGORY_THEME[spec.category];
	const added = count > 0;
	const name = specName(t, spec.id, spec.name);
	return (
		<button
			type="button"
			onClick={onAdd}
			aria-label={`${fill(t.picker.addLabel, { name })}${added ? `, ${t.picker.added(count)}` : ""}`}
			className={cn(
				"relative flex h-full w-full flex-col items-center gap-3 rounded-2xl border-2 p-4 text-center transition-colors",
				added
					? "border-primary bg-primary/5"
					: "border-border hover:border-primary/50 hover:bg-muted/60"
			)}>
			<IconTile icon={spec.icon} tone={theme.tile} size="lg" />
			<span className="text-base font-semibold leading-snug">{name}</span>
			<span className="mt-auto text-sm text-muted-foreground">
				{fill(t.picker.typical, { kwh: formatNumber(typicalMonthlyKwh(spec), "en-US", 0) })}
			</span>
			<span
				className={cn(
					"absolute end-2.5 top-2.5 flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-bold",
					added ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
				)}
				aria-hidden>
				{added ? count > 1 ? `×${count}` : <Check className="size-4" strokeWidth={3} /> : <Plus className="size-4" strokeWidth={3} />}
			</span>
		</button>
	);
}
