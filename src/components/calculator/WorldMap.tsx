"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { Globe2, LocateFixed, Minus, Plus } from "lucide-react";
import { EU_MEMBERS, REGIONS, type Region } from "@/lib/data/regions";
import { formatMoney } from "@/lib/calc";
import { regionName, useLang, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Flag } from "./Flag";

const WIDTH = 960;
const HEIGHT = 470;
const ANTARCTICA = "010";
const MAX_ZOOM = 20;
/** Past this zoom the detailed map (with small countries) is shown. */
const DETAIL_ZOOM = 2;

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

/** Quick-zoom areas as [west, south, east, north] in degrees. */
const AREAS = {
	europe: [-25, 34, 45, 71],
	middleEast: [25, 12, 63, 42],
	asia: [60, -10, 150, 55],
	africa: [-20, -36, 52, 38],
	americas: [-170, -56, -30, 72],
	oceania: [110, -48, 180, 0],
} as const;
type Area = keyof typeof AREAS;

type CountryFeature = Feature<Geometry, { name: string }> & { id?: string | number };
type Topo = Topology<{ countries: GeometryCollection<{ name: string }> }>;
type View = { k: number; x: number; y: number };
type Bounds = [[number, number], [number, number]];

const toFeatures = (topo: Topo) =>
	(feature(topo, topo.objects.countries) as FeatureCollection<Geometry, { name: string }>).features.filter(
		(f) => String(f.id) !== ANTARCTICA
	) as CountryFeature[];

/** Keeps the map covering the frame, so it can't be dragged off screen. */
function clampView({ k, x, y }: View): View {
	const kk = Math.min(MAX_ZOOM, Math.max(1, k));
	return {
		k: kk,
		x: Math.min(0, Math.max(WIDTH * (1 - kk), x)),
		y: Math.min(0, Math.max(HEIGHT * (1 - kk), y)),
	};
}

export function WorldMap({
	selectedId,
	onSelect,
}: {
	selectedId: string;
	onSelect: (regionId: string) => void;
}) {
	const t = useT();
	const lang = useLang();
	const [coarse, setCoarse] = useState<CountryFeature[] | null>(null);
	const [detail, setDetail] = useState<CountryFeature[] | null>(null);
	const [view, setView] = useState<View>({ k: 1, x: 0, y: 0 });
	// Latest view for gesture handlers, updated as soon as it changes.
	const viewRef = useRef<View>(view);
	const [animate, setAnimate] = useState(false);
	const [hover, setHover] = useState<{ region: Region; x: number; y: number } | null>(null);
	const boxRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const projectionRef = useRef<GeoProjection | null>(null);
	const loadingDetail = useRef(false);
	// Set while dragging so the pointer-up doesn't also count as a click.
	const dragged = useRef(false);

	// ~100 KB world outline, fetched when the calculator loads.
	useEffect(() => {
		let alive = true;
		import("world-atlas/countries-110m.json").then((m) => {
			if (alive) setCoarse(toFeatures(m.default as unknown as Topo));
		});
		return () => {
			alive = false;
		};
	}, []);

	// The detailed map (~240 KB) only loads once someone zooms in.
	useEffect(() => {
		if (view.k < DETAIL_ZOOM || detail || loadingDetail.current) return;
		loadingDetail.current = true;
		import("world-atlas/countries-50m.json").then((m) => setDetail(toFeatures(m.default as unknown as Topo)));
	}, [view.k, detail]);

	// One projection, fitted to the coarse map, shared by both detail levels.
	const path = useMemo(() => {
		if (!coarse) return null;
		const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], {
			type: "FeatureCollection",
			features: coarse,
		});
		projectionRef.current = projection;
		return geoPath(projection);
	}, [coarse]);

	const features = view.k >= DETAIL_ZOOM && detail ? detail : coarse;
	const paths = useMemo(() => {
		if (!features || !path) return [];
		// Some codes repeat (a country and its territories), so keys add the index.
		return features.map((f, i) => ({ key: `${f.id}-${i}`, id: String(f.id ?? f.properties.name), d: path(f) ?? "" }));
	}, [features, path]);

	const isSelected = (iso: string) =>
		selectedId === "eu" ? EU_MEMBERS.has(iso) : BY_ISO.get(iso)?.id === selectedId;

	// --- View changes ------------------------------------------------------------

	const reducedMotion = () =>
		typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/** Button-driven moves glide; gestures follow the finger directly. */
	const go = useCallback((next: View, smooth: boolean) => {
		const v = clampView(next);
		viewRef.current = v;
		setAnimate(smooth && !reducedMotion());
		setView(v);
	}, []);

	/** Zooms by `factor` keeping the SVG point (cx, cy) under the cursor. */
	const zoomAt = useCallback(
		(factor: number, cx: number, cy: number, smooth: boolean) => {
			const v = viewRef.current;
			const k = Math.min(MAX_ZOOM, Math.max(1, v.k * factor));
			go({ k, x: cx - ((cx - v.x) * k) / v.k, y: cy - ((cy - v.y) * k) / v.k }, smooth);
		},
		[go]
	);

	const fitBounds = useCallback(
		([[x0, y0], [x1, y1]]: Bounds, padding = 0.85) => {
			const k = Math.min(MAX_ZOOM, Math.max(1, padding * Math.min(WIDTH / (x1 - x0 || 1), HEIGHT / (y1 - y0 || 1))));
			go({ k, x: WIDTH / 2 - (k * (x0 + x1)) / 2, y: HEIGHT / 2 - (k * (y0 + y1)) / 2 }, true);
		},
		[go]
	);

	const zoomToArea = (area: Area) => {
		const projection = projectionRef.current;
		if (!projection) return;
		const [w, s, e, n] = AREAS[area];
		// Sample the edges: meridians and parallels curve in this projection.
		const pts: [number, number][] = [];
		for (let i = 0; i <= 8; i++) {
			const lon = w + ((e - w) * i) / 8;
			const lat = s + ((n - s) * i) / 8;
			pts.push([lon, s], [lon, n], [w, lat], [e, lat]);
		}
		const xy = pts.map((p) => projection(p)).filter((p): p is [number, number] => !!p);
		fitBounds([
			[Math.min(...xy.map((p) => p[0])), Math.min(...xy.map((p) => p[1]))],
			[Math.max(...xy.map((p) => p[0])), Math.max(...xy.map((p) => p[1]))],
		]);
	};

	const zoomToSelected = () => {
		if (!path) return;
		if (selectedId === "eu") return zoomToArea("europe");
		if (selectedId === "world") return go({ k: 1, x: 0, y: 0 }, true);
		const region = REGIONS.find((r) => r.id === selectedId);
		const f = (detail ?? coarse)?.find((c) => String(c.id) === region?.iso);
		if (!f) return;
		// Tiny countries get a sensible frame rather than a 20x zoom on a dot.
		const [[x0, y0], [x1, y1]] = path.bounds(f);
		const minSize = 40;
		const cx = (x0 + x1) / 2;
		const cy = (y0 + y1) / 2;
		const hw = Math.max(x1 - x0, minSize) / 2;
		const hh = Math.max(y1 - y0, minSize / 2) / 2;
		fitBounds([[cx - hw, cy - hh], [cx + hw, cy + hh]], 0.6);
	};

	// --- Gestures ------------------------------------------------------------------

	/** Client pixel position to SVG units (accounts for letterboxing on phones). */
	const toSvg = (clientX: number, clientY: number) => {
		const ctm = svgRef.current?.getScreenCTM();
		if (!ctm) return [WIDTH / 2, HEIGHT / 2] as const;
		const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
		return [p.x, p.y] as const;
	};

	const pointers = useRef(new Map<number, { x: number; y: number }>());
	const gesture = useRef<{ view: View; dist?: number; mid?: readonly [number, number]; start: readonly [number, number] } | null>(null);

	const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
		if (e.pointerType === "mouse" && e.button !== 0) return;
		pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
		dragged.current = false;
		startGesture();

		const move = (ev: PointerEvent) => {
			if (!pointers.current.has(ev.pointerId)) return;
			pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
			const g = gesture.current;
			if (!g) return;
			const pts = [...pointers.current.values()];
			if (pts.length >= 2 && g.dist && g.mid) {
				// Pinch: scale around the fingers' midpoint and follow it.
				const [a, b] = pts;
				const dist = Math.hypot(a.x - b.x, a.y - b.y);
				const mid = toSvg((a.x + b.x) / 2, (a.y + b.y) / 2);
				const k = Math.min(MAX_ZOOM, Math.max(1, (g.view.k * dist) / g.dist));
				const [sx, sy] = g.mid;
				dragged.current = true;
				go({ k, x: mid[0] - ((sx - g.view.x) * k) / g.view.k, y: mid[1] - ((sy - g.view.y) * k) / g.view.k }, false);
			} else if (pts.length === 1) {
				const [px, py] = toSvg(pts[0].x, pts[0].y);
				const dx = px - g.start[0];
				const dy = py - g.start[1];
				if (!dragged.current && Math.hypot(dx, dy) < 4) return;
				dragged.current = true;
				setHover(null);
				go({ k: g.view.k, x: g.view.x + dx, y: g.view.y + dy }, false);
			}
		};
		const up = (ev: PointerEvent) => {
			pointers.current.delete(ev.pointerId);
			if (pointers.current.size === 0) {
				gesture.current = null;
				window.removeEventListener("pointermove", move);
				window.removeEventListener("pointerup", up);
				window.removeEventListener("pointercancel", up);
			} else startGesture();
		};
		if (pointers.current.size === 1) {
			window.addEventListener("pointermove", move);
			window.addEventListener("pointerup", up);
			window.addEventListener("pointercancel", up);
		}
	};

	/** Records where a pan or pinch began, relative to the current view. */
	const startGesture = () => {
		const pts = [...pointers.current.values()];
		const v = viewRef.current;
		if (pts.length >= 2) {
			const [a, b] = pts;
			gesture.current = {
				view: v,
				dist: Math.hypot(a.x - b.x, a.y - b.y),
				mid: toSvg((a.x + b.x) / 2, (a.y + b.y) / 2),
				start: toSvg(a.x, a.y),
			};
		} else if (pts.length === 1) {
			gesture.current = { view: v, start: toSvg(pts[0].x, pts[0].y) };
		}
	};

	// Ctrl/⌘ + wheel zooms; a plain wheel keeps scrolling the page.
	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;
		const onWheel = (e: WheelEvent) => {
			if (!e.ctrlKey && !e.metaKey) return;
			e.preventDefault();
			const ctm = svg.getScreenCTM();
			if (!ctm) return;
			const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
			zoomAt(Math.exp(-e.deltaY * 0.0025), p.x, p.y, false);
		};
		svg.addEventListener("wheel", onWheel, { passive: false });
		return () => svg.removeEventListener("wheel", onWheel);
	}, [zoomAt, coarse]);

	const showTip = (region: Region, e: React.PointerEvent) => {
		if (pointers.current.size > 0) return;
		const box = boxRef.current?.getBoundingClientRect();
		if (box) setHover({ region, x: e.clientX - box.left, y: e.clientY - box.top });
	};

	const zoomed = view.k > 1.01;

	return (
		<div>
			{/* Quick zoom to a part of the world. */}
			<div className="mb-3 flex flex-wrap gap-2">
				{(Object.keys(AREAS) as Area[]).map((area) => (
					<button
						key={area}
						type="button"
						tabIndex={-1}
						onClick={() => zoomToArea(area)}
						className="shrink-0 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/5">
						{t.map.areas[area]}
					</button>
				))}
			</div>

			<div
				ref={boxRef}
				className="relative overflow-hidden rounded-2xl bg-muted/40 max-sm:aspect-[4/3]"
				onPointerLeave={() => setHover(null)}>
				{/* Pointer-only shortcut; keyboard and screen-reader users get the
				    country list below, which offers the same choices. */}
				<svg
					ref={svgRef}
					viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
					className={cn(
						"block h-auto w-full select-none max-sm:h-full",
						zoomed ? "cursor-grab active:cursor-grabbing" : ""
					)}
					style={{ touchAction: zoomed ? "none" : "pan-y" }}
					aria-hidden
					onPointerDown={onPointerDown}
					onDoubleClick={(e) => {
						const [cx, cy] = toSvg(e.clientX, e.clientY);
						zoomAt(2, cx, cy, true);
					}}>
					{!coarse && <rect width={WIDTH} height={HEIGHT} className="animate-pulse fill-muted" />}
					<g
						style={{
							transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
							transformOrigin: "0 0",
							transition: animate ? "transform 450ms cubic-bezier(0.22, 1, 0.36, 1)" : undefined,
						}}
						onTransitionEnd={() => setAnimate(false)}>
						{paths.map(({ key, id, d }) => {
							const region = BY_ISO.get(id);
							const selected = isSelected(id);
							if (!region) {
								return (
									<path
										key={key}
										d={d}
										className={selected ? "fill-primary/60 stroke-card" : "fill-muted-foreground/15 stroke-card"}
										strokeWidth={0.6}
										vectorEffect="non-scaling-stroke"
									/>
								);
							}
							return (
								<path
									key={key}
									d={d}
									data-region={region.id}
									fill={intensityColor(region.intensity)}
									className="cursor-pointer outline-none transition-opacity hover:opacity-80"
									stroke={selected ? "var(--foreground)" : "var(--card)"}
									strokeWidth={selected ? 2.5 : 0.6}
									vectorEffect="non-scaling-stroke"
									onClick={() => {
										if (!dragged.current) onSelect(region.id);
									}}
									onPointerMove={(e) => e.pointerType === "mouse" && showTip(region, e)}
								/>
							);
						})}
					</g>
				</svg>

				{/* Zoom controls */}
				<div className="absolute end-2 top-2 flex divide-x overflow-hidden rounded-xl border bg-card/95 shadow-sm backdrop-blur sm:flex-col sm:divide-x-0 sm:divide-y rtl:divide-x-reverse">
					<MapButton label={t.map.zoomIn} onClick={() => zoomAt(2, WIDTH / 2, HEIGHT / 2, true)} disabled={view.k >= MAX_ZOOM}>
						<Plus className="size-5" />
					</MapButton>
					<MapButton label={t.map.zoomOut} onClick={() => zoomAt(0.5, WIDTH / 2, HEIGHT / 2, true)} disabled={!zoomed}>
						<Minus className="size-5" />
					</MapButton>
					<MapButton label={t.map.reset} onClick={() => go({ k: 1, x: 0, y: 0 }, true)} disabled={!zoomed}>
						<Globe2 className="size-5" />
					</MapButton>
				</div>
				<button
					type="button"
					tabIndex={-1}
					onClick={zoomToSelected}
					className="absolute bottom-2 end-2 inline-flex h-10 items-center gap-2 rounded-xl border bg-card/95 px-3 text-sm font-semibold shadow-sm backdrop-blur transition-colors hover:bg-muted">
					<LocateFixed className="size-4 text-primary" aria-hidden />
					{t.map.myCountry}
				</button>

				{hover && (
					<div
						className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-full rounded-2xl border bg-popover p-3 text-sm shadow-lg"
						style={{
							left: Math.min(Math.max(hover.x, 112), (boxRef.current?.clientWidth ?? 0) - 112),
							top: hover.y - 12,
						}}>
						<div className="flex items-center gap-2 font-semibold">
							<Flag regionId={hover.region.id} className="text-lg" />
							<span className="truncate">{regionName(t, lang, hover.region.id, hover.region.name)}</span>
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
								<span className="size-2.5 rounded-full" style={{ background: intensityColor(hover.region.intensity) }} />
								{hover.region.intensity} kg
							</span>
						</div>
					</div>
				)}
			</div>

			<p className="mt-2 text-xs text-muted-foreground">{t.map.gestures}</p>

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

function MapButton({
	label,
	children,
	...props
}: React.ComponentProps<"button"> & { label: string }) {
	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			tabIndex={-1}
			className="flex size-10 items-center justify-center text-foreground/80 transition-colors hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
			{...props}>
			{children}
		</button>
	);
}
