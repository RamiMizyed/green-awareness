// src/components/Sections/CalculationPage/SummaryInteractiveChart.tsx

"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, TrendingUp, Zap, Car } from "lucide-react";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	BarChart,
	Bar,
	CartesianGrid,
	XAxis,
	YAxis,
	LabelList,
	ResponsiveContainer,
	Cell,
} from "recharts";
import LottieAnimator from "@/components/ui/lottieAnimator";
import { CalculationSettings } from "./CalculationSettings";

const LIGHT_MODE_COLORS = [
	"#1d4ed8",
	"#db2777",
	"#f59e0b",
	"#16a34a",
	"#6d28d9",
];
const DARK_MODE_COLORS = [
	"#60a5fa",
	"#f472b6",
	"#fb923c",
	"#4ade80",
	"#c084fc",
];

const formatNumber = (num: number, digits = 2) =>
	new Intl.NumberFormat("en-US", {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	}).format(num);
const formatTick = (tick: string) =>
	tick.length > 15 ? tick.substring(0, 15) + "..." : tick;

const RelatabilityTip = ({ kgCO2e }: { kgCO2e: number }) => {
	// Avg. passenger vehicle emits ~0.404 kg CO₂ per mile.
	const milesDriven = kgCO2e / 0.404;
	if (milesDriven < 0.1) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="mt-4 flex items-center justify-center gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 p-3 text-sm text-amber-800 dark:text-amber-200">
			<Car className="h-5 w-5 flex-shrink-0" />
			<p>
				This is equivalent to the emissions from driving an average car for{" "}
				<strong className="font-bold">{milesDriven.toFixed(1)} miles</strong>{" "}
				per day.
			</p>
		</motion.div>
	);
};

export function SummaryInteractiveChart() {
	const { cart, getTotals, settings } = useAppStore();
	const [activeMetric, setActiveMetric] = useState<"kwh" | "cost" | "co2">(
		"kwh"
	);

	const metricConfig = useMemo(
		() => ({
			kwh: {
				label: "Energy Usage",
				unit: "kWh",
				icon: <Zap className="h-5 w-5" />,
				activeColor:
					"data-[active=true]:border-blue-500 data-[active=true]:bg-blue-50 dark:data-[active=true]:bg-blue-950",
			},
			cost: {
				label: "Estimated Cost",
				unit: settings.currency,
				icon: <TrendingUp className="h-5 w-5" />,
				activeColor:
					"data-[active=true]:border-pink-500 data-[active=true]:bg-pink-50 dark:data-[active=true]:bg-pink-950",
			},
			co2: {
				label: "Carbon Footprint",
				unit: "kgCO₂e",
				icon: <Leaf className="h-5 w-5" />,
				activeColor:
					"data-[active=true]:border-amber-500 data-[active=true]:bg-amber-50 dark:data-[active=true]:bg-amber-950",
			},
		}),
		[settings.currency]
	);

	const chartData = useMemo(() => {
		const colors = window.matchMedia?.("(prefers-color-scheme: dark)").matches
			? DARK_MODE_COLORS
			: LIGHT_MODE_COLORS;
		return cart.map((item, i) => {
			let kwh = (item.wattage * item.usageValue * item.qty) / 1000;
			if (item.usageFrequency === "weekly") kwh /= 7;
			const cost = kwh * settings.pricePerKwh;
			const co2 = kwh * settings.emissionFactor;
			return {
				name: item.name,
				kwh,
				cost,
				co2,
				fill: colors[i % colors.length],
			};
		});
	}, [cart, settings]);

	const totals = useMemo(() => {
		const t = getTotals();
		return { kwh: t.kwh.day, cost: t.cost.day, co2: t.co2.day };
	}, [getTotals, cart, settings]);

	const chartConfig = {
		[activeMetric]: { label: metricConfig[activeMetric].label },
	};

	return (
		<Card className="w-full rounded-xl border bg-card text-card-foreground shadow-sm mt-6">
			<CardTitle className="text-2xl font-semibold shrink-0 px-6">
				Energy Summary
			</CardTitle>
			<div className="flex items-center justify-start  px-6">
				<div className="text-sm flex items-center text-muted-foreground">
					{cart.length} item(s) — Daily total:
					<strong className="mx-2 dark:text-yellow-500 text-orange-600">
						{totals.kwh.toFixed(3)} kWh/Day
					</strong>
					<LottieAnimator
						src="/animationAssets/renewable-energy.json"
						className="w-10 h-10"
						loop
						autoplay
					/>
				</div>
			</div>
			<div className="flex flex-col gap-4 p-6">
				<div className=" border-b pb-3">
					<CalculationSettings />
				</div>
				<div className="flex flex-col lg:flex-row items-start justify-between gap-4">
					<div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
						{(
							Object.keys(metricConfig) as Array<keyof typeof metricConfig>
						).map((metric) => (
							<button
								key={metric}
								data-active={activeMetric === metric}
								onClick={() => setActiveMetric(metric)}
								className={`rounded-lg cursor-pointer border-2 p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border-transparent hover:bg-muted/50 ${metricConfig[metric].activeColor}`}>
								<div className="flex items-center gap-2 text-muted-foreground">
									{metricConfig[metric].icon}
									<span className="text-sm font-medium">
										{metricConfig[metric].label}
									</span>
								</div>
								<div className="mt-2 flex items-baseline gap-2">
									<span className="text-2xl font-bold tracking-tight text-foreground">
										{formatNumber(totals[metric])}
									</span>
									<span className="text-sm font-medium text-muted-foreground">
										{metricConfig[metric].unit}/day
									</span>
								</div>
							</button>
						))}
					</div>
				</div>
				{activeMetric === "co2" && <RelatabilityTip kgCO2e={totals.co2} />}
			</div>

			<CardContent className="px-2 sm:px-6 pb-6">
				{chartData.length > 0 ? (
					<ChartContainer
						config={chartConfig}
						className="min-h-64 max-h-80 w-full pr-6">
						<ResponsiveContainer width="100%">
							<BarChart
								data={chartData}
								layout="vertical"
								margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
								<CartesianGrid
									horizontal={false}
									stroke="hsl(var(--border) / 0.5)"
								/>
								<XAxis
									type="number"
									stroke="hsl(var(--muted-foreground))"
									tickLine={false}
									axisLine={false}
									tickFormatter={(value) => formatNumber(Number(value), 1)}
									label={{
										value: `${metricConfig[activeMetric].label} (${metricConfig[activeMetric].unit}/day)`,
										position: "insideBottom",
										offset: -5,
										className: "fill-muted-foreground text-sm",
									}}
								/>
								<YAxis
									type="category"
									dataKey="name"
									stroke="hsl(var(--muted-foreground))"
									tickLine={false}
									axisLine={false}
									width={120}
									tickFormatter={formatTick}
								/>
								<ChartTooltip
									cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
									content={
										<ChartTooltipContent
											formatter={(value) => formatNumber(Number(value))}
											hideLabel
										/>
									}
								/>
								<Bar
									dataKey={activeMetric}
									radius={[0, 4, 4, 0]}
									maxBarSize={80}>
									<LabelList
										dataKey={activeMetric}
										position="right"
										offset={8}
										className="fill-foreground text-xs font-medium"
										formatter={(value: number) => formatNumber(value)}
									/>
									{chartData.map((entry) => (
										<Cell key={`cell-${entry.name}`} fill={entry.fill} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</ChartContainer>
				) : (
					<div className="flex flex-col items-center justify-center text-muted-foreground min-h-64">
						<LottieAnimator
							src="/animationAssets/Solar Sun Power Animation.json"
							className="w-48 h-48"
							loop
							autoplay
						/>
						<p>Add an appliance to see your energy summary.</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
