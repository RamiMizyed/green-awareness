"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Leaf, Sun, Wind, Footprints } from "lucide-react";
import Image from "next/image";
import { Newsreader } from "next/font/google";
const newsreader = Newsreader({
	subsets: ["latin"],
	weight: ["200", "300", "400", "500", "600", "700", "800"],
});
// The hand-drawn scribble for the highlighted word.
const ScribbleUnderline = () => (
	<svg
		className="absolute -bottom-2 md:-bottom-3 left-0 w-full h-auto text-emerald-500"
		viewBox="0 0 212 22"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		preserveAspectRatio="none">
		<motion.path
			d="M3 13.38C26.7 11.88 59.3 -2.12 84.5 4.38c25.2 6.5 30 16 56 14.5s37.5-8.5 57.5-8.5"
			stroke="currentColor"
			strokeWidth="6"
			strokeLinecap="round"
			initial={{ pathLength: 0 }}
			animate={{ pathLength: 1 }}
			transition={{ duration: 1.2, delay: 1, ease: "easeInOut" }}
		/>
	</svg>
);

const Hero = () => {
	const containerVariants: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: 0.15 } },
	};

	const textVariants: Variants = {
		hidden: { opacity: 0, y: 40 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] },
		},
	};

	const iconVariants: Variants = {
		hidden: { opacity: 0, scale: 0.5 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: { type: "spring", stiffness: 150, damping: 15 },
		},
	};

	const headline = "A Greener Future Starts With You.";

	return (
		<section className="relative w-full min-h-screen overflow-hidden ">
			<video
				autoPlay
				muted
				loop
				playsInline
				className="absolute inset-0 object-cover w-full h-full"
				src="https://www.pexels.com/download/video/31834719/"></video>
			<div className="absolute inset-0 bg-gradient-to-br from-background via-black/50 to-black/50 "></div>

			{/* The subtle grid background from your design */}

			<div className="relative z-10 container mx-auto flex min-h-screen items-center px-6">
				<motion.div
					className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full"
					initial="hidden"
					animate="visible"
					variants={containerVariants}>
					{/* Left Column: Text Content */}
					<div className="lg:col-span-7 text-center lg:text-left">
						<motion.h1
							className={`${newsreader.className} text-5xl font-semibold tracking-tight text-slate-800 sm:text-6xl md:text-7xl dark:text-slate-100`}>
							{headline.split(" ").map((word, i) => (
								<motion.span
									key={i}
									className="inline-block"
									variants={textVariants}>
									{word === "You." ? (
										<span className="relative font-sans text-emerald-500">
											{word}
											<ScribbleUnderline />
										</span>
									) : (
										word
									)}
									&nbsp;
								</motion.span>
							))}
						</motion.h1>

						<motion.p
							className="mt-8 max-w-xl mx-auto lg:mx-0 text-lg leading-8 text-slate-600 dark:text-slate-300"
							variants={textVariants}>
							We are dedicated to promoting sustainability, reducing carbon
							footprints, and advancing renewable energy. Join a global movement
							to create a cleaner, greener future.
						</motion.p>

						<motion.div
							className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
							variants={textVariants}>
							<Button
								size="lg"
								className="w-full sm:w-auto bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300">
								<Footprints className="mr-2 h-5 w-5" /> Calculate Your Footprint
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="w-full sm:w-auto border-slate-800 text-slate-800 hover:bg-slate-200/50 dark:border-slate-200 dark:text-slate-200 dark:hover:bg-slate-800">
								Read Our Blog
							</Button>
						</motion.div>
					</div>

					{/* Right Column: Global Connection Graphic */}
					<motion.div
						className="lg:col-span-5 hidden lg:block"
						variants={containerVariants}>
						<div className="relative w-full aspect-square max-w-2xl mx-auto">
							{/* World Map SVG Background */}
							<Image
								width={600}
								height={600}
								alt="World Map"
								src="/world-map-dots-dark.svg"
								className=" inset-0 w-full h-full object-contain  dark:hidden"
							/>
							<Image
								width={600}
								height={600}
								alt="World Map"
								src="/world-map-dots-light.svg"
								className=" inset-0 w-full h-full object-contain opacity-80 hidden dark:block"
							/>

							{/* Animated Connecting Lines SVG */}
							<svg
								className="absolute inset-0 w-full h-full"
								viewBox="0 0 100 100">
								<motion.path
									d="M 30 35 Q 50 20 75 30"
									className="stroke-emerald-500/70"
									strokeWidth="0.5"
									fill="none"
									strokeDasharray="2 2"
									initial={{ pathLength: 0 }}
									animate={{ pathLength: 1 }}
									transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
								/>
								<motion.path
									d="M 25 65 Q 40 85 65 75"
									className="stroke-emerald-500/70"
									strokeWidth="0.5"
									fill="none"
									strokeDasharray="2 2"
									initial={{ pathLength: 0 }}
									animate={{ pathLength: 1 }}
									transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
								/>
								<motion.path
									d="M 30 35 C 20 60, 70 80, 65 75"
									className="stroke-emerald-500/70"
									strokeWidth="0.5"
									fill="none"
									strokeDasharray="2 2"
									initial={{ pathLength: 0 }}
									animate={{ pathLength: 1 }}
									transition={{ duration: 1.5, delay: 1.4, ease: "easeInOut" }}
								/>
							</svg>

							{/* Animated Icons on the Map */}
							<motion.div
								variants={iconVariants}
								className="absolute top-[30%] left-[25%]">
								<IconBubble>
									<Sun size={20} />
								</IconBubble>
							</motion.div>
							<motion.div
								variants={iconVariants}
								className="absolute top-[25%] left-[70%]">
								<IconBubble>
									<Wind size={20} />
								</IconBubble>
							</motion.div>
							<motion.div
								variants={iconVariants}
								className="absolute top-[60%] left-[20%]">
								<IconBubble>
									<Leaf size={20} />
								</IconBubble>
							</motion.div>
							<motion.div
								variants={iconVariants}
								className="absolute top-[70%] left-[60%]">
								<IconBubble>
									<Sun size={20} />
								</IconBubble>
							</motion.div>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
};

// A helper component to create the icon bubbles
const IconBubble = ({ children }: { children: React.ReactNode }) => (
	<div className="w-12 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
		<div className="text-emerald-500">{children}</div>
	</div>
);

export default Hero;
