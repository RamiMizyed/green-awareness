"use client";

import { ArrowRight, Globe2, Lightbulb, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Staggered fade-up on load; skipped entirely for reduced-motion users. */
const RISE =
	"motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:fill-mode-both";

const POINTS = [
	{ icon: Lightbulb, text: "Takes about 2 minutes" },
	{ icon: Globe2, text: "Prices and grid data for 29 regions" },
	{ icon: Lock, text: "Private: nothing leaves your device" },
];

export default function LandingPage() {
	return (
		<section className="relative isolate flex min-h-[88svh] items-center overflow-hidden bg-zinc-950 text-white">
			<video
				muted
				autoPlay
				playsInline
				loop
				poster="/BGTN.jpg"
				src="/1011 (1)(3).mp4"
				aria-hidden
				className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60 motion-reduce:hidden"
			/>
			<div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/30" />
			<div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent" />

			<div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6">
				<p
					style={{ animationDelay: "100ms" }}
					className={`${RISE} text-sm font-semibold uppercase tracking-widest text-emerald-400`}>
					Home energy & carbon calculator
				</p>
				<h1
					style={{ animationDelay: "220ms" }}
					className={`${RISE} mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl`}>
					See what your home really costs the planet, and your wallet.
				</h1>
				<p
					style={{ animationDelay: "340ms" }}
					className={`${RISE} mt-6 max-w-xl text-lg text-zinc-300`}>
					Add your appliances to find out where your electricity goes, what it
					costs, and the changes that would save you the most.
				</p>
				<div
					style={{ animationDelay: "460ms" }}
					className={`${RISE} mt-8 flex flex-col gap-3 sm:flex-row`}>
					<Button asChild size="lg" className="h-12 px-6 text-base">
						<a href="#calculator">
							Calculate my footprint <ArrowRight aria-hidden />
						</a>
					</Button>
					<Button
						asChild
						size="lg"
						variant="outline"
						className="h-12 border-white/30 bg-white/5 px-6 text-base text-white hover:bg-white/15 hover:text-white dark:bg-white/5">
						<a href="#how-it-works">How it works</a>
					</Button>
				</div>
				<ul
					style={{ animationDelay: "580ms" }}
					className={`${RISE} mt-10 flex flex-col gap-3 text-sm text-zinc-300 sm:flex-row sm:gap-6`}>
					{POINTS.map(({ icon: Icon, text }) => (
						<li key={text} className="flex items-center gap-2">
							<Icon className="size-4 text-emerald-400" aria-hidden />
							{text}
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
