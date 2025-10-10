"use client";

import React, { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, TrendingUp, Zap } from "lucide-react";
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

// --- Color palettes for a polished look in both themes ---
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

const formatTick = (tick: string) => {
	const limit = 15;
	if (tick.length > limit) {
		return tick.substring(0, limit) + "...";
	}
	return tick;
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
				unit: "CO₂e",
				icon: <Leaf className="h-5 w-5" />,
				activeColor:
					"data-[active=true]:border-amber-500 data-[active=true]:bg-amber-50 dark:data-[active=true]:bg-amber-950",
			},
		}),
		[settings.currency]
	);

	const chartData = useMemo(() => {
		// NOTE: Use a theme context in a real app to switch colors
		const colors =
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches
				? DARK_MODE_COLORS
				: LIGHT_MODE_COLORS;
		return cart.map((item, i) => {
			const kwh = (item.wattage * item.hoursPerDay * item.qty) / 1000;
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
	}, [getTotals]);

	const chartConfig = {
		[activeMetric]: { label: metricConfig[activeMetric].label },
	};

	return (
		<Card className="mt-4 px-6 w-full rounded-xl border bg-card text-card-foreground shadow-sm">
			<div className="flex flex-col lg:flex-row items-center justify-between">
				<div className="flex h-full items-center justify-center gap-4">
					<CardTitle className="text-2xl mb-3 font-semibold">
						Energy Summary
					</CardTitle>
				</div>
				<div className="grid w-full grid-cols-1 gap-3 sm:max-w-md lg:max-w-xl sm:grid-cols-3">
					{(Object.keys(metricConfig) as Array<keyof typeof metricConfig>).map(
						(metric) => (
							<button
								key={metric}
								data-active={activeMetric === metric}
								onClick={() => setActiveMetric(metric)}
								className={`rounded-lg cursor-pointer border-2 p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
                                        border-transparent hover:bg-muted/50
                                        ${metricConfig[metric].activeColor}`}>
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
						)
					)}
				</div>
			</div>

			<CardContent className="m-6">
				{chartData.length > 0 ? (
					<ChartContainer
						config={chartConfig}
						className="min-h-64 max-h-80  w-full">
						<ResponsiveContainer className={""} width="100%">
							<BarChart data={chartData} layout="vertical" className="">
								<CartesianGrid
									horizontal={false}
									stroke="hsl(var(--border) / 0.5)"
								/>
								<XAxis
									className=""
									type="number"
									stroke="hsl(var(--muted-foreground))"
									tickLine={false}
									axisLine={false}
									tickFormatter={(value) => formatNumber(Number(value), 1)}
									label={{
										value: `${metricConfig[activeMetric].label} (${metricConfig[activeMetric].unit}/day)`,
										position: "insideBottom",
										offset: -10,
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
									className=""
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
					<div className="flex flex-col  items-center justify-center text-muted-foreground">
						<div className="w-full flex items-center justify-center">
							<LottieAnimator
								src="/animationAssets/Solar Sun Power Animation.json"
								className=""
								loop
								autoplay
							/>
						</div>
						<p>No data available to display.</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
