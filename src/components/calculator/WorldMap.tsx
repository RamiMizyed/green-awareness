"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { EU_MEMBERS, REGIONS, type Region } from "@/lib/data/regions";
import { formatMoney } from "@/lib/calc";
import { regionName, useLang, useT } from "@/lib/i18n";
import { Flag } from "./Flag";

const WIDTH = 960;
const HEIGHT = 470;
const ANTARCTICA = "010";

/** Grid intensity (kg/kWh) to colour: green when clean, amber, then red. */
const STOPS: [number, [number, number, number]][] = [
	[0.03, [16, 185, 129]],
	[0.3, [234, 179, 8]],
	[0.72, [220, 38, 38]],
];
export function intensityColor(v: number) {
	if (v <= STOPS[0][0]) return `rgb(${STOPS[0][1].join(",")})`;
	for (let i = 1; i < STOPS.length; i++) {
		const [x1, c1] = STOPS[i];
		const [x0, c0] = STOPS[i - 1];
		if (v <= x1) {
			const k = (v - x0) / (x1 - x0);
			return `rgb(${c0.map((c, j) => Math.round(c + (c1[j] - c) * k)).join(",")})`;
		}
	}
	return `rgb(${STOPS[STOPS.length - 1][1].join(",")})`;
}

const BY_ISO = new Map(REGIONS.filter((r) => r.iso).map((r) => [r.iso!, r]));

type CountryFeature = Feature<Geometry, { name: string }> & { id?: string | number };

export function WorldMap({
	selectedId,
	onSelect,
}: {
	selectedId: string;
	onSelect: (regionId: string) => void;
}) {
	const t = useT();
	const lang = useLang();
	const [countries, setCountries] = useState<CountryFeature[] | null>(null);
	const [hover, setHover] = useState<{ region: Region; x: number; y: number } | null>(null);
	const boxRef = useRef<HTMLDivElement>(null);

	// ~100 KB of map data, fetched only when the calculator loads.
	useEffect(() => {
		let alive = true;
		import("world-atlas/countries-110m.json").then((m) => {
			const topo = m.default as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
			const fc = feature(topo, topo.objects.countries) as FeatureCollection<Geometry, { name: string }>;
			if (alive) setCountries(fc.features.filter((f) => String(f.id) !== ANTARCTICA) as CountryFeature[]);
		});
		return () => {
			alive = false;
		};
	}, []);

	const paths = useMemo(() => {
		if (!countries) return [];
		const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], {
			type: "FeatureCollection",
			features: countries,
		});
		const path = geoPath(projection);
		return countries.map((f) => ({ id: String(f.id ?? f.properties.name), d: path(f) ?? "" }));
	}, [countries]);

	const isSelected = (iso: string) =>
		selectedId === "eu" ? EU_MEMBERS.has(iso) : BY_ISO.get(iso)?.id === selectedId;

	const showTip = (region: Region, e: React.PointerEvent | React.FocusEvent) => {
		const box = boxRef.current?.getBoundingClientRect();
		if (!box) return;
		const target = (e.target as SVGPathElement).getBoundingClientRect();
		const x = "clientX" in e ? e.clientX : target.left + target.width / 2;
		const y = "clientY" in e ? e.clientY : target.top;
		setHover({ region, x: x - box.left, y: y - box.top });
	};

	return (
		<div ref={boxRef} className="relative" onPointerLeave={() => setHover(null)}>
			<svg
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				className="h-auto w-full"
				role="group"
				aria-label={t.map.mapLabel}>
				{!countries && (
					<rect width={WIDTH} height={HEIGHT} rx={24} className="animate-pulse fill-muted" />
				)}
				{paths.map(({ id, d }) => {
					const region = BY_ISO.get(id);
					const selected = isSelected(id);
					if (!region) {
						return (
							<path
								key={id}
								d={d}
								className={selected ? "fill-primary/60 stroke-card" : "fill-muted-foreground/15 stroke-card"}
								strokeWidth={0.6}
							/>
						);
					}
					const name = regionName(t, lang, region.id, region.name);
					return (
						<path
							key={id}
							d={d}
							role="button"
							tabIndex={0}
							aria-label={name}
							aria-pressed={selected}
							fill={intensityColor(region.intensity)}
							className="cursor-pointer outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80"
							stroke={selected ? "var(--foreground)" : "var(--card)"}
							strokeWidth={selected ? 2.5 : 0.6}
							onClick={() => onSelect(region.id)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onSelect(region.id);
								}
							}}
							onPointerMove={(e) => e.pointerType === "mouse" && showTip(region, e)}
							onFocus={(e) => showTip(region, e)}
							onBlur={() => setHover(null)}
						/>
					);
				})}
			</svg>

			{hover && (
				<div
					className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-full rounded-2xl border bg-popover p-3 text-sm shadow-lg"
					style={{
						left: Math.min(Math.max(hover.x, 112), (boxRef.current?.clientWidth ?? 0) - 112),
						top: hover.y - 12,
					}}>
					<div className="flex items-center gap-2 font-semibold">
						<Flag regionId={hover.region.id} className="text-lg" />
						<span className="truncate">
							{regionName(t, lang, hover.region.id, hover.region.name)}
						</span>
					</div>
					<div className="mt-2 flex justify-between gap-3 text-muted-foreground">
						<span>{t.map.price}</span>
						<span className="font-semibold text-foreground tabular-nums">
							{formatMoney(hover.region.price, hover.region.currency, hover.region.locale)}
						</span>
					</div>
					<div className="mt-1 flex justify-between gap-3 text-muted-foreground">
						<span>{t.map.co2}</span>
						<span className="flex items-center gap-1.5 font-semibold text-foreground tabular-nums">
							<span
								className="size-2.5 rounded-full"
								style={{ background: intensityColor(hover.region.intensity) }}
							/>
							{hover.region.intensity} kg
						</span>
					</div>
				</div>
			)}

			<div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground" aria-hidden>
				<span>{t.map.cleaner}</span>
				<span
					className="h-2 flex-1 rounded-full rtl:rotate-180"
					style={{
						background: `linear-gradient(to right, ${intensityColor(0.03)}, ${intensityColor(0.3)}, ${intensityColor(0.72)})`,
					}}
				/>
				<span>{t.map.dirtier}</span>
			</div>
		</div>
	);
}
