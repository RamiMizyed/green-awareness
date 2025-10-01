"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Tv,
	Refrigerator,
	Lightbulb,
	Microwave,
	WashingMachine,
	Wind,
	Sun,
	Droplets,
	Flame,
	Leaf,
	Zap,
	Loader2,
	AlertCircle,
	TrendingUp,
	Laptop,
	Monitor,
	Gamepad,
	Fan,
	Coffee,
	UtensilsCrossed,
	Plus,
	Trash2,
	Download,
	Settings,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/** -----------------------
 * Types & Data
 * ------------------------*/
interface Appliance {
	name: string;
	wattage: number;
	icon: React.ReactElement;
}

const APPLIANCE_DATA: Record<string, Appliance> = {
	television: {
		name: "Television (LED, 40-50 inch)",
		wattage: 80,
		icon: <Tv className="w-6 h-6" />,
	},
	refrigerator: {
		name: "Refrigerator (standard 18-20 cu ft)",
		wattage: 150,
		icon: <Refrigerator className="w-6 h-6" />,
	},
	lightbulb_incandescent: {
		name: "Incandescent Bulb (60W)",
		wattage: 60,
		icon: <Lightbulb className="w-6 h-6" />,
	},
	lightbulb_led: {
		name: "LED Bulb (equivalent to 60W incandescent)",
		wattage: 9,
		icon: <Lightbulb className="w-6 h-6 text-green-400" />,
	},
	microwave: {
		name: "Microwave Oven",
		wattage: 1000,
		icon: <Microwave className="w-6 h-6" />,
	},
	washing_machine: {
		name: "Washing Machine",
		wattage: 500,
		icon: <WashingMachine className="w-6 h-6" />,
	},
	laptop: {
		name: "Laptop Computer",
		wattage: 60,
		icon: <Laptop className="w-6 h-6" />,
	},
	desktop: {
		name: "Desktop Computer",
		wattage: 300,
		icon: <Monitor className="w-6 h-6" />,
	},
	game_console: {
		name: "Game Console (e.g., PS5/Xbox)",
		wattage: 150,
		icon: <Gamepad className="w-6 h-6" />,
	},
	fan: {
		name: "Ceiling or Box Fan",
		wattage: 75,
		icon: <Fan className="w-6 h-6" />,
	},
	ac: {
		name: "Air Conditioner (window unit, 8000 BTU)",
		wattage: 1000,
		icon: <Wind className="w-6 h-6" />,
	},
	heater: {
		name: "Space Heater",
		wattage: 1500,
		icon: <Flame className="w-6 h-6 text-orange-500" />,
	},
	coffee_maker: {
		name: "Coffee Maker",
		wattage: 900,
		icon: <Coffee className="w-6 h-6" />,
	},
	dishwasher: {
		name: "Dishwasher",
		wattage: 1400,
		icon: <UtensilsCrossed className="w-6 h-6" />,
	},
	// ...add more if you like
};

type ApplianceKey = keyof typeof APPLIANCE_DATA | "custom";

interface CartItem {
	id: string;
	key: ApplianceKey;
	name: string;
	wattage: number;
	hoursPerDay: number;
	qty: number;
}

interface Settings {
	pricePerKwh: number;
	currency: string;
	emissionFactor: number; // kg CO2e per kWh (editable)
	useClimatiq: boolean;
	regionPreset: string;
}

/** -----------------------
 * Localstorage keys
 * ------------------------*/
const LS_KEYS = {
	CART: "ga_cart_v1",
	SETTINGS: "ga_settings_v1",
};

/** -----------------------
 * Defaults
 * ------------------------*/
const DEFAULT_SETTINGS: Settings = {
	pricePerKwh: 0.17,
	currency: "$",
	emissionFactor: 0.417, // default editable value (kg CO2e / kWh)
	useClimatiq: false,
	regionPreset: "0.417", // Storing value not label
};

const REGION_PRESETS: { label: string; value: number }[] = [
	{ label: "US average", value: 0.417 },
	{ label: "EU average", value: 0.253 },
	{ label: "Turkey", value: 0.38 },
	{ label: "Global average", value: 0.475 },
];

/** -----------------------
 * Main Component
 * ------------------------*/
export default function GreenAwarenessPage() {
	// cart of appliances
	const [cart, setCart] = useState<CartItem[]>(() => {
		try {
			const raw = localStorage.getItem(LS_KEYS.CART);
			if (raw) return JSON.parse(raw) as CartItem[];
		} catch (e) {
			// ignore
		}
		// seed with one example item
		return [
			{
				id: uuidv4(),
				key: "television",
				name: APPLIANCE_DATA.television.name,
				wattage: APPLIANCE_DATA.television.wattage,
				hoursPerDay: 4,
				qty: 1,
			},
		];
	});

	const [settings, setSettings] = useState<Settings>(() => {
		try {
			const raw = localStorage.getItem(LS_KEYS.SETTINGS);
			if (raw) return JSON.parse(raw) as Settings;
		} catch (e) {
			// ignore
		}
		return DEFAULT_SETTINGS;
	});

	const [selectedApplianceKey, setSelectedApplianceKey] =
		useState<ApplianceKey>("television");
	const [customName, setCustomName] = useState("");
	const [customWattage, setCustomWattage] = useState<number | "">("");
	const [addingHours, setAddingHours] = useState<number | "">(1);
	const [addingQty, setAddingQty] = useState<number>(1);
	const [loadingClimatiq, setLoadingClimatiq] = useState(false);
	const [climatiqResultKg, setClimatiqResultKg] = useState<number | null>(null);
	const [error, setError] = useState<string>("");

	// Persist cart + settings to localStorage
	useEffect(() => {
		try {
			localStorage.setItem(LS_KEYS.CART, JSON.stringify(cart));
		} catch (e) {
			return;
		}
	}, [cart]);

	useEffect(() => {
		try {
			localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(settings));
		} catch (e) {
			return;
		}
	}, [settings]);

	/** -----------------------
	 * Derived Totals
	 * ------------------------*/
	// total kWh per day
	const totalKwhPerDay = useMemo(() => {
		return cart.reduce(
			(acc, it) => acc + (it.wattage * it.hoursPerDay * it.qty) / 1000,
			0
		);
	}, [cart]);

	const totalCostPerDay = useMemo(
		() => totalKwhPerDay * settings.pricePerKwh,
		[totalKwhPerDay, settings.pricePerKwh]
	);

	const totals = useMemo(() => {
		return {
			kwh: {
				day: totalKwhPerDay,
				month: totalKwhPerDay * 30,
				year: totalKwhPerDay * 365,
			},
			cost: {
				day: totalCostPerDay,
				month: totalCostPerDay * 30,
				year: totalCostPerDay * 365,
			},
			co2: {
				// local calculation using emissionFactor
				day: totalKwhPerDay * settings.emissionFactor,
				month: totalKwhPerDay * 30 * settings.emissionFactor,
				year: totalKwhPerDay * 365 * settings.emissionFactor,
			},
		};
	}, [totalKwhPerDay, totalCostPerDay, settings.emissionFactor]);

	/** -----------------------
	 * Items manipulation
	 * ------------------------*/
	const addItemToCart = () => {
		setError("");
		const isCustom = selectedApplianceKey === "custom";
		const name = isCustom
			? customName || "Custom appliance"
			: APPLIANCE_DATA[selectedApplianceKey].name;
		const watt = isCustom
			? Number(customWattage || 0)
			: APPLIANCE_DATA[selectedApplianceKey].wattage;
		const hours = Number(addingHours || 0);
		const qty = Number(addingQty || 1);

		if (!name || watt <= 0 || hours < 0 || qty <= 0) {
			setError(
				"Please provide a valid name, wattage (>0), hours and quantity."
			);
			return;
		}

		setCart((c) => [
			...c,
			{
				id: uuidv4(),
				key: selectedApplianceKey,
				name,
				wattage: watt,
				hoursPerDay: hours,
				qty,
			},
		]);

		// reset input fields
		setCustomName("");
		setCustomWattage("");
		setAddingHours(1);
		setAddingQty(1);
		setSelectedApplianceKey("television");
	};

	const updateCartItem = (id: string, patch: Partial<CartItem>) => {
		setCart((c) => c.map((it) => (it.id === id ? { ...it, ...patch } : it)));
	};

	const removeCartItem = (id: string) => {
		setCart((c) => c.filter((it) => it.id !== id));
	};

	const clearCart = () => setCart([]);

	/** -----------------------
	 * CSV Export
	 * ------------------------*/
	const exportCsv = () => {
		const header = [
			"name",
			"wattage_w",
			"hours_per_day",
			"quantity",
			"kwh_per_day",
			"cost_per_day",
		];
		const rows = cart.map((it) => {
			const kwh = (it.wattage * it.hoursPerDay * it.qty) / 1000;
			const cost = kwh * settings.pricePerKwh;
			return [
				it.name,
				it.wattage,
				it.hoursPerDay,
				it.qty,
				kwh.toFixed(3),
				cost.toFixed(3),
			].join(",");
		});

		const summary = [
			`total_kwh_day,${totals.kwh.day.toFixed(3)}`,
			`total_kwh_month,${totals.kwh.month.toFixed(3)}`,
			`total_kwh_year,${totals.kwh.year.toFixed(3)}`,
			`total_cost_day,${totals.cost.day.toFixed(2)}`,
			`total_cost_month,${totals.cost.month.toFixed(2)}`,
			`total_cost_year,${totals.cost.year.toFixed(2)}`,
			`co2_kg_day,${totals.co2.day.toFixed(3)}`,
			`co2_kg_year,${totals.co2.year.toFixed(3)}`,
		];

		const csv = [header.join(","), ...rows, "", ...summary].join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `green-awareness-export-${new Date().toISOString()}.csv`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};

	/** -----------------------
	 * Optional Climatiq integration (annual)
	 * ------------------------*/
	const estimateWithClimatiq = async () => {
		setError("");
		setClimatiqResultKg(null);

		// check for env var
		const apiKey = (process.env.NEXT_PUBLIC_CLIMATIQ_API_KEY || "").trim();
		if (!apiKey) {
			setError(
				"Climatiq API key not configured. Set NEXT_PUBLIC_CLIMATIQ_API_KEY in your environment."
			);
			return;
		}

		const energyKwhYear = totals.kwh.year;
		if (!energyKwhYear || energyKwhYear <= 0) {
			setError("No energy usage to estimate. Add some appliances first.");
			return;
		}

		setLoadingClimatiq(true);
		try {
			const resp = await fetch("https://api.climatiq.io/data/v1/estimate", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					emission_factor: {
						activity_id: "electricity-supply_grid-source_supplier_mix",
						source: "EPA",
						data_version: "^1",
						region: "US",
						source_lca_activity: "electricity_generation",
					},
					parameters: {
						energy: energyKwhYear,
						energy_unit: "kWh",
					},
				}),
			});

			if (!resp.ok) {
				const err = await resp.json().catch(() => ({}));
				throw new Error(err.message || "Climatiq returned an error");
			}

			const data = await resp.json();
			// data.co2e is kg for the supplied energy
			if (typeof data.co2e === "number") {
				setClimatiqResultKg(data.co2e);
			} else {
				setError("Unexpected Climatiq response.");
			}
		} catch (err: unknown) {
			if (err instanceof Error) setError(err.message);
			else setError("Unknown error when calling Climatiq.");
			console.error(err);
		} finally {
			setLoadingClimatiq(false);
		}
	};

	/** -----------------------
	 * Small helpers
	 * ------------------------*/
	const fmt = (n: number, digits = 2) => Number(n).toFixed(digits);
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => {
		setHydrated(true);
	}, []);
	if (!hydrated) {
		return null;
	}

	return (
		<div className="font-sans min-h-screen py-12">
			<main className="container mx-auto px-6">
				{/* Title */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-teal-400">
							Green Awareness — Energy & Carbon Calculator
						</h1>
						<p className="text-sm text-gray-400 mt-1">
							Track appliances, price per kWh, and emissions. Export or estimate
							with Climatiq.
						</p>
					</div>
					<div className="flex items-center space-x-3">
						<Button
							variant="outline"
							onClick={exportCsv}
							className="flex items-center gap-2">
							<Download className="w-4 h-4" />
							<span>Export CSV</span>
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								setCart([
									{
										id: uuidv4(),
										key: "television",
										name: APPLIANCE_DATA.television.name,
										wattage: APPLIANCE_DATA.television.wattage,
										hoursPerDay: 4,
										qty: 1,
									},
								]);
								setSettings(DEFAULT_SETTINGS);
								setError("");
								setClimatiqResultKg(null);
							}}
							className="flex items-center gap-2">
							<Settings className="w-4 h-4" />
							<span>Reset</span>
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left: Add Appliance */}
					<Card className="lg:col-span-1">
						<CardHeader>
							<CardTitle className="text-lg">Add Appliance</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<Label>Choose preset</Label>
								<Select
									value={selectedApplianceKey}
									onValueChange={(val) =>
										setSelectedApplianceKey(val as ApplianceKey)
									}>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="custom">Custom / Other</SelectItem>
										{Object.entries(APPLIANCE_DATA).map(([k, v]) => (
											<SelectItem key={k} value={k}>
												{`${v.name} — ${v.wattage}W`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								{selectedApplianceKey === "custom" && (
									<>
										<div>
											<Label>Name</Label>
											<Input
												value={customName}
												onChange={(e) => setCustomName(e.target.value)}
											/>
										</div>
										<div>
											<Label>Wattage (W)</Label>
											<Input
												type="number"
												min={0}
												value={
													customWattage === "" ? "" : String(customWattage)
												}
												onChange={(e) =>
													setCustomWattage(
														e.target.value === "" ? "" : Number(e.target.value)
													)
												}
											/>
										</div>
									</>
								)}

								{selectedApplianceKey !== "custom" && (
									<p className="text-sm text-gray-400">
										Typical wattage:{" "}
										{APPLIANCE_DATA[selectedApplianceKey].wattage} W
									</p>
								)}

								<div className="grid grid-cols-2 gap-2">
									<div>
										<Label>Hours / day</Label>
										<Input
											type="number"
											min={0}
											step={0.1}
											value={addingHours === "" ? "" : String(addingHours)}
											onChange={(e) =>
												setAddingHours(
													e.target.value === "" ? "" : Number(e.target.value)
												)
											}
										/>
									</div>
									<div>
										<Label>Quantity</Label>
										<Input
											type="number"
											min={1}
											value={String(addingQty)}
											onChange={(e) => setAddingQty(Number(e.target.value))}
										/>
									</div>
								</div>

								<Button className="w-full mt-2" onClick={addItemToCart}>
									<Plus className="w-4 h-4 mr-2" /> Add to list
								</Button>
								{error && (
									<div className="text-sm text-red-400 mt-2 flex items-center gap-2">
										<AlertCircle className="w-4 h-4" /> {error}
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Middle: Cart / List */}
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle>Your Appliances & Settings</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="overflow-auto max-h-[320px] pr-2">
									<AnimatePresence>
										{cart.map((it) => (
											<motion.div
												key={it.id}
												initial={{ opacity: 0, y: 6 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, scale: 0.98 }}
												className="grid grid-cols-12 gap-3 items-center mb-3 p-3 rounded-lg  border border-zinc-400 dark:border-zinc-500">
												<div className="col-span-1 flex items-center justify-center">
													{APPLIANCE_DATA[it.key as keyof typeof APPLIANCE_DATA]
														?.icon || <Leaf className="w-5 h-5" />}
												</div>
												<div className="col-span-4">
													<Input
														className="bg-transparent"
														value={it.name}
														onChange={(e) =>
															updateCartItem(it.id, { name: e.target.value })
														}
													/>
												</div>
												<div className="col-span-2">
													<Input
														type="number"
														min={0}
														className="bg-transparent"
														value={String(it.wattage)}
														onChange={(e) =>
															updateCartItem(it.id, {
																wattage: Number(e.target.value),
															})
														}
													/>
													<div className="text-xs text-gray-500">W</div>
												</div>
												<div className="col-span-2">
													<Input
														type="number"
														min={0}
														step={0.1}
														className="bg-transparent"
														value={String(it.hoursPerDay)}
														onChange={(e) =>
															updateCartItem(it.id, {
																hoursPerDay: Number(e.target.value),
															})
														}
													/>
													<div className="text-xs text-gray-500">hrs/day</div>
												</div>
												<div className="col-span-1">
													<Input
														type="number"
														min={1}
														className="bg-transparent"
														value={String(it.qty)}
														onChange={(e) =>
															updateCartItem(it.id, {
																qty: Number(e.target.value),
															})
														}
													/>
													<div className="text-xs text-gray-500">qty</div>
												</div>
												<div className="col-span-2 text-right">
													<Button
														variant="ghost"
														onClick={() => removeCartItem(it.id)}
														className="float-right p-1">
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</motion.div>
										))}
									</AnimatePresence>
								</div>

								<div className="flex items-center justify-between mt-3">
									<div className="text-sm text-gray-400">
										{cart.length} item(s) — Total daily:{" "}
										<strong>{fmt(totals.kwh.day, 3)} kWh</strong>
									</div>
									<div className="flex items-center gap-3">
										<Button
											variant="secondary"
											onClick={clearCart}
											className="px-3 py-1 text-sm">
											Clear list
										</Button>
									</div>
								</div>

								{/* Settings area */}
								<div className="mt-4 border-t border-gray-700 pt-4 space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<Label className="text-xs text-green-200">
												Price per kWh
											</Label>
											<div className="flex gap-2 mt-1">
												<Input
													className="w-12"
													value={settings.currency}
													onChange={(e) =>
														setSettings((s) => ({
															...s,
															currency: e.target.value,
														}))
													}
												/>
												<Input
													type="number"
													min={0}
													step={0.001}
													className="w-full"
													value={settings.pricePerKwh}
													onChange={(e) =>
														setSettings((s) => ({
															...s,
															pricePerKwh: Number(e.target.value),
														}))
													}
												/>
											</div>
										</div>
										<div className="md:col-span-2">
											<Label className="text-xs text-green-200 block mb-1">
												Carbon Calculation Method
											</Label>
											<div className="flex rounded-lg border  p-1 ">
												<Button
													variant={settings.useClimatiq ? "ghost" : "default"}
													className="w-1/2"
													onClick={() =>
														setSettings((s) => ({ ...s, useClimatiq: false }))
													}>
													Manual / Preset
												</Button>
												<Button
													variant={settings.useClimatiq ? "default" : "ghost"}
													className="w-1/2"
													onClick={() => {
														setError("");
														setClimatiqResultKg(null);
														setSettings((s) => ({ ...s, useClimatiq: true }));
													}}>
													Climatiq API
												</Button>
											</div>
										</div>
									</div>

									<AnimatePresence>
										{!settings.useClimatiq && (
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
												<div>
													<Label>Region Preset</Label>
													<Select
														value={settings.regionPreset}
														onValueChange={(val) =>
															setSettings((s) => ({
																...s,
																regionPreset: val,
																emissionFactor: Number(val),
															}))
														}>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Select a preset..." />
														</SelectTrigger>
														<SelectContent>
															{REGION_PRESETS.map((p) => (
																<SelectItem
																	key={p.label}
																	value={String(p.value)}>
																	{p.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
												<div>
													<Label>Emission Factor (kg CO₂e/kWh)</Label>
													<Input
														type="number"
														min={0}
														step={0.001}
														className="w-full"
														value={settings.emissionFactor}
														onChange={(e) =>
															setSettings((s) => ({
																...s,
																emissionFactor: Number(e.target.value),
																regionPreset: "",
															}))
														}
													/>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Totals Section */}
				<div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
					{/* Energy Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-3">
								<Zap className="text-yellow-400" /> Energy Consumption
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="mt-4 space-y-2">
								<p>
									<strong className="text-2xl text-white">
										{fmt(totals.kwh.day, 2)}
									</strong>{" "}
									kWh/day
								</p>
								<p>
									<strong className="text-lg text-gray-200">
										{fmt(totals.kwh.month, 1)}
									</strong>{" "}
									kWh/month
								</p>
								<p>
									<strong className="text-lg text-gray-200">
										{fmt(totals.kwh.year, 0)}
									</strong>{" "}
									kWh/year
								</p>
							</div>
						</CardContent>
					</Card>
					{/* Cost Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-3">
								<TrendingUp className="text-blue-400" /> Estimated Cost
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="mt-4 space-y-2">
								<p>
									<strong className="text-2xl text-white">
										{settings.currency}
										{fmt(totals.cost.day, 2)}
									</strong>{" "}
									/day
								</p>
								<p>
									<strong className="text-lg text-gray-200">
										{settings.currency}
										{fmt(totals.cost.month, 2)}
									</strong>{" "}
									/month
								</p>
								<p>
									<strong className="text-lg text-gray-200">
										{settings.currency}
										{fmt(totals.cost.year, 2)}
									</strong>{" "}
									/year
								</p>
							</div>
						</CardContent>
					</Card>
					{/* CO2 Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-3">
								<Leaf className="text-green-400" /> CO₂ Emissions
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="mt-4">
								{settings.useClimatiq ? (
									<div className="space-y-4">
										{climatiqResultKg === null ? (
											<p className="text-sm text-gray-400">
												Estimate your annual carbon footprint using the Climatiq
												API for a more accurate, real-world calculation.
											</p>
										) : (
											<div>
												<p className="text-sm text-gray-300">
													Climatiq Annual Estimate:
												</p>
												<p className="text-3xl font-bold">
													{fmt(climatiqResultKg, 1)}{" "}
													<span className="text-lg font-normal text-gray-400">
														kg CO₂e
													</span>
												</p>
											</div>
										)}
										<Button
											className="w-full mt-2"
											onClick={estimateWithClimatiq}
											disabled={loadingClimatiq}>
											{loadingClimatiq ? (
												<Loader2 className="w-4 h-4 animate-spin mr-2" />
											) : (
												<Sun className="w-4 h-4 mr-2" />
											)}
											{climatiqResultKg === null
												? "Estimate with Climatiq"
												: "Re-estimate"}
										</Button>
									</div>
								) : (
									<div className="space-y-2">
										<p>
											<strong className="text-2xl text-white">
												{fmt(totals.co2.day, 2)}
											</strong>{" "}
											kg/day
										</p>
										<p>
											<strong className="text-lg text-gray-200">
												{fmt(totals.co2.month, 1)}
											</strong>{" "}
											kg/month
										</p>
										<p>
											<strong className="text-lg text-gray-200">
												{fmt(totals.co2.year, 0)}
											</strong>{" "}
											kg/year
										</p>
										<p className="text-xs text-gray-500 pt-2">
											Based on factor of {settings.emissionFactor} kg/kWh.
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{error && (
					<div className="lg:col-span-3 mt-6 text-sm text-red-400 flex items-center justify-center gap-2 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
						<AlertCircle className="w-5 h-5 flex-shrink-0" />
						<span>
							<strong>Error:</strong> {error}
						</span>
					</div>
				)}
			</main>
		</div>
	);
}
