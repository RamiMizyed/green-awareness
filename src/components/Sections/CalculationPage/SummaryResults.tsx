"use client";
import React from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, TrendingUp, Zap } from "lucide-react";

// Helper for formatting numbers
const fmt = (n: number, digits = 2) =>
	n.toLocaleString(undefined, {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	});

export function SummaryResults() {
	const { getTotals, settings } = useAppStore();
	const totals = getTotals(); // Get the derived state

	const renderCo2Content = () => {
		// Default manual/preset calculation
		return (
			<div className="grid grid-cols-3 gap-4 text-center">
				<div>
					<p className="text-2xl font-bold">{fmt(totals.co2.day, 2)}</p>
					<p className="text-sm text-muted-foreground">kg CO₂e/day</p>
				</div>
				<div>
					<p className="text-2xl font-bold">{fmt(totals.co2.month, 1)}</p>
					<p className="text-sm text-muted-foreground">kg CO₂e/month</p>
				</div>
				<div>
					<p className="text-2xl font-bold">{fmt(totals.co2.year, 0)}</p>
					<p className="text-sm text-muted-foreground">kg CO₂e/year</p>
				</div>
			</div>
		);
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
			<Card>
				<CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Energy Consumption
					</CardTitle>
					<Zap className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 gap-4 text-center">
						<div>
							<p className="text-2xl font-bold">{fmt(totals.kwh.day, 2)}</p>
							<p className="text-sm text-muted-foreground">kWh/day</p>
						</div>
						<div>
							<p className="text-2xl font-bold">{fmt(totals.kwh.month, 1)}</p>
							<p className="text-sm text-muted-foreground">kWh/month</p>
						</div>
						<div>
							<p className="text-2xl font-bold">{fmt(totals.kwh.year, 0)}</p>
							<p className="text-sm text-muted-foreground">kWh/year</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 gap-4 text-center">
						<div>
							<p className="text-2xl font-bold">
								{settings.currency}
								{fmt(totals.cost.day, 2)}
							</p>
							<p className="text-sm text-muted-foreground">Per Day</p>
						</div>
						<div>
							<p className="text-2xl font-bold">
								{settings.currency}
								{fmt(totals.cost.month, 2)}
							</p>
							<p className="text-sm text-muted-foreground">Per Month</p>
						</div>
						<div>
							<p className="text-2xl font-bold">
								{settings.currency}
								{fmt(totals.cost.year, 2)}
							</p>
							<p className="text-sm text-muted-foreground">Per Year</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Carbon Footprint
					</CardTitle>
					<Leaf className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>{renderCo2Content()}</CardContent>
			</Card>
		</div>
	);
}
