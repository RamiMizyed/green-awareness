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
} from "recharts";

const COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
	"var(--chart-6)",
];

const fmt = (n: number, digits = 2) =>
	n.toLocaleString(undefined, {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	});

export function SummaryInteractiveChart() {
	const { cart, getTotals, settings } = useAppStore();
	const totals = getTotals();
	const [activeMetric, setActiveMetric] = useState<"kwh" | "cost" | "co2">(
		"kwh"
	);

	const chartData = useMemo(() => {
		return cart.map((item, i) => {
			const kwh = (item.wattage * item.hoursPerDay * item.qty) / 1000;
			const cost = kwh * settings.pricePerKwh;
			const co2 = kwh * settings.emissionFactor;

			return {
				name: item.name,
				kwh,
				cost,
				co2,
				fill: COLORS[i % COLORS.length],
			};
		});
	}, [cart, settings]);

	const metricConfig = {
		kwh: {
			label: "Energy Usage",
			unit: "kWh/day",
			icon: <Zap className="h-4 w-4 text-muted-foreground" />,
		},
		cost: {
			label: "Estimated Cost",
			unit: `${settings.currency}/day`,
			icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
		},
		co2: {
			label: "Carbon Footprint",
			unit: "kg CO₂e/day",
			icon: <Leaf className="h-4 w-4 text-muted-foreground" />,
		},
	} as const;

	const total = useMemo(
		() => ({
			kwh: totals.kwh.day,
			cost: totals.cost.day,
			co2: totals.co2.day,
		}),
		[totals]
	);

	return (
		<Card className="mt-4">
			<div className="max-w-4xl mx-auto">
				<CardHeader className="flex flex-col sm:flex-row border-b !p-0">
					<div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
						<CardTitle>Energy Summary</CardTitle>
					</div>
					<div className="flex">
						{(["kwh", "cost", "co2"] as const).map((metric) => (
							<button
								key={metric}
								data-active={activeMetric === metric}
								className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
								onClick={() => setActiveMetric(metric)}>
								<span className="text-muted-foreground text-xs">
									{metricConfig[metric].label}
								</span>
								<span className="text-lg leading-none font-bold sm:text-3xl">
									{fmt(total[metric], 2)}
								</span>
							</button>
						))}
					</div>
				</CardHeader>
				<CardContent className="px-2 sm:p-6">
					<ChartContainer
						config={{
							[activeMetric]: {
								label: metricConfig[activeMetric].unit,
								color: "var(--chart-1)",
							},
						}}>
						<BarChart
							data={chartData}
							margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
							<CartesianGrid vertical={false} strokeDasharray="3 3" />
							<XAxis dataKey="name" tickLine={false} axisLine={false} />
							<YAxis hide />
							<ChartTooltip
								cursor={{ fill: "rgba(0,0,0,0.05)" }}
								content={
									<ChartTooltipContent
										formatter={(value) =>
											`${fmt(Number(value), 2)} ${
												metricConfig[activeMetric].unit
											}`
										}
									/>
								}
							/>
							<Bar dataKey={activeMetric}>
								<LabelList
									dataKey={activeMetric}
									position="top"
									className="fill-foreground text-xs"
									formatter={(value: number) =>
										`${fmt(value, 2)} ${metricConfig[activeMetric].unit}`
									}
								/>
							</Bar>
						</BarChart>
					</ChartContainer>
				</CardContent>
			</div>
		</Card>
	);
}
