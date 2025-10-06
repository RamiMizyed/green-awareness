"use client";
import React, { useEffect, useState } from "react";
import { Download, Settings } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ApplianceList } from "@/components/Sections/CalculationPage/ApplianceList";
import { SummaryResults } from "@/components/Sections/CalculationPage/SummaryResults";

// Import your new smaller components

export default function GACalculationPage() {
	const { reset, exportCsv } = useAppStore();

	// The hydration check is important when using zustand with persistence
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => {
		setHydrated(true);
	}, []);

	if (!hydrated) {
		return null; // Or a loading spinner
	}

	return (
		<div className="font-sans h-full min-h-screen min-w-full flex items-center justify-center py-[150px]">
			<main className="container mx-auto px-6">
				{/* Header */}
				<div className="flex mt-14 lg:mt-0 flex-col lg:flex-row items-center justify-between gap-6 mb-10">
					<div>
						<h1 className="text-4xl lg:text-5xl font-extrabold">
							Green Awareness Calculator
						</h1>
						<p className="text-sm text-center lg:text-start text-gray-400 mt-3">
							Track appliances, costs, and emissions.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button variant="outline" onClick={exportCsv}>
							<Download className="w-4 h-4 mr-2" /> Export CSV
						</Button>
						<Button variant="outline" onClick={reset}>
							<Settings className="w-4 h-4 mr-2" /> Reset
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 w-full  gap-6">
					<ApplianceList />
				</div>

				<SummaryResults />
			</main>
		</div>
	);
}
