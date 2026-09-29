"use client";

import dynamic from "next/dynamic";
import LandingPage from "@/components/Sections/Landing/landing";

const Calculator = dynamic(() => import("@/components/calculator/Calculator"), {
	ssr: false,
	loading: () => (
		<div className="mx-auto max-w-6xl px-4 py-24 sm:px-6" aria-busy="true">
			<div className="h-10 w-72 animate-pulse rounded-lg bg-muted" />
			<div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
				<div className="h-96 animate-pulse rounded-2xl bg-muted" />
				<div className="h-96 animate-pulse rounded-2xl bg-muted" />
			</div>
		</div>
	),
});

export default function Home() {
	return (
		<>
			<LandingPage />
			<Calculator />
			<footer className="border-t py-10 text-sm text-muted-foreground">
				<div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
					<p>
						&copy; {new Date().getFullYear()} Green Awareness. Estimates only;
						check your bill for exact figures.
					</p>
					<div className="flex gap-5">
						<a
							href="https://github.com/RamiMizyed/green-awareness"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground">
							Contribute on GitHub
						</a>
						<a
							href="https://ramimizyed.dev/"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground">
							Made by Rami Mizyed
						</a>
					</div>
				</div>
			</footer>
		</>
	);
}
