"use client";
import React from "react";
import { ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { Poppins } from "next/font/google";

// Initialize Poppins font with desired weights and subsets
const poppins = Poppins({
	subsets: ["latin"],
	weight: ["300", "400", "600", "700", "800", "900"],
});

const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.3,
			delayChildren: 0.2,
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: "easeOut" },
	},
};

const featureVariants: Variants = {
	hidden: { opacity: 0, scale: 0.95 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.6, ease: "easeOut" },
	},
};

const sectionVariants: Variants = {
	hidden: { opacity: 0, y: 50 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.8, ease: "easeOut" },
	},
};

// A simple Feature Card component for reusability
const FeatureCard = ({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) => (
	<motion.div
		variants={featureVariants}
		className="bg-zinc-800/50 p-8 rounded-xl shadow-lg flex flex-col items-center text-center backdrop-blur-sm border border-zinc-700/50">
		<div className="bg-green-600/20 text-green-400 p-4 rounded-full mb-4">
			{icon}
		</div>
		<h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
		<p className="text-zinc-300">{description}</p>
	</motion.div>
);

export default function LandingPage() {
	return (
		// Apply the Poppins font class to the main wrapper
		<div className={`${poppins.className} bg-zinc-950 text-zinc-200`}>
			{/* HERO SECTION */}
			<div className="relative h-[100svh] min-h-[600px] overflow-hidden py-[10vh] min-w-full">
				{/* Video Background */}
				<motion.video
					initial={{
						clipPath: "inset(50% 50% round 50vw)",
						scale: 1.2,
						filter: "brightness(0%) saturate(0%)",
					}}
					animate={{
						clipPath: "inset(0% 0% round 0vw)",
						scale: 1,
						filter: "brightness(75%) saturate(100%)",
					}}
					transition={{
						clipPath: { duration: 1.2, delay: 0.25 },
						scale: { duration: 1.2, delay: 0.15 },
						filter: { duration: 0.4, ease: "easeIn", delay: 0.25 },
					}}
					muted
					poster="/BGTN.jpg"
					autoPlay
					playsInline
					loop
					src="/1011 (1)(3).mp4" // Example video
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>
				<div className="absolute inset-0 bg-gradient-to-br from-zinc-950/80 to-zinc-950/20 z-5" />{" "}
				{/* Overlay for better text visibility */}
				<main className="container flex h-full mx-auto px-6 py-[150px] min-h-[400px] text-center relative z-10">
					<motion.div
						className="flex flex-col items-start justify-center gap-6 mb-16 max-w-3xl text-left"
						variants={containerVariants}
						initial="hidden"
						animate="visible">
						<motion.h1
							className="text-4xl lg:text-7xl font-extrabold text-white drop-shadow-lg"
							variants={itemVariants}>
							Green Awareness
						</motion.h1>

						<motion.p
							className="text-start max-w-xl text-lg text-zinc-200"
							variants={itemVariants}>
							Empower yourself to make sustainable choices. Track your
							appliances, calculate energy costs, and measure carbon emissions
							with our easy-to-use calculator.
						</motion.p>

						<motion.div
							className="flex gap-4 flex-col lg:flex-row"
							variants={itemVariants}>
							<Button
								variant="default"
								className=""
								onClick={() => {
									const element = document.getElementById("Calc");
									element?.scrollIntoView({ behavior: "smooth" });
								}}>
								Start Calculating <ArrowRight className="w-5 h-5 ml-2" />
							</Button>
							<Button
								variant="outline"
								className=""
								onClick={() => window.open("https://github.com", "_blank")} // Replace with your repo link
							>
								<Github className="w-5 h-5 mr-2" /> View on GitHub
							</Button>
						</motion.div>
					</motion.div>
				</main>
			</div>
		</div>
	);
}
