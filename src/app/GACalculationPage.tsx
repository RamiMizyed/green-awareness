"use client";
import React, { useEffect, useState } from "react";
import { Download, Github, Settings } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ApplianceList } from "@/components/Sections/CalculationPage/ApplianceList";
import { SummaryInteractiveChart } from "@/components/Sections/CalculationPage/SummaryResults";

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
		<div
			id="Calc"
			className="font-sans h-full min-h-screen py-10 min-w-full flex items-center justify-center bg-background">
			<main className="container mx-auto px-6">
				{/* Header */}
				<div className="flex lg:mt-0 flex-col lg:flex-row items-center justify-between gap-6 mb-10">
					<div>
						<h1 className="text-4xl lg:text-5xl font-extrabold">
							Green Awareness Calculator
						</h1>
						<p className="text-base  max-w-3xl mx-auto mt-3  ">
							Green Awareness is an open source project built by the community{" "}
							<br /> for the community. Check out the code, contribute, or give
							it a star on GitHub!
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button variant="outline" onClick={exportCsv}>
							<Download className="w-4 h-4 mr-2" /> Export CSV
						</Button>
						<Button variant="outline" onClick={reset}>
							<Settings className="w-4 h-4 mr-2" /> Reset
						</Button>
						<Button
							variant="outline"
							className=""
							onClick={() =>
								window.open(
									"https://github.com/RamiMizyed/green-awareness",
									"_blank"
								)
							}>
							Visit GitHub <Github className="w-5 h-5 ml-2" />
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 w-full  gap-6">
					<ApplianceList />
				</div>

				<SummaryInteractiveChart />
			</main>
		</div>
	);
}
